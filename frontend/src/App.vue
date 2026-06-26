<template>
  <div id="app-root">
    <NavBar v-if="!isAuthPage" />
    <div :class="{ 'has-nav': !isAuthPage }">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'

const route = useRoute()

const authPages = ['Login', 'Register']
const isAuthPage = computed(() => authPages.includes(route.name))
</script>

<style>
/* ===== 全局样式重置 ===== */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue',
    Helvetica, Arial, sans-serif;
  background: #f0f2f5;
  color: #303133;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  min-height: 100vh;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 内容区域上边距 */
.has-nav {
  padding-top: 64px;
}

/* ===== 页面切换动画 ===== */
.page-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

/* ===== Element Plus 全局覆盖 ===== */
/* 统一的暗色毛玻璃按钮 */
.el-button--primary {
  background: linear-gradient(135deg, #409EFF, #667eea) !important;
  border: none !important;
  transition: all 0.3s ease !important;
}

.el-button--primary:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.3) !important;
}

.el-button--primary:active {
  transform: translateY(0) !important;
}

/* Tag 圆角 */
.el-tag {
  border-radius: 6px;
}

/* Tabs 样式增强 */
.el-tabs__item {
  font-weight: 500 !important;
  transition: color 0.3s !important;
}

.el-tabs__item:hover {
  color: #409EFF !important;
}

.el-tabs__active-bar {
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, #409EFF, #667eea) !important;
}

/* Pagination 圆角 */
.el-pagination .el-pager li {
  border-radius: 8px !important;
  font-weight: 600 !important;
  margin: 0 2px;
}

.el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #409EFF, #667eea) !important;
  border: none !important;
}

/* Select 下拉 */
.el-select-dropdown__item.selected {
  color: #409EFF !important;
  font-weight: 600 !important;
}

/* Dialog */
.el-dialog {
  border-radius: 16px !important;
}

.el-dialog__header {
  padding: 20px 24px 0 !important;
}

.el-dialog__body {
  padding: 20px 24px !important;
}

.el-dialog__footer {
  padding: 0 24px 20px !important;
}

/* Message 样式加强 */
.el-message {
  border-radius: 10px !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  padding: 12px 20px !important;
}

/* Input 内部边框清理 */
.el-input__wrapper {
  box-shadow: none !important;
}
</style>
