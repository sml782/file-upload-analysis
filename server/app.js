const express  = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const multipart = require('connect-multiparty');

const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// cors
app.options('*', cors({
  origin: 'http://127.0.0.1:3000/',
  methods: ['GET', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
}));

app.get('/upload', multipart(), (req, res) => {
  res.json({
    success: true
  });
});

app.post('/upload', multipart(), (req, res) => {
  console.log(req.body, req.files);
  res.json({
    success: true
  });
  res.end(123);
});

app.listen(6001);
