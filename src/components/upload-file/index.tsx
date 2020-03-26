import React, { Component } from 'react';
import { Progress, message } from 'antd';
import { AxiosResponse } from 'axios';
import { FileObject, initChunkSize, UploadResult, retryTime, ChunkFile } from '../../constants/upload';
import InputFile from '../input-file';
import request from '../../common/request';
import Style from './index.module.scss';

interface IState {
  uploading: boolean;
  percent: number;
}

class UploadComp extends Component<{}, IState> {

  readonly state = {
    uploading: false,
    percent: 0,
  };

  private uploadedList: number[] = []

  private fileObject: FileObject | null = null;

  private uploadFileIndex = 0;

  private aisleFlag = retryTime;

  // 更改控制请求通道
  changeAisleFlag = (aisleFlag: number, notUpload?: boolean) => {
    this.aisleFlag = aisleFlag;
    if (aisleFlag === 0) {
      return;
    }

    if (notUpload) {
      return;
    }
    // 通知取出分片上传
    return this.notifyAisleRequest();
  }

  sUpload = () => {
    this.changeAisleFlag(5, true);
    this.setState({
      uploading: true,
      percent: 0,
    });
  }

  eUpload = () => {
    this.uploadFileIndex = 0;
    this.setState({
      uploading: false,
    });
  }

  // 上传失败
  failUpload = () => {
    message.success('文件上传失败');
    this.uploadFileIndex = 0;
    this.changeAisleFlag(5, true);
  }

  // 通知改变百分比
  notifyPercent = async (percent: number, pass?: boolean) => {
    this.setState({
      percent,
    });
    if (percent !== 100) {
      return;
    }
    // 上传切片成功
    message.success('上传切片成功');
    setTimeout(this.eUpload, 1000);

    // 秒传
    if (pass) {
      return message.success('文件已经有了, 秒传');
    }

    const { name, uid } = this.fileObject as FileObject;
    const formData: FormData = new FormData();
    formData.append('filename', name);
    formData.append('hash', uid);
    formData.append('chunksize', String(initChunkSize));
    const res: AxiosResponse<UploadResult> = await request.post('http://localhost:6001/upload/merge', formData);
    const { data } = res;
    if (data.success) {
      return message.success(data.message);
    }
    return message.error(data.message);
  }

  // 计算 %
  calculatePrecent = (index: number) => {
    if (!this.fileObject) {
      return;
    }
    const { chunkFileList } = this.fileObject;
    this.uploadedList.push(index);
    const originPercent: number = (this.uploadedList.length / chunkFileList.length) * 100;
    const precent = Number(originPercent.toFixed(2));
    this.notifyPercent(precent);
  }

  beforeUpload = (fileObject: FileObject): void => {
    this.fileObject = fileObject;
    this.uploadedList = [];
    this.startUpload();
  }

  startUpload = async () => {
    if (!this.fileObject) {
      return;
    }
    this.sUpload();
    const { chunkFileList } = this.fileObject;
    if (chunkFileList.length === 0) {
      return;
    }
    const { name, uid } = this.fileObject;

    let verify = null;
    try {
      verify = await this.verifyUpload(name, uid);
    } catch (err) {
      return message.error(err.message);
    }

    if (verify.uploaded) {
      return this.notifyPercent(100, true);
    }

    const uploadedList = verify.uploadedList || [];
    // 操作已经上传的分片
    uploadedList.map((item) => {
      const splitHash: string[] = item.split('-');
      chunkFileList[Number(splitHash[1])].status = 'success';

      // 控制开始位置
      this.uploadFileIndex = Math.min(this.uploadFileIndex, Number(splitHash[1]));

      return this.calculatePrecent(Number(splitHash[1]));
    });

    // 通知开始上传
    this.notifyAisleRequest();
  }

  getNextChunkList = (chunkFileList: ChunkFile[]) => {
    const lastChunkList: ChunkFile[] = chunkFileList.slice(this.uploadFileIndex);
    let lastAisleFlag = 0;
    const nextChunkList: ChunkFile[] = [];

    lastChunkList.some((item) => {
      if (lastAisleFlag === this.aisleFlag) {
        return true;
      }
      if (item.status !== 'success') {
        lastAisleFlag += 1;
        nextChunkList.push(item);
        return false;
      }

      return false;
    });

    this.uploadFileIndex += lastAisleFlag;

    return {
      nextChunkList,
      usedAisle: lastAisleFlag,
    };
  }

  // 通道上传, 控制最大请求 5 条
  notifyAisleRequest = () => {
    const { name, uid, chunkFileList } = this.fileObject as FileObject;
    console.log({
      aisleFlag: this.aisleFlag,
      uploadFileIndex: this.uploadFileIndex,
    });
    if (this.aisleFlag === 0) {
      return;
    }

    const { nextChunkList, usedAisle } = this.getNextChunkList(chunkFileList);
    console.log({
      nextChunkList,
      usedAisle,
    });
    if (nextChunkList.length === 0) {
      return;
    }

    setTimeout(() => {

      this.uploadFileIndex = this.uploadFileIndex + usedAisle;

      this.changeAisleFlag(this.aisleFlag - usedAisle);

      nextChunkList.map(({ chunk, index, status }) => {
        if (status === 'success') {
          return;
        }

        const formData: FormData = new FormData();
        formData.append('filename', name);
        formData.append('filehash', `${uid}-${index}`);
        formData.append('chunk', chunk);
        formData.append('hash', uid);
        formData.append('index', String(index));

        return this.sendRequest(index, formData, retryTime);
      });
    }, 5000);

  }

  // 发送切片
  sendRequest = (index: number, formData: FormData, lastRetryTime: number) => {
    const { chunkFileList } = this.fileObject as FileObject;
    request.post('http://localhost:6001/upload', formData)
      .then((res) => {
        const { data } = res;
        if (data.success) {
          // 上传分片成功
          this.calculatePrecent(index);
          // 更改状态
          chunkFileList[index].status = 'success';

          this.changeAisleFlag(this.aisleFlag + 1);
          console.log(index, '成功');
          return;
        }

        console.log(index, lastRetryTime, '重试');

        // 重试次数没有，直接失败
        if (lastRetryTime === 0) {
          return this.failUpload();
        }
        lastRetryTime -= 1;
        return this.sendRequest(index, formData, lastRetryTime);
      });
  }

  // 验证上传
  verifyUpload = async (filename: string, hash: string) => {
    const res: AxiosResponse<UploadResult> = await request.get('http://localhost:6001/upload/verify', {
      params: {
        filename,
        hash,
      },
    });
    const { data } = res;
    const ret = data.data;
    if (!ret) {
      throw new Error('验证出错');
    }

    return ret;
  }

  // onRemove = (file: UploadFile) => {
  //   const newFileList: UploadFile[] = [...this.state.fileList];
  //   const fileIndex = newFileList.findIndex((f) => f.uid === file.uid);
  //   if (fileIndex === -1) {
  //     return;
  //   }
  //   newFileList.splice(fileIndex, 1);
  //   this.setState({
  //     fileList: newFileList,
  //   });
  // }

  renderPercent = (): React.ReactNode => {
    const { percent } = this.state;
    return (
      <div>
        上传中
        <Progress percent={percent} />
      </div>
    );
  }

  render() {
    const { uploading } = this.state;
    return (
      <div className={Style['upload-box']}>
        <InputFile isUpload={uploading} beforeUpload={this.beforeUpload} />
        {this.renderPercent()}
      </div>
    );
  }
}

export default UploadComp;
