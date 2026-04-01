// 文件说明：对话历史本地数据库
// 作用：使用 localStorage 实现类似数据库的会话和消息存储

const DB_KEY = 'scu_chat_database_v1';

// 获取数据库
function getDB() {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取对话数据库失败:', e);
  }
  return { sessions: [], messages: {} };
}

// 保存数据库
function saveDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('保存对话数据库失败:', e);
  }
}

// ==================== 会话操作 ====================

// 获取所有会话
export function getAllSessions() {
  const db = getDB();
  return db.sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}

// 创建新会话
export function createSession(title = '新的对话') {
  const db = getDB();
  const session = {
    id: Date.now(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.sessions.unshift(session);
  db.messages[session.id] = [];
  saveDB(db);
  return session;
}

// 更新会话标题
export function updateSessionTitle(sessionId, title) {
  const db = getDB();
  const session = db.sessions.find(s => s.id === sessionId);
  if (session) {
    session.title = title;
    session.updatedAt = Date.now();
    saveDB(db);
  }
}

// 更新会话时间
export function updateSessionTime(sessionId) {
  const db = getDB();
  const session = db.sessions.find(s => s.id === sessionId);
  if (session) {
    session.updatedAt = Date.now();
    saveDB(db);
  }
}

// 删除会话
export function deleteSession(sessionId) {
  const db = getDB();
  db.sessions = db.sessions.filter(s => s.id !== sessionId);
  delete db.messages[sessionId];
  saveDB(db);
}

// ==================== 消息操作 ====================

// 获取会话的所有消息
export function getSessionMessages(sessionId) {
  const db = getDB();
  return db.messages[sessionId] || [];
}

// 添加用户消息
export function addUserMessage(sessionId, content) {
  const db = getDB();
  if (!db.messages[sessionId]) {
    db.messages[sessionId] = [];
  }
  const message = {
    id: Date.now(),
    role: 'user',
    content,
    created_at: new Date().toISOString(),
  };
  db.messages[sessionId].push(message);
  
  // 更新会话时间
  const session = db.sessions.find(s => s.id === sessionId);
  if (session) {
    session.updatedAt = Date.now();
  }
  
  saveDB(db);
  return message;
}

// 开始 AI 消息（流式）
export function startAssistantMessage(sessionId) {
  const db = getDB();
  if (!db.messages[sessionId]) {
    db.messages[sessionId] = [];
  }
  const message = {
    id: 'streaming',
    role: 'assistant',
    content: '',
    sources: null,
    created_at: new Date().toISOString(),
  };
  db.messages[sessionId].push(message);
  saveDB(db);
  return message;
}

// 追加 AI 消息内容
export function appendAssistantContent(sessionId, delta) {
  const db = getDB();
  const messages = db.messages[sessionId];
  if (messages && messages.length > 0) {
    const last = messages[messages.length - 1];
    if (last.role === 'assistant') {
      last.content += delta;
      saveDB(db);
    }
  }
}

// 完成 AI 消息
export function finishAssistantMessage(sessionId, result) {
  const db = getDB();
  const messages = db.messages[sessionId];
  if (messages && messages.length > 0) {
    const last = messages[messages.length - 1];
    if (last.role === 'assistant') {
      const { message_id, sources, ...extra } = result || {};
      last.id = message_id || Date.now();
      last.sources = sources || null;
      Object.assign(last, extra);
      saveDB(db);
      return last;
    }
  }
}

// 清空所有对话数据
export function clearAllChatData() {
  localStorage.removeItem(DB_KEY);
}

// 导出数据库（用于调试）
export function exportDatabase() {
  return getDB();
}
