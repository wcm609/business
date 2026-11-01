/**
 * 通用工具函数
 */
import { ElMessage } from 'element-plus'
import { t } from '../i18n'

/* ---------------- 金额 ---------------- */

/**
 * 金额格式化：1299 → 1,299.00
 * @param {number|string} value
 * @param {boolean} withDecimals 是否保留两位小数
 */
export const formatPrice = (value, withDecimals = true) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return withDecimals ? '0.00' : '0'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0
  })
}

/* ---------------- 文本 ---------------- */

/**
 * 手机号脱敏：13812345678 → 138****5678
 * @param {string} phone
 */
export const maskPhone = (phone) => {
  if (!phone || phone.length !== 11) return phone || ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 用户名首字母，用于默认头像
 * @param {string} name
 */
export const initialOf = (name) => (name ? name.trim().charAt(0).toUpperCase() : 'U')

/* ---------------- 订单状态 ---------------- */

/** 状态元数据：语义色 + i18n 键，供列表、筛选、详情共用 */
export const orderStatusMap = {
  0: { tone: 'warning', labelKey: 'status.0', descKey: 'status.0.desc' },
  1: { tone: 'brand', labelKey: 'status.1', descKey: 'status.1.desc' },
  3: { tone: 'success', labelKey: 'status.3', descKey: 'status.3.desc' },
  4: { tone: 'muted', labelKey: 'status.4', descKey: 'status.4.desc' }
}

/** 订单筛选标签（顺序即展示顺序） */
export const orderTabs = [
  { key: 'all', labelKey: 'orders.tabAll' },
  { key: '0', labelKey: 'orders.tabPending' },
  { key: '1', labelKey: 'orders.tabReceived' },
  { key: '3', labelKey: 'orders.tabCompleted' },
  { key: '4', labelKey: 'orders.tabCancelled' }
]

/**
 * 获取订单状态的展示信息（文案由组件通过 t(labelKey) 渲染）
 * @param {number|string} status
 */
export const getOrderStatus = (status) =>
  orderStatusMap[Number(status)] || {
    tone: 'muted',
    labelKey: 'status.unknown',
    descKey: 'status.unknown'
  }

/* ---------------- 日期 ---------------- */

const pad = (n) => String(n).padStart(2, '0')

/**
 * 格式化日期：2026-11-01 22:09:00
 * @param {string|number|Date} value
 */
export const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** 仅日期：2026-11-01 */
export const formatDay = (value) => {
  const full = formatDate(value)
  return full ? full.slice(0, 10) : ''
}

/* ---------------- 交互辅助 ---------------- */

/**
 * 统一错误提示：拦截器已提示过的错误（__handled）不再重复弹出
 * @param {Error & { __handled?: boolean }} error
 * @param {string} fallback
 */
export const showError = (error, fallback = t('toast.genericError')) => {
  if (error?.__handled) return
  ElMessage.error(error?.message || fallback)
}

/**
 * 深拷贝本地存储的 JSON 数据，解析失败时回退默认值
 * @param {string} key
 * @param {*} fallback
 */
export const readStorage = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn(`[storage] 读取 ${key} 失败`, error)
    return fallback
  }
}

/**
 * 写入本地存储（自动序列化）
 * @param {string} key
 * @param {*} value
 */
export const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[storage] 写入 ${key} 失败`, error)
  }
}
