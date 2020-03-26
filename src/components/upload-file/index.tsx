import React, { Component } from 'react';
import { Progress, message } from 'antd';
import { AxiosResponse } from 'axios';
import { FileObject, initChunkSize, UploadResult } from '../../constants/upload';
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

  sUpload = () => {
    this.setState({
      uploading: true,
      percent: 0,
    });
  }

  eUpload = () => {
    this.setState({
      uploading: false,
    });
  }

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
      const splitHash = item.split('-');
      return this.calculatePrecent(Number(splitHash[1]));
    });

    // 验证分片是否上传
    const validChunkUploaded = (hash: string, index: number) => {
      const chunkHash = `${hash}-${index}`;
      return uploadedList.includes(chunkHash);
    };

    const requestList = chunkFileList
      .map(({ chunk, index }) => {
        const isUploaded = validChunkUploaded(uid, index);
        if (isUploaded) {
          return;
        }

        const formData: FormData = new FormData();
        formData.append('filename', name);
        formData.append('filehash', `${uid}-${index}`);
        formData.append('chunk', chunk);
        formData.append('hash', uid);
        formData.append('index', String(index));
        return request.post('http://localhost:6001/upload', formData)
          .then(() => this.calculatePrecent(index));
      });
    await Promise.all(requestList);
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
    const { percent, uploading } = this.state;
    if (!uploading) {
      return null;
    }
    return (
      <div>
        上传中
        <Progress percent={percent} />
      </div>
    );
  }

  render() {
    return (
      <div className={Style['upload-box']}>
        <InputFile beforeUpload={this.beforeUpload} />
        {this.renderPercent()}
      </div>
    );
  }
}

export default UploadComp;
