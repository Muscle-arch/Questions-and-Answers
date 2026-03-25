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
const AMAP_WEB_KEY = import.meta.env.VITE_AMAP_WEB_KEY || import.meta.env.VITE_AMAP_JS_KEY || "";

// 意图检测：是否询问自己的位置
function isAskingLocation(message) {
  const patterns = [
    /我(的|现在)?(在哪|位置|在哪里|在什么地方)/,
    /我(现在|目前)?(在哪|位置)/,
    /(我的|获取|查询|显示)(当前)?位置/,
    /定位/,
    /我在哪/,
  ];
  return patterns.some(p => p.test(message));
}

// 意图检测：是否询问导航/路线/目标地点
function isAskingNavigation(message) {
  const patterns = [
    /怎么走|怎么去|如何去|如何走|路线|导航/,
    /从.+到/,
    /(在哪|怎么找|哪里有).+/,
    /.+(在哪里?|怎么找|位置)/,
    /我(想|要|打算)?去.+/,
    /带?我(到|去).+/,
    /(指引|告诉)我(去|到|怎么).+/,
  ];
  return patterns.some(p => p.test(message));
}

// 调用高德API获取当前位置（IP定位）
async function getMyLocation() {
  try {
    if (!AMAP_WEB_KEY) {
      throw new Error("未配置高德API密钥");
    }
    const resp = await fetch(`https://restapi.amap.com/v3/ip?key=${AMAP_WEB_KEY}`);
    const data = await resp.json();
    if (data.status === "1") {
      return {
        success: true,
        province: data.province || "",
        city: data.city || "",
        adcode: data.adcode || "",
        rectangle: data.rectangle || "",
      };
    }
    throw new Error(data.info || "定位失败");
  } catch (error) {
    console.error("获取位置失败:", error);
    return { success: false, error: error.message };
  }
}

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
    // 0. 检查是否询问位置
    if (isAskingLocation(message)) {
      const location = await getMyLocation();
      if (location.success) {
        const answer = `您当前位于：${location.province}${location.city}`;
        const words = answer.split("");
        let i = 0;
        const timer = setInterval(() => {
          if (i < words.length) {
            onDelta(words[i++]);
          } else {
            clearInterval(timer);
            onDone({
              message_id: Date.now(),
              sources: [],
              is_location: true,
              location_data: location,
            });
          }
        }, 30);
        return;
      }
    }

    // 0.5 检查是否询问导航/路线
    if (isAskingNavigation(message)) {
      const answer = "我可以帮您导航！请点击下方按钮前往导航页面，输入起点和终点进行路线规划。";
      const words = answer.split("");
      let i = 0;
      const timer = setInterval(() => {
        if (i < words.length) {
          onDelta(words[i++]);
        } else {
          clearInterval(timer);
          onDone({
            message_id: Date.now(),
            sources: [],
            show_nav_button: true,
            nav_query: message,
          });
        }
      }, 30);
      return;
    }

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
            sources: [],
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
          sources: [],
        });
      },
      (error) => {
        console.error("OpenAI API error:", error);
        // API 失败时返回友好提示
        onDelta("抱歉，我暂时无法连接到 AI 服务。您可以尝试询问关于四川大学的专业、奖学金、校园导航等问题，我可以从知识库中为您解答。");
        onDone({
          message_id: Date.now(),
          sources: [],
        });
      }
    );
  } catch (error) {
    console.error("Knowledge base chat error:", error);
    onDelta("抱歉，处理您的请求时出错了。请稍后重试。");
    onDone({
      message_id: Date.now(),
      sources: [],
    });
  }
}
