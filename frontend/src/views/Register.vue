<template>
  <div class="register-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="particle-grid">
        <div v-for="n in 16" :key="n" class="particle" :style="particleStyle(n)"></div>
      </div>
    </div>

    <div class="register-card">
      <div class="logo-section">
        <div class="logo-icon-wrap">
          <el-icon class="logo-icon" :size="36"><ShoppingCart /></el-icon>
        </div>
        <h1 class="site-title">创建账号</h1>
        <p class="site-desc">加入可乐商城，开始购物之旅</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        class="register-form"
        @keyup.enter="handleRegister"
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
            type="password"
            placeholder="至少6位密码"
            :prefix-icon="Lock"
            class="cool-input"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            class="cool-input"
            show-password
          />
        </el-form-item>

        <el-form-item label="手机号" prop="userPhone">
          <el-input
            v-model="form.userPhone"
            placeholder="请输入手机号"
            :prefix-icon="Iphone"
            class="cool-input"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn glow-btn"
            :loading="loading"
            @click="handleRegister"
          >
            <span v-if="!loading">注 册</span>
          </el-button>
        </el-form-item>
      </el-form>

      <div class="divider">
        <span class="divider-text">已有账号？</span>
      </div>

      <el-button class="login-btn" @click="goLogin">
        返回登录
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ShoppingCart,
  User,
  Lock,
  Iphone
} from '@element-plus/icons-vue'
import { userApi } from '../api'

const router = useRouter()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  userName: '',
  userPassword: '',
  confirmPassword: '',
  userPhone: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.userPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号格式'))
  } else {
    callback()
  }
}

const rules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  userPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await userApi.register({
      userName: form.userName,
      userPassword: form.userPassword,
      userPhone: form.userPhone
    })
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    }
  } catch (e) {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push('/login')
}

const particleStyle = (i) => {
  const size = Math.random() * 5 + 2
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${Math.random() * 6 + 4}s`,
    opacity: Math.random() * 0.4 + 0.15
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0b0e1a;
}

.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  animation: floatShape 20s ease-in-out infinite;
}

.shape-1 {
  width: 450px;
  height: 450px;
  background: linear-gradient(135deg, #667eea, #409EFF);
  top: -15%;
  right: -10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #764ba2, #f093fb);
  bottom: -10%;
  left: -10%;
  animation-delay: -5s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #409EFF, #36d1dc);
  top: 40%;
  left: 60%;
  animation-delay: -10s;
}

@keyframes floatShape {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(30px, -40px) scale(1.05) rotate(5deg); }
  50% { transform: translate(-20px, 20px) scale(0.95) rotate(-3deg); }
  75% { transform: translate(40px, 30px) scale(1.02) rotate(4deg); }
}

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
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
}

/* 卡片 */
.register-card {
  width: 440px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  position: relative;
  z-index: 1;
  animation: cardEnter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(40px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, #409EFF, #667eea);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.35);
}

.logo-icon { color: #fff !important; }

.site-title {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px;
  letter-spacing: 2px;
}

.site-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* 表单暗色样式 */
.register-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 13px;
  padding-bottom: 4px;
}

.register-form :deep(.cool-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: none;
  padding: 4px 16px;
  transition: all 0.3s ease;
}

.register-form :deep(.cool-input .el-input__wrapper:hover) {
  border-color: rgba(64, 158, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.register-form :deep(.cool-input .el-input__wrapper.is-focus) {
  border-color: #409EFF;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

.register-form :deep(.cool-input .el-input__inner) {
  color: #fff;
  height: 42px;
}

.register-form :deep(.cool-input .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.3);
}

.register-form :deep(.cool-input .el-input__prefix) {
  color: rgba(255, 255, 255, 0.4);
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  letter-spacing: 4px;
  border: none;
}

.glow-btn {
  background: linear-gradient(135deg, #409EFF, #667eea) !important;
  transition: all 0.3s ease !important;
}

.glow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(64, 158, 255, 0.4) !important;
}

.divider {
  display: flex;
  align-items: center;
  margin: 16px 0 12px;
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

.login-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.3s ease !important;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  transform: translateY(-1px);
}
</style>
