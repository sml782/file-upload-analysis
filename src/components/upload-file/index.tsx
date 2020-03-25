import React, { Component } from 'react';
import { Progress } from 'antd';
import { FileObject, initChunkSize } from '../../constants/upload';
import InputFile from '../input-file';
import request from '../../common/request';

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

  notifyPercent = (percent: number) => {
    this.setState({
      percent,
    });
    if (percent !== 100) {
      return;
    }
    setTimeout(this.eUpload, 1000);
    const { name, uid } = this.fileObject as FileObject;
    const formData: FormData = new FormData();
    formData.append('filename', name);
    formData.append('hash', uid);
    formData.append('chunksize', String(initChunkSize));
    request.post('http://localhost:6001/upload/merge', formData);
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
    const requestList = chunkFileList
      .map(({ chunk, index }) => {
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

  // handleUpload = () => {

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
    // const { fileList, uploading } = this.state;
    return (
      <div>
        <InputFile beforeUpload={this.beforeUpload} />
        {this.renderPercent()}
      </div>
    );
  }
}

export default UploadComp;
