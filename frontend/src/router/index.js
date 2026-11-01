/**
 * 路由配置
 * meta.authLayout：登录/注册页使用无导航栏的独立布局
 * meta.guestOnly：已登录用户访问时跳回商品列表
 * meta.titleKey：页面标题的 i18n 键
 */
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuth } from '../composables/useAuth'
import { t } from '../i18n'

const routes = [
  { path: '/', redirect: '/products' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { authLayout: true, guestOnly: true, titleKey: 'auth.login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { authLayout: true, guestOnly: true, titleKey: 'auth.register' }
  },
  {
    path: '/products',
    name: 'ProductList',
    component: () => import('../views/ProductList.vue'),
    meta: { requiresAuth: true, titleKey: 'list.allProducts' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue'),
    meta: { requiresAuth: true, titleKey: 'detail.title' }
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: () => import('../views/OrderList.vue'),
    meta: { requiresAuth: true, titleKey: 'orders.title' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true, titleKey: 'profile.title' }
  },
  { path: '/:pathMatch(.*)*', redirect: '/products' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 路由切换后回到页面顶部，保留浏览器前进/后退的滚动位置
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach((to) => {
  const { isLoggedIn } = useAuth()

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    ElMessage.warning(t('toast.loginRequired'))
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && isLoggedIn.value) {
    return { path: '/products' }
  }

  return true
})

export default router
