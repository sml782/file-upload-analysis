import React, { Component } from 'react';
import { Button, Progress, message } from 'antd';
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

  private uploadedList: Set<number> = new Set()

  private fileObject: FileObject | null = null;

  private uploadFileIndex = 0;

  private aisleFlag = retryTime;

  // 获取文件上传是否出错
  getIsUploadError = (iswarn = true) => {
    const { status: fileStatus } = this.fileObject as FileObject;
    if (fileStatus !== 'error') {
      return false;
    }
    if (iswarn) {
      message.error('文件已经上传出错, 请重试');
    }
    return true;
  }

  // 更改控制请求通道
  changeAisleFlag = (aisleFlag: number, notUpload?: boolean) => {
    this.aisleFlag = aisleFlag;
    if (aisleFlag === 0) {
      return;
    }

    if (notUpload) {
      return;
    }

    if (this.getIsUploadError()) {
      return;
    }

    // 通知取出分片上传
    return this.notifyAisleRequest();
    // return () => 1;
  }

  retryUpload = () => {
    message.success('重新尝试文件上传');
    this.startUpload();
  }

  sUpload = () => {
    (this.fileObject as FileObject).status = 'uploading';
    this.uploadFileIndex = 0;
    this.setState({
      uploading: true,
      percent: 0,
    }, () => this.changeAisleFlag(5, true));
  }

  eUpload = () => {
    this.setState({
      uploading: false,
    });
  }



  // 上传失败
  failUpload = () => {
    message.success('文件上传失败');
    this.uploadFileIndex = 0;
    (this.fileObject as FileObject).status = 'error';
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
    console.log('上传切片成功');
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
    this.uploadedList.add(index);
    console.log(this.uploadedList);
    const originPercent: number = (this.uploadedList.size / chunkFileList.length) * 100;
    const precent = Number(originPercent.toFixed(2));
    this.notifyPercent(precent);
  }

  beforeUpload = (fileObject: FileObject): void => {
    this.fileObject = fileObject;
    this.uploadedList.clear();
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
    this.changeAisleFlag(this.aisleFlag - lastAisleFlag, true);

    return {
      nextChunkList,
      usedAisle: lastAisleFlag,
    };
  }

  // 通道上传, 控制最大请求 5 条
  notifyAisleRequest = () => {
    const { name, uid, chunkFileList } = this.fileObject as FileObject;

    if (this.getIsUploadError()) {
      return;
    }

    if (this.aisleFlag === 0) {
      return;
    }

    const { nextChunkList } = this.getNextChunkList(chunkFileList);
    if (nextChunkList.length === 0) {
      return;
    }

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

          this.changeAisleFlag(this.aisleFlag + 1, this.getIsUploadError(false));
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

  // 下一组分片
  nextGroupChunk = () => {
    if (!this.fileObject) {
      return message.warn('请先上传文件');
    }
    this.notifyAisleRequest();
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
        <Button type="primary" onClick={this.nextGroupChunk} >下一组分片</Button>
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
        <Button onClick={this.retryUpload}>重试</Button>
      </div>
    );
  }
}

export default UploadComp;
