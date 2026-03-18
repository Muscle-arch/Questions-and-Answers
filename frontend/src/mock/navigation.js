// Mock 数据 — 导航
// 当 VITE_USE_MOCK=true 时由 api/navigation.js 调用
// 文件说明：导航 mock 模块
// 页面对应：校园导航页、聊天中的导航结果卡片
// 作用：按校区返回演示路线数据，便于前端独立开发

const CAMPUS_DB = {
  wangjiang: {
    label: "望江校区",
    landmarks: {
      望江楼: { lnglat: [104.0827, 30.6297] },
      化工学院: { lnglat: [104.0851, 30.6312] },
      第二教学楼: { lnglat: [104.0832, 30.6301] },
      学生食堂: { lnglat: [104.084, 30.6295] },
    },
  },
  jiangan: {
    label: "江安校区",
    landmarks: {
      江安校区图书馆: { lnglat: [103.9421, 30.5812] },
      江安一食堂: { lnglat: [103.9445, 30.5804] },
      青春广场: { lnglat: [103.9462, 30.5828] },
      综合实验楼: { lnglat: [103.9476, 30.5831] },
    },
  },
  huaxi: {
    label: "华西校区",
    landmarks: {
      华西口腔医院: { lnglat: [104.0638, 30.6518] },
      华西钟楼: { lnglat: [104.0649, 30.6506] },
      华西临床医学院: { lnglat: [104.0662, 30.6498] },
      华西东区田径场: { lnglat: [104.0674, 30.6511] },
    },
  },
};

export function mockGetRoute(input) {
  // 兼容两种调用方式：字符串 query 或结构化对象
  const payload = typeof input === "string" ? { query: input } : input || {};

  // 按校区选择对应地点库
  const campusKey = payload.campus || "wangjiang";
  const campus = CAMPUS_DB[campusKey] || CAMPUS_DB.wangjiang;
  const landmarkNames = Object.keys(campus.landmarks);

  // 优先用显式起终点，否则从该校区地点中给默认值
  let origin = payload.origin || landmarkNames[0];
  let destination = payload.destination || landmarkNames[1] || landmarkNames[0];
  const query = payload.query || `从${origin}到${destination}`;

  // 若传入自然语言 query，尝试从 query 中提取地点覆盖默认起终点
  for (const lm of landmarkNames) {
    if (query.includes(lm)) {
      if (!payload.origin && origin === landmarkNames[0]) {
        origin = lm;
      } else if (!payload.destination && destination === landmarkNames[1]) {
        destination = lm;
      }
    }
  }

  const originInfo =
    campus.landmarks[origin] || campus.landmarks[landmarkNames[0]];
  const destInfo =
    campus.landmarks[destination] || campus.landmarks[landmarkNames[1]];

  // 返回结构尽量对齐后端字段，前端可无缝切换 mock/real API
  return Promise.resolve({
    campus: campusKey,
    campus_label: campus.label,
    origin,
    destination,
    origin_name: origin,
    destination_name: destination,
    origin_lnglat: originInfo.lnglat,
    dest_lnglat: destInfo.lnglat,
    distance_text: "约 650 米",
    duration_text: "8 分钟",
    total_distance: "约 650 米",
    estimated_time: "8 分钟",
    steps: [
      `从 ${origin} 出发，沿 ${campus.label} 主路步行约 120 米`,
      "在主干道继续直行约 200 米",
      `根据路牌指引右转，继续步行至 ${destination}`,
    ],
    polyline: `${originInfo.lnglat[0]},${originInfo.lnglat[1]};${destInfo.lnglat[0]},${destInfo.lnglat[1]}`,
  });
}
