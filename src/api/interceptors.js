import axios from 'axios';

export const APP_BASE_URI = '/api';
const headers = {
  'Content-Type': 'application/json',
};

export const createInstance = (url, options) => {
  const instance = axios.create({
    baseURL: url,
    ...options,
  });
  instance.defaults.timeout = 300000;

  instance.interceptors.request.use(
    (config) => {
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => {
      return error.response;
    }
  );
  instance.interceptors.response.use(
    (response) => {
      // 서버 응답에서 Access Token을 받아온다고 가정
      const accessToken = response.data.accessToken;

      if (accessToken) {
        // Access Token을 로컬 스토리지에 저장
        localStorage.setItem('accessToken', accessToken);
      }

      return response;
    },
    (error) => {
      if (error) {
        return error.response;
      }
    }
  );
  return instance;
};

export const API = createInstance(`${APP_BASE_URI}`, { headers });
