<template>
  <div class="profile container page">
    <header class="profile__head">
      <p class="eyebrow">{{ t('profile.eyebrow') }}</p>
      <h1 class="page-title">{{ t('profile.title') }}</h1>
      <p class="page-subtitle">{{ t('profile.subtitle') }}</p>
    </header>

    <div class="profile__layout">
      <!-- 左侧账号卡片 -->
      <aside class="account">
        <div class="account__top">
          <span class="account__avatar">{{ initial }}</span>
          <h2 class="account__name">{{ auth.userName || t('nav.notLoggedIn') }}</h2>
          <p class="account__phone">{{ maskPhone(phone) || t('profile.notBound') }}</p>
          <span v-if="registerTime" class="account__since">
            {{ t('profile.joined', { date: formatDay(registerTime) }) }}
          </span>
        </div>

        <dl class="account__meta">
          <div>
            <dt>{{ t('profile.userId') }}</dt>
            <dd>{{ auth.userId || t('profile.noData') }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.orderTotal') }}</dt>
            <dd>{{ orders.length }}</dd>
          </div>
          <div>
            <dt>{{ t('profile.favoriteTotal') }}</dt>
            <dd>{{ favoritesCount }}</dd>
          </div>
        </dl>

        <div class="account__actions">
          <el-button type="primary" round @click="goOrders('all')">{{ t('profile.viewOrders') }}</el-button>
          <el-button round @click="handleLogout">{{ t('profile.logout') }}</el-button>
        </div>

        <p class="account__tip">
          <el-icon :size="13"><Lock /></el-icon>
          {{ t('profile.securityTip') }}
        </p>
      </aside>

      <div class="profile__main">
        <!-- 订单概览 -->
        <section class="panel">
          <header class="panel__head">
            <div>
              <h2 class="section-title">{{ t('profile.overview') }}</h2>
              <p class="panel__desc">{{ t('profile.overviewDesc') }}</p>
            </div>
            <button type="button" class="panel__link" @click="goOrders('all')">
              {{ t('profile.allOrders') }}
              <el-icon :size="13"><ArrowRight /></el-icon>
            </button>
          </header>

          <div class="stats">
            <button
              v-for="item in statCards"
              :key="item.status"
              type="button"
              class="stat"
              :class="`stat--${item.tone}`"
              @click="goOrders(item.status)"
            >
              <span class="stat__icon">
                <el-icon :size="17"><component :is="item.icon" /></el-icon>
              </span>
              <span class="stat__count">{{ countByStatus(item.status) }}</span>
              <span class="stat__label">{{ t(item.labelKey) }}</span>
            </button>
          </div>
        </section>

        <!-- 账号信息 -->
        <section class="panel">
          <header class="panel__head">
            <div>
              <h2 class="section-title">{{ t('profile.infoTitle') }}</h2>
              <p class="panel__desc">{{ t('profile.infoDesc') }}</p>
            </div>
          </header>

          <dl class="info">
            <div>
              <dt>{{ t('profile.username') }}</dt>
              <dd>{{ auth.userName || t('profile.noData') }}</dd>
            </div>
            <div>
              <dt>{{ t('profile.phone') }}</dt>
              <dd>{{ maskPhone(phone) || t('profile.notBound') }}</dd>
            </div>
            <div>
              <dt>{{ t('profile.registerTime') }}</dt>
              <dd>{{ formatDate(registerTime) || t('profile.noData') }}</dd>
            </div>
            <div>
              <dt>{{ t('profile.userId') }}</dt>
              <dd>#{{ auth.userId || t('profile.noData') }}</dd>
            </div>
          </dl>
        </section>

        <!-- 我的收藏 -->
        <section class="panel">
          <header class="panel__head">
            <div>
              <h2 class="section-title">{{ t('profile.favoritesTitle') }}</h2>
              <p class="panel__desc">{{ t('profile.favoritesCount', { count: favoritesCount }) }}</p>
            </div>
            <button type="button" class="panel__link" @click="goFavorites">
              {{ t('profile.allFavorites') }}
              <el-icon :size="13"><ArrowRight /></el-icon>
            </button>
          </header>

          <div v-if="favoriteProducts.length === 0" class="favorites-empty">
            <el-icon :size="18"><Star /></el-icon>
            <span>{{ t('profile.favoritesEmpty') }}</span>
            <el-button text @click="router.push('/products')">{{ t('profile.browse') }}</el-button>
          </div>

          <ul v-else class="favorites">
            <li v-for="item in favoriteProducts" :key="item.productId" class="favorite">
              <button type="button" class="favorite__main" @click="router.push(`/product/${item.productId}`)">
                <img :src="PRODUCT_IMAGE" alt="" class="favorite__img" />
                <span class="favorite__info">
                  <strong>{{ item.productName }}</strong>
                  <span>¥{{ formatPrice(item.productPrice) }}</span>
                </span>
              </button>
              <button
                type="button"
                class="favorite__remove"
                :aria-label="t('profile.removeFavorite')"
                @click="removeFavorite(item)"
              >
                <el-icon :size="13"><Close /></el-icon>
              </button>
            </li>
          </ul>
        </section>

        <!-- 修改密码 -->
        <section class="panel">
          <header class="panel__head">
            <div>
              <h2 class="section-title">{{ t('profile.passwordTitle') }}</h2>
              <p class="panel__desc">{{ t('profile.passwordDesc') }}</p>
            </div>
          </header>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            :validate-on-rule-change="false"
            label-position="top"
            class="password-form"
            @submit.prevent="handleChangePassword"
          >
            <el-form-item :label="t('profile.oldPassword')" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                :placeholder="t('profile.oldPlaceholder')"
                show-password
                autocomplete="current-password"
              />
            </el-form-item>
            <el-form-item :label="t('profile.newPassword')" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                :placeholder="t('profile.newPlaceholder')"
                show-password
                autocomplete="new-password"
              />
            </el-form-item>
            <el-form-item :label="t('profile.confirmPassword')" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                :placeholder="t('profile.confirmPlaceholder')"
                show-password
                autocomplete="new-password"
              />
            </el-form-item>

            <el-button
              type="primary"
              class="password-form__submit"
              :loading="changingPassword"
              native-type="submit"
            >
              {{ t('profile.savePassword') }}
            </el-button>
          </el-form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  CircleCheck,
  CircleClose,
  Close,
  Lock,
  Money,
  Star,
  Van
} from '@element-plus/icons-vue'
import { PRODUCT_IMAGE } from '../config'
import { orderApi, productApi, userApi } from '../api'
import { useAuth } from '../composables/useAuth'
import { useFavorites } from '../composables/useFavorites'
import { useI18n } from '../i18n'
import {
  formatDate,
  formatDay,
  formatPrice,
  initialOf,
  maskPhone,
  showError
} from '../utils'

const router = useRouter()
const { t } = useI18n()
const { auth, clearSession } = useAuth()
const { count: favoritesCount, favorites, toggle } = useFavorites()

const orders = ref([])
const products = ref([])
const phone = ref('')
const registerTime = ref('')

const initial = computed(() => initialOf(auth.userName))

const statCards = [
  { labelKey: 'profile.statPending', status: '0', tone: 'warning', icon: Money },
  { labelKey: 'profile.statReceived', status: '1', tone: 'brand', icon: Van },
  { labelKey: 'profile.statCompleted', status: '3', tone: 'success', icon: CircleCheck },
  { labelKey: 'profile.statCancelled', status: '4', tone: 'muted', icon: CircleClose }
]

const countByStatus = (status) =>
  orders.value.filter((order) => String(order.orderStatus) === status).length

const favoriteProducts = computed(() =>
  products.value.filter((item) => favorites.ids.some((id) => String(id) === String(item.productId))).slice(0, 4)
)

/* ---------------- 数据加载 ---------------- */
const loadProfile = async () => {
  try {
    const res = await userApi.info()
    phone.value = res.data?.userPhone || ''
    registerTime.value = res.data?.userRegisterTime || ''
  } catch (error) {
    showError(error, t('profile.infoLoadFailed'))
  }
}

const loadOrders = async () => {
  try {
    const res = await orderApi.list()
    orders.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    orders.value = []
  }
}

const loadProducts = async () => {
  try {
    const res = await productApi.list()
    products.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    products.value = []
  }
}

onMounted(() => {
  loadProfile()
  loadOrders()
  loadProducts()
})

/* ---------------- 交互 ---------------- */
const goOrders = (status) => router.push({ path: '/orders', query: { tab: status } })
const goFavorites = () => router.push({ path: '/products', query: { view: 'favorites' } })

const removeFavorite = (product) => {
  toggle(product.productId)
  ElMessage.success(t('profile.removeFavoriteSuccess'))
}

const handleLogout = () => {
  clearSession()
  ElMessage.success(t('toast.logout'))
  router.push('/login')
}

/* ---------------- 修改密码 ---------------- */
const passwordFormRef = ref(null)
const changingPassword = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateNewPassword = (rule, value, callback) => {
  if (value === passwordForm.oldPassword) {
    callback(new Error(t('profile.passwordSame')))
    return
  }
  callback()
}

const validateConfirm = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error(t('auth.confirmMismatch')))
    return
  }
  callback()
}

const passwordRules = {
  oldPassword: [{ required: true, message: t('auth.oldRequired'), trigger: 'blur' }],
  newPassword: [
    { required: true, message: t('auth.newRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMin'), trigger: 'blur' },
    { validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('auth.confirmRequired'), trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  changingPassword.value = true
  try {
    await userApi.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success(t('profile.passwordSuccess'))
    passwordFormRef.value.resetFields()
    setTimeout(() => {
      clearSession()
      router.push('/login')
    }, 800)
  } catch (error) {
    showError(error, t('profile.passwordFailed'))
  } finally {
    changingPassword.value = false
  }
}
</script>

<style scoped>
.profile__head {
  margin-bottom: 28px;
}

.profile__layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

/* ---------- 账号卡片 ---------- */
.account {
  position: sticky;
  top: calc(var(--nav-height) + 20px);
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-lg);
  background: var(--c-surface);
  box-shadow: var(--shadow-sm);
}

.account__top {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 34px 24px 24px;
  text-align: center;
  background:
    radial-gradient(120% 100% at 50% 0%, #fff 0%, #faf6ef 60%, #f3ece1 100%);
  border-bottom: 1px solid var(--c-line);
}

.account__avatar {
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  margin-bottom: 14px;
  border-radius: 50%;
  background: var(--grad-ink);
  color: #fff;
  font-size: 30px;
  font-weight: 600;
  box-shadow: 0 18px 30px -18px rgba(25, 23, 19, 0.7);
}

.account__name {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.account__phone {
  margin-top: 4px;
  font-size: 13px;
  color: var(--c-ink-3);
}

.account__since {
  margin-top: 10px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--c-surface-2);
  font-size: 11px;
  color: var(--c-ink-2);
}

.account__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 18px 12px;
  border-bottom: 1px solid var(--c-line);
  text-align: center;
}

.account__meta div + div {
  border-left: 1px solid var(--c-line);
}

.account__meta dt {
  font-size: 11px;
  color: var(--c-ink-3);
}

.account__meta dd {
  margin-top: 4px;
  font-size: 17px;
  font-weight: 700;
  color: var(--c-ink);
  font-variant-numeric: tabular-nums;
}

.account__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px 22px;
}

.account__actions .el-button {
  width: 100%;
  margin: 0;
}

.account__tip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 13px 20px;
  border-top: 1px solid var(--c-line);
  background: var(--c-bg-soft);
  font-size: 11.5px;
  color: var(--c-ink-3);
}

.account__tip .el-icon {
  flex-shrink: 0;
  color: var(--c-ink-3);
}

/* ---------- 右侧面板 ---------- */
.profile__main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.panel {
  padding: 24px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-lg);
  background: var(--c-surface);
  box-shadow: var(--shadow-xs);
}

.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.panel__desc {
  margin-top: 4px;
  font-size: 12.5px;
  color: var(--c-ink-3);
}

.panel__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--c-ink-2);
  transition: color var(--dur) var(--ease-soft), gap var(--dur) var(--ease-soft);
}

.panel__link:hover {
  gap: 8px;
  color: var(--c-brand);
}

/* ---------- 订单统计 ---------- */
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background: var(--c-bg-soft);
  text-align: left;
  transition: all var(--dur) var(--ease-soft);
}

.stat:hover {
  transform: translateY(-3px);
  border-color: var(--c-line-strong);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.stat__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  border-radius: 10px;
}

.stat__count {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--c-ink);
  font-variant-numeric: tabular-nums;
}

.stat__label {
  font-size: 12px;
  color: var(--c-ink-3);
}

.stat--warning .stat__icon {
  background: var(--c-warning-soft);
  color: var(--c-warning);
}

.stat--brand .stat__icon {
  background: var(--c-brand-soft);
  color: var(--c-brand);
}

.stat--success .stat__icon {
  background: var(--c-success-soft);
  color: var(--c-success);
}

.stat--muted .stat__icon {
  background: var(--c-surface-2);
  color: var(--c-ink-3);
}

/* ---------- 信息列表 ---------- */
.info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 32px;
}

.info > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 0;
  border-bottom: 1px solid var(--c-line);
}

.info dt {
  font-size: 13px;
  color: var(--c-ink-3);
}

.info dd {
  overflow: hidden;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--c-ink);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- 收藏 ---------- */
.favorites {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.favorite {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background: var(--c-bg-soft);
  transition: all var(--dur) var(--ease-soft);
}

.favorite:hover {
  border-color: var(--c-line-strong);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.favorite__main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  text-align: left;
}

.favorite__img {
  width: 46px;
  height: 56px;
  flex-shrink: 0;
  padding: 4px;
  border-radius: var(--radius-xs);
  background: #fff;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.favorite__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.favorite__info strong {
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-ink);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite__info span {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-brand);
}

.favorite__remove {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  color: var(--c-ink-3);
  transition: all var(--dur-fast) ease;
}

.favorite__remove:hover {
  color: var(--c-brand);
  background: var(--c-brand-soft);
}

.favorites-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 1px dashed var(--c-line-strong);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--c-ink-3);
}

/* ---------- 修改密码 ---------- */
.password-form {
  max-width: 460px;
}

.password-form__submit {
  margin-top: 4px;
  height: 44px;
  padding: 0 28px;
}

/* ---------- 响应式 ---------- */
@media (max-width: 980px) {
  .profile__layout {
    grid-template-columns: 1fr;
  }

  .account {
    position: static;
  }

  .account__actions {
    flex-direction: row;
  }

  .account__actions .el-button {
    width: auto;
    flex: 1;
  }
}

@media (max-width: 640px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .info {
    grid-template-columns: 1fr;
  }

  .favorites {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 20px 18px;
  }
}
</style>
