<template>
  <div class="detail-page">
    <div v-if="loading" class="loading-container">
      <div class="loader">
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
      </div>
      <p>正在加载商品详情...</p>
    </div>

    <template v-else-if="product">
      <!-- 面包屑 -->
      <div class="breadcrumb">
        <span class="breadcrumb-item" @click="goBack">商品列表</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-item active">{{ product.productName }}</span>
      </div>

      <div class="detail-content">
        <!-- 左侧：商品图片 -->
        <div class="detail-image-wrap">
          <div class="detail-image">
            <el-image
              :src="`https://via.placeholder.com/500x500/f0f2f5/c0c4cc?text=${encodeURIComponent(product.productName)}`"
              fit="cover"
              class="main-image"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon :size="64"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="image-thumbs">
            <div class="thumb active">
              <el-image
                :src="`https://via.placeholder.com/80x80/f0f2f5/c0c4cc?text=${encodeURIComponent(product.productName)}`"
                fit="cover"
              />
            </div>
          </div>
        </div>

        <!-- 右侧：商品信息 -->
        <div class="detail-info">
          <h1 class="product-name">{{ product.productName }}</h1>

          <div class="price-section">
            <div class="price-main">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ product.productPrice }}</span>
            </div>
            <div class="price-tip">正品保障 · 品质保证</div>
          </div>

          <div class="info-list">
            <div class="info-row">
              <span class="info-label"><el-icon><Box /></el-icon> 商品库存</span>
              <span class="info-value" :class="{ 'stock-warning': product.productStock < 10 }">
                {{ product.productStock }}件
                <el-tag v-if="product.productStock < 10" size="small" type="danger" effect="dark" class="stock-tag">库存紧张</el-tag>
                <el-tag v-else size="small" type="success" effect="plain" class="stock-tag">充足</el-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label"><el-icon><Document /></el-icon> 商品描述</span>
              <p class="info-desc">{{ product.productDescription || '暂无描述' }}</p>
            </div>
            <div class="info-row">
              <span class="info-label"><el-icon><ShoppingCart /></el-icon> 购买数量</span>
              <div class="quantity-wrap">
                <el-input-number
                  v-model="quantity"
                  :min="1"
                  :max="product.productStock"
                  size="large"
                  controls-position="right"
                  class="quantity-input"
                />
                <span class="quantity-tip">最多 {{ product.productStock }} 件</span>
              </div>
            </div>
            <div class="info-row">
              <span class="info-label"><el-icon><Location /></el-icon> 收货地址</span>
              <el-input
                v-model="address"
                placeholder="请输入收货地址"
                size="large"
                class="address-input"
              />
            </div>
          </div>

          <div class="total-section">
            <span class="total-label">合计：</span>
            <span class="total-value">¥{{ (product.productPrice * quantity).toFixed(2) }}</span>
          </div>

          <div class="detail-actions">
            <el-button
              type="primary"
              size="large"
              :loading="ordering"
              @click="placeOrder"
              class="action-btn action-buy"
            >
              <el-icon><ShoppingCart /></el-icon>
              立即下单
            </el-button>
            <el-button
              size="large"
              @click="goBack"
              class="action-btn action-back"
            >
              ← 返回列表
            </el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Picture,
  Box,
  Document,
  ShoppingCart,
  Location
} from '@element-plus/icons-vue'
import { productApi, orderApi } from '../api'

const router = useRouter()
const route = useRoute()

const product = ref(null)
const loading = ref(true)
const ordering = ref(false)
const quantity = ref(1)
const address = ref('')

onMounted(async () => {
  const productId = route.params.id
  if (productId) {
    await fetchProductDetail(productId)
  } else {
    ElMessage.error('商品ID不存在')
    router.push('/products')
  }
})

const fetchProductDetail = async (productId) => {
  loading.value = true
  try {
    const res = await productApi.list()
    if (res.code === 200) {
      const data = res.data
      const list = Array.isArray(data) ? data : (data.records || [])
      const found = list.find(item => String(item.productId) === String(productId))
      if (found) {
        product.value = found
      } else {
        const detailRes = await productApi.detail(productId)
        if (detailRes.code === 200) {
          product.value = detailRes.data
        } else {
          ElMessage.error('商品不存在')
          router.push('/products')
        }
      }
    }
  } catch (e) {
    ElMessage.error('获取商品详情失败')
    router.push('/products')
  } finally {
    loading.value = false
  }
}

const placeOrder = async () => {
  if (!address.value.trim()) {
    ElMessage.warning('请输入收货地址')
    return
  }
  ordering.value = true
  try {
    const res = await orderApi.create({
      userId: Number(localStorage.getItem('userId')) || 0,
      productId: product.value.productId,
      orderQuantity: quantity.value,
      orderPrice: product.value.productPrice * quantity.value,
      orderAddress: address.value.trim(),
      orderStatus: 0
    })
    if (res.code === 200) {
      ElMessage.success('🎉 下单成功！')
      router.push('/orders')
    }
  } catch (e) {}
  finally { ordering.value = false }
}

const goBack = () => router.push('/products')
</script>

<style scoped>
.detail-page {
  max-width: 1100px;
  margin: 84px auto 40px;
  padding: 0 20px;
}

/* 加载 */
.loading-container {
  text-align: center;
  padding: 120px 0;
}

.loader {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.loader-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
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

.loading-container p { color: #909399; font-size: 14px; margin: 0; }

/* 面包屑 */
.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: #909399;
}

.breadcrumb-item { cursor: pointer; transition: color 0.3s; }
.breadcrumb-item:hover { color: #409EFF; }
.breadcrumb-item.active { color: #303133; cursor: default; }
.breadcrumb-sep { margin: 0 8px; color: #dcdfe6; }

/* 主要内容 */
.detail-content {
  display: flex;
  gap: 40px;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

/* 图片区 */
.detail-image-wrap {
  flex: 0 0 420px;
}

.detail-image {
  width: 100%;
  height: 420px;
  border-radius: 16px;
  overflow: hidden;
  background: #f5f7fa;
  border: 1px solid #f0f0f0;
}

.main-image { width: 100%; height: 100%; }

.image-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: #c0c4cc;
}

.image-thumbs {
  display: flex; gap: 8px; margin-top: 12px;
}

.thumb {
  width: 68px; height: 68px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.thumb.active { border-color: #409EFF; }

/* 信息区 */
.detail-info { flex: 1; }

.product-name {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 20px;
  line-height: 1.3;
}

/* 价格 */
.price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff5f5, #fff0f0);
  padding: 18px 24px;
  border-radius: 14px;
  margin-bottom: 24px;
}

.price-main {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 20px;
  color: #f56c6c;
  font-weight: 700;
}

.price-value {
  font-size: 40px;
  color: #f56c6c;
  font-weight: 800;
  margin-left: 2px;
  letter-spacing: -1px;
}

.price-tip {
  font-size: 13px;
  color: #909399;
}

/* 信息列表 */
.info-list {
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child { border-bottom: none; }

.info-label {
  width: 110px;
  flex-shrink: 0;
  font-size: 14px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 36px;
}

.info-value {
  font-size: 15px;
  color: #303133;
  line-height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stock-warning { color: #f56c6c; font-weight: 600; }

.info-desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
  flex: 1;
}

.quantity-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-input { width: 140px; }

.quantity-input :deep(.el-input__wrapper) {
  border-radius: 8px !important;
  box-shadow: none !important;
  border: 2px solid #e4e7ed;
}

.quantity-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409EFF;
}

.quantity-tip {
  font-size: 12px;
  color: #c0c4cc;
}

.address-input { flex: 1; max-width: 360px; }

.address-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: none !important;
  border: 2px solid #e4e7ed;
}

.address-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409EFF;
}

/* 合计 */
.total-section {
  padding: 16px 0;
  border-top: 2px dashed #f0f0f0;
  margin-bottom: 24px;
}

.total-label {
  font-size: 16px;
  color: #303133;
}

.total-value {
  font-size: 28px;
  color: #f56c6c;
  font-weight: 800;
  margin-left: 8px;
}

/* 操作按钮 */
.detail-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  min-width: 160px;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
}

.action-buy {
  background: linear-gradient(135deg, #409EFF, #667eea) !important;
  border: none !important;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease !important;
}

.action-buy:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(64, 158, 255, 0.4) !important;
}

.action-back {
  border: 2px solid #e4e7ed !important;
  background: #fff !important;
  transition: all 0.3s ease !important;
}

.action-back:hover {
  border-color: #409EFF !important;
  color: #409EFF !important;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .detail-content { flex-direction: column; padding: 20px; }
  .detail-image-wrap { flex: none; width: 100%; }
  .detail-image { height: 320px; }
  .price-section { flex-direction: column; gap: 8px; align-items: flex-start; }
}
</style>
