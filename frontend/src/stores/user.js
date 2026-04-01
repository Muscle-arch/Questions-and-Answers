import { defineStore } from "pinia";
import { ref, computed } from "vue";

// 文件说明：用户状态模块
// 页面对应：登录页、注册页、顶部导航栏、所有需要判断登录态的页面
// 作用：集中管理 token、用户信息和登录状态
const TOKEN_KEY = "scu_token";
const USER_KEY = "scu_user";

// 用户状态仓库：维护登录态、用户信息与本地持久化
export const useUserStore = defineStore("user", () => {
  // 初始化时从 localStorage 恢复登录状态
  const token = ref(localStorage.getItem(TOKEN_KEY) || "");
  const userInfo = ref(JSON.parse(localStorage.getItem(USER_KEY) || "null"));

  const isLoggedIn = computed(() => !!token.value);
  const username = computed(() => userInfo.value?.username || "");

  // 登录成功后同步内存状态 + 本地缓存
  function setAuth(data) {
    token.value = data.access_token;
    userInfo.value = { id: data.id, username: data.username };
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo.value));
  }

  function setUserInfo(info) {
    userInfo.value = info;
    localStorage.setItem(USER_KEY, JSON.stringify(info));
  }

  // 主动退出登录
  async function logout() {
    // 调用 API 清除登录状态
    try {
      await import("@/api/user").then(m => m.logout());
    } catch (e) {
      console.error("退出登录失败:", e);
    }
    // 清除内存状态
    token.value = "";
    userInfo.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    setAuth,
    setUserInfo,
    logout,
  };
});
