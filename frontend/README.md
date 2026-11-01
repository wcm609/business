# 🥤 可乐商城 · 前端

基于 **Vue 3 + Element Plus + Vite** 的电商前端，配套 `../backend` 的 Spring Boot 接口。

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- Vue Router（路由守卫、懒加载）
- Element Plus 2（按需覆盖主题变量）
- Axios（统一拦截器、Token 注入、错误处理）
- Vite（开发代理、构建）
- 自研轻量 i18n（中文 / English）+ CSS 变量主题（浅色 / 深色）

## 页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | `/login` | 品牌展示 + 表单，支持记住用户名、密码可见切换 |
| 注册 | `/register` | 用户名 / 手机号 / 密码校验 |
| 商品列表 | `/products` | 首屏展示、搜索、库存筛选、排序、收藏、分页 |
| 商品详情 | `/product/:id` | 库存、数量、地址、加购、立即购买、猜你喜欢 |
| 我的订单 | `/orders` | 状态筛选、支付 / 取消 / 确认收货 |
| 个人中心 | `/profile` | 订单统计、账号信息、收藏、修改密码 |

## 目录说明

```
src/
├── api/            # 接口封装；后端不可用时自动使用本地演示数据
├── components/     # 导航栏、页脚、商品卡片、购物车抽屉、认证布局、主题/语言切换
├── composables/    # 登录态、购物车、收藏、主题（全局单例 + localStorage）
├── i18n/           # 中文 / English 文案字典与 t() 实现
├── router/         # 路由表与登录守卫
├── styles/         # 浏览器重置、设计变量、Element Plus 覆盖、深色主题
├── utils/          # 金额 / 日期 / 订单状态 / 本地存储工具
└── views/          # 页面组件
```

## 启动

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # 生产构建
```

开发服务器会把 `/api` 代理到 `http://localhost:8080`，可通过环境变量覆盖：

```bash
API_TARGET=http://192.168.1.10:8080 npm run dev
```

## 语言与主题

- 导航栏右侧（登录 / 注册页右上角）提供 **中 / EN** 与 **月亮 / 太阳** 按钮
- 语言、主题偏好保存在 localStorage（`cola_locale` / `cola_theme`），刷新后保持
- 没有保存过主题时，首次访问跟随系统 `prefers-color-scheme`
- 深色主题下商品图仍放在浅色“相纸”上，避免白底图变灰；Element Plus 分页等内置文案会同步切换语言

实现位置：`src/i18n/`、`src/composables/useTheme.js`、`src/styles/dark.css`。

## 演示模式

首次打开若检测不到后端，页面会显示「本地演示数据」标识，并自动切换到内置演示数据：
使用 `demo / 123456` 登录即可体验完整购物流程，数据保存在浏览器 localStorage 中。

连接真实后端时，请使用数据库中已有的账号登录（例如测试库中的 `admin / 123456`）；
`demo / 123456` 是离线演示账号，也可由 `../init-data.sql` 在全新数据库中创建。

## 商品图片

所有商品统一使用 `public/images.jpg`（需求约定）。图片为白底图，通过
`object-fit: contain` 与 `mix-blend-mode: multiply` 融入暖色卡片背景，避免白块。
如需替换，替换同名文件即可，无需改动组件。
