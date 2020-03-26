import React, { Component, Fragment } from 'react';
import { Button, Progress, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import calculateHash from '../../common/file-hash';
import { FileObject, ChunkFile, initChunkSize, retryTime } from '../../constants/upload';
import Style from './index.module.scss';

interface IProps {
  isUpload: boolean;
  beforeUpload?: (fileObject: FileObject) => void;
}
interface IState {
  hashing: boolean;
  hashPrecent: number;
}

class InputFile extends Component<IProps, IState> {

  readonly state = {
    hashing: false,
    hashPrecent: 0,
  }

  // 上次选择文件
  private lastFile: File | null = null;

  // 上次文件对象
  public lastFileObject: FileObject | null = null;

  // 上次文件分片列表
  public lastChunkList: ChunkFile[] = [];

  // input file
  private inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  // 选择文件后
  handleChangeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {files} = event.target;
    if (!files) {
      return;
    }
    const file: File = files[0];
    if (!file) {
      return;
    }
    this.lastFile = file;
    console.log(file);

    // 清空inputfile
    this.clearInputFile();

    // 分片
    this.createChunkList();

    // 开始计算 hash
    this.startCalculateHash();

    // 计算 hash
    let hash = null;
    try {
      hash = await calculateHash(this.lastChunkList, this.handleChangePercent);
      if (hash) {
        this.handleCreateFileObject(hash);
      }
    } catch (err) {
      message.error('计算出错，暂停上传');
    }
    setTimeout(() => {
      this.endCalculateHash();
    }, 1000);
  }

  // 开始计算 hash
  private startCalculateHash = (): void => {
    this.setState({
      hashing: true,
    });
  }

  // 结束计算 hash
  private endCalculateHash = (): void => {
    this.setState({
      hashing: false,
    });
  }

  // 更改 hash %
  handleChangePercent = (precent: number): void => {
    this.setState({
      hashPrecent: precent,
    });
  }

  // 清空 input
  clearInputFile = (): void => {
    const { current: inputElement } = this.inputRef;
    // 清空文件
    if (!inputElement) {
      return;
    }
    inputElement.value = '';
  }

  // 构建文件对象
  handleCreateFileObject = (hash: string): void => {
    const { beforeUpload } = this.props;
    const { size, name, type, lastModified } = this.lastFile as File;
    this.lastFileObject = {
      uid: hash,
      size,
      name,
      fileName: name,
      lastModified,
      lastModifiedDate: new Date(lastModified),
      status: 'uploading',
      percent: 0,
      originFileObj: this.lastFile  as File,
      chunkFileList: this.lastChunkList,
      type,
    };

    if (!beforeUpload) {
      return;
    }

    // 开始准备上传工作
    beforeUpload(this.lastFileObject);
  }

  createChunkList = (): void => {
    if (!this.lastFile) {
      return;
    }
    const totalSize: number = this.lastFile.size;
    let currentSize = 0;
    let chunkIndex = 0;
    const chunkList: ChunkFile[] = [];
    while (currentSize < totalSize) {
      chunkList.push({
        chunk: this.lastFile.slice(currentSize, currentSize + initChunkSize),
        index: chunkIndex,
        status: 'uploading',
        retryTime,
      });
      chunkIndex += 1;
      currentSize += initChunkSize;
    }
    this.lastChunkList = chunkList;
  }

  onSelect = (): void => {
    const { current: inputElement } = this.inputRef;
    if (!inputElement) {
      return;
    }

    inputElement.click();
  }

  renderPercent = (): React.ReactNode => {
    const { hashPrecent, hashing } = this.state;
    if (!hashing) {
      return null;
    }
    return (
      <div>
        计算hash中
        <Progress percent={hashPrecent} />
      </div>
    );
  }

  render() {
    const { isUpload } = this.props;
    const { hashing } = this.state;
    return (
      <div className={Style.upload}>
        <Button
          className={Style['upload-btn']}
          type="ghost"
          size="large"
          onClick={this.onSelect}
          loading={hashing || isUpload}
        >
          {hashing ?
            'Upload' :
            (
              <Fragment><UploadOutlined /> Select File</Fragment>
            )
          }
          <input
            className={Style['upload-input']}
            ref={this.inputRef}
            type="file"
            name="file"
            onChange={this.handleChangeFile}
          />
        </Button>
        {this.renderPercent()}
      </div>
    );
  }
}

export default InputFile;
