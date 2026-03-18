import axios from "axios";
import { useUserStore } from "@/stores/user";
import router from "@/router";

// 统一 HTTP 客户端：集中处理鉴权和错误
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 30000,
});

// 请求拦截器：自动附加 JWT Token
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 直接读取，避免 pinia 在 setup 外访问的问题
    const token = localStorage.getItem("scu_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一处理 401
request.interceptors.response.use(
  // 约定直接返回 response.data，调用方无需再写 .data
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 登录态失效时清理本地缓存并跳回登录页
      localStorage.removeItem("scu_token");
      localStorage.removeItem("scu_user");
      router.push("/login");
    }
    const msg = error.response?.data?.message || error.message || "请求失败";
    return Promise.reject(new Error(msg));
  },
);

export default request;
