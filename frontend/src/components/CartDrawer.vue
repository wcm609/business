<template>
  <el-drawer
    v-model="visible"
    :with-header="false"
    direction="rtl"
    size="min(440px, 94vw)"
    append-to-body
    class="cart-drawer"
  >
    <div class="cart">
      <!-- 头部 -->
      <header class="cart__head">
        <div>
          <p class="eyebrow">Shopping Bag</p>
          <h2 class="cart__title">
            {{ t('cart.title') }}
            <span v-if="count">{{ count === 1 ? t('cart.itemsOne') : t('cart.items', { count }) }}</span>
          </h2>
        </div>
        <button class="cart__close" type="button" :aria-label="t('common.close')" @click="visible = false">
          <el-icon :size="18"><Close /></el-icon>
        </button>
      </header>

      <!-- 空购物车 -->
      <div v-if="isEmpty" class="cart__empty">
        <span class="cart__empty-icon">
          <el-icon :size="28"><ShoppingCart /></el-icon>
        </span>
        <p>{{ t('cart.emptyTitle') }}</p>
        <span class="cart__empty-tip">{{ t('cart.emptyDesc') }}</span>
        <el-button type="primary" round @click="goShopping">{{ t('common.browse') }}</el-button>
      </div>

      <template v-else>
        <!-- 商品列表 -->
        <ul class="cart__list">
          <li v-for="item in cart.items" :key="item.productId" class="cart-item">
            <img class="cart-item__img" :src="PRODUCT_IMAGE" alt="" />
            <div class="cart-item__info">
              <h3 class="cart-item__name">{{ item.productName }}</h3>
              <p class="cart-item__price">¥{{ formatPrice(item.productPrice) }}</p>
              <div class="cart-item__row">
                <div class="stepper" role="group" :aria-label="t('detail.qty')">
                  <button
                    type="button"
                    class="stepper__btn"
                    :aria-label="t('detail.decrease')"
                    :disabled="item.quantity <= 1"
                    @click="updateQuantity(item.productId, item.quantity - 1)"
                  >
                    <el-icon :size="12"><Minus /></el-icon>
                  </button>
                  <span class="stepper__value">{{ item.quantity }}</span>
                  <button
                    type="button"
                    class="stepper__btn"
                    :aria-label="t('detail.increase')"
                    :disabled="item.quantity >= item.productStock"
                    @click="updateQuantity(item.productId, item.quantity + 1)"
                  >
                    <el-icon :size="12"><Plus /></el-icon>
                  </button>
                </div>
                <button class="cart-item__remove" type="button" @click="remove(item.productId)">
                  {{ t('cart.remove') }}
                </button>
              </div>
            </div>
          </li>
        </ul>

        <!-- 结算区 -->
        <footer class="cart__foot">
          <label class="cart__label" for="cart-address">{{ t('cart.address') }}</label>
          <el-input
            id="cart-address"
            v-model="address"
            type="textarea"
            :rows="2"
            maxlength="80"
            :placeholder="t('cart.addressPlaceholder')"
            resize="none"
          />

          <dl class="cart__summary">
            <div>
              <dt>{{ t('cart.itemsLabel') }}</dt>
              <dd>
                {{ count === 1 ? t('cart.itemsValueOne') : t('cart.itemsValue', { count }) }}
              </dd>
            </div>
            <div class="cart__summary-total">
              <dt>{{ t('cart.total') }}</dt>
              <dd>¥{{ formatPrice(totalPrice) }}</dd>
            </div>
          </dl>

          <el-button
            type="primary"
            size="large"
            class="cart__checkout"
            :loading="submitting"
            @click="checkout"
          >
            {{ t('cart.checkout') }}
          </el-button>
          <p class="cart__hint">{{ t('cart.hint') }}</p>
        </footer>
      </template>
    </div>
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Close, Minus, Plus, ShoppingCart } from '@element-plus/icons-vue'
import { PRODUCT_IMAGE } from '../config'
import { orderApi } from '../api'
import { useCart } from '../composables/useCart'
import { useI18n } from '../i18n'
import { formatPrice, readStorage, showError, writeStorage } from '../utils'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const { t } = useI18n()
const { cart, count, totalPrice, isEmpty, updateQuantity, remove, clear } = useCart()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 上次填写的地址保存在本地，减少重复输入
const address = ref(readStorage('cola_last_address', ''))
const submitting = ref(false)

watch(address, (value) => writeStorage('cola_last_address', value))

const goShopping = () => {
  visible.value = false
  router.push('/products')
}

/**
 * 逐个商品创建订单：
 * 后端按商品实时价格重新计算金额并扣减库存，前端只提交数量与地址。
 */
const checkout = async () => {
  if (isEmpty.value) return
  if (!address.value.trim()) {
    ElMessage.warning(t('cart.needAddress'))
    return
  }

  submitting.value = true
  const created = []

  try {
    for (const item of [...cart.items]) {
      await orderApi.create({
        productId: item.productId,
        orderQuantity: item.quantity,
        orderAddress: address.value.trim()
      })
      created.push(item.productId)
    }

    clear()
    ElMessage.success(t('cart.checkoutSuccess'))
    visible.value = false
    router.push('/orders')
  } catch (error) {
    // 部分成功时移除已下单商品，避免重复提交
    created.forEach((productId) => remove(productId))
    if (created.length) {
      ElMessage.warning(t('cart.partialSuccess'))
      router.push('/orders')
    }
    showError(error, t('cart.checkoutError'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.cart {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 36px);
}

.cart__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--c-line);
}

.cart__title {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.cart__title span {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-ink-3);
}

.cart__close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--c-ink-2);
  background: var(--c-surface-2);
  transition: all var(--dur) var(--ease-soft);
}

.cart__close:hover {
  color: var(--c-on-solid);
  background: var(--c-solid);
  transform: rotate(90deg);
}

/* ---------- 空状态 ---------- */
.cart__empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  color: var(--c-ink-2);
}

.cart__empty-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 10px;
  border-radius: 50%;
  background: var(--c-surface-2);
  color: var(--c-ink-3);
}

.cart__empty p {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-ink);
}

.cart__empty-tip {
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--c-ink-3);
}

/* ---------- 商品列表 ---------- */
.cart__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 2px;
  margin: 0 -2px;
}

.cart-item {
  display: flex;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background: var(--c-surface);
  transition: box-shadow var(--dur) var(--ease-soft), border-color var(--dur) var(--ease-soft);
}

.cart-item + .cart-item {
  margin-top: 12px;
}

.cart-item:hover {
  border-color: var(--c-line-strong);
  box-shadow: var(--shadow-sm);
}

.cart-item__img {
  width: 74px;
  height: 92px;
  flex-shrink: 0;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #fbfaf7, #f1ece4);
  padding: 6px;
  mix-blend-mode: multiply;
}

.cart-item__info {
  flex: 1;
  min-width: 0;
}

.cart-item__name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item__price {
  margin-top: 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
}

.cart-item__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.stepper {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
}

.stepper__btn {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  color: var(--c-ink-2);
  transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
}

.stepper__btn:hover:not(:disabled) {
  color: var(--c-brand);
  background: var(--c-brand-soft);
}

.stepper__btn:disabled {
  color: var(--c-line-strong);
  cursor: not-allowed;
}

.stepper__value {
  min-width: 28px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.cart-item__remove {
  font-size: 12px;
  color: var(--c-ink-3);
  transition: color var(--dur-fast) ease;
}

.cart-item__remove:hover {
  color: var(--c-brand);
}

/* ---------- 结算区 ---------- */
.cart__foot {
  padding-top: 18px;
  border-top: 1px solid var(--c-line);
}

.cart__label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-ink-2);
}

.cart__summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
  font-size: 13px;
  color: var(--c-ink-3);
}

.cart__summary > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.cart__summary dd {
  color: var(--c-ink);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.cart__summary-total dt {
  font-size: 14px;
  color: var(--c-ink-2);
}

.cart__summary-total dd {
  font-size: 22px;
  font-weight: 700;
  color: var(--c-brand);
  letter-spacing: -0.02em;
}

.cart__checkout {
  width: 100%;
}

.cart__hint {
  margin-top: 10px;
  font-size: 12px;
  text-align: center;
  color: var(--c-ink-3);
}

/* 抽屉内容内边距由组件库控制，这里只调整分隔感 */
:deep(.el-drawer__body) {
  display: flex;
  flex-direction: column;
}
</style>
