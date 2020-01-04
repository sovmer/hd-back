import Vue from 'vue'
import VueRouter from 'vue-router'
import { Home, Login, NotFound, SetPort, VNC } from '@/views'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/setport',
    name: 'setport',
    component: SetPort
  },
  {
    path: '/vnc',
    name: 'vnc',
    component: VNC
  },
  {
    path: '*',
    name: 'notfound',
    component: NotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
