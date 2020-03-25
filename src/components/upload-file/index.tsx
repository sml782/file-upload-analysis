import React, { Component } from 'react';
// import { Button } from 'antd';
import { FileObject } from '../../constants/upload';
import InputFile from '../input-file';
import request from '../../common/request';

interface IState {
  fileList: FileObject[];
  uploading: boolean;
}

class UploadComp extends Component<{}, IState> {

  // readonly state = {
  //   fileList: [],
  //   uploading: false,
  // };

  private fileObject: FileObject | null = null;

  beforeUpload = (fileObject: FileObject): void => {
    this.fileObject = fileObject;
    this.startUpload();
  }

  startUpload = async () => {
    if (!this.fileObject) {
      return;
    }
    const { chunkFileList } = this.fileObject;
    if (chunkFileList.length === 0) {
      return;
    }
    const { name, uid } = this.fileObject;
    const requestList = chunkFileList
      .map(({ chunk, index }) => {
        const formData: FormData = new FormData();
        formData.append('filename', name);
        formData.append('chunk', chunk);
        formData.append('hash', uid);
        formData.append('index', String(index));
        return request.post('/upload', formData);
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

  render() {
    // const { fileList, uploading } = this.state;
    return (
      <div>
        <InputFile beforeUpload={this.beforeUpload} />
      </div>
    );
  }
}

export default UploadComp;
