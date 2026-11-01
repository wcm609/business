<template>
  <AuthLayout>
    <header class="auth-form-head">
      <p class="eyebrow">{{ t('auth.joinEyebrow') }}</p>
      <h2>{{ t('auth.registerTitle') }}</h2>
      <p>{{ t('auth.registerSubtitle') }}</p>
    </header>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :validate-on-rule-change="false"
      label-position="top"
      size="large"
      @submit.prevent="handleRegister"
    >
      <el-form-item :label="t('auth.username')" prop="userName">
        <el-input
          v-model="form.userName"
          :placeholder="t('auth.usernameHint')"
          :prefix-icon="User"
          autocomplete="username"
          clearable
        />
      </el-form-item>

      <el-form-item :label="t('auth.phone')" prop="userPhone">
        <el-input
          v-model="form.userPhone"
          :placeholder="t('auth.phonePlaceholder')"
          :prefix-icon="Iphone"
          maxlength="11"
          autocomplete="tel"
          clearable
        />
      </el-form-item>

      <el-form-item :label="t('auth.password')" prop="userPassword">
        <el-input
          v-model="form.userPassword"
          type="password"
          :placeholder="t('auth.passwordHint')"
          :prefix-icon="Lock"
          autocomplete="new-password"
          show-password
        />
      </el-form-item>

      <el-form-item :label="t('auth.confirmPassword')" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          :placeholder="t('auth.confirmPlaceholder')"
          :prefix-icon="Lock"
          autocomplete="new-password"
          show-password
        />
      </el-form-item>

      <el-button
        type="primary"
        size="large"
        class="auth-submit"
        :loading="loading"
        native-type="submit"
      >
        {{ t('auth.register') }}
      </el-button>
    </el-form>

    <p class="auth-switch">
      {{ t('auth.haveAccount') }}
      <RouterLink to="/login">{{ t('auth.backLogin') }}</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Iphone, Lock, User } from '@element-plus/icons-vue'
import AuthLayout from '../components/AuthLayout.vue'
import { userApi } from '../api'
import { useI18n } from '../i18n'
import { showError } from '../utils'

const router = useRouter()
const { t } = useI18n()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  userName: '',
  userPhone: '',
  userPassword: '',
  confirmPassword: ''
})

/* ---------- 自定义校验 ---------- */
const validateUserName = (rule, value, callback) => {
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/.test(value)) {
    callback(new Error(t('auth.usernameFormat')))
    return
  }
  callback()
}

const validatePhone = (rule, value, callback) => {
  if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error(t('auth.phoneInvalid')))
    return
  }
  callback()
}

const validateConfirm = (rule, value, callback) => {
  if (value !== form.userPassword) {
    callback(new Error(t('auth.confirmMismatch')))
    return
  }
  callback()
}

const rules = computed(() => ({
  userName: [
    { required: true, message: t('auth.usernameRequired'), trigger: 'blur' },
    { validator: validateUserName, trigger: 'blur' }
  ],
  userPhone: [
    { required: true, message: t('auth.phoneRequired'), trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ],
  userPassword: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMin'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('auth.confirmRequired'), trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}))

const handleRegister = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await userApi.register({
      userName: form.userName,
      userPassword: form.userPassword,
      userPhone: form.userPhone
    })

    if (res.code === 200) {
      ElMessage.success(t('auth.registerSuccess'))
      localStorage.setItem('cola_remember_username', form.userName)
      router.push({ path: '/login', query: { userName: form.userName } })
    }
  } catch (error) {
    showError(error, t('toast.genericError'))
  } finally {
    loading.value = false
  }
}
</script>
