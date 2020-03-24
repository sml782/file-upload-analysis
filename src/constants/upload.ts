
export type UploadFileStatus = 'error' | 'success' | 'done' | 'uploading' | 'removed';

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
  originFileObj?: File | Blob;
  type: string;
}
