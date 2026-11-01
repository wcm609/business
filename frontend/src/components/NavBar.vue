<template>
  <header class="navbar" :class="{ 'is-scrolled': isScrolled }">
    <div class="navbar__inner container">
      <!-- 品牌 -->
      <RouterLink to="/products" class="brand" :aria-label="t('nav.home')">
        <span class="brand__mark">
          <el-icon :size="20"><ShoppingBag /></el-icon>
        </span>
        <span class="brand__text">
          <strong>{{ t('common.brand') }}</strong>
          <small>{{ t('common.brandEn') }}</small>
        </span>
      </RouterLink>

      <!-- 主导航 -->
      <nav class="navbar__links" aria-label="Main navigation">
        <RouterLink
          v-for="item in navLinks"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ 'is-active': isActive(item.to) }"
        >
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>

      <div class="navbar__actions">
        <!-- 搜索 -->
        <form class="nav-search" role="search" @submit.prevent="submitSearch">
          <el-icon class="nav-search__icon" :size="16"><Search /></el-icon>
          <input
            v-model="keyword"
            type="search"
            class="nav-search__input"
            :placeholder="t('nav.searchPlaceholder')"
            :aria-label="t('nav.searchAria')"
          />
          <button
            v-if="keyword"
            type="button"
            class="nav-search__clear"
            :aria-label="t('list.clearSearch')"
            @click="keyword = ''"
          >
            <el-icon :size="13"><Close /></el-icon>
          </button>
        </form>

        <!-- 主题 / 语言 -->
        <AppSettings class="navbar__settings" />

        <!-- 购物车 -->
        <button class="icon-btn" type="button" :aria-label="t('nav.openCart')" @click="cartVisible = true">
          <el-icon :size="19"><ShoppingCart /></el-icon>
          <span v-if="cartCount" class="icon-btn__badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
        </button>

        <!-- 用户菜单 -->
        <el-dropdown trigger="click" placement="bottom-end" @command="handleCommand">
          <button class="user-chip" type="button">
            <span class="user-chip__avatar">{{ initial }}</span>
            <span class="user-chip__name">{{ auth.userName || t('nav.account') }}</span>
            <el-icon :size="12" class="user-chip__arrow"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>{{ t('nav.profile') }}
              </el-dropdown-item>
              <el-dropdown-item command="orders">
                <el-icon><List /></el-icon>{{ t('nav.orders') }}
              </el-dropdown-item>
              <el-dropdown-item command="favorites">
                <el-icon><Star /></el-icon>{{ t('nav.favorites') }}
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>{{ t('nav.logout') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 移动端菜单 -->
        <button class="icon-btn menu-toggle" type="button" :aria-label="t('nav.openMenu')" @click="menuVisible = true">
          <el-icon :size="20"><Menu /></el-icon>
        </button>
      </div>
    </div>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="menuVisible"
      direction="rtl"
      size="82%"
      :with-header="false"
      append-to-body
      class="mobile-menu"
    >
      <div class="mobile-menu__head">
        <div class="brand">
          <span class="brand__mark"><el-icon :size="18"><ShoppingBag /></el-icon></span>
          <span class="brand__text">
            <strong>{{ t('common.brand') }}</strong>
            <small>{{ t('common.brandEn') }}</small>
          </span>
        </div>
        <button class="icon-btn" type="button" :aria-label="t('nav.closeMenu')" @click="menuVisible = false">
          <el-icon :size="18"><Close /></el-icon>
        </button>
      </div>

      <form class="mobile-menu__search" @submit.prevent="submitSearch">
        <el-icon :size="16"><Search /></el-icon>
        <input v-model="keyword" type="search" :placeholder="t('nav.searchPlaceholder')" />
      </form>

      <div class="mobile-menu__settings">
        <AppSettings />
      </div>

      <nav class="mobile-menu__links">
        <RouterLink
          v-for="item in navLinks"
          :key="item.to"
          :to="item.to"
          class="mobile-link"
          @click="menuVisible = false"
        >
          <span>{{ t(item.labelKey) }}</span>
          <el-icon :size="14"><ArrowRight /></el-icon>
        </RouterLink>
      </nav>

      <div class="mobile-menu__user">
        <p class="mobile-menu__label">{{ t('nav.currentAccount') }}</p>
        <p class="mobile-menu__name">{{ auth.userName || t('nav.notLoggedIn') }}</p>
        <el-button class="mobile-menu__logout" plain @click="handleCommand('logout')">
          {{ t('nav.logout') }}
        </el-button>
      </div>
    </el-drawer>

    <!-- 购物车抽屉 -->
    <CartDrawer v-model="cartVisible" />
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  ArrowRight,
  Close,
  List,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  Star,
  SwitchButton,
  User
} from '@element-plus/icons-vue'
import CartDrawer from './CartDrawer.vue'
import AppSettings from './AppSettings.vue'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import { useI18n } from '../i18n'
import { initialOf } from '../utils'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { auth, clearSession } = useAuth()
const { count: cartCount } = useCart()

const navLinks = [
  { labelKey: 'nav.home', to: '/products' },
  { labelKey: 'nav.orders', to: '/orders' },
  { labelKey: 'nav.profile', to: '/profile' }
]

const keyword = ref('')
const cartVisible = ref(false)
const menuVisible = ref(false)
const isScrolled = ref(false)

const initial = computed(() => initialOf(auth.userName))

/** 当前路由是否命中导航项 */
const isActive = (to) => {
  if (to === '/products') return route.path === '/products' || route.path.startsWith('/product/')
  return route.path.startsWith(to)
}

const submitSearch = () => {
  const value = keyword.value.trim()
  menuVisible.value = false
  router.push({ path: '/products', query: value ? { keyword: value } : {} })
}

const handleCommand = (command) => {
  menuVisible.value = false
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'orders':
      router.push('/orders')
      break
    case 'favorites':
      router.push({ path: '/products', query: { view: 'favorites' } })
      break
    case 'logout':
      clearSession()
      ElMessage.success(t('toast.logout'))
      router.push('/login')
      break
  }
}

/** 滚动后加深导航栏背景与阴影 */
const onScroll = () => {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

// 从其它页面跳转搜索时，保持输入框与地址栏同步
watch(
  () => route.query.keyword,
  (value) => {
    keyword.value = value ? String(value) : ''
  },
  { immediate: true }
)
</script>

<style scoped>
.navbar {
  position: fixed;
  inset: 0 0 auto;
  z-index: var(--z-nav);
  height: var(--nav-height);
  background: rgba(251, 250, 247, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid transparent;
  transition: background-color var(--dur) var(--ease-soft), border-color var(--dur) var(--ease-soft),
    box-shadow var(--dur) var(--ease-soft);
}

.navbar.is-scrolled {
  background: rgba(251, 250, 247, 0.92);
  border-bottom-color: var(--c-line);
  box-shadow: 0 12px 30px -24px rgba(25, 23, 19, 0.45);
}

.navbar__inner {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 100%;
}

/* ---------- 品牌 ---------- */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #fff;
  background: var(--grad-brand);
  box-shadow: var(--shadow-brand);
  transition: transform var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out);
}

.brand:hover .brand__mark {
  transform: rotate(-6deg) scale(1.05);
  box-shadow: 0 18px 32px -14px rgba(194, 68, 47, 0.6);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand__text strong {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.brand__text small {
  margin-top: 3px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--c-ink-3);
}

/* ---------- 导航链接 ---------- */
.navbar__links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  position: relative;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 500;
  color: var(--c-ink-2);
  transition: color var(--dur) var(--ease-soft), background-color var(--dur) var(--ease-soft);
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 2px;
  width: 0;
  height: 2px;
  border-radius: 2px;
  background: var(--c-brand);
  transform: translateX(-50%);
  transition: width var(--dur) var(--ease-out);
}

.nav-link:hover {
  color: var(--c-ink);
  background: rgba(25, 23, 19, 0.04);
}

.nav-link.is-active {
  color: var(--c-ink);
  font-weight: 600;
}

.nav-link.is-active::after {
  width: 18px;
}

/* ---------- 右侧操作区 ---------- */
.navbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.navbar__settings {
  flex-shrink: 0;
}

.mobile-menu__settings {
  display: flex;
  align-items: center;
  margin-top: 14px;
}

.nav-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 250px;
  height: 42px;
  padding: 0 8px 0 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.7);
  color: var(--c-ink-3);
  transition: border-color var(--dur) var(--ease-soft), background-color var(--dur) var(--ease-soft),
    box-shadow var(--dur) var(--ease-soft), width var(--dur) var(--ease-soft);
}

.nav-search:focus-within {
  width: 300px;
  border-color: var(--c-brand);
  background: #fff;
  box-shadow: 0 0 0 4px var(--c-brand-ring);
}

.nav-search__icon {
  flex-shrink: 0;
}

.nav-search__input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--c-ink);
}

.nav-search__input::placeholder {
  color: var(--c-ink-3);
}

/* 移除浏览器对 search 输入框自带的清除按钮 */
.nav-search__input::-webkit-search-cancel-button {
  display: none;
}

.nav-search__clear {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: var(--c-ink-3);
  background: var(--c-surface-2);
  transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
}

.nav-search__clear:hover {
  color: var(--c-ink);
  background: var(--c-surface-3);
}

.icon-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--c-line);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  color: var(--c-ink-2);
  transition: all var(--dur) var(--ease-soft);
}

.icon-btn:hover {
  color: var(--c-brand);
  border-color: var(--c-brand);
  background: #fff;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.icon-btn__badge {
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: var(--radius-pill);
  border: 2px solid var(--c-bg-soft);
  background: var(--c-brand);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 12px 0 5px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.7);
  transition: all var(--dur) var(--ease-soft);
}

.user-chip:hover {
  border-color: var(--c-line-strong);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.user-chip__avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--grad-ink);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.user-chip__name {
  max-width: 90px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-ink);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-chip__arrow {
  color: var(--c-ink-3);
}

.menu-toggle {
  display: none;
}

/* ---------- 移动端菜单 ---------- */
.mobile-menu__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.mobile-menu__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: var(--c-surface);
  color: var(--c-ink-3);
}

.mobile-menu__search input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 14px;
}

.mobile-menu__links {
  display: flex;
  flex-direction: column;
  margin: 22px 0;
}

.mobile-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 4px;
  border-bottom: 1px solid var(--c-line);
  font-size: 15px;
  font-weight: 500;
  color: var(--c-ink-2);
  transition: color var(--dur) var(--ease-soft), padding-left var(--dur) var(--ease-soft);
}

.mobile-link:hover {
  padding-left: 8px;
  color: var(--c-brand);
}

.mobile-menu__user {
  padding: 18px;
  border-radius: var(--radius-md);
  background: var(--c-surface-2);
}

.mobile-menu__label {
  font-size: 12px;
  color: var(--c-ink-3);
}

.mobile-menu__name {
  margin: 2px 0 14px;
  font-size: 16px;
  font-weight: 600;
}

.mobile-menu__logout {
  width: 100%;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1080px) {
  .nav-search {
    width: 190px;
  }

  .nav-search:focus-within {
    width: 220px;
  }
}

@media (max-width: 960px) {
  .navbar__links,
  .nav-search,
  .user-chip__name,
  .user-chip__arrow {
    display: none;
  }

  .menu-toggle {
    display: grid;
  }

  .navbar__inner {
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .brand__text small {
    display: none;
  }

  .user-chip,
  .navbar__settings {
    display: none;
  }
}
</style>
