<template>
  <header class="navbar">
    <div class="nav-inner">
      <!-- 左侧：Logo + 网站名 -->
      <div class="nav-left" @click="goHome">
        <div class="logo-icon-wrap">
          <el-icon :size="22" color="#fff"><ShoppingCart /></el-icon>
        </div>
        <span class="site-name">可乐商城</span>
      </div>

      <!-- 中间：搜索框 -->
      <div class="nav-center">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品..."
            size="large"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" class="search-btn" @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 右侧：用户操作 -->
      <div class="nav-right">
        <template v-if="!isLoggedIn">
          <el-button class="nav-btn nav-btn-ghost" @click="goLogin">登录</el-button>
          <el-button class="nav-btn nav-btn-primary" @click="goRegister">注册</el-button>
        </template>
        <template v-else>
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" class="user-avatar">
                <el-icon :size="18"><UserFilled /></el-icon>
              </el-avatar>
              <span class="username">{{ userName }}</span>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown">
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="orders">
                  <el-icon><List /></el-icon>我的订单
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ShoppingCart,
  Search,
  UserFilled,
  ArrowDown,
  User,
  List,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const searchKeyword = ref('')

const isLoggedIn = computed(() => !!localStorage.getItem('token'))
const userName = computed(() => localStorage.getItem('userName') || '')

const goHome = () => {
  if (isLoggedIn.value) {
    router.push('/products')
  } else {
    router.push('/login')
  }
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/products', query: { keyword: searchKeyword.value.trim() } })
  } else {
    router.push('/products')
  }
}

const goLogin = () => router.push('/login')
const goRegister = () => router.push('/register')

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'orders') {
    router.push('/orders')
  } else if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.04);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 32px;
}

/* 左侧 */
.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #409EFF, #667eea);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-left:hover .logo-icon-wrap {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.site-name {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #303133, #409EFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

/* 中间搜索 */
.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.search-box {
  display: flex;
  width: 100%;
  max-width: 480px;
  align-items: stretch;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 10px 0 0 10px;
  box-shadow: none !important;
  border: 2px solid #e4e7ed;
  border-right: none;
  background: #fff;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover),
.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409EFF;
}

.search-input :deep(.el-input__inner) {
  height: 42px;
  font-size: 14px;
}

.search-icon {
  color: #c0c4cc;
}

.search-btn {
  border-radius: 0 10px 10px 0 !important;
  height: 42px;
  width: 48px;
  padding: 0;
  font-size: 18px;
}

/* 右侧 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.nav-btn {
  height: 36px;
  border-radius: 20px;
  padding: 0 20px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.nav-btn-ghost {
  border: 1px solid #dcdfe6 !important;
  background: transparent !important;
  color: #606266 !important;
}

.nav-btn-ghost:hover {
  border-color: #409EFF !important;
  color: #409EFF !important;
  background: rgba(64, 158, 255, 0.04) !important;
}

.nav-btn-primary {
  background: linear-gradient(135deg, #409EFF, #667eea) !important;
  border: none !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.nav-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.35) !important;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px 4px 4px;
  border-radius: 20px;
  transition: background 0.3s ease;
}

.user-info:hover {
  background: rgba(0, 0, 0, 0.03);
}

.user-avatar {
  background: linear-gradient(135deg, #409EFF, #667eea);
  flex-shrink: 0;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 12px;
  color: #c0c4cc;
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.user-dropdown :deep(.el-dropdown-menu__item) {
  font-size: 14px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-dropdown :deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}

.user-dropdown :deep(.el-dropdown-menu__item--divided) {
  border-top-color: #f0f0f0;
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-inner {
    gap: 12px;
    padding: 0 12px;
  }

  .nav-center {
    order: 3;
    width: 100%;
    position: absolute;
    top: 64px;
    left: 0;
    padding: 8px 12px;
    background: inherit;
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .search-box {
    max-width: 100%;
  }

  .site-name {
    font-size: 16px;
  }
}
</style>
