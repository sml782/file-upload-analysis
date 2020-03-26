const express = require('express');
const multipart = require('connect-multiparty');
const router = express.Router();
const file = require('../controller/file');

// 上传处理分片
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: null,
    message: '这里是上传',
  })
});
router.post('/', multipart(), file.uploadChunk);

// 合成切片
router.post('/merge', multipart(), file.mergeChunk);

// 验证切片
router.get('/verify', file.verifyFileHas);

module.exports = router;
