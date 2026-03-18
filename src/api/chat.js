import request from "@/utils/request";
import {
  mockGetSessions,
  mockCreateSession,
  mockDeleteSession,
  mockGetMessages,
  mockStreamChat,
} from "@/mock/chat";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// 文件说明：聊天接口模块
// 页面对应：智能问答页、侧边栏会话管理
// 作用：封装会话列表、会话消息和流式问答请求
// 聊天相关 API：会话管理 + 流式问答

// 获取会话列表
export function getSessions(params = {}) {
  if (USE_MOCK) return mockGetSessions();
  return request.get("/sessions", { params });
}

// 新建会话
export function createSession(title = "新的对话") {
  if (USE_MOCK) return mockCreateSession(title);
  return request.post("/sessions", { title });
}

// 删除会话
export function deleteSession(id) {
  if (USE_MOCK) return mockDeleteSession(id);
  return request.delete(`/sessions/${id}`);
}

// 获取会话消息列表
export function getMessages(sessionId) {
  if (USE_MOCK) return mockGetMessages(sessionId);
  return request.get(`/sessions/${sessionId}/messages`);
}

/**
 * 流式问答
 * @param {number} sessionId
 * @param {string} message
 * @param {(delta: string) => void} onDelta  - 每次收到增量文字回调
 * @param {(data: object) => void} onDone    - 结束时回调 {message_id, sources, is_navigation?, nav_data?}
 */
export async function streamChat(sessionId, message, onDelta, onDone) {
  if (USE_MOCK) {
    mockStreamChat(sessionId, message, onDelta, onDone);
    return;
  }

  // 真实后端使用 fetch + ReadableStream 读取 SSE 分片
  const token = localStorage.getItem("scu_token");
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "请求失败");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    const lines = text.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      try {
        const event = JSON.parse(line.slice(6));
        // done=false 时持续拼接文字；done=true 时收尾并返回附加数据
        if (!event.done) {
          onDelta(event.delta);
        } else {
          onDone({
            message_id: event.message_id,
            sources: event.sources,
            is_navigation: event.is_navigation,
            nav_data: event.nav_data,
          });
        }
      } catch {
        // 跳过非 JSON 行
      }
    }
  }
}
