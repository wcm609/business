<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
      <div class="particle-grid">
        <div v-for="n in 20" :key="n" class="particle" :style="particleStyle(n)"></div>
      </div>
    </div>

    <div class="login-card">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-icon-wrap">
          <el-icon class="logo-icon" :size="40"><ShoppingCart /></el-icon>
        </div>
        <h1 class="site-title">可乐商城</h1>
        <p class="site-desc">欢迎回来，开始你的购物之旅</p>
      </div>

      <!-- 表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="form.userName"
            placeholder="请输入用户名"
            :prefix-icon="User"
            class="cool-input"
          />
        </el-form-item>

        <el-form-item label="密码" prop="userPassword">
          <el-input
            v-model="form.userPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            class="cool-input"
          >
            <template #suffix>
              <el-icon class="password-toggle" @click="showPassword = !showPassword">
                <Hide v-if="!showPassword" />
                <View v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="form-options">
          <span class="forgot-password" @click="handleForgot">忘记密码？</span>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn glow-btn"
            :loading="loading"
            @click="handleLogin"
          >
            <span v-if="!loading">登 录</span>
          </el-button>
        </el-form-item>
      </el-form>

      <div class="divider">
        <span class="divider-text">还没有账号？</span>
      </div>

      <el-button class="register-btn" @click="goRegister">
        创建新账号
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ShoppingCart,
  User,
  Lock,
  Hide,
  View
} from '@element-plus/icons-vue'
import { userApi } from '../api'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  userName: '',
  userPassword: ''
})

const rules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await userApi.login(form.userName, form.userPassword)
    if (res.code === 200) {
      const data = res.data
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('userName', form.userName)
      ElMessage.success('登录成功')
      const redirect = route.query.redirect || '/products'
      router.push(redirect)
    }
  } catch (e) {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

const handleForgot = () => {
  ElMessage.info('请联系管理员重置密码')
}

const goRegister = () => {
  router.push('/register')
}

// 生成随机粒子样式
const particleStyle = (i) => {
  const size = Math.random() * 6 + 2
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${Math.random() * 6 + 4}s`,
    opacity: Math.random() * 0.5 + 0.2
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0b0e1a;
}

/* ===== 背景装饰 ===== */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: floatShape 20s ease-in-out infinite;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea, #409EFF);
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #764ba2, #667eea);
  bottom: -10%;
  right: -10%;
  animation-delay: -5s;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #409EFF, #36d1dc);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

.shape-4 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  top: 20%;
  right: 15%;
  animation-delay: -7s;
  opacity: 0.3;
}

.shape-5 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  bottom: 15%;
  left: 10%;
  animation-delay: -14s;
  opacity: 0.25;
}

@keyframes floatShape {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  25% {
    transform: translate(30px, -40px) scale(1.05) rotate(5deg);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95) rotate(-3deg);
  }
  75% {
    transform: translate(40px, 30px) scale(1.02) rotate(4deg);
  }
}

/* 粒子网格 */
.particle-grid {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: particleFloat linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

/* ===== 登录卡片 ===== */
.login-card {
  width: 420px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 44px 40px;
  position: relative;
  z-index: 1;
  animation: cardEnter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #409EFF, #667eea);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.35);
  animation: pulseGlow 3s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(64, 158, 255, 0.35);
  }
  50% {
    box-shadow: 0 8px 48px rgba(64, 158, 255, 0.55);
  }
}

.logo-icon {
  color: #fff !important;
}

.site-title {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 8px;
  letter-spacing: 3px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.site-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  letter-spacing: 1px;
}

/* 表单 */
.login-form {
  margin-top: 8px;
}

/* 覆盖 Element Plus 输入框暗色样式 */
.login-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 13px;
  padding-bottom: 4px;
}

.login-form :deep(.cool-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: none;
  padding: 4px 16px;
  transition: all 0.3s ease;
}

.login-form :deep(.cool-input .el-input__wrapper:hover) {
  border-color: rgba(64, 158, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.login-form :deep(.cool-input .el-input__wrapper.is-focus) {
  border-color: #409EFF;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

.login-form :deep(.cool-input .el-input__inner) {
  color: #fff;
  height: 44px;
}

.login-form :deep(.cool-input .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.3);
}

.login-form :deep(.cool-input .el-input__prefix) {
  color: rgba(255, 255, 255, 0.4);
}

.login-form :deep(.cool-input .el-input__suffix) {
  color: rgba(255, 255, 255, 0.4);
}

/* 密码切换 */
.password-toggle {
  cursor: pointer;
  transition: color 0.3s;
}

.password-toggle:hover {
  color: #409EFF;
}

.form-options {
  display: flex;
  justify-content: flex-end;
  margin-top: -4px;
  margin-bottom: 20px;
}

.forgot-password {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #409EFF;
}

/* 登录按钮 - 发光效果 */
.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  letter-spacing: 4px;
  border: none;
  position: relative;
  overflow: hidden;
}

.glow-btn {
  background: linear-gradient(135deg, #409EFF, #667eea) !important;
  transition: all 0.3s ease !important;
}

.glow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(64, 158, 255, 0.4) !important;
}

.glow-btn:active {
  transform: translateY(0);
}

.glow-btn::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: linear-gradient(135deg, #409EFF, #667eea, #764ba2);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s;
  animation: rotateGlow 3s linear infinite;
}

.glow-btn:hover::before {
  opacity: 1;
}

@keyframes rotateGlow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

/* 分割线 */
.divider {
  display: flex;
  align-items: center;
  margin: 20px 0 16px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.divider-text {
  padding: 0 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.3s ease !important;
}

.register-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  transform: translateY(-1px);
}
</style>
