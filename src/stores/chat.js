import { defineStore } from "pinia";
import { ref } from "vue";

// 文件说明：聊天状态模块
// 页面对应：智能问答页、左侧会话列表、消息显示组件
// 作用：集中管理会话列表、当前会话、消息列表和流式输出状态
// 聊天状态仓库：维护会话列表、当前会话与流式消息状态
export const useChatStore = defineStore("chat", () => {
  const sessions = ref([]); // 会话列表
  const currentSessionId = ref(null);
  const messages = ref([]); // 当前会话的消息列表
  const isStreaming = ref(false); // 是否正在流式接收

  function setSessions(list) {
    sessions.value = list;
  }

  function addSession(session) {
    sessions.value.unshift(session);
  }

  function removeSession(id) {
    sessions.value = sessions.value.filter((s) => s.id !== id);
    if (currentSessionId.value === id) {
      currentSessionId.value = null;
      messages.value = [];
    }
  }

  function setCurrentSession(id) {
    // 切换会话时清空消息，等待重新拉取
    currentSessionId.value = id;
    messages.value = [];
  }

  function setMessages(list) {
    messages.value = list;
  }

  function appendUserMessage(content) {
    messages.value.push({
      id: Date.now(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    });
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
  function finishAssistantMessage({ message_id, sources }) {
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === "assistant") {
      last.id = message_id;
      last.sources = sources || null;
    }
    isStreaming.value = false;
  }

  // 更新侧边栏会话标题（取第一条用户消息）
  function updateSessionTitle(sessionId, title) {
    const session = sessions.value.find((s) => s.id === sessionId);
    if (session) session.title = title;
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
  };
});
