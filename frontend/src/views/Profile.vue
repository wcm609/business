<template>
  <div class="profile-page">
    <div class="profile-layout">
      <!-- 左侧用户卡片 -->
      <div class="profile-sidebar">
        <div class="user-card">
          <div class="avatar-wrap">
            <el-avatar :size="88" class="avatar">
              <el-icon :size="48"><UserFilled /></el-icon>
            </el-avatar>
            <div class="avatar-badge"></div>
          </div>
          <h2 class="username">{{ userName }}</h2>
          <p class="phone">{{ maskPhone(userPhone) }}</p>
          <div class="user-card-footer">
            <el-button type="primary" size="small" round @click="goOrders('all')">
              查看订单
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="profile-main">
        <!-- 订单统计 -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">📊 订单统计</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item" @click="goOrders('0')">
              <div class="stat-badge wait">
                <span class="stat-number">{{ pendingCount }}</span>
              </div>
              <span class="stat-label">待付款</span>
            </div>
            <div class="stat-item" @click="goOrders('3')">
              <div class="stat-badge done">
                <span class="stat-number">{{ completedCount }}</span>
              </div>
              <span class="stat-label">已完成</span>
            </div>
            <div class="stat-item" @click="goOrders('4')">
              <div class="stat-badge cancel">
                <span class="stat-number">{{ cancelledCount }}</span>
              </div>
              <span class="stat-label">已取消</span>
            </div>
          </div>
        </div>

        <!-- 个人信息 -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">👤 个人信息</h3>
          </div>
          <div class="info-list">
            <div class="info-row">
              <span class="info-label">用户名</span>
              <span class="info-value">{{ userName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">手机号</span>
              <span class="info-value">{{ maskPhone(userPhone) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">注册时间</span>
              <span class="info-value">{{ formatDate(registerTime) || '--' }}</span>
            </div>
          </div>
        </div>

        <!-- 修改密码 -->
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">🔒 修改密码</h3>
          </div>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            size="large"
            class="password-form"
          >
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入旧密码"
                show-password
                class="psw-input"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="至少6位密码"
                show-password
                class="psw-input"
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                class="psw-input"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="change-btn" @click="handleChangePassword">
                确认修改
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { userApi, orderApi } from '../api'
import { maskPhone, formatDate } from '../utils'

const router = useRouter()

const userName = ref(localStorage.getItem('userName') || '')
const userPhone = ref('')
const registerTime = ref('')
const pendingCount = ref(0)
const completedCount = ref(0)
const cancelledCount = ref(0)

const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirm = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else { callback() }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

onMounted(async () => {
  await fetchUserInfo()
  await fetchOrderStats()
})

const fetchUserInfo = async () => {
  try {
    const userId = localStorage.getItem('userId')
    const res = await userApi.info(userId)
    if (res.code === 200) {
      const data = res.data
      userPhone.value = data.userPhone || ''
      registerTime.value = data.userRegisterTime || data.createTime || ''
    }
  } catch (e) {}
}

const fetchOrderStats = async () => {
  try {
    const userId = localStorage.getItem('userId')
    const res = await orderApi.list(userId)
    if (res.code === 200) {
      const list = res.data
      if (Array.isArray(list)) {
        pendingCount.value = list.filter(item => item.orderStatus === 0).length
        completedCount.value = list.filter(item => item.orderStatus === 3).length
        cancelledCount.value = list.filter(item => item.orderStatus === 4).length
      }
    }
  } catch (e) {}
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return
  ElMessage.info('密码修改功能暂未开放')
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const goOrders = (tab) => {
  router.push({ path: '/orders', query: { tab } })
}
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 84px auto 40px;
  padding: 0 20px;
}

.profile-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 左侧 */
.profile-sidebar {
  flex: 0 0 280px;
  position: sticky;
  top: 84px;
}

.user-card {
  background: #fff;
  border-radius: 20px;
  padding: 36px 24px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(135deg, #409EFF, #667eea);
  opacity: 0.08;
}

.avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.avatar {
  background: linear-gradient(135deg, #409EFF, #667eea) !important;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  transition: transform 0.3s ease;
}

.avatar:hover { transform: scale(1.05); }

.avatar-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: #67c23a;
  border: 3px solid #fff;
  border-radius: 50%;
}

.username {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 6px;
}

.phone {
  font-size: 14px;
  color: #909399;
  margin: 0 0 20px;
}

.user-card-footer {
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

/* 右侧 */
.profile-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.section-header { margin-bottom: 20px; }

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

/* 订单统计 */
.stats-grid {
  display: flex;
  gap: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 24px 12px;
  border-radius: 14px;
  background: #fafbfc;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-badge {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.stat-badge.wait { background: linear-gradient(135deg, #fdf6ec, #fce6c8); }
.stat-badge.done { background: linear-gradient(135deg, #f0f9eb, #d8f0c8); }
.stat-badge.cancel { background: linear-gradient(135deg, #f5f5f5, #e8e8e8); }

.stat-number {
  font-size: 26px;
  font-weight: 800;
}

.stat-badge.wait .stat-number { color: #e6a23c; }
.stat-badge.done .stat-number { color: #67c23a; }
.stat-badge.cancel .stat-number { color: #909399; }

.stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

/* 个人信息 */
.info-list { display: flex; flex-direction: column; }

.info-row {
  display: flex;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child { border-bottom: none; }

.info-label {
  width: 100px;
  font-size: 14px;
  color: #909399;
  flex-shrink: 0;
}

.info-value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

/* 修改密码 */
.password-form { max-width: 480px; }

.psw-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: none !important;
  border: 2px solid #e4e7ed;
  transition: all 0.3s ease;
}

.psw-input :deep(.el-input__wrapper:hover),
.psw-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409EFF;
}

.change-btn {
  border-radius: 10px;
  padding: 10px 32px;
  font-weight: 600;
  background: linear-gradient(135deg, #409EFF, #667eea) !important;
  border: none !important;
  transition: all 0.3s ease !important;
}

.change-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.3) !important;
}

@media (max-width: 768px) {
  .profile-layout { flex-direction: column; }
  .profile-sidebar { flex: none; width: 100%; position: static; }
  .stats-grid { flex-direction: column; gap: 12px; }
}
</style>
