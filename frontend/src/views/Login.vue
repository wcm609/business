<template>
  <AuthLayout>
    <header class="auth-form-head">
      <p class="eyebrow">{{ t('auth.welcomeBackEyebrow') }}</p>
      <h2>{{ t('auth.loginTitle') }}</h2>
      <p>{{ t('auth.loginSubtitle') }}</p>
    </header>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :validate-on-rule-change="false"
      label-position="top"
      size="large"
      @submit.prevent="handleLogin"
    >
      <el-form-item :label="t('auth.username')" prop="userName">
        <el-input
          v-model="form.userName"
          :placeholder="t('auth.usernamePlaceholder')"
          :prefix-icon="User"
          autocomplete="username"
          clearable
        />
      </el-form-item>

      <el-form-item :label="t('auth.password')" prop="userPassword">
        <el-input
          v-model="form.userPassword"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="t('auth.passwordPlaceholder')"
          :prefix-icon="Lock"
          autocomplete="current-password"
        >
          <template #suffix>
            <button
              type="button"
              class="auth-pwd-toggle"
              :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
              @click="showPassword = !showPassword"
            >
              <el-icon :size="15">
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </button>
          </template>
        </el-input>
      </el-form-item>

      <div class="auth-form-row">
        <el-checkbox v-model="rememberMe">{{ t('auth.remember') }}</el-checkbox>
        <button type="button" class="auth-link-btn" @click="handleForgot">
          {{ t('auth.forgot') }}
        </button>
      </div>

      <el-button
        type="primary"
        size="large"
        class="auth-submit"
        :loading="loading"
        native-type="submit"
      >
        {{ t('auth.login') }}
      </el-button>
    </el-form>

    <p class="auth-switch">
      {{ t('auth.noAccount') }}
      <RouterLink to="/register">{{ t('auth.create') }}</RouterLink>
    </p>

    <p v-if="connection.offline" class="auth-demo-tip">
      <el-icon :size="13"><InfoFilled /></el-icon>
      {{ t('auth.demoOffline') }}
    </p>
  </AuthLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Hide, InfoFilled, Lock, User, View } from '@element-plus/icons-vue'
import AuthLayout from '../components/AuthLayout.vue'
import { userApi } from '../api'
import { connection } from '../api/request'
import { useAuth } from '../composables/useAuth'
import { useI18n } from '../i18n'
import { showError } from '../utils'

const REMEMBER_KEY = 'cola_remember_username'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { setSession } = useAuth()

const formRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(Boolean(localStorage.getItem(REMEMBER_KEY)))

const form = reactive({
  userName: '',
  userPassword: ''
})

const rules = computed(() => ({
  userName: [{ required: true, message: t('auth.usernameRequired'), trigger: 'blur' }],
  userPassword: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMin'), trigger: 'blur' }
  ]
}))

onMounted(() => {
  // 优先级：注册后回填 > 记住的用户名 > 空
  const remembered = localStorage.getItem(REMEMBER_KEY) || ''
  form.userName = route.query.userName || remembered || ''
})

const handleLogin = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await userApi.login(form.userName, form.userPassword)
    const { token, userId } = res.data

    setSession({ token, userId, userName: form.userName })

    if (rememberMe.value) {
      localStorage.setItem(REMEMBER_KEY, form.userName)
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }

    ElMessage.success(t('auth.loginSuccess'))
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/products'
    router.push(redirect)
  } catch (error) {
    showError(error, t('toast.genericError'))
  } finally {
    loading.value = false
  }
}

const handleForgot = () => {
  ElMessage.info(t('auth.forgotInfo'))
}
</script>
