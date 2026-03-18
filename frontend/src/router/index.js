import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";

// 文件说明：路由配置文件
// 页面对应：首页、登录页、注册页、聊天页、导航页
// 作用：决定“访问哪个地址显示哪个页面”，并统一处理页面权限
// 页面路由配置：仅智能问答页需要鉴权，导航页可匿名访问
const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/RegisterView.vue"),
  },
  {
    path: "/chat",
    name: "Chat",
    component: () => import("@/views/ChatView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/nav",
    name: "Navigation",
    component: () => import("@/views/NavigationView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫：未登录时拦截需鉴权的页面
router.beforeEach((to) => {
  const userStore = useUserStore();

  // 未登录访问受保护页面：跳转登录并记录目标地址
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: "Login", query: { redirect: to.fullPath } };
  }

  // 已登录时访问登录/注册页直接跳转首页
  if ((to.name === "Login" || to.name === "Register") && userStore.isLoggedIn) {
    return { name: "Home" };
  }
});

export default router;
