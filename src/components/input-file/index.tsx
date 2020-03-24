import React, { Component } from 'react';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FileObject } from '../../constants/upload';
import Style from './index.module.scss';

interface IProps {
  beforeUpload?: (file: FileObject) => void;
}

class InputFile extends Component<IProps> {

  public lastFile: File | null = null;

  private inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  private handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {files} = event.target;
    if (!files) {
      return;
    }
    const [file] = files;
    if (!file) {
      return;
    }
    console.dir(file);
  }

  onSelect = () => {
    const { current: inputElement } = this.inputRef;
    if (!inputElement) {
      return;
    }

    inputElement.click();
  }

  render() {
    return (
      <div className={Style.upload}>
        <Button
          className={Style['upload-btn']}
          type="ghost"
          size="large"
          onClick={this.onSelect}
        >
          <UploadOutlined /> Select File
          <input
            className={Style['upload-input']}
            ref={this.inputRef}
            type="file"
            name="file"
            onChange={this.handleChangeFile}
          />
        </Button>
      </div>
    );
  }
}

export default InputFile;
