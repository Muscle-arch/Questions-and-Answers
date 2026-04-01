import { defineStore } from "pinia";
import { ref } from "vue";
import * as chatDB from "@/utils/chatDatabase.js";

// 文件说明：聊天状态模块
// 页面对应：智能问答页、左侧会话列表、消息显示组件
// 作用：集中管理会话列表、当前会话、消息列表和流式输出状态
// 数据持久化：使用本地数据库 chatDatabase 存储会话和消息

export const useChatStore = defineStore("chat", () => {
  // 从本地数据库加载会话列表
  const sessions = ref(chatDB.getAllSessions());
  const currentSessionId = ref(null);
  // 当前会话的消息列表
  const messages = ref([]);
  const isStreaming = ref(false);

  // 设置会话列表
  function setSessions(list) {
    sessions.value = list;
  }

  // 添加新会话（保存到数据库）
  function addSession(session) {
    sessions.value.unshift(session);
  }

  // 从数据库创建新会话
  function createNewSession(title = '新的对话') {
    const session = chatDB.createSession(title);
    sessions.value.unshift(session);
    return session;
  }

  // 删除会话（从数据库删除）
  function removeSession(id) {
    chatDB.deleteSession(id);
    sessions.value = sessions.value.filter((s) => s.id !== id);
    if (currentSessionId.value === id) {
      currentSessionId.value = null;
      messages.value = [];
    }
  }

  // 切换会话（从数据库加载消息）
  function setCurrentSession(id) {
    currentSessionId.value = id;
    if (id) {
      messages.value = chatDB.getSessionMessages(id);
    } else {
      messages.value = [];
    }
  }

  // 设置消息列表
  function setMessages(list) {
    messages.value = list;
  }

  // 添加用户消息（保存到数据库）
  function appendUserMessage(content) {
    if (!currentSessionId.value) return;
    
    // 保存到数据库
    chatDB.addUserMessage(currentSessionId.value, content);
    
    // 更新内存中的消息列表
    messages.value.push({
      id: Date.now(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    });
    
    // 更新会话列表顺序
    sessions.value = chatDB.getAllSessions();
  }

  // 开始 AI 消息（保存到数据库）
  function startAssistantMessage() {
    if (!currentSessionId.value) return null;
    
    // 保存到数据库
    chatDB.startAssistantMessage(currentSessionId.value);
    
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

  // 追加 AI 消息内容（保存到数据库）
  function appendDelta(delta) {
    if (!currentSessionId.value) return;
    
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === "assistant") {
      last.content += delta;
      // 同步到数据库
      chatDB.appendAssistantContent(currentSessionId.value, delta);
    }
  }

  // 完成 AI 消息（保存到数据库）
  function finishAssistantMessage(result) {
    if (!currentSessionId.value) {
      isStreaming.value = false;
      return;
    }
    
    const { message_id, sources, ...extra } = result || {};
    const last = messages.value[messages.value.length - 1];
    
    if (last && last.role === "assistant") {
      last.id = message_id;
      last.sources = sources || null;
      Object.assign(last, extra);
    }
    
    isStreaming.value = false;
    
    // 同步到数据库
    chatDB.finishAssistantMessage(currentSessionId.value, result);
  }

  // 更新会话标题（保存到数据库）
  function updateSessionTitle(sessionId, title) {
    chatDB.updateSessionTitle(sessionId, title);
    const session = sessions.value.find((s) => s.id === sessionId);
    if (session) {
      session.title = title;
    }
  }

  // 刷新会话列表（从数据库重新加载）
  function refreshSessions() {
    sessions.value = chatDB.getAllSessions();
  }

  // 清空所有对话数据
  function clearAllHistory() {
    chatDB.clearAllChatData();
    sessions.value = [];
    currentSessionId.value = null;
    messages.value = [];
  }

  return {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    setSessions,
    addSession,
    createNewSession,
    removeSession,
    setCurrentSession,
    setMessages,
    appendUserMessage,
    startAssistantMessage,
    appendDelta,
    finishAssistantMessage,
    updateSessionTitle,
    refreshSessions,
    clearAllHistory,
  };
});
