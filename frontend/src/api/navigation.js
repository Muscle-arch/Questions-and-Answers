import request from "@/utils/request";
import { mockGetRoute } from "@/mock/navigation";

// 文件说明：导航接口模块
// 页面对应：校园导航页
// 作用：向 mock 或真实后端请求路线规划结果
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// 导航 API：支持旧的自然语言 query 与新的结构化参数
export function getRoute(input) {
  // 本地开发直接走 mock，避免后端未就绪影响联调
  if (USE_MOCK) return mockGetRoute(input);

  // 兼容旧调用：getRoute('从A到B')
  if (typeof input === "string") {
    return request.post("/navigation/route", { query: input });
  }

  // 新调用：传结构化参数，后端可按校区 + 起终点处理
  const { origin, destination, campus } = input || {};
  const query = `从${origin}到${destination}`;
  return request.post("/navigation/route", {
    query,
    origin,
    destination,
    campus,
  });
}
