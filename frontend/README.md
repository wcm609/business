# 🥤 可乐商城

基于 **Vue 3 + Element Plus** 开发的电商网站前端。

## 技术栈

- Vue 3 (Composition API + `<script setup>`)
- Vue Router 4
- Element Plus 2.x
- Axios
- Vite 8

## 页面列表

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | `/login` | 卡片居中，密码切换显示 |
| 注册 | `/register` | 前端表单验证（密码一致、手机号格式） |
| 商品列表 | `/products` | 卡片网格、搜索、价格排序、分页 |
| 商品详情 | `/product/:id` | 大图、数量选择、收货地址、下单 |
| 我的订单 | `/orders` | Tab 筛选、卡片展示、操作按钮 |
| 个人中心 | `/profile` | 订单统计、个人信息、修改密码 |

## 启动

```bash
npm install
npm run dev
```

后端 API 默认代理到 `http://localhost:8080`，可在 `vite.config.js` 中修改。
