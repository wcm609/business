/**
 * 手机号脱敏处理，显示 138****1234
 * @param {string} phone
 * @returns {string}
 */
export const maskPhone = (phone) => {
  if (!phone || phone.length !== 11) return phone || ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 订单状态映射
 */
export const orderStatusMap = {
  0: { text: '待付款', type: 'warning' },
  1: { text: '已付款', type: 'primary' },
  3: { text: '已收货', type: 'success' },
  4: { text: '已取消', type: 'info' }
}

/**
 * 格式化时间
 * @param {string|number} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}
