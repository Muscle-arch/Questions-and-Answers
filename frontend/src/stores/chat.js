import { defineStore } from "pinia";
import { ref, watch } from "vue";

// 文件说明：聊天状态模块
// 页面对应：智能问答页、左侧会话列表、消息显示组件
// 作用：集中管理会话列表、当前会话、消息列表和流式输出状态，支持多会话历史对话持久化
// 聊天状态仓库：维护会话列表、每个会话的消息、当前会话与流式消息状态

const STORAGE_KEY = 'scu_chat_sessions_v2';

// 从 localStorage 加载历史数据
function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('加载历史对话失败:', e);
  }
  return null;
}

// 保存到 localStorage
function saveToStorage(sessions, currentSessionId, sessionMessages) {
  try {
    const data = {
      sessions,
      currentSessionId,
      sessionMessages, // 每个会话的消息映射 { sessionId: messages[] }
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('保存历史对话失败:', e);
  }
}

export const useChatStore = defineStore("chat", () => {
  // 尝试从 localStorage 恢复数据
  const savedData = loadFromStorage();

  const sessions = ref(savedData?.sessions || []); // 会话列表
  const currentSessionId = ref(savedData?.currentSessionId || null);
  const sessionMessages = ref(savedData?.sessionMessages || {}); // 每个会话的消息映射
  const isStreaming = ref(false); // 是否正在流式接收

  // 当前会话的消息（计算属性）
  const messages = ref([]);

  // 同步当前会话的消息
  function syncCurrentMessages() {
    if (currentSessionId.value) {
      messages.value = sessionMessages.value[currentSessionId.value] || [];
    } else {
      messages.value = [];
    }
  }

  // 初始化时同步消息
  syncCurrentMessages();

  // 监听数据变化，自动保存到 localStorage
  watch(
    () => ({ 
      sessions: sessions.value, 
      currentSessionId: currentSessionId.value, 
      sessionMessages: sessionMessages.value 
    }),
    (newVal) => {
      saveToStorage(newVal.sessions, newVal.currentSessionId, newVal.sessionMessages);
    },
    { deep: true }
  );

  function setSessions(list) {
    sessions.value = list;
  }

  function addSession(session) {
    sessions.value.unshift(session);
    // 初始化新会话的消息数组
    sessionMessages.value[session.id] = [];
  }

  function removeSession(id) {
    sessions.value = sessions.value.filter((s) => s.id !== id);
    // 删除该会话的消息
    delete sessionMessages.value[id];
    if (currentSessionId.value === id) {
      currentSessionId.value = null;
      messages.value = [];
    }
  }

  function setCurrentSession(id) {
    // 保存当前会话的消息
    if (currentSessionId.value) {
      sessionMessages.value[currentSessionId.value] = [...messages.value];
    }
    // 切换会话
    currentSessionId.value = id;
    // 加载新会话的消息
    messages.value = sessionMessages.value[id] || [];
  }

  function setMessages(list) {
    messages.value = list;
    // 同步到 sessionMessages
    if (currentSessionId.value) {
      sessionMessages.value[currentSessionId.value] = list;
    }
  }

  function appendUserMessage(content) {
    const msg = {
      id: Date.now(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    messages.value.push(msg);
    // 同步到 sessionMessages
    if (currentSessionId.value) {
      sessionMessages.value[currentSessionId.value] = [...messages.value];
    }
  }

  // 开始一条新的 AI 消息（流式占位）
  function startAssistantMessage() {
    const msg = {
      id: "streaming",
      role: "assistant",
      content: "",
      sources: null,
      created_at: new Date().toISOString(),
    };
    messages.value.push(msg);
    isStreaming.value = true;
    return msg;
  }

  // 追加增量文字到最后一条 AI 消息
  function appendDelta(delta) {
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === "assistant") {
      last.content += delta;
    }
  }

  // 流结束，更新最后一条消息
  function finishAssistantMessage({ message_id, sources, is_location, location_data, show_nav_button, nav_query, is_navigation, nav_data }) {
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === "assistant") {
      last.id = message_id;
      last.sources = sources || null;
      // 位置和导航相关字段
      if (is_location) last.is_location = is_location;
      if (location_data) last.location_data = location_data;
      if (show_nav_button) last.show_nav_button = show_nav_button;
      if (nav_query) last.nav_query = nav_query;
      if (is_navigation) last.is_navigation = is_navigation;
      if (nav_data) last.nav_data = nav_data;
    }
    isStreaming.value = false;
    // 同步到 sessionMessages
    if (currentSessionId.value) {
      sessionMessages.value[currentSessionId.value] = [...messages.value];
    }
  }

  // 更新侧边栏会话标题（取第一条用户消息）
  function updateSessionTitle(sessionId, title) {
    const session = sessions.value.find((s) => s.id === sessionId);
    if (session) session.title = title;
  }

  // 清空所有历史对话
  function clearAllHistory() {
    sessions.value = [];
    currentSessionId.value = null;
    messages.value = [];
    sessionMessages.value = {};
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    setSessions,
    addSession,
    removeSession,
    setCurrentSession,
    setMessages,
    appendUserMessage,
    startAssistantMessage,
    appendDelta,
    finishAssistantMessage,
    updateSessionTitle,
    clearAllHistory,
  };
});
