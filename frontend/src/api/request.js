/**
 * Axios 实例与全局拦截器
 * - 自动携带 Bearer Token
 * - 统一解包 { code, message, data }
 * - 401 自动清理会话并跳转登录
 * - 网络错误标记为 __network，供接口层决定是否启用演示数据
 */
import axios from 'axios'
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import router from '../router'
import { useAuth } from '../composables/useAuth'
import { t } from '../i18n'

/** 后端连通状态：未知 → 在线 / 离线（离线时启用演示数据） */
export const connection = reactive({
  checked: false,
  offline: false
})

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

/** 是否属于「服务未启动 / 网络不可达」类错误 */
export const isNetworkError = (error) => Boolean(error?.__network)

/** 判断当前是否已在登录页，避免重复跳转 */
const redirectToLogin = () => {
  if (router.currentRoute.value.name !== 'Login') {
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
  }
}

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 后端约定：code === 200 表示业务成功
    if (res && res.code === 200) {
      return res
    }

    if (res && res.code === 401) {
      const { clearSession } = useAuth()
      clearSession()
      ElMessage.error(res.message || t('toast.sessionExpired'))
      redirectToLogin()
      const error = new Error(res.message || t('toast.sessionExpired'))
      error.__handled = true
      return Promise.reject(error)
    }

    const message = res?.message || t('toast.requestFailed')
    ElMessage.error(message)
    const error = new Error(message)
    error.__handled = true
    return Promise.reject(error)
  },
  (error) => {
    const { config = {}, response } = error

    // 服务未启动、断网、代理转发失败、超时：不打扰用户，交由接口层走演示数据
    const unavailable = !response || [502, 503, 504].includes(response.status)
    if (unavailable) {
      connection.offline = true
      const networkError = new Error(t('toast.networkError'))
      networkError.__network = true
      networkError.__handled = true
      return Promise.reject(networkError)
    }

    if (response.status === 401) {
      const { clearSession } = useAuth()
      clearSession()
      ElMessage.error(t('toast.sessionExpired'))
      redirectToLogin()
    } else if (!config.silent) {
      const statusText = {
        403: t('toast.noPermission'),
        404: t('toast.notFound'),
        500: t('toast.serverError')
      }
      ElMessage.error(response.data?.message || statusText[response.status] || t('toast.requestFailed'))
    }

    const httpError = new Error(error.message || t('toast.requestFailed'))
    httpError.__handled = true
    return Promise.reject(httpError)
  }
)

export default request
