# API 接口文档 — 四川大学校内问题解答网站

> **Base URL（开发）**：`http://localhost:8000`
> **统一前缀**：`/api`
> **数据格式**：请求体与响应体均为 `application/json`，流式接口除外
> **鉴权方式**：JWT Bearer Token，在请求头中携带：
>
> ```
> Authorization: Bearer <access_token>
> ```
>
> 标注 🔒 的接口需要登录，未携带或 Token 失效时返回 `401`。

---

## 目录

1. [用户认证 `/api/auth`](#一用户认证-apiauth)
   - [注册](#11-注册)
   - [登录](#12-登录)
   - [获取当前用户](#13-获取当前用户-🔒)
2. [会话管理 `/api/sessions`](#二会话管理-apisessions-🔒)
   - [获取会话列表](#21-获取会话列表)
   - [新建会话](#22-新建会话)
   - [获取会话消息列表](#23-获取会话消息列表)
   - [删除会话](#24-删除会话)
3. [聊天 `/api/chat`](#三聊天-apichat-🔒)
   - [流式问答](#31-流式问答sse)
4. [导航 `/api/navigation`](#四导航-apinavigation-🔒)
   - [路线规划](#41-路线规划)
5. [通用响应规范](#五通用响应规范)

---

## 一、用户认证 `/api/auth`

### 1.1 注册

| 项目     | 内容                      |
| -------- | ------------------------- |
| **路径** | `POST /api/auth/register` |
| **鉴权** | 无                        |
| **描述** | 创建新用户账号            |

**请求体**

```json
{
  "username": "zhangsan",
  "password": "Abc12345"
}
```

| 字段     | 类型   | 必填 | 说明                                    |
| -------- | ------ | ---- | --------------------------------------- |
| username | string | ✅   | 用户名，4-64 字符，仅限字母/数字/下划线 |
| password | string | ✅   | 密码，6-128 字符                        |

**成功响应** `201 Created`

```json
{
  "id": 1,
  "username": "zhangsan",
  "created_at": "2026-03-12T10:00:00"
}
```

**错误响应**

| HTTP 状态码 | 错误码            | 说明                               |
| ----------- | ----------------- | ---------------------------------- |
| 400         | `USERNAME_EXISTS` | 用户名已被注册                     |
| 422         | —                 | 参数格式不合法（FastAPI 自动返回） |

---

### 1.2 登录

| 项目     | 内容                         |
| -------- | ---------------------------- |
| **路径** | `POST /api/auth/login`       |
| **鉴权** | 无                           |
| **描述** | 验证账号密码，返回 JWT Token |

**请求体**

```json
{
  "username": "zhangsan",
  "password": "Abc12345"
}
```

| 字段     | 类型   | 必填 | 说明   |
| -------- | ------ | ---- | ------ |
| username | string | ✅   | 用户名 |
| password | string | ✅   | 密码   |

**成功响应** `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

| 字段         | 类型    | 说明                       |
| ------------ | ------- | -------------------------- |
| access_token | string  | JWT Token，有效期 7 天     |
| token_type   | string  | 固定值 `"bearer"`          |
| expires_in   | integer | 有效期秒数（604800 = 7天） |

**错误响应**

| HTTP 状态码 | 错误码                | 说明             |
| ----------- | --------------------- | ---------------- |
| 401         | `INVALID_CREDENTIALS` | 用户名或密码错误 |

---

### 1.3 获取当前用户 🔒

| 项目     | 内容                       |
| -------- | -------------------------- |
| **路径** | `GET /api/auth/me`         |
| **鉴权** | 🔒 Bearer Token            |
| **描述** | 返回当前登录用户的基本信息 |

**请求参数**：无

**成功响应** `200 OK`

```json
{
  "id": 1,
  "username": "zhangsan",
  "created_at": "2026-03-12T10:00:00"
}
```

**错误响应**

| HTTP 状态码 | 说明               |
| ----------- | ------------------ |
| 401         | Token 缺失或已过期 |

---

## 二、会话管理 `/api/sessions` 🔒

> 所有接口均需 Bearer Token 鉴权，会话数据隔离到当前用户。

### 2.1 获取会话列表

| 项目     | 内容                                       |
| -------- | ------------------------------------------ |
| **路径** | `GET /api/sessions`                        |
| **鉴权** | 🔒 Bearer Token                            |
| **描述** | 获取当前用户的所有历史会话，按创建时间倒序 |

**Query 参数**

| 参数      | 类型    | 必填 | 说明                           |
| --------- | ------- | ---- | ------------------------------ |
| page      | integer | 否   | 页码，默认 `1`                 |
| page_size | integer | 否   | 每页数量，默认 `20`，最大 `50` |

**请求示例**

```
GET /api/sessions?page=1&page_size=20
```

**成功响应** `200 OK`

```json
{
  "total": 5,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 3,
      "title": "四川大学有哪些专业",
      "created_at": "2026-03-12T14:30:00"
    },
    {
      "id": 2,
      "title": "从望江楼到化工学院怎么走",
      "created_at": "2026-03-11T09:10:00"
    }
  ]
}
```

---

### 2.2 新建会话

| 项目     | 内容                                             |
| -------- | ------------------------------------------------ |
| **路径** | `POST /api/sessions`                             |
| **鉴权** | 🔒 Bearer Token                                  |
| **描述** | 创建新的对话会话，返回 session_id 供后续聊天使用 |

**请求体**

```json
{
  "title": "新的对话"
}
```

| 字段  | 类型   | 必填 | 说明                                       |
| ----- | ------ | ---- | ------------------------------------------ |
| title | string | 否   | 会话标题，默认 `"新的对话"`，最大 128 字符 |

**成功响应** `201 Created`

```json
{
  "id": 4,
  "title": "新的对话",
  "created_at": "2026-03-12T15:00:00"
}
```

---

### 2.3 获取会话消息列表

| 项目     | 内容                                      |
| -------- | ----------------------------------------- |
| **路径** | `GET /api/sessions/{session_id}/messages` |
| **鉴权** | 🔒 Bearer Token                           |
| **描述** | 获取指定会话的全部消息记录，按时间正序    |

**路径参数**

| 参数       | 类型    | 说明    |
| ---------- | ------- | ------- |
| session_id | integer | 会话 ID |

**成功响应** `200 OK`

```json
{
  "session_id": 3,
  "messages": [
    {
      "id": 10,
      "role": "user",
      "content": "四川大学有哪些专业？",
      "sources": null,
      "created_at": "2026-03-12T14:30:00"
    },
    {
      "id": 11,
      "role": "assistant",
      "content": "四川大学设有**36个学院**，涵盖...",
      "sources": [
        {
          "title": "学校简介.txt",
          "content": "四川大学是教育部直属..."
        }
      ],
      "created_at": "2026-03-12T14:30:05"
    }
  ]
}
```

| 字段    | 类型          | 说明                                |
| ------- | ------------- | ----------------------------------- |
| role    | string        | `"user"` 或 `"assistant"`           |
| content | string        | 消息内容（AI 消息为 Markdown 格式） |
| sources | array \| null | RAG 来源引用，仅 assistant 消息有值 |

**错误响应**

| HTTP 状态码 | 说明                 |
| ----------- | -------------------- |
| 403         | 该会话不属于当前用户 |
| 404         | 会话不存在           |

---

### 2.4 删除会话

| 项目     | 内容                                 |
| -------- | ------------------------------------ |
| **路径** | `DELETE /api/sessions/{session_id}`  |
| **鉴权** | 🔒 Bearer Token                      |
| **描述** | 删除指定会话及其所有消息（不可恢复） |

**路径参数**

| 参数       | 类型    | 说明    |
| ---------- | ------- | ------- |
| session_id | integer | 会话 ID |

**成功响应** `200 OK`

```json
{
  "message": "会话已删除",
  "session_id": 3
}
```

**错误响应**

| HTTP 状态码 | 说明                 |
| ----------- | -------------------- |
| 403         | 该会话不属于当前用户 |
| 404         | 会话不存在           |

---

## 三、聊天 `/api/chat` 🔒

### 3.1 流式问答（SSE）

| 项目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| **路径**     | `POST /api/chat/stream`                                            |
| **鉴权**     | 🔒 Bearer Token                                                    |
| **描述**     | 向 AI 提问，后端进行 RAG 检索 + DeepSeek 调用，以 SSE 流式返回回答 |
| **响应类型** | `text/event-stream`                                                |

**请求体**

```json
{
  "session_id": 3,
  "message": "四川大学有哪些专业？"
}
```

| 字段       | 类型    | 必填 | 说明                  |
| ---------- | ------- | ---- | --------------------- |
| session_id | integer | ✅   | 会话 ID（需提前创建） |
| message    | string  | ✅   | 用户问题，1-2000 字符 |

**SSE 响应流格式**

每条 SSE 事件格式如下：

```
data: <JSON 字符串>\n\n
```

**流式过程中（`done: false`）**

```
data: {"delta": "四川", "done": false}

data: {"delta": "大学设有", "done": false}

data: {"delta": "36个学院，涵盖...", "done": false}
```

**结束帧（`done: true`）**

```
data: {"delta": "", "done": true, "message_id": 11, "sources": [{"title": "学校简介.txt", "content": "四川大学是教育部直属..."}]}
```

| 字段       | 类型    | 说明                                    |
| ---------- | ------- | --------------------------------------- |
| delta      | string  | 本次增量文字（结束帧为空字符串）        |
| done       | boolean | `true` 表示回答完毕                     |
| message_id | integer | 本条 AI 消息在数据库中的 ID（仅结束帧） |
| sources    | array   | RAG 来源引用列表（仅结束帧）            |

**sources 数组元素结构**

```json
{
  "title": "学校简介.txt",
  "content": "四川大学是教育部直属全国重点大学..."
}
```

**错误响应**（非流式，JSON）

| HTTP 状态码 | 错误码              | 说明                  |
| ----------- | ------------------- | --------------------- |
| 400         | `EMPTY_MESSAGE`     | 消息内容为空          |
| 403         | `SESSION_NOT_OWNED` | 会话不属于当前用户    |
| 404         | `SESSION_NOT_FOUND` | 会话不存在            |
| 503         | `LLM_UNAVAILABLE`   | DeepSeek API 访问失败 |

**前端接入示例（JavaScript）**

```javascript
const response = await fetch("/api/chat/stream", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ session_id: 3, message: "四川大学有哪些专业？" }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  // 解析 "data: {...}\n\n" 格式
  const lines = text.split("\n").filter((l) => l.startsWith("data: "));
  for (const line of lines) {
    const event = JSON.parse(line.slice(6));
    if (!event.done) {
      // 追加文字到消息气泡
      appendDelta(event.delta);
    } else {
      // 显示来源引用
      showSources(event.sources);
    }
  }
}
```

---

## 四、导航 `/api/navigation` 🔒

### 4.1 路线规划

| 项目     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| **路径** | `POST /api/navigation/route`                                         |
| **鉴权** | 🔒 Bearer Token                                                      |
| **描述** | 解析自然语言导航指令，返回起终点坐标、步行路线步骤及绘图用折线坐标串 |

**请求体**

```json
{
  "query": "从望江楼到化工学院怎么走"
}
```

| 字段  | 类型   | 必填 | 说明                         |
| ----- | ------ | ---- | ---------------------------- |
| query | string | ✅   | 自然语言导航指令，1-200 字符 |

**成功响应** `200 OK`

```json
{
  "origin": "望江楼",
  "destination": "化工学院",
  "origin_lnglat": [104.0827, 30.6297],
  "dest_lnglat": [104.0851, 30.6312],
  "distance": 650,
  "duration": 480,
  "steps": [
    "沿校园东路向北步行约 120 米",
    "左转进入文理大道，步行约 200 米",
    "右转进入化工路，步行约 100 米，到达化工学院正门"
  ],
  "polyline": "104.0827,30.6297;104.0829,30.6305;104.0838,30.6305;104.0851,30.6312"
}
```

| 字段          | 类型             | 说明                                                                 |
| ------------- | ---------------- | -------------------------------------------------------------------- |
| origin        | string           | 识别出的起点地标名称                                                 |
| destination   | string           | 识别出的终点地标名称                                                 |
| origin_lnglat | [number, number] | 起点经纬度 `[lng, lat]`                                              |
| dest_lnglat   | [number, number] | 终点经纬度 `[lng, lat]`                                              |
| distance      | integer          | 步行总距离（单位：米）                                               |
| duration      | integer          | 预计步行时间（单位：秒）                                             |
| steps         | string[]         | 分步导航文字说明列表                                                 |
| polyline      | string           | 路线折线坐标串，格式 `"lng,lat;lng,lat;..."`，供高德 JS API 直接绘制 |

**错误响应**

| HTTP 状态码 | 错误码                 | 说明                             |
| ----------- | ---------------------- | -------------------------------- |
| 400         | `NO_NAVIGATION_INTENT` | 未识别到导航意图（非导航类问题） |
| 404         | `LANDMARK_NOT_FOUND`   | 起点或终点不在校内地标库中       |
| 502         | `AMAP_API_ERROR`       | 高德地图 API 调用失败            |

**前端地图绘制示例（高德 JS API 2.0）**

```javascript
// 解析 polyline 坐标串
const path = result.polyline.split(";").map((p) => {
  const [lng, lat] = p.split(",").map(Number);
  return new AMap.LngLat(lng, lat);
});

// 绘制路线
const polyline = new AMap.Polyline({
  path,
  strokeColor: "#1677FF",
  strokeWeight: 5,
});
map.add(polyline);

// 添加起终点 Marker
map.add(
  new AMap.Marker({ position: result.origin_lnglat, title: result.origin }),
);
map.add(
  new AMap.Marker({ position: result.dest_lnglat, title: result.destination }),
);

// 自动缩放视野
map.setFitView();
```

---

## 五、通用响应规范

### 错误响应结构

所有非 2xx 响应统一格式：

```json
{
  "code": "ERROR_CODE",
  "message": "错误描述（中文）"
}
```

### HTTP 状态码说明

| 状态码 | 含义                                 |
| ------ | ------------------------------------ |
| 200    | 成功                                 |
| 201    | 创建成功                             |
| 400    | 请求参数错误                         |
| 401    | 未登录或 Token 失效                  |
| 403    | 无权访问（资源属于他人）             |
| 404    | 资源不存在                           |
| 422    | 参数格式校验失败（FastAPI 自动生成） |
| 502    | 第三方服务（高德/DeepSeek）调用失败  |
| 503    | 服务暂时不可用                       |

### 422 参数校验错误示例

```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "username"],
      "msg": "String should have at least 4 characters",
      "input": "ab"
    }
  ]
}
```

### 时间格式

所有时间字段均为 **ISO 8601 格式**，UTC+8（北京时间）：

```
2026-03-12T14:30:00
```

---

## 附：接口速查表

| 方法   | 路径                          | 鉴权 | 说明             |
| ------ | ----------------------------- | ---- | ---------------- |
| POST   | `/api/auth/register`          | 无   | 注册             |
| POST   | `/api/auth/login`             | 无   | 登录，获取 Token |
| GET    | `/api/auth/me`                | 🔒   | 获取当前用户     |
| GET    | `/api/sessions`               | 🔒   | 获取会话列表     |
| POST   | `/api/sessions`               | 🔒   | 新建会话         |
| GET    | `/api/sessions/{id}/messages` | 🔒   | 获取会话消息     |
| DELETE | `/api/sessions/{id}`          | 🔒   | 删除会话         |
| POST   | `/api/chat/stream`            | 🔒   | 流式问答（SSE）  |
| POST   | `/api/navigation/route`       | 🔒   | 导航路线规划     |
