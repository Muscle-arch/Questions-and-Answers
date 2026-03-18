import request from "@/utils/request";
import { mockRegister, mockLogin, mockGetMe } from "@/mock/user";

// 文件说明：用户接口模块
// 页面对应：登录页、注册页、顶部用户信息展示
// 作用：封装与用户认证相关的请求，屏蔽 mock / 真实接口差异
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// 用户相关 API：根据开关自动切换 mock / 真实后端
export function register(data) {
  if (USE_MOCK) return mockRegister(data);
  return request.post("/auth/register", data);
}

export function login(data) {
  if (USE_MOCK) return mockLogin(data);
  return request.post("/auth/login", data);
}

export function getMe() {
  if (USE_MOCK) return mockGetMe();
  return request.get("/auth/me");
}
