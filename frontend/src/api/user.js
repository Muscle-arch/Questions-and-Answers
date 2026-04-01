import request from "@/utils/request";
import { mockRegister, mockLogin, mockGetMe } from "@/mock/user";

// 文件说明：用户接口模块
// 页面对应：登录页、注册页、顶部用户信息展示
// 作用：封装与用户认证相关的请求，支持本地用户数据库

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const USE_LOCAL_DB = true; // 启用本地用户数据库
const USER_DB_KEY = "scu_user_database_v1";

// ==================== 本地用户数据库 ====================

// 获取用户数据库
function getUserDB() {
  try {
    const data = localStorage.getItem(USER_DB_KEY);
    return data ? JSON.parse(data) : { users: [] };
  } catch (e) {
    return { users: [] };
  }
}

// 保存用户数据库
function saveUserDB(db) {
  localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
}

// 查找用户
function findUser(username) {
  const db = getUserDB();
  return db.users.find(u => u.username === username);
}

// 添加用户
function addUser(userData) {
  const db = getUserDB();
  const newUser = {
    id: Date.now(),
    username: userData.username,
    password: userData.password, // 实际项目中应该加密
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveUserDB(db);
  return newUser;
}

// ==================== API 函数 ====================

// 注册 - 使用本地数据库（增强防错机制）
export function register(data) {
  if (USE_MOCK) return mockRegister(data);
  
  if (USE_LOCAL_DB) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 1. 参数校验 - 检查输入是否为空
        if (!data || typeof data !== 'object') {
          reject(new Error("注册参数错误"));
          return;
        }
        
        // 2. 参数校验 - 检查用户名
        const username = String(data.username || '').trim();
        if (!username) {
          reject(new Error("请输入用户名"));
          return;
        }
        if (username.length < 4 || username.length > 20) {
          reject(new Error("用户名长度为4-20位"));
          return;
        }
        // 用户名只能包含字母、数字、下划线
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          reject(new Error("用户名只能包含字母、数字、下划线"));
          return;
        }
        
        // 3. 参数校验 - 检查密码
        const password = String(data.password || '');
        if (!password) {
          reject(new Error("请输入密码"));
          return;
        }
        if (password.length < 6) {
          reject(new Error("密码长度至少6位"));
          return;
        }
        if (password.length > 50) {
          reject(new Error("密码长度不能超过50位"));
          return;
        }
        
        // 4. 检查用户是否已存在（使用 trim 后的用户名）
        if (findUser(username)) {
          reject(new Error("用户名已存在"));
          return;
        }
        
        // 5. 创建新用户
        const user = addUser({ username, password });
        resolve({
          id: user.id,
          username: user.username,
          message: "注册成功",
        });
      }, 300); // 模拟网络延迟
    });
  }
  
  return request.post("/auth/register", data);
}

// 登录 - 使用本地数据库（增强防错机制）
export function login(data) {
  if (USE_MOCK) return mockLogin(data);
  
  if (USE_LOCAL_DB) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 1. 参数校验 - 检查输入是否为空
        if (!data || typeof data !== 'object') {
          reject(new Error("登录参数错误"));
          return;
        }
        
        // 2. 参数校验 - 检查用户名
        const username = String(data.username || '').trim();
        if (!username) {
          reject(new Error("请输入用户名"));
          return;
        }
        if (username.length < 4 || username.length > 20) {
          reject(new Error("用户名长度为4-20位"));
          return;
        }
        
        // 3. 参数校验 - 检查密码
        const password = String(data.password || '');
        if (!password) {
          reject(new Error("请输入密码"));
          return;
        }
        if (password.length < 6) {
          reject(new Error("密码长度至少6位"));
          return;
        }
        
        // 4. 查找用户（使用 trim 后的用户名）
        const user = findUser(username);
        if (!user) {
          reject(new Error("用户名或密码错误")); // 不暴露具体是哪个错误，安全考虑
          return;
        }
        
        // 5. 密码严格匹配校验
        if (user.password !== password) {
          reject(new Error("用户名或密码错误"));
          return;
        }
        
        // 6. 登录成功，生成 token
        const token = "local_" + btoa(user.username + "_" + Date.now());
        resolve({
          access_token: token,
          id: user.id,
          username: user.username,
          message: "登录成功",
        });
      }, 300);
    });
  }
  
  return request.post("/auth/login", data);
}

// 获取当前用户信息
export function getMe() {
  if (USE_MOCK) return mockGetMe();
  
  if (USE_LOCAL_DB) {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("scu_token");
      if (!token) {
        reject(new Error("未登录"));
        return;
      }
      // 从 token 解析用户名（简化处理）
      try {
        const username = atob(token.replace("local_", "")).split("_")[0];
        const user = findUser(username);
        if (user) {
          resolve({
            id: user.id,
            username: user.username,
          });
        } else {
          reject(new Error("用户不存在"));
        }
      } catch (e) {
        reject(new Error("登录状态无效"));
      }
    });
  }
  
  return request.get("/auth/me");
}

// 退出登录
export function logout() {
  // 清除本地存储的登录状态
  localStorage.removeItem("scu_token");
  localStorage.removeItem("scu_user");
  return Promise.resolve({ message: "退出成功" });
}

// 获取所有用户（仅用于调试）
export function getAllUsers() {
  const db = getUserDB();
  return db.users.map(u => ({ id: u.id, username: u.username, createdAt: u.createdAt }));
}

// 删除用户（管理员功能）
export function deleteUser(username) {
  const db = getUserDB();
  db.users = db.users.filter(u => u.username !== username);
  saveUserDB(db);
  return Promise.resolve({ message: "删除成功" });
}
