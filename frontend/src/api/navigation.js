// 文件说明：导航接口模块
// 页面对应：校园导航页
// 作用：前端直接请求高德 Web Service API，并在前端解析成页面可展示的统一格式

const AMAP_WEB_KEY =
  import.meta.env.VITE_AMAP_WEB_KEY || import.meta.env.VITE_AMAP_JS_KEY || "";
const GEO_CACHE_KEY = "scu_nav_geocode_cache_v1";

const CAMPUS_META = {
  wangjiang: {
    label: "望江校区",
    center: [104.0835, 30.63],
    radius: 2200,
  },
  jiangan: {
    label: "江安校区",
    center: [104.0005, 30.5575],
    radius: 3200,
  },
  huaxi: {
    label: "华西校区",
    center: [104.0658, 30.6416],
    radius: 2200,
  },
};

const FIXED_LANDMARKS = {
  望江楼: [104.0827, 30.6297],
  第二教学楼: [104.0832, 30.6301],
  学生食堂: [104.084, 30.6295],
  化工学院: [104.0851, 30.6312],
  望江校区东门: [104.083932, 30.630838],
  四川大学江安校区图书馆: [104.000076, 30.556682],
  青春广场: [103.995159, 30.554643],
  江安校区东门: [104.007216, 30.560565],
  江安校区南门: [104.001882, 30.553254],
  江安校区体育馆: [104.0058, 30.558219],
  华西校区图书馆: [104.067612, 30.641683],
  华西口腔医院: [104.065467, 30.642222],
  华西第二医院: [104.064928, 30.639891],
  华西医院急诊科: [104.060944, 30.64069],
  华西坝地铁站: [104.066279, 30.642821],
  天府广场: [104.0668, 30.5728],
  成都东站: [104.1477, 30.6199],
  成都双流国际机场: [103.9526, 30.5785],
};

const TRANSPORT_MODE_MAP = {
  walking: "walking",
  biking: "biking",
  driving: "driving",
};

function normalizeMode(mode) {
  return TRANSPORT_MODE_MAP[mode] || "walking";
}

function parseNaturalLanguageQuery(query) {
  if (!query || typeof query !== "string") return {};
  const text = query.replace(/\s+/g, "").trim();
  const match = text.match(
    /^从(.+?)到(.+?)(怎么走|怎么去|如何走|如何去|走哪条路)?$/,
  );
  if (!match) return {};
  return {
    origin: match[1],
    destination: match[2],
  };
}

function formatDistance(distance) {
  if (typeof distance !== "number" || Number.isNaN(distance)) return "";
  if (distance < 1000) return `约 ${Math.round(distance)} 米`;
  return `约 ${(distance / 1000).toFixed(1)} 公里`;
}

function formatDuration(duration) {
  if (typeof duration !== "number" || Number.isNaN(duration)) return "";
  const mins = Math.max(1, Math.round(duration / 60));
  if (mins < 60) return `${mins} 分钟`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`;
}

function toLngLatString(lnglat) {
  return `${lnglat[0]},${lnglat[1]}`;
}

function parseLngLatString(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.split(",").map((n) => Number(n));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
  return parts;
}

function createResolveError(message, extra = {}) {
  const err = new Error(message);
  Object.assign(err, extra);
  return err;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceMeter(pointA, pointB) {
  if (!Array.isArray(pointA) || !Array.isArray(pointB)) return Infinity;
  const [lng1, lat1] = pointA;
  const [lng2, lat2] = pointB;
  const earthRadius = 6378137;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function getCampusMeta(campus) {
  if (!campus || campus === "all") return null;
  return CAMPUS_META[campus] || null;
}

function getCacheMap() {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function setCacheMap(cache) {
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // 本地存储异常时静默失败，不影响主流程
  }
}

function getCachedPoint(text, campus = "all") {
  const key = `${campus}|${text}`;
  const cache = getCacheMap();
  const hit = cache[key];
  if (!hit || !Array.isArray(hit.lnglat)) return null;
  return {
    name: hit.name || text,
    lnglat: hit.lnglat,
    address: hit.address || "",
    source: "cache",
  };
}

function saveCachedPoint(text, point, campus = "all") {
  const key = `${campus}|${text}`;
  const cache = getCacheMap();
  cache[key] = {
    name: point.name,
    lnglat: point.lnglat,
    address: point.address || "",
    updatedAt: Date.now(),
  };
  setCacheMap(cache);
}

async function requestAmap(path, params) {
  if (!AMAP_WEB_KEY) {
    throw new Error(
      "请在 .env 中配置 VITE_AMAP_WEB_KEY（或可用的 VITE_AMAP_JS_KEY）",
    );
  }

  const url = new URL(`https://restapi.amap.com${path}`);
  const mergedParams = {
    ...params,
    key: AMAP_WEB_KEY,
  };

  Object.entries(mergedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`高德 API 请求失败（${resp.status}）`);
  }

  const data = await resp.json();
  if (data?.status === "0") {
    throw new Error(data.info || "高德 API 返回失败");
  }

  return data;
}

function normalizeCandidate(candidate) {
  if (!candidate || !Array.isArray(candidate.lnglat)) return null;
  const [lng, lat] = candidate.lnglat.map(Number);
  if (Number.isNaN(lng) || Number.isNaN(lat)) return null;
  return {
    name: candidate.name || "候选地点",
    lnglat: [lng, lat],
    address: candidate.address || "",
    source: "candidate",
  };
}

function normalizeSuggestions(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    if (!item || !Array.isArray(item.lnglat)) continue;
    const key = `${item.name}|${item.lnglat.join(",")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function queryAmapTips(text, campus = "all") {
  const campusMeta = getCampusMeta(campus);
  const data = await requestAmap("/v3/assistant/inputtips", {
    keywords: text,
    datatype: "poi",
    city: "成都",
    location: campusMeta
      ? `${campusMeta.center[0]},${campusMeta.center[1]}`
      : undefined,
  });

  const tips = data?.tips || [];
  const candidates = tips
    .map((tip) => {
      const lnglat = parseLngLatString(tip.location || "");
      if (!lnglat) return null;
      return {
        name: tip.name || text,
        address: [tip.district, tip.address].filter(Boolean).join(" "),
        lnglat,
      };
    })
    .filter(Boolean);

  if (!campusMeta) {
    return normalizeSuggestions(candidates);
  }

  // 有校区偏好时优先返回校区附近结果，但不阻断校外可选项
  const sorted = candidates
    .map((item) => ({
      ...item,
      _distance: getDistanceMeter(item.lnglat, campusMeta.center),
    }))
    .sort((a, b) => a._distance - b._distance)
    .map(({ _distance, ...rest }) => rest);

  return normalizeSuggestions(sorted);
}

export async function getPlaceSuggestions(keyword, campus = "all", limit = 8) {
  const text = (keyword || "").trim();
  if (!text || text.length < 2) return [];

  const fixed = Object.entries(FIXED_LANDMARKS)
    .filter(([name]) => name.includes(text) || text.includes(name))
    .map(([name, lnglat]) => ({
      name,
      address: "固定地标",
      lnglat,
      source: "landmark",
    }));

  const dynamic = await queryAmapTips(text, campus);
  const merged = normalizeSuggestions([...fixed, ...dynamic]).slice(0, limit);

  return merged.map((item) => ({
    value: item.name,
    name: item.name,
    address: item.address || "",
    lnglat: item.lnglat,
    source: item.source || "tip",
  }));
}

async function resolvePoint(name, role, campus = "all") {
  const text = (name || "").trim();
  if (!text) {
    throw new Error("起点或终点不能为空");
  }

  const fromString = parseLngLatString(text);
  if (fromString) {
    return { name: text, lnglat: fromString };
  }

  const fixedNames = Object.keys(FIXED_LANDMARKS);

  // 固定地标快速命中：无网络、零延迟
  if (FIXED_LANDMARKS[text]) {
    return { name: text, lnglat: FIXED_LANDMARKS[text], source: "landmark" };
  }

  const cached = getCachedPoint(text, campus);
  if (cached) {
    return cached;
  }

  // 动态解析主流程：先走高德候选检索
  const tipCandidates = await queryAmapTips(text, campus);

  if (tipCandidates.length === 1) {
    const point = { ...tipCandidates[0], source: "tip" };
    saveCachedPoint(text, point, campus);
    return point;
  }

  if (tipCandidates.length > 1) {
    throw createResolveError(
      `${role === "origin" ? "起点" : "终点"}「${text}」有多个候选地点，请选择一个`,
      {
        code: "MULTIPLE_CANDIDATES",
        role,
        input: text,
        candidates: tipCandidates.slice(0, 8),
      },
    );
  }

  // 动态解析兜底：高德地理编码
  const geocodeData = await requestAmap("/v3/geocode/geo", {
    address: text,
  });
  const first = geocodeData?.geocodes?.[0];
  const lnglat = parseLngLatString(first?.location || "");

  if (!lnglat) {
    // 固定地标兜底（模糊匹配）
    const fuzzyName = fixedNames.find(
      (item) => item.includes(text) || text.includes(item),
    );
    if (fuzzyName) {
      return {
        name: fuzzyName,
        lnglat: FIXED_LANDMARKS[fuzzyName],
        source: "landmark_fuzzy",
      };
    }
    throw new Error(`未找到地点：${text}`);
  }

  const point = {
    name: first?.formatted_address || text,
    lnglat,
    address: first?.formatted_address || "",
    source: "geocode",
  };
  saveCachedPoint(text, point, campus);

  return point;
}

function mergeStepPolylines(steps) {
  const segments = [];
  for (const step of steps || []) {
    if (step?.polyline) segments.push(step.polyline);
    if (step?.path) segments.push(step.path);
  }
  return segments.join(";");
}

function normalizeSteps(rawSteps) {
  return (rawSteps || []).map((step) => ({
    instruction:
      step?.instruction ||
      step?.road ||
      step?.assistant_action ||
      "沿道路继续前进",
    distance:
      typeof step?.distance === "string"
        ? formatDistance(Number(step.distance))
        : formatDistance(step?.distance),
  }));
}

function buildResult({
  mode,
  origin,
  destination,
  distance,
  duration,
  steps,
  polyline,
}) {
  const safePolyline =
    polyline ||
    `${toLngLatString(origin.lnglat)};${toLngLatString(destination.lnglat)}`;
  return {
    transportMode: mode,
    origin: origin.name,
    destination: destination.name,
    origin_name: origin.name,
    destination_name: destination.name,
    origin_lnglat: origin.lnglat,
    dest_lnglat: destination.lnglat,
    distance: Number(distance) || 0,
    duration: Number(duration) || 0,
    distance_text: formatDistance(Number(distance)),
    duration_text: formatDuration(Number(duration)),
    total_distance: formatDistance(Number(distance)),
    estimated_time: formatDuration(Number(duration)),
    steps:
      steps && steps.length
        ? steps
        : [{ instruction: "已生成路线，请沿地图线路行进" }],
    polyline: safePolyline,
  };
}

async function getWalkingOrDrivingRoute({ mode, origin, destination }) {
  const path =
    mode === "driving" ? "/v3/direction/driving" : "/v3/direction/walking";
  const data = await requestAmap(path, {
    origin: toLngLatString(origin.lnglat),
    destination: toLngLatString(destination.lnglat),
    extensions: "base",
    strategy: mode === "driving" ? 0 : undefined,
  });

  const firstPath = data?.route?.paths?.[0];
  if (!firstPath) {
    throw new Error("未获取到可用路线，请尝试更换起点终点");
  }

  return buildResult({
    mode,
    origin,
    destination,
    distance: firstPath.distance,
    duration: firstPath.duration,
    steps: normalizeSteps(firstPath.steps),
    polyline: mergeStepPolylines(firstPath.steps),
  });
}

async function getBikingRoute({ mode, origin, destination }) {
  const data = await requestAmap("/v4/direction/bicycling", {
    origin: toLngLatString(origin.lnglat),
    destination: toLngLatString(destination.lnglat),
  });

  const firstPath = data?.data?.paths?.[0] || data?.route?.paths?.[0];
  if (!firstPath) {
    throw new Error("未获取到骑行路线，请尝试更换起点终点");
  }

  const steps = firstPath.steps || firstPath.ride_steps || [];
  return buildResult({
    mode,
    origin,
    destination,
    distance: firstPath.distance,
    duration: firstPath.duration,
    steps: normalizeSteps(steps),
    polyline: mergeStepPolylines(steps),
  });
}

// 导航 API：前端直接调用高德 API 并返回统一结构
export async function getRoute(input) {
  const payload =
    typeof input === "string" ? parseNaturalLanguageQuery(input) : input || {};

  const mode = normalizeMode(payload.transportMode);
  const originName = (payload.origin || "").trim();
  const destinationName = (payload.destination || "").trim();
  const campus = payload.campus || "all";

  if (!originName || !destinationName) {
    throw new Error("请输入有效的起点和终点，例如：从望江楼到化工学院");
  }

  const originCandidate = normalizeCandidate(payload.originCandidate);
  const destinationCandidate = normalizeCandidate(payload.destinationCandidate);

  const origin =
    originCandidate || (await resolvePoint(originName, "origin", campus));
  const destination =
    destinationCandidate ||
    (await resolvePoint(destinationName, "destination", campus));

  if (mode === "biking") {
    return getBikingRoute({ mode, origin, destination });
  }
  return getWalkingOrDrivingRoute({ mode, origin, destination });
}
