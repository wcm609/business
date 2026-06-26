/**
 * 统一 API 封装层
 * 集中管理所有后端接口调用，避免视图层直接拼接 URL
 */
import request from './request'

export const userApi = {
  /** 登录，返回 { token, userId } */
  login: (userName, userPassword) =>
    request.post('/user/login', null, { params: { userName, userPassword } }),

  /** 注册 */
  register: (data) =>
    request.post('/user/register', data),

  /** 获取用户个人信息 */
  info: (userId) =>
    request.get('/user/info', { params: { userId } }),
}

export const productApi = {
  /** 商品列表（支持分页及名称搜索） */
  list: (params) =>
    request.get('/product/list', { params }),

  /** 商品详情（按名称查询） */
  detail: (productName) =>
    request.get('/product/detail', { params: { productName } }),
}

export const orderApi = {
  /** 获取用户订单列表 */
  list: (userId) =>
    request.get('/order/list', { params: { userId } }),

  /** 创建订单 */
  create: (data) =>
    request.post('/order/create', data),

  /** 支付订单 */
  pay: (orderId) =>
    request.put('/order/pay', null, { params: { orderId } }),

  /** 确认收货 */
  confirm: (orderId) =>
    request.put('/order/confirm', null, { params: { orderId } }),

  /** 取消订单 */
  cancel: (orderId) =>
    request.put('/order/cancel', null, { params: { orderId } }),
}
