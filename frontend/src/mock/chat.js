// Mock 数据 — 会话 & 聊天
// 当 VITE_USE_MOCK=true 时由 api/chat.js 调用
// 文件说明：聊天 mock 模块
// 页面对应：智能问答页、会话侧边栏
// 作用：模拟会话数据、历史消息和流式回答

let sessionIdCounter = 3;
let messageIdCounter = 100;

export const MOCK_SESSIONS = [
  {
    id: 2,
    title: "从望江楼到化工学院怎么走",
    created_at: "2026-03-11T09:10:00",
  },
  { id: 1, title: "四川大学有哪些专业", created_at: "2026-03-10T14:30:00" },
];

export const MOCK_MESSAGES = {
  1: [
    {
      id: 1,
      role: "user",
      content: "四川大学有哪些专业",
      sources: null,
      created_at: "2026-03-10T14:30:00",
    },
    {
      id: 2,
      role: "assistant",
      content:
        "四川大学是**教育部直属全国重点大学**，目前设有**36个学院**，涵盖文、理、工、医、经、管、法、艺等众多学科门类。\n\n主要专业方向包括：\n- 理工类：计算机科学、电子信息、化学工程等\n- 人文类：中国语言文学、历史学、哲学等\n- 医学类：临床医学、口腔医学（全国顶尖）等\n\n> 来源：学校简介",
      sources: [
        {
          title: "学校简介.txt",
          content: "四川大学是教育部直属全国重点综合性大学...",
        },
      ],
      created_at: "2026-03-10T14:30:05",
    },
  ],
  2: [
    {
      id: 3,
      role: "user",
      content: "从望江楼到化工学院怎么走",
      sources: null,
      created_at: "2026-03-11T09:10:00",
    },
    {
      id: 4,
      role: "assistant",
      content: "**导航结果**：从望江楼到化工学院，步行约 650 米，预计 8 分钟。",
      sources: null,
      is_navigation: true,
      nav_data: {
        origin: "望江楼",
        destination: "化工学院",
        origin_lnglat: [104.0827, 30.6297],
        dest_lnglat: [104.0851, 30.6312],
        distance: 650,
        duration: 480,
        steps: [
          "沿校园东路向北步行约 120 米",
          "左转进入文理大道，步行约 200 米",
          "右转进入化工路，步行约 100 米，到达化工学院正门",
        ],
        polyline:
          "104.0827,30.6297;104.0829,30.6305;104.0838,30.6305;104.0851,30.6312",
      },
      created_at: "2026-03-11T09:10:05",
    },
  ],
};

export function mockGetSessions() {
  // 模拟分页结构，便于将来平滑替换真实后端
  return Promise.resolve({
    total: MOCK_SESSIONS.length,
    page: 1,
    page_size: 20,
    items: [...MOCK_SESSIONS],
  });
}

export function mockCreateSession(title = "新的对话") {
  const session = {
    id: ++sessionIdCounter,
    title,
    created_at: new Date().toISOString(),
  };
  MOCK_SESSIONS.unshift(session);
  MOCK_MESSAGES[session.id] = [];
  return Promise.resolve(session);
}

export function mockDeleteSession(id) {
  const idx = MOCK_SESSIONS.findIndex((s) => s.id === id);
  if (idx !== -1) MOCK_SESSIONS.splice(idx, 1);
  return Promise.resolve({ message: "会话已删除", session_id: id });
}

export function mockGetMessages(sessionId) {
  return Promise.resolve({
    session_id: sessionId,
    messages: MOCK_MESSAGES[sessionId] || [],
  });
}

// 模拟 SSE 流式回复
// onDelta(delta: string), onDone({ message_id, sources })
const MOCK_REPLIES = [
  '您好！我是**四川大学智能助手**。\n\n根据知识库检索，我为您找到了相关信息：\n\n四川大学坐落于四川省成都市，是教育部直属的全国重点大学，也是国家"双一流"A类建设高校。学校有三个校区：**望江校区**、**华西校区**和**江安校区**。\n\n如需了解更多，欢迎继续提问！',
  "根据学校相关规定：\n\n1. **奖学金评定**：综合测评成绩排名前30%的同学可申请国家奖学金\n2. **申请时间**：每年9-10月\n3. **所需材料**：成绩单、获奖证书等\n\n> 参考来源：《四川大学本科生奖学金评定办法》",
  "这是一个很好的问题！关于四川大学的校园文化活动：\n\n- 每年**校庆日**（9月29日）会举办系列文化活动\n- **望江校区**有著名的望江楼公园，景色优美\n- 学校设有**100+** 个学生社团，涵盖文艺、体育、学术等方向\n\n欢迎来到川大！",
];

let replyIndex = 0;

export function mockStreamChat(sessionId, message, onDelta, onDone) {
  // 检测导航意图
  const navKeywords = ["怎么走", "路线", "在哪", "如何到达", "导航", "位置"];
  const isNav = navKeywords.some((kw) => message.includes(kw));

  if (isNav) {
    const navReply =
      "**导航结果**：已为您规划路线，步行约 650 米，预计 8 分钟。请查看下方地图。";
    const navData = {
      origin: "起点",
      destination: "终点",
      origin_lnglat: [104.0827, 30.6297],
      dest_lnglat: [104.0851, 30.6312],
      distance: 650,
      duration: 480,
      steps: [
        "沿校园东路向北步行约 120 米",
        "左转进入文理大道，步行约 200 米",
        "到达目的地",
      ],
      polyline:
        "104.0827,30.6297;104.0829,30.6305;104.0838,30.6305;104.0851,30.6312",
    };
    // 逐字返回，模拟真实流式输出体验
    const words = navReply.split("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < words.length) {
        onDelta(words[i++]);
      } else {
        clearInterval(timer);
        const msgId = ++messageIdCounter;
        if (!MOCK_MESSAGES[sessionId]) MOCK_MESSAGES[sessionId] = [];
        MOCK_MESSAGES[sessionId].push({
          id: msgId,
          role: "assistant",
          content: navReply,
          sources: null,
          is_navigation: true,
          nav_data: navData,
          created_at: new Date().toISOString(),
        });
        onDone({
          message_id: msgId,
          sources: null,
          is_navigation: true,
          nav_data: navData,
        });
      }
    }, 30);
    return;
  }

  const reply = MOCK_REPLIES[replyIndex % MOCK_REPLIES.length];
  replyIndex++;
  const words = reply.split("");
  let i = 0;
  const timer = setInterval(() => {
    if (i < words.length) {
      onDelta(words[i++]);
    } else {
      clearInterval(timer);
      const msgId = ++messageIdCounter;
      const sources = [
        {
          title: "学校简介.txt",
          content: "四川大学是教育部直属全国重点综合性大学...",
        },
      ];
      if (!MOCK_MESSAGES[sessionId]) MOCK_MESSAGES[sessionId] = [];
      MOCK_MESSAGES[sessionId].push({
        id: msgId,
        role: "assistant",
        content: reply,
        sources,
        created_at: new Date().toISOString(),
      });
      onDone({ message_id: msgId, sources });
    }
  }, 25);
}
