/**
 * 本地演示数据（Demo Mode）
 *
 * 当后端服务不可用时（例如只启动前端做页面预览），接口层会自动降级到这里，
 * 保证页面仍可完整走通「登录 → 浏览 → 加购 → 下单 → 支付」流程。
 * 数据保存在 localStorage，仅用于演示，不会与真实数据库混用。
 */
import { readStorage, writeStorage } from '../utils'
import { t } from '../i18n'

const USERS_KEY = 'cola_demo_users_v1'
const ORDERS_KEY = 'cola_demo_orders_v1'
const PRODUCTS_KEY = 'cola_demo_products_v1'
const DELAY = 260

const sleep = (ms = DELAY) => new Promise((resolve) => setTimeout(resolve, ms))

const ok = (data = null, message = '成功') => ({ code: 200, message, data })

const fail = (message) => {
  const error = new Error(message)
  error.__handled = false
  throw error
}

/* ---------------- 商品 ---------------- */

const now = Date.now()
const daysAgo = (days) => new Date(now - days * 86400000).toISOString()

const products = [
  {
    productId: 1,
    productName: 'iPhone 15 Pro 256GB',
    productPrice: 8999,
    productStock: 36,
    productDescription: '钛金属机身，A17 Pro 芯片，4800 万像素主摄，轻至 187g。',
    productCreateTime: daysAgo(1)
  },
  {
    productId: 2,
    productName: 'MacBook Air 13.6 英寸 M3',
    productPrice: 9499,
    productStock: 18,
    productDescription: 'M3 芯片，13.6 英寸 Liquid 视网膜屏，18 小时续航，无风扇静音设计。',
    productCreateTime: daysAgo(2)
  },
  {
    productId: 3,
    productName: '索尼 WH-1000XM5 头戴耳机',
    productPrice: 2499,
    productStock: 45,
    productDescription: '业界领先降噪，30 小时续航，佩戴轻盈，支持多点连接。',
    productCreateTime: daysAgo(3)
  },
  {
    productId: 4,
    productName: 'Apple Watch Series 9',
    productPrice: 2999,
    productStock: 8,
    productDescription: 'S9 芯片，全天候视网膜屏，支持血氧与睡眠监测。',
    productCreateTime: daysAgo(4)
  },
  {
    productId: 5,
    productName: 'Nike Air Force 1 经典白',
    productPrice: 799,
    productStock: 120,
    productDescription: '经典空军一号版型，百搭低帮，日常通勤与街头风格都能驾驭。',
    productCreateTime: daysAgo(5)
  },
  {
    productId: 6,
    productName: '戴森 V12 Detect 无线吸尘器',
    productPrice: 3999,
    productStock: 22,
    productDescription: '激光探测微尘，智能显示屏，整机 HEPA 过滤，轻量手持。',
    productCreateTime: daysAgo(6)
  },
  {
    productId: 7,
    productName: '三只松鼠 坚果礼盒 1.5kg',
    productPrice: 128,
    productStock: 500,
    productDescription: '年货坚果大礼包，夏威夷果、碧根果、巴旦木等混合搭配。',
    productCreateTime: daysAgo(7)
  },
  {
    productId: 8,
    productName: '罗技 MX Master 3S 鼠标',
    productPrice: 699,
    productStock: 6,
    productDescription: '8K DPI 传感器，静音按键，人体工学设计，多设备切换。',
    productCreateTime: daysAgo(8)
  },
  {
    productId: 9,
    productName: '任天堂 Switch OLED 主机',
    productPrice: 2599,
    productStock: 30,
    productDescription: '7 英寸 OLED 屏幕，64GB 存储，掌机与主机模式自由切换。',
    productCreateTime: daysAgo(9)
  },
  {
    productId: 10,
    productName: '小米 14 Ultra 16GB+512GB',
    productPrice: 5999,
    productStock: 40,
    productDescription: '骁龙 8 Gen 3，徕卡光学镜头，一英寸大底主摄。',
    productCreateTime: daysAgo(10)
  },
  {
    productId: 11,
    productName: 'ThinkPad X1 Carbon Gen12',
    productPrice: 10999,
    productStock: 14,
    productDescription: '14 英寸 2.8K OLED 屏，Ultra 7 处理器，1.09kg 镁合金机身。',
    productCreateTime: daysAgo(11)
  },
  {
    productId: 12,
    productName: '北鼎 K159 养生壶',
    productPrice: 899,
    productStock: 60,
    productDescription: '玻璃壶身，10 档智能程序，预约保温，办公室煮茶好搭档。',
    productCreateTime: daysAgo(12)
  }
]

/* ---------------- 用户 ---------------- */

const defaultUser = {
  userId: 1,
  userName: 'demo',
  userPassword: '123456',
  userPhone: '13800138000',
  userRegisterTime: daysAgo(30)
}

const readUsers = () => readStorage(USERS_KEY, [defaultUser])
const saveUsers = (users) => writeStorage(USERS_KEY, users)

const currentUser = (userId) => {
  const users = readUsers()
  return users.find((user) => String(user.userId) === String(userId)) || users[0]
}

/* ---------------- 订单 ---------------- */

const seedOrders = () => [
  {
    orderId: 1001,
    userId: 1,
    productId: 1,
    productName: products[0].productName,
    productDescription: products[0].productDescription,
    productPrice: products[0].productPrice,
    orderQuantity: 1,
    orderPrice: 8999,
    orderAddress: '上海市浦东新区世纪大道 100 号 8 楼',
    orderStatus: 0,
    orderCreateTime: daysAgo(0.2)
  },
  {
    orderId: 1002,
    userId: 1,
    productId: 3,
    productName: products[2].productName,
    productDescription: products[2].productDescription,
    productPrice: products[2].productPrice,
    orderQuantity: 2,
    orderPrice: 4998,
    orderAddress: '上海市浦东新区世纪大道 100 号 8 楼',
    orderStatus: 1,
    orderCreateTime: daysAgo(1.4)
  },
  {
    orderId: 1003,
    userId: 1,
    productId: 7,
    productName: products[6].productName,
    productDescription: products[6].productDescription,
    productPrice: products[6].productPrice,
    orderQuantity: 3,
    orderPrice: 384,
    orderAddress: '杭州市西湖区文三路 90 号',
    orderStatus: 3,
    orderCreateTime: daysAgo(6)
  },
  {
    orderId: 1004,
    userId: 1,
    productId: 5,
    productName: products[4].productName,
    productDescription: products[4].productDescription,
    productPrice: products[4].productPrice,
    orderQuantity: 1,
    orderPrice: 799,
    orderAddress: '杭州市西湖区文三路 90 号',
    orderStatus: 4,
    orderCreateTime: daysAgo(9)
  }
]

const readOrders = () => readStorage(ORDERS_KEY, seedOrders())
const saveOrders = (orders) => writeStorage(ORDERS_KEY, orders)

/** 演示模式的商品库存也会随下单变化，保持与真实后端一致 */
const readProducts = () => readStorage(PRODUCTS_KEY, products.map((item) => ({ ...item })))
const saveProducts = (list) => writeStorage(PRODUCTS_KEY, list)

/* ---------------- 对外接口（与真实 API 返回结构一致） ---------------- */

export const demoApi = {
  async login(userName, userPassword) {
    await sleep()
    const user = readUsers().find((item) => item.userName === userName)
    if (!user || user.userPassword !== userPassword) fail(t('api.invalidCredentials'))
    return ok({ token: `demo-token-${user.userId}`, userId: user.userId })
  },

  async register({ userName, userPassword, userPhone, userRegisterTime }) {
    await sleep()
    if (!userName || userName.trim().length < 3) fail(t('api.usernameTooShort'))
    if (!userPassword || userPassword.length < 6) fail(t('api.passwordTooShort'))
    if (!/^1[3-9]\d{9}$/.test(userPhone || '')) fail(t('api.phoneInvalid'))

    const users = readUsers()
    if (users.some((item) => item.userName === userName)) fail(t('api.userExists'))
    users.push({
      userId: users.length ? Math.max(...users.map((item) => item.userId)) + 1 : 1,
      userName,
      userPassword,
      userPhone,
      userRegisterTime: userRegisterTime || new Date().toISOString()
    })
    saveUsers(users)
    return ok(null, '注册成功')
  },

  async info(userId) {
    await sleep(120)
    const user = currentUser(userId)
    if (!user) fail(t('api.userNotFound'))
    const { userPassword, ...safeUser } = user
    return ok(safeUser, '查询成功')
  },

  async changePassword(userId, oldPassword, newPassword) {
    await sleep()
    const users = readUsers()
    const user = users.find((item) => String(item.userId) === String(userId))
    if (!user) fail(t('api.userNotFound'))
    if (user.userPassword !== oldPassword) fail(t('api.wrongOldPassword'))
    user.userPassword = newPassword
    saveUsers(users)
    return ok(null, '密码修改成功')
  },

  async listProducts() {
    await sleep(200)
    return ok(readProducts(), '查询成功')
  },

  async getProduct(productId) {
    await sleep(120)
    const product = readProducts().find((item) => String(item.productId) === String(productId))
    if (!product) fail(t('api.productNotFound'))
    return ok({ ...product }, '查询成功')
  },

  async listOrders(userId) {
    await sleep(200)
    return ok(
      readOrders()
        .filter((order) => String(order.userId) === String(userId))
        .sort((a, b) => String(b.orderCreateTime).localeCompare(String(a.orderCreateTime)))
    )
  },

  async createOrder(userId, { productId, orderQuantity, orderAddress }) {
    await sleep()
    const productsInStore = readProducts()
    const product = productsInStore.find((item) => String(item.productId) === String(productId))
    if (!product) fail(t('api.productNotFound'))

    const quantity = Number(orderQuantity)
    if (!Number.isInteger(quantity) || quantity < 1) fail(t('api.invalidQuantity'))
    if (Number(product.productStock) < quantity) fail(t('api.outOfStock'))
    if (!orderAddress || !String(orderAddress).trim()) fail(t('api.addressRequired'))

    // 扣减演示库存
    product.productStock = Number(product.productStock) - quantity
    saveProducts(productsInStore)

    const orders = readOrders()
    const orderId = orders.length ? Math.max(...orders.map((item) => item.orderId)) + 1 : 1001
    const order = {
      orderId,
      userId: Number(userId),
      productId: product.productId,
      productName: product.productName,
      productDescription: product.productDescription,
      productPrice: product.productPrice,
      orderQuantity: quantity,
      orderPrice: Number((product.productPrice * quantity).toFixed(2)),
      orderAddress: String(orderAddress).trim(),
      orderStatus: 0,
      orderCreateTime: new Date().toISOString()
    }
    orders.push(order)
    saveOrders(orders)
    return ok(null, '下单成功')
  },

  async updateOrderStatus(userId, orderId, status) {
    await sleep(180)
    const orders = readOrders()
    const order = orders.find((item) => String(item.orderId) === String(orderId))
    if (!order) fail(t('api.orderNotFound'))
    if (String(order.userId) !== String(userId)) fail(t('api.unauthorizedOrder'))

    const allowed = { pay: { from: 0, to: 1 }, confirm: { from: 1, to: 3 }, cancel: { from: 0, to: 4 } }
    const action = { 1: 'pay', 3: 'confirm', 4: 'cancel' }[status]
    const rule = allowed[action]
    if (!rule || Number(order.orderStatus) !== rule.from) fail(t('api.invalidStatus'))

    order.orderStatus = rule.to

    // 取消订单时归还演示库存
    if (status === 4) {
      const productsInStore = readProducts()
      const product = productsInStore.find(
        (item) => String(item.productId) === String(order.productId)
      )
      if (product) {
        product.productStock = Number(product.productStock) + Number(order.orderQuantity)
        saveProducts(productsInStore)
      }
    }

    saveOrders(orders)
    return ok(null, '操作成功')
  }
}
