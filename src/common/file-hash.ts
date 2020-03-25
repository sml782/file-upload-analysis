import SparkMD5 from 'spark-md5';
import { ChunkFile } from '../constants/upload';

interface CalculateHash {
  (chunkList: ChunkFile[], callback: (precent: number) => void): Promise<string | null>
}

const calculateHash: CalculateHash = (chunkList, callback) => {
  const spark: SparkMD5.ArrayBuffer = new SparkMD5.ArrayBuffer();
  const fileReader: FileReader = new FileReader();

  const res: Promise<string | null> = new Promise((resolve, reject) => {
    const cListLength = chunkList.length;
    if (cListLength === 0) {
      return resolve(null);
    }

    let tagnum = 0;

    function loadNext(): void {
      const { chunk } = chunkList[tagnum];
      fileReader.readAsArrayBuffer(chunk);
    }

    fileReader.addEventListener('load', () => {
      spark.append(fileReader.result as ArrayBuffer); // Append array buffer
      const percent: number = (tagnum / cListLength) * 100;
      callback(Number(percent.toFixed(2)));
      tagnum += 1;

      if (tagnum < cListLength) {
        loadNext();
      } else {
        callback(100);
        const resultHash: string = spark.end();
        console.info('computed hash', resultHash); // Compute hash
        resolve(resultHash); // Compute hash
      }
    });

    fileReader.addEventListener('error', function (error) {
      console.warn('oops, something went wrong.');
      reject(error);
    });

    loadNext();
  });

  return res;
};

export default calculateHash;
