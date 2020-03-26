
export type UploadFileStatus = 'error' | 'success' | 'done' | 'uploading' | 'removed';

export interface ChunkFile {
  chunk: File | Blob;
  index: number;
  status?: Omit<UploadFileStatus, 'removed'>;
  retryTime: number;
}

export interface FileObject {
  uid: string;
  size: number;
  name: string;
  fileName?: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  url?: string;
  status?: UploadFileStatus;
  percent?: number;
  originFileObj: File | Blob;
  chunkFileList: ChunkFile[];
  type: string;
}

export interface UploadResult {
  success: boolean;
  data?: {
    uploaded?: boolean;
    uploadedList?: string[];
    filename?: string;
  };
  message: string;
}

// 初始切片大小
export const initChunkSize: number = 1024 * 1024;

// 重试次数
export const retryTime = 5;
