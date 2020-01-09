<template>
  <div id="login">
    <el-card>
      <div slot="header">
        <div class="header">登录</div>
      </div>
      <div>
        <el-input v-model="username" placeholder="用户名" prefix-icon="el-icon-user" class="input"></el-input>
        <el-input v-model="password" placeholder="密码" show-password prefix-icon="el-icon-lock" class="input"></el-input>
        <el-button type="primary" @click="onLoginClick" :loading="loginLoading" class="login-btn">登录</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from '@/utils/axios'
import { API, STROGE } from '@/constants'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      loginLoading: false
    }
  },
  methods: {
    async onLoginClick() {
      this.loginLoading = true
      const res = await axios.post(API.LOGIN, {
        password: this.password,
        username: this.username,
        realm: 'pam'
      })
      this.loginLoading = false
      if (res) {
        const data = res.data.data
        const now = new Date();
        const time = now.getTime();
        const expireTime = time + 1000*3600000;
        now.setTime(expireTime);
        document.cookie = `PVEAuthCookie=${data.ticket}`;
        localStorage.setItem('password', data.ticket)
        localStorage.setItem(STROGE.USERNAME, data.username)
        this.$router.replace({ name: 'home' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>

#login {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header {
  text-align: center;
}

.input {
  margin-bottom: 20px;
}

.login-btn {
  float: right;
  margin-bottom: 20px;
}
</style>