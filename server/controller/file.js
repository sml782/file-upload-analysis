const path = require('path');
const fse = require('fs-extra');
const UPLOAD_BASE_DIR = path.resolve(__dirname, '../receive');

// 获取已经上传列表
const getUploadedList = (path) => {
  if (!fse.existsSync(path)) {
    return [];
  }
  return fse.readdirSync(path).filter(item => !(/^\./.test(item)));
}

exports.verifyFileHas = function (req, res) {
  const { filename, hash } = req.query;
  const fileParse = path.parse(filename);
  const newFileName = `${fileParse.name}.${hash.substr(0, 5)}${fileParse.ext}`;
  const filePath = path.resolve(UPLOAD_BASE_DIR, newFileName);

  // 文件存在
  if (fse.existsSync(filePath)) {
    return res.json({
      success: true,
      data: {
        uploaded: true,
      },
      message: '文件已经存在',
    });
  }

  const uploadedList = getUploadedList(path.resolve(UPLOAD_BASE_DIR, hash));
  return res.json({
    success: true,
    data: {
      uploaded: false,
      uploadedList,
    },
    message: '文件未上传完毕'
  });
};

// 上传文件分片
exports.uploadChunk = function (req, res) {
  // console.log(req.files, typeof req.files, req.files.chunk);

  const { filehash, hash } = req.body;
  const { chunk } = req.files;
  const fileDir = path.resolve(UPLOAD_BASE_DIR, hash);

  if (!fse.existsSync(fileDir)) {
    fse.mkdirSync(fileDir);
  }

  const chunkfile = path.resolve(fileDir, filehash);

  if (fse.existsSync(chunkfile)) {
    return res.json({
      success: true,
      message: '分片已经存在',
    });
  }

  fse.moveSync(chunk.path, chunkfile);

  res.json({
    success: true,
    message: '接收分片成功',
  });
};

const pipeStream = (path, writeStream) => {
  return new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on('end', () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });
}

// 合成文件
exports.mergeChunk = function (req, res) {
  const { hash, filename, chunksize } = req.body;
  const fileParse = path.parse(filename);
  const newFileName = `${fileParse.name}.${hash.substr(0, 5)}${fileParse.ext}`;
  const filePath = path.resolve(UPLOAD_BASE_DIR, newFileName);
  const chunkDir = path.resolve(UPLOAD_BASE_DIR, hash);
  const chunkPaths = fse.readdirSync(chunkDir);
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序可能会错乱
  chunkPaths.sort((a, b) => a.split('-')[1] - b.split('-')[1]);
  Promise.all(
    chunkPaths.map((chunkPath, index) => {
      const chunkFilePath = path.resolve(chunkDir, chunkPath);
      return pipeStream(
        chunkFilePath,
        // 指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * chunksize,
          end: (index + 1) * chunksize
        })
      );
    })
  ).then(() => {
    // 合并后删除保存切片的目录
    fse.rmdirSync(chunkDir);
    res.json({
      success: true,
      data: {
        filename: filename
      },
      message: '合成文件成功'
    });
  }).catch(() => {
    // 合成文件失败
    res.json({
      success: false,
      data: {
        filename: filename
      },
      message: '合成文件失败'
    });
  })
}
