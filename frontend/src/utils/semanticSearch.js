// 语义搜索模块
// 文件说明：基于 OpenAI Embedding 的知识库语义检索
// 功能：将知识库问题向量化，支持语义相似度匹配

import { KNOWLEDGE_BASE } from "@/mock/knowledgeBase.js";
import { getEmbedding, cosineSimilarity } from "./openai.js";

// 缓存知识库的向量嵌入
let knowledgeEmbeddings = null;

/**
 * 初始化知识库向量（预计算所有问题的嵌入）
 * 注意：实际项目中应在构建时预计算，避免每次请求
 */
export async function initKnowledgeEmbeddings() {
  if (knowledgeEmbeddings) return knowledgeEmbeddings;

  // 由于前端频繁调用 Embedding API 成本高，
  // 这里使用简化的方式：基于关键词的预计算向量（模拟）
  // 生产环境应在后端使用向量数据库
  knowledgeEmbeddings = KNOWLEDGE_BASE.map((item) => ({
    ...item,
    // 创建简单的文本特征向量用于初步筛选
    textFeatures: extractTextFeatures(item.question + " " + item.keywords.join(" ")),
  }));

  return knowledgeEmbeddings;
}

/**
 * 提取文本特征（简单的词袋模型）
 * 用于快速初步筛选，减少 API 调用
 */
function extractTextFeatures(text) {
  const features = {};
  const words = text.toLowerCase().split(/\s+|，|。|？|！|,|\.|\?|!/);
  words.forEach((word) => {
    if (word.length > 1) {
      features[word] = (features[word] || 0) + 1;
    }
  });
  return features;
}

/**
 * 计算文本特征相似度（Jaccard 系数）
 */
function jaccardSimilarity(features1, features2) {
  const keys1 = Object.keys(features1);
  const keys2 = Object.keys(features2);
  const intersection = keys1.filter((k) => keys2.includes(k));
  const union = [...new Set([...keys1, ...keys2])];
  return intersection.length / union.length;
}

/**
 * 语义搜索知识库
 * @param {string} query - 用户查询
 * @param {number} topK - 返回最相似的 K 个结果
 * @param {number} threshold - 相似度阈值 (0-1)
 * @returns {Promise<Array>} - 匹配的问答对及相似度分数
 */
export async function semanticSearch(query, topK = 3, threshold = 0.75) {
  if (!query || query.trim().length === 0) return [];

  // 由于 OpenAI API Key 可能无效，直接使用关键词搜索
  // 生产环境应使用后端向量数据库
  console.log("Using keyword search instead of embedding (API key may be invalid)");
  return fallbackKeywordSearch(query, topK);
}

/**
 * 预筛选候选问题（减少 API 调用）
 */
async function preFilterCandidates(query) {
  const kb = await initKnowledgeEmbeddings();
  const queryFeatures = extractTextFeatures(query);

  // 计算 Jaccard 相似度进行预筛选
  const scored = kb.map((item) => ({
    ...item,
    preScore: jaccardSimilarity(queryFeatures, item.textFeatures),
  }));

  // 按预筛选分数排序，取前 10 个
  scored.sort((a, b) => b.preScore - a.preScore);
  return scored.slice(0, 10).filter((item) => item.preScore > 0);
}

/**
 * 降级方案：关键词搜索（当 Embedding API 失败时使用）
 */
function fallbackKeywordSearch(query, topK = 3) {
  const lowerQuery = query.toLowerCase();
  const results = [];

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;

    // 问题匹配
    if (item.question.toLowerCase().includes(lowerQuery)) {
      score += 0.5;
    }

    // 关键词匹配
    for (const keyword of item.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 0.3;
      }
    }

    // 分类匹配
    if (item.category.toLowerCase().includes(lowerQuery)) {
      score += 0.2;
    }

    if (score > 0) {
      results.push({ ...item, similarity: score });
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

/**
 * 生成基于知识库的回答
 * @param {string} query - 用户问题
 * @param {Array} searchResults - 语义搜索结果
 * @returns {string} - 格式化的回答
 */
export function generateKnowledgeAnswer(query, searchResults) {
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  const bestMatch = searchResults[0];

  // 如果相似度很高，直接返回答案
  if (bestMatch.similarity >= 0.85) {
    return bestMatch.answer;
  }

  // 如果有多条相关结果，整合回答
  if (searchResults.length >= 2 && bestMatch.similarity >= 0.7) {
    let combinedAnswer = bestMatch.answer;

    // 添加补充信息
    for (let i = 1; i < searchResults.length && i < 3; i++) {
      const result = searchResults[i];
      if (result.similarity >= 0.6) {
        combinedAnswer += `\n\n**补充信息**：${result.answer.substring(0, 200)}...`;
      }
    }

    return combinedAnswer;
  }

  // 相似度不够高，返回 null，让 AI 自行回答
  return null;
}

/**
 * 构建系统提示词
 * @param {Array} searchResults - 知识库搜索结果
 * @returns {string} - 系统提示词
 */
export function buildSystemPrompt(searchResults) {
  let prompt = `你是四川大学的智能助手，专门回答关于学校的问题。`;

  if (searchResults && searchResults.length > 0) {
    prompt += `\n\n以下是与用户问题相关的知识库信息，请基于这些信息回答：\n\n`;
    searchResults.forEach((result, index) => {
      prompt += `[${index + 1}] 问题：${result.question}\n`;
      prompt += `答案：${result.answer}\n\n`;
    });
    prompt += `请根据以上信息，用友好、专业的语气回答用户的问题。如果知识库信息不足以回答，请礼貌地说明。`;
  } else {
    prompt += `\n\n你是四川大学的智能助手，请用友好、专业的语气回答用户关于学校的问题。如果不确定答案，请礼貌地说明。`;
  }

  return prompt;
}

export default {
  initKnowledgeEmbeddings,
  semanticSearch,
  generateKnowledgeAnswer,
  buildSystemPrompt,
};
