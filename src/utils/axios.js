import axios from 'axios'
import vue from '@/main'
import qs from 'qs'

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true
})
let CSRFPreventionToken = ''

axiosInstance.interceptors.request.use(function (config) {
  if (config.method !== 'get') {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    config.data = qs.stringify(config.data)
  }
  config.headers['CSRFPreventionToken'] = CSRFPreventionToken
  return config;
}, function (error) {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(function (response) {
  if (response.data.data.CSRFPreventionToken) {
    CSRFPreventionToken = response.data.data.CSRFPreventionToken
  }

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