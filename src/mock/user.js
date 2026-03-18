// Mock 数据 — 用户认证
// 当 VITE_USE_MOCK=true 时由 api/user.js 调用
// 文件说明：用户 mock 模块
// 页面对应：登录页、注册页
// 作用：在后端未完成时，模拟注册、登录和用户信息接口

const MOCK_USERS = []; // 运行时内存存储（刷新页面后会丢失）

export function mockRegister({ username, password }) {
  if (MOCK_USERS.find((u) => u.username === username)) {
    return Promise.reject(new Error("用户名已被注册"));
  }
  const user = {
    id: MOCK_USERS.length + 1,
    username,
    password,
    created_at: new Date().toISOString(),
  };
  MOCK_USERS.push(user);
  return Promise.resolve({
    id: user.id,
    username: user.username,
    created_at: user.created_at,
  });
}

export function mockLogin({ username, password }) {
  // 开发便利：任意用户名密码均可登录（或匹配已注册的）
  const found = MOCK_USERS.find((u) => u.username === username);
  if (found && found.password !== password) {
    return Promise.reject(new Error("用户名或密码错误"));
  }
  const user = found || { id: 999, username };
  const fakeToken = btoa(`mock:${username}:${Date.now()}`);
  return Promise.resolve({
    access_token: fakeToken,
    token_type: "bearer",
    expires_in: 604800,
    id: user.id,
    username: user.username,
  });
}

export function mockGetMe() {
  // 从 localStorage 读取上一次登录用户，模拟 /auth/me
  const raw = localStorage.getItem("scu_user");
  const user = raw ? JSON.parse(raw) : { id: 999, username: "mock_user" };
  return Promise.resolve({ ...user, created_at: "2026-01-01T00:00:00" });
}
