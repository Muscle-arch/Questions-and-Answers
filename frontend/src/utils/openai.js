// DeepSeek API 服务模块
// 文件说明：封装 DeepSeek API 调用，提供对话功能
// DeepSeek API 兼容 OpenAI 接口格式

// DeepSeek API 配置
const DEEPSEEK_API_KEY = "sk-c5b5ffb50564454183edde5d2b87ce1c";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

/**
 * 获取文本的向量嵌入 (Embedding)
 * @param {string} text - 输入文本
 * @returns {Promise<number[]>} - 向量数组
 */
export async function getEmbedding(text) {
  const response = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-ada-002",
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Embedding request failed");
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * 计算两个向量的余弦相似度
 * @param {number[]} vec1 - 向量1
 * @param {number[]} vec2 - 向量2
 * @returns {number} - 相似度 (-1 到 1)
 */
export function cosineSimilarity(vec1, vec2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * 流式对话请求
 * @param {Array} messages - 消息历史 [{role, content}]
 * @param {Function} onDelta - 流式回调 (delta) => void
 * @param {Function} onDone - 完成回调 () => void
 * @param {Function} onError - 错误回调 (error) => void
 */
export async function streamChatCompletion(messages, onDelta, onDone, onError) {
  try {
    console.log("Calling DeepSeek API...", { url: `${DEEPSEEK_BASE_URL}/chat/completions` });
    
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error response:", response.status, errorText);
      throw new Error(`API ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) onDelta(delta);
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error);
  }
}

/**
 * 非流式对话请求（用于简单问答）
 * @param {Array} messages - 消息历史
 * @returns {Promise<string>} - 完整回复
 */
export async function chatCompletion(messages) {
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Chat request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export default {
  getEmbedding,
  cosineSimilarity,
  streamChatCompletion,
  chatCompletion,
};
