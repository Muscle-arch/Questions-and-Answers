/**
 * 新的聊天API模块 - 连接FastAPI后端
 * 提供与后端RAG问答服务的集成
 */
import axios from "axios";

// 后端API基础URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// 创建axios实例
const chatApiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/chat`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 添加JWT token
chatApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("scu_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
chatApiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 未授权，清除token并跳转到登录
      localStorage.removeItem("scu_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * 发送消息并获取AI回答（RAG模式）
 * @param {string} message - 用户消息
 * @param {string} userId - 用户ID (可选)
 * @param {string} conversationId - 对话ID (可选)
 * @returns {Promise<Object>} 服务器返回的回答
 */
export async function sendMessage(message, userId = null, conversationId = null) {
  try {
    const response = await chatApiClient.post("/send", {
      message,
      user_id: userId,
      conversation_id: conversationId,
    });
    return response;
  } catch (error) {
    console.error("发送消息失败:", error);
    throw error;
  }
}

/**
 * 直接查询（不使用RAG，直接调用DeepSeek）
 * @param {string} message - 用户消息
 * @param {string} userId - 用户ID (可选)
 * @returns {Promise<Object>} 服务器返回的回答
 */
export async function directQuery(message, userId = null) {
  try {
    const response = await chatApiClient.post("/direct-query", {
      message,
      user_id: userId,
    });
    return response;
  } catch (error) {
    console.error("查询失败:", error);
    throw error;
  }
}

/**
 * 加载知识库文档
 * @param {Array<string>} documents - 文档列表
 * @param {string} category - 文档类别
 * @returns {Promise<Object>} 加载结果
 */
export async function loadKnowledgeBase(documents, category = "general") {
  try {
    const response = await chatApiClient.post("/load-knowledge", {
      documents,
      category,
    });
    return response;
  } catch (error) {
    console.error("加载知识库失败:", error);
    throw error;
  }
}

/**
 * 获取对话历史
 * @param {string} conversationId - 对话ID
 * @returns {Promise<Object>} 对话历史
 */
export async function getConversationHistory(conversationId) {
  try {
    const response = await chatApiClient.get(`/history/${conversationId}`);
    return response;
  } catch (error) {
    console.error("获取对话历史失败:", error);
    throw error;
  }
}

/**
 * 健康检查
 * @returns {Promise<Object>} 服务器健康状态
 */
export async function healthCheck() {
  try {
    const response = await chatApiClient.get("/health");
    return response;
  } catch (error) {
    console.error("健康检查失败:", error);
    throw error;
  }
}

/**
 * 获取API状态
 * @returns {Promise<Object>} API状态信息
 */
export async function getApiStatus() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/status`);
    return response.data;
  } catch (error) {
    console.error("获取API状态失败:", error);
    throw error;
  }
}

export default chatApiClient;
