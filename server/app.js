const express  = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const router = require('./route/index');

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

app.use('/upload', router)

app.listen(6001);
