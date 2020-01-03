module.exports = {
  transpileDependencies: [
    'vue-echarts',
    'resize-detector'
  ],
  configureWebpack: {
    devServer: {
      proxy: {
        '/api': {
          target: 'https://nas.snas.xyz:8006',
          pathRewrite: {'^/api' : ''},
          secure: false
        }
      }
    }
  }
}