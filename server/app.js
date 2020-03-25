const express  = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const multipart = require('connect-multiparty');

const path = require('path');
const fse = require('fs-extra');
const UPLOAD_BASE_DIR = path.resolve(__dirname, './receive');

const app = express();

// cors
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
}))

// cookie
app.use(cookieParser());
// body
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/upload', (req, res) => {
  res.json({
    success: true
  });
});

app.post('/upload', multipart(), (req, res) => {
  // console.log(req.files, typeof req.files, req.files.chunk);

  console.log(req.files.chunk);
  const { filename, hash, index } = req.body;
  const { chunk } = req.files;
  const fileDir = path.resolve(UPLOAD_BASE_DIR, `./${hash}`);
  app.set('upload_dir', fileDir);

  if (!fse.existsSync(fileDir)) {
    fse.mkdirSync(fileDir);
  }

  const chunkname = `${hash}-${index}`;
  const chunkfile = path.resolve(fileDir, `./${chunkname}`);

  if (fse.existsSync(chunkfile)) {
    return res.json({
      success: true
    });
  }

  fse.moveSync(chunk.path, chunkfile)

  res.status(200).end('not')
});

app.listen(6001);
