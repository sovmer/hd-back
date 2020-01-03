import axios from 'axios'
import vue from '@/main'
import qs from 'qs'

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true
})

axiosInstance.interceptors.request.use(function (config) {
  if (config.method !== 'get') {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    config.data = qs.stringify(config.data)
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (!error.response) {
    vue.$message.error(error)
    return;
  }
  switch(error.response.status) {
    case 401:
      vue.$message.error(error.response.statusText)
      vue.$router.replace({ name: 'login' })
      return;
    default:
      vue.$message.error(error.response.statusText)
      break
  }
});

export default axiosInstance