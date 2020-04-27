const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const path = require('path');

const app = express();

app.use('/api/**', createProxyMiddleware({
  target: 'https://nas.snas.xyz:8006',
  pathRewrite: {'^/api' : ''},
  secure: false,
  changeOrigin: true,
}));
app.use(express.static(path.resolve(__dirname, '../dist')));

app.listen(10086)