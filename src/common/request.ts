import axios, { AxiosInstance } from 'axios';

const instance: AxiosInstance = axios.create({
  baseURL: 'http://localhos:6001/',
  timeout: 1000,
  withCredentials: true,
  // headers: {'X-Custom-Header': 'foobar'},
});

export default instance;
