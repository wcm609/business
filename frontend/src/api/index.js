/**
 * 统一 API 封装层
 *
 * 所有后端接口在这里声明，视图层不直接拼接 URL。
 * 每个请求都提供「真实接口 + 本地演示」两条路径：
 * 后端未启动时自动降级到演示数据，保证页面可完整演示。
 * 真实接口永远是首选，演示数据只在网络不可达时启用。
 */
import { ElMessage } from 'element-plus'
import request, { connection, isNetworkError } from './request'
import { demoApi } from './demo'
import { useAuth } from '../composables/useAuth'
import { t } from '../i18n'

let fallbackNotified = false

/** 首次降级时给出一次友好提示 */
const notifyFallback = () => {
  if (fallbackNotified) return
  fallbackNotified = true
  ElMessage.info(t('toast.networkFallback'))
}

/**
 * 执行真实请求；仅当网络不可达时降级到演示实现
 * @param {Function} real 真实接口调用
 * @param {Function} demo 演示实现
 */
const withDemo = async (real, demo) => {
  if (connection.offline) return demo()
  try {
    return await real()
  } catch (error) {
    if (isNetworkError(error)) {
      connection.offline = true
      notifyFallback()
      return demo()
    }
    throw error
  }
}

const currentUserId = () => useAuth().auth.userId

/* ---------------- 用户 ---------------- */

export const userApi = {
  /** 登录，返回 { token, userId } */
  login: (userName, userPassword) =>
    withDemo(
      () => request.post('/user/login', null, { params: { userName, userPassword } }),
      () => demoApi.login(userName, userPassword)
    ),

  /** 注册 */
  register: (data) =>
    withDemo(
      () => request.post('/user/register', data),
      () => demoApi.register(data)
    ),

  /** 当前登录用户资料（后端从 Token 解析用户，无需传 userId） */
  info: () =>
    withDemo(
      () => request.get('/user/info'),
      () => demoApi.info(currentUserId())
    ),

  /** 修改密码 */
  changePassword: (data) =>
    withDemo(
      () => request.put('/user/password', data),
      () => demoApi.changePassword(currentUserId(), data.oldPassword, data.newPassword)
    )
}

/* ---------------- 商品 ---------------- */

export const productApi = {
  /** 商品列表（后端返回全量，筛选、排序、分页在前端完成） */
  list: () =>
    withDemo(
      () => request.get('/product/list'),
      () => demoApi.listProducts()
    ),

  /** 商品详情 */
  detail: (productId) =>
    withDemo(
      () => request.get(`/product/${productId}`),
      () => demoApi.getProduct(productId)
    )
}

/* ---------------- 订单 ---------------- */

export const orderApi = {
  /** 当前用户订单列表 */
  list: () =>
    withDemo(
      () => request.get('/order/list'),
      () => demoApi.listOrders(currentUserId())
    ),

  /** 创建订单（价格与库存由后端校验，前端只传商品、数量、地址） */
  create: (data) =>
    withDemo(
      () => request.post('/order/create', data),
      () => demoApi.createOrder(currentUserId(), data)
    ),

  /** 支付订单 */
  pay: (orderId) =>
    withDemo(
      () => request.put('/order/pay', null, { params: { orderId } }),
      () => demoApi.updateOrderStatus(currentUserId(), orderId, 1)
    ),

  /** 确认收货 */
  confirm: (orderId) =>
    withDemo(
      () => request.put('/order/confirm', null, { params: { orderId } }),
      () => demoApi.updateOrderStatus(currentUserId(), orderId, 3)
    ),

  /** 取消订单 */
  cancel: (orderId) =>
    withDemo(
      () => request.put('/order/cancel', null, { params: { orderId } }),
      () => demoApi.updateOrderStatus(currentUserId(), orderId, 4)
    )
}

/**
 * 启动时探测后端是否可用（静默请求）
 * 用于提前决定是否展示演示数据提示，避免用户首次操作时才感知到降级。
 */
export const probeBackend = async () => {
  if (connection.checked) return
  try {
    await request.get('/product/list', { timeout: 2500, silent: true })
  } catch (error) {
    if (isNetworkError(error)) connection.offline = true
  } finally {
    connection.checked = true
  }
}
