import React, { Component } from 'react';
import { Button } from 'antd';
import { FileObject } from '../../constants/upload';
import InputFile from '../input-file';

interface IState {
  fileList: FileObject[];
  uploading: boolean;
}

class UploadComp extends Component<{}, IState> {

  // readonly state = {
  //   fileList: [],
  //   uploading: false,
  // };

  // beforeUpload = (file: UploadFile): boolean => {
  //   const { fileList } = this.state;
  //   this.setState({
  //     fileList: [...fileList, file],
  //   });
  //   return false;
  // }

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
        {/* <Button
          type="primary"
          onClick={this.handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? 'Uploading' : 'Start Upload'}
        </Button> */}
      </div>
    );
  }
}

export default UploadComp;
