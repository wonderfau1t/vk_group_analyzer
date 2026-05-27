import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vk.wonderrfau1t.site/api/v1',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;