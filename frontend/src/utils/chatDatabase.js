// 文件说明：对话历史本地数据库
// 作用：使用 localStorage 实现类似数据库的会话和消息存储
// 每个用户的数据独立存储，通过 userId 区分命名空间

const DB_KEY_PREFIX = 'scu_chat_db_';

// 获取当前用户的存储 key
function getDBKey(userId) {
  const key = DB_KEY_PREFIX + (userId || 'guest');
  console.log('[ChatDB] getDBKey for userId:', userId, '-> key:', key);
  return key;
}

// 获取数据库
function getDB(userId) {
  try {
    const data = localStorage.getItem(getDBKey(userId));
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取对话数据库失败:', e);
  }
  return { sessions: [], messages: {} };
}

// 保存数据库
function saveDB(userId, db) {
  try {
    localStorage.setItem(getDBKey(userId), JSON.stringify(db));
  } catch (e) {
    console.error('保存对话数据库失败:', e);
  }
}

// ==================== 会话操作 ====================

// 获取所有会话
export function getAllSessions(userId) {
  const db = getDB(userId);
  return db.sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}

// 创建新会话
export function createSession(userId, title = '新的对话') {
  const db = getDB(userId);
  const session = {
    id: Date.now(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.sessions.unshift(session);
  db.messages[session.id] = [];
  saveDB(userId, db);
  return session;
}

// 更新会话标题
export function updateSessionTitle(userId, sessionId, title) {
  const db = getDB(userId);
  const session = db.sessions.find(s => s.id === sessionId);
  if (session) {
    session.title = title;
    session.updatedAt = Date.now();
    saveDB(userId, db);
  }
}

// 更新会话时间
export function updateSessionTime(userId, sessionId) {
  const db = getDB(userId);
  const session = db.sessions.find(s => s.id === sessionId);
  if (session) {
    session.updatedAt = Date.now();
    saveDB(userId, db);
  }
}

// 删除会话
export function deleteSession(userId, sessionId) {
  const db = getDB(userId);
  db.sessions = db.sessions.filter(s => s.id !== sessionId);
  delete db.messages[sessionId];
  saveDB(userId, db);
}

// ==================== 消息操作 ====================

// 获取会话的所有消息
export function getSessionMessages(userId, sessionId) {
  const db = getDB(userId);
  return db.messages[sessionId] || [];
}

// 添加用户消息
export function addUserMessage(userId, sessionId, content) {
  const db = getDB(userId);
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

  saveDB(userId, db);
  return message;
}

// 开始 AI 消息（流式）
export function startAssistantMessage(userId, sessionId) {
  const db = getDB(userId);
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
  saveDB(userId, db);
  return message;
}

// 追加 AI 消息内容
export function appendAssistantContent(userId, sessionId, delta) {
  const db = getDB(userId);
  const messages = db.messages[sessionId];
  if (messages && messages.length > 0) {
    const last = messages[messages.length - 1];
    if (last.role === 'assistant') {
      last.content += delta;
      saveDB(userId, db);
    }
  }
}

// 完成 AI 消息
export function finishAssistantMessage(userId, sessionId, result) {
  const db = getDB(userId);
  const messages = db.messages[sessionId];
  if (messages && messages.length > 0) {
    const last = messages[messages.length - 1];
    if (last.role === 'assistant') {
      const { message_id, sources, ...extra } = result || {};
      last.id = message_id || Date.now();
      last.sources = sources || null;
      Object.assign(last, extra);
      saveDB(userId, db);
      return last;
    }
  }
}

// 清空指定用户的所有对话数据
export function clearAllChatData(userId) {
  localStorage.removeItem(getDBKey(userId));
}

// 导出数据库（用于调试）
export function exportDatabase(userId) {
  return getDB(userId);
}
