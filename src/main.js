import Vue from 'vue'
import ElementUI from 'element-ui';
import ECharts from 'vue-echarts'
import 'element-ui/lib/theme-chalk/index.css';

import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.component('v-chart', ECharts)

const vue = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

export default vue