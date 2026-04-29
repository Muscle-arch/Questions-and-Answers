// 知识库扩展存储模块
// 文件说明：管理用户补充的知识库条目和未回答问题
// 持久化方式：localStorage

const KB_EXTENSION_KEY = 'scu_knowledge_base_extension';
const UNANSWERED_QUESTIONS_KEY = 'scu_unanswered_questions';

// ==================== 用户扩展知识库 ====================

function getExtensionDB() {
  try {
    const data = localStorage.getItem(KB_EXTENSION_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('[KnowledgeBaseDB] 读取扩展知识库失败:', e);
  }
  return [];
}

function saveExtensionDB(db) {
  try {
    localStorage.setItem(KB_EXTENSION_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('[KnowledgeBaseDB] 保存扩展知识库失败:', e);
  }
}

/**
 * 获取所有用户补充的知识库条目
 */
export function getExtendedKnowledgeBase() {
  return getExtensionDB();
}

/**
 * 添加新知识库条目
 * @param {Object} item - { question, answer, category, keywords }
 */
export function addKnowledgeItem(item) {
  const db = getExtensionDB();
  const newItem = {
    id: Date.now(),
    question: item.question,
    answer: item.answer,
    category: item.category || '用户补充',
    keywords: item.keywords || extractKeywords(item.question),
    source: 'user',
    createdAt: new Date().toISOString(),
    verified: item.verified !== false,
  };
  db.push(newItem);
  saveExtensionDB(db);
  return newItem;
}

/**
 * 删除知识库条目
 */
export function removeKnowledgeItem(id) {
  const db = getExtensionDB();
  const filtered = db.filter(item => item.id !== id);
  saveExtensionDB(filtered);
}

/**
 * 获取合并后的完整知识库（原始 + 扩展）
 * @param {Array} baseKnowledge - 原始知识库
 */
export function getMergedKnowledgeBase(baseKnowledge) {
  const extended = getExtensionDB();
  return [...baseKnowledge, ...extended];
}

// ==================== 未回答问题 ====================

function getUnansweredDB() {
  try {
    const data = localStorage.getItem(UNANSWERED_QUESTIONS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('[KnowledgeBaseDB] 读取未回答问题失败:', e);
  }
  return [];
}

function saveUnansweredDB(db) {
  try {
    localStorage.setItem(UNANSWERED_QUESTIONS_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('[KnowledgeBaseDB] 保存未回答问题失败:', e);
  }
}

/**
 * 获取所有未回答问题
 */
export function getUnansweredQuestions() {
  return getUnansweredDB();
}

/**
 * 添加未回答问题（去重）
 * @param {string} question - 问题内容
 */
export function addUnansweredQuestion(question) {
  const db = getUnansweredDB();
  const trimmed = question.trim();
  if (!trimmed) return null;

  // 检查是否已存在相同或相似的问题
  const exists = db.some(q => q.question === trimmed);
  if (exists) return null;

  const newItem = {
    id: Date.now(),
    question: trimmed,
    createdAt: new Date().toISOString(),
    answered: false,
  };
  db.push(newItem);
  saveUnansweredDB(db);
  return newItem;
}

/**
 * 标记问题已回答
 * @param {number} id
 */
export function markQuestionAnswered(id) {
  const db = getUnansweredDB();
  const item = db.find(q => q.id === id);
  if (item) {
    item.answered = true;
    item.answeredAt = new Date().toISOString();
    saveUnansweredDB(db);
  }
}

/**
 * 删除未回答问题
 */
export function removeUnansweredQuestion(id) {
  const db = getUnansweredDB();
  const filtered = db.filter(q => q.id !== id);
  saveUnansweredDB(filtered);
}

/**
 * 获取未回答数量
 */
export function getUnansweredCount() {
  return getUnansweredDB().filter(q => !q.answered).length;
}

/**
 * 清空所有未回答问题
 */
export function clearUnansweredQuestions() {
  localStorage.removeItem(UNANSWERED_QUESTIONS_KEY);
}

// ==================== 辅助函数 ====================

function extractKeywords(question) {
  const stopWords = new Set(['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这']);
  const words = question.split(/\s+|，|。|？|！|,|\.|\?|!/);
  return words
    .map(w => w.trim())
    .filter(w => w.length >= 2 && !stopWords.has(w))
    .slice(0, 5);
}
