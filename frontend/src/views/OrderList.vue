<template>
  <div class="orders-page">
    <div class="page-header">
      <h1 class="page-title">我的订单</h1>
      <el-button class="back-btn" @click="goShopping">
        <el-icon><ArrowLeft /></el-icon> 继续购物
      </el-button>
    </div>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="order-tabs" @tab-change="fetchOrders">
      <el-tab-pane label="📋 全部" name="all" />
      <el-tab-pane label="⏳ 待付款" name="0" />
      <el-tab-pane label="✅ 已付款" name="1" />
      <el-tab-pane label="🎉 已收货" name="3" />
      <el-tab-pane label="❌ 已取消" name="4" />
    </el-tabs>

    <!-- 加载 -->
    <div v-if="loading" class="loading-container">
      <div class="loader">
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
      </div>
      <p>正在加载订单...</p>
    </div>

    <!-- 空数据 -->
    <div v-else-if="orders.length === 0" class="empty-container">
      <div class="empty-icon">📦</div>
      <p class="empty-text">暂无订单</p>
      <el-button type="primary" class="shop-btn" @click="goShopping">
        <el-icon><ShoppingCart /></el-icon> 去购物
      </el-button>
    </div>

    <!-- 订单列表 -->
    <div v-else class="order-list">
      <transition-group name="order-anim">
        <div
          v-for="order in orders"
          :key="order.orderId"
          class="order-card"
        >
          <!-- 头部 -->
          <div class="order-header">
            <div class="order-meta">
              <span class="order-id">#{{ order.orderId }}</span>
              <span class="order-time">{{ formatDate(order.orderCreateTime) }}</span>
            </div>
            <el-tag
              :type="orderStatusMap[order.orderStatus]?.type || 'info'"
              size="large"
              effect="dark"
              class="status-tag"
            >
              {{ orderStatusMap[order.orderStatus]?.text || '未知' }}
            </el-tag>
          </div>

          <!-- 内容 -->
          <div class="order-body">
            <div class="order-info-grid">
              <div class="order-info-item">
                <span class="info-icon">🆔</span>
                <div>
                  <div class="info-label">商品 ID</div>
                  <div class="info-value">{{ order.productId }}</div>
                </div>
              </div>
              <div class="order-info-item">
                <span class="info-icon">📦</span>
                <div>
                  <div class="info-label">购买数量</div>
                  <div class="info-value">{{ order.orderQuantity }} 件</div>
                </div>
              </div>
              <div class="order-info-item">
                <span class="info-icon">💰</span>
                <div>
                  <div class="info-label">订单总价</div>
                  <div class="info-value price-value">¥{{ order.orderPrice }}</div>
                </div>
              </div>
              <div class="order-info-item address-item">
                <span class="info-icon">📍</span>
                <div>
                  <div class="info-label">收货地址</div>
                  <div class="info-value address-value">{{ order.orderAddress }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="order-footer">
            <div class="order-actions">
              <el-button
                v-if="order.orderStatus === 0"
                type="primary"
                class="action-btn pay-btn"
                @click="handlePay(order.orderId)"
              >
                💳 付款
              </el-button>
              <el-button
                v-if="order.orderStatus === 0"
                class="action-btn cancel-btn"
                @click="handleCancel(order.orderId)"
              >
                取消订单
              </el-button>
              <el-button
                v-if="order.orderStatus === 1"
                type="success"
                class="action-btn confirm-btn"
                @click="handleConfirm(order.orderId)"
              >
                ✅ 确认收货
              </el-button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ShoppingCart } from '@element-plus/icons-vue'
import { orderApi } from '../api'
import { orderStatusMap, formatDate } from '../utils'

const router = useRouter()
const route = useRoute()

const activeTab = ref('all')
const orders = ref([])
const loading = ref(false)

onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  fetchOrders()
})

const fetchOrders = async () => {
  loading.value = true
  try {
    const userId = localStorage.getItem('userId')
    const res = await orderApi.list(userId)
    if (res.code === 200) {
      let list = res.data
      if (Array.isArray(list)) {
        if (activeTab.value !== 'all') {
          list = list.filter(item => String(item.orderStatus) === activeTab.value)
        }
        list.sort((a, b) => {
          const ta = a.orderCreateTime || ''
          const tb = b.orderCreateTime || ''
          return String(tb).localeCompare(String(ta))
        })
        orders.value = list
      } else {
        orders.value = []
      }
    }
  } catch (e) { orders.value = [] }
  finally { loading.value = false }
}

const handlePay = async (orderId) => {
  try {
    const res = await orderApi.pay(orderId)
    if (res.code === 200) {
      ElMessage.success('🎉 付款成功')
      fetchOrders()
    }
  } catch (e) {}
}

const handleCancel = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    const res = await orderApi.cancel(orderId)
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      fetchOrders()
    }
  } catch (e) {
    if (e !== 'cancel') { /* 忽略取消 */ }
  }
}

const handleConfirm = async (orderId) => {
  try {
    const res = await orderApi.confirm(orderId)
    if (res.code === 200) {
      ElMessage.success('✅ 已确认收货')
      fetchOrders()
    }
  } catch (e) {}
}

const goShopping = () => router.push('/products')
</script>

<style scoped>
.orders-page {
  max-width: 900px;
  margin: 84px auto 40px;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.back-btn {
  border-radius: 20px;
}

.order-tabs { margin-bottom: 20px; }

.order-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  padding: 0 16px;
}

.order-tabs :deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px;
}

/* 加载 */
.loading-container {
  text-align: center;
  padding: 80px 0;
}
.loader {
  display: flex; justify-content: center; gap: 8px; margin-bottom: 20px;
}
.loader-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: #409EFF;
  animation: dotBounce 1.4s ease-in-out infinite both;
}
.loader-dot:nth-child(1) { animation-delay: -0.32s; }
.loader-dot:nth-child(2) { animation-delay: -0.16s; }
.loader-dot:nth-child(3) { animation-delay: 0s; }
@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}
.loading-container p { color: #909399; }

/* 空数据 */
.empty-container { text-align: center; padding: 60px 0; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: #909399; margin-bottom: 20px; }
.shop-btn { border-radius: 20px; padding: 10px 28px; }

/* 订单列表 */
.order-list { display: flex; flex-direction: column; gap: 16px; }

/* 列表动画 */
.order-anim-enter-active { transition: all 0.4s ease; }
.order-anim-leave-active { transition: all 0.3s ease; }
.order-anim-enter-from { opacity: 0; transform: translateX(-20px); }
.order-anim-leave-to { opacity: 0; transform: translateX(20px); }

/* 订单卡片 */
.order-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #fafafa, #f5f7fa);
  border-bottom: 1px solid #f0f0f0;
}

.order-meta { display: flex; gap: 20px; align-items: center; }

.order-id {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  font-family: 'Courier New', monospace;
}

.order-time { font-size: 13px; color: #909399; }

.status-tag { font-weight: 600; border: none !important; }

/* 内容 */
.order-body { padding: 24px; }

.order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.order-info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.info-icon { font-size: 20px; line-height: 1; }

.info-label {
  font-size: 12px;
  color: #c0c4cc;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.price-value { color: #f56c6c; font-weight: 700; font-size: 18px; }

.address-value {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 底部 */
.order-footer {
  padding: 12px 24px;
  border-top: 1px solid #f5f5f5;
  display: flex;
  justify-content: flex-end;
}

.order-actions { display: flex; gap: 12px; }

.action-btn {
  border-radius: 20px;
  padding: 8px 22px;
  font-weight: 500;
}

.pay-btn {
  background: linear-gradient(135deg, #e6a23c, #f56c6c) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
  transition: all 0.3s ease !important;
}

.pay-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(230, 162, 60, 0.4) !important;
}

.cancel-btn {
  background: #fff !important;
  border: 1px solid #e4e7ed !important;
  color: #909399 !important;
}

.cancel-btn:hover {
  border-color: #f56c6c !important;
  color: #f56c6c !important;
}

.confirm-btn {
  background: linear-gradient(135deg, #67c23a, #5daf34) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
  transition: all 0.3s ease !important;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(103, 194, 58, 0.4) !important;
}

@media (max-width: 600px) {
  .order-info-grid { grid-template-columns: 1fr; }
  .order-meta { flex-direction: column; align-items: flex-start; gap: 4px; }
}
</style>
