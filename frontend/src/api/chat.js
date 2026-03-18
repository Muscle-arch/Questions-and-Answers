import request from "@/utils/request";
import {
  mockGetSessions,
  mockCreateSession,
  mockDeleteSession,
  mockGetMessages,
} from "@/mock/chat";
import { semanticSearch, buildSystemPrompt } from "@/utils/semanticSearch.js";
import { streamChatCompletion } from "@/utils/openai.js";

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
 * 流式问答（集成 OpenAI + 知识库）
 * @param {number} sessionId
 * @param {string} message
 * @param {(delta: string) => void} onDelta  - 每次收到增量文字回调
 * @param {(data: object) => void} onDone    - 结束时回调 {message_id, sources, is_navigation?, nav_data?}
 */
export async function streamChat(sessionId, message, onDelta, onDone) {
  // 使用 OpenAI 知识库检索模式
  await streamChatWithKnowledgeBase(sessionId, message, onDelta, onDone);
}

/**
 * 基于知识库的流式对话
 */
async function streamChatWithKnowledgeBase(sessionId, message, onDelta, onDone) {
  try {
    // 1. 语义搜索知识库（关键词匹配）
    const searchResults = await semanticSearch(message, 3, 0.7);

    // 2. 检查是否有导航类结果
    const navResult = searchResults.find((r) => r.is_navigation && r.similarity >= 0.5);

    // 3. 如果有高相似度结果，直接返回答案（不调用 OpenAI API）
    const bestMatch = searchResults[0];
    if (bestMatch && bestMatch.similarity >= 0.5) {
      // 直接输出知识库答案
      const answer = bestMatch.answer;
      const words = answer.split("");
      let i = 0;
      
      const timer = setInterval(() => {
        if (i < words.length) {
          onDelta(words[i++]);
        } else {
          clearInterval(timer);
          
          const result = {
            message_id: Date.now(),
            sources: [{
              title: `知识库: ${bestMatch.question}`,
              content: "来自校园知识库",
            }],
          };

          // 如果有导航结果且用户询问路线，添加导航数据
          if (navResult && /怎么走|路线|导航|在哪/.test(message)) {
            result.is_navigation = true;
            result.nav_data = navResult.nav_data;
          }

          onDone(result);
        }
      }, 20);
      return;
    }

    // 4. 没有匹配结果，尝试调用 OpenAI API
    const systemPrompt = buildSystemPrompt([]);
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    await streamChatCompletion(
      messages,
      (delta) => {
        onDelta(delta);
      },
      () => {
        onDone({
          message_id: Date.now(),
          sources: [{ title: "OpenAI", content: "由 AI 生成回答" }],
        });
      },
      (error) => {
        console.error("OpenAI API error:", error);
        // API 失败时返回友好提示
        onDelta("抱歉，我暂时无法连接到 AI 服务。您可以尝试询问关于四川大学的专业、奖学金、校园导航等问题，我可以从知识库中为您解答。");
        onDone({
          message_id: Date.now(),
          sources: [{ title: "系统", content: "API 暂不可用" }],
        });
      }
    );
  } catch (error) {
    console.error("Knowledge base chat error:", error);
    onDelta("抱歉，处理您的请求时出错了。请稍后重试。");
    onDone({
      message_id: Date.now(),
      sources: [{ title: "系统", content: "处理失败" }],
    });
  }
}
