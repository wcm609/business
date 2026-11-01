/**
 * 登录状态（全局单例）
 *
 * 之前直接用 computed 读取 localStorage，localStorage 不是响应式数据，
 * 导致登录 / 退出后导航栏不刷新。这里用 reactive 保存会话，
 * 所有组件共享同一份状态，读写保持同步。
 */
import { computed, reactive } from 'vue'

const TOKEN_KEY = 'token'
const USER_ID_KEY = 'userId'
const USER_NAME_KEY = 'userName'

const state = reactive({
  token: localStorage.getItem(TOKEN_KEY) || '',
  userId: localStorage.getItem(USER_ID_KEY) || '',
  userName: localStorage.getItem(USER_NAME_KEY) || ''
})

/** 写入会话并持久化 */
const setSession = ({ token, userId, userName }) => {
  state.token = token || ''
  state.userId = userId !== undefined && userId !== null ? String(userId) : ''
  state.userName = userName || ''

  localStorage.setItem(TOKEN_KEY, state.token)
  localStorage.setItem(USER_ID_KEY, state.userId)
  localStorage.setItem(USER_NAME_KEY, state.userName)
}

/** 仅更新用户名等资料，不改动 token */
const updateProfile = ({ userName }) => {
  if (userName !== undefined && userName !== null) {
    state.userName = userName
    localStorage.setItem(USER_NAME_KEY, userName)
  }
}

/** 清除会话 */
const clearSession = () => {
  state.token = ''
  state.userId = ''
  state.userName = ''
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(USER_NAME_KEY)
}

const isLoggedIn = computed(() => Boolean(state.token))

export const useAuth = () => ({
  auth: state,
  isLoggedIn,
  setSession,
  updateProfile,
  clearSession
})
