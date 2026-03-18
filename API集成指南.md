# API集成指南

## 概述

本文档说明如何集成前端和后端的API组件。项目使用FastAPI后端和Vue.js前端，通过RESTful API进行通信。

## 架构

```
前端 (Vue.js) ←→ FastAPI 后端 ←→ DeepSeek API
                  ↓
              ChromaDB (向量数据库)
                  ↓
              MySQL (关系数据库)
```

## 开发步骤

### 1. 启动后端服务

```bash
cd backend
# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件，添加DEEPSEEK_API_KEY

# 启动服务
python main.py
# 或Windows: run.bat
# 或Linux/Mac: ./run.sh
```

后端将在 `http://localhost:8000` 启动

查看API文档: http://localhost:8000/docs

### 2. 启动前端开发服务器

```bash
cd frontend
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` 启动

### 3. 前后端通信

前端通过新的API模块 `src/api/chat-api.js` 与后端通信。

**示例代码:**

```javascript
import { sendMessage, directQuery } from "@/api/chat-api.js";

// 使用RAG问答
const response = await sendMessage("四川大学在哪里？", userId);

// 直接查询（不使用RAG）
const response = await directQuery("今天天气怎样？");
```

## API端点汇总

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/chat/send` | 发送消息（使用RAG） |
| POST | `/api/chat/direct-query` | 直接查询 |
| POST | `/api/chat/load-knowledge` | 加载知识库 |
| GET | `/api/chat/history/{conversation_id}` | 获取对话历史 |
| GET | `/api/chat/health` | 健康检查 |
| GET | `/api/status` | API状态 |

## 环境配置

### 前端 (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=true  # 后端启动后改为false
```

### 后端 (.env)

```env
DEEPSEEK_API_KEY=your_key_here
DATABASE_URL=mysql+aiomysql://root:password@localhost/scu_qa
JWT_SECRET_KEY=your_secret_here
DEBUG=True
```

## 开发注意事项

### 1. CORS问题处理

如果遇到CORS错误，在后端配置文件中添加前端URL：

```python
# config.py
CORS_ORIGINS: list = ["http://localhost:5173"]
```

### 2. JWT认证

前端会自动在请求头中添加JWT token：

```javascript
// chat-api.js中的拦截器
Authorization: `Bearer ${token}`
```

确保token存储在localStorage中：
```javascript
localStorage.setItem("scu_token", token);
```

### 3. 错误处理

所有API调用都应进行错误处理：

```javascript
try {
  const response = await sendMessage(message);
  console.log("成功:", response);
} catch (error) {
  console.error("失败:", error);
  // 显示用户友好的错误提示
}
```

### 4. 超时配置

默认超时时间为30秒，可在 `chat-api.js` 中修改：

```javascript
const chatApiClient = axios.create({
  timeout: 30000,  // 毫秒
});
```

## 测试API

### 使用Postman或curl

```bash
# 测试健康检查
curl http://localhost:8000/api/chat/health

# 发送消息
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message":"四川大学在哪里？"}'

# 直接查询
curl -X POST http://localhost:8000/api/chat/direct-query \
  -H "Content-Type: application/json" \
  -d '{"message":"今天天气怎样？"}'
```

### 使用Swagger UI

访问 http://localhost:8000/docs 在浏览器中测试所有API端点

## 常见问题

### Q1: 后端无法连接到DeepSeek API
- 检查DEEPSEEK_API_KEY是否正确
- 确保网络连接正常
- 检查API配额

### Q2: 前端无法连接到后端
- 检查后端是否运行在8000端口
- 检查VITE_API_URL配置是否正确
- 检查浏览器控制台的CORS错误

### Q3: ChromaDB初始化失败
- 检查./data/chroma_db目录权限
- 确保磁盘空间充足
- 删除旧的chroma数据重新初始化

## 生产部署

### 前端构建

```bash
cd frontend
npm run build
```

生成文件在 `dist/` 目录，使用Nginx或其他Web服务器部署

### 后端部署

```bash
# 使用gunicorn或其他ASGI服务器
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# 或使用systemd服务
# 创建 /etc/systemd/system/scu-qa.service 文件
```

## 性能优化建议

1. **缓存**：对常见问题的回答进行缓存
2. **连接池**：使用数据库连接池
3. **异步处理**：使用FastAPI的异步特性
4. **负载均衡**：多个后端实例的负载均衡
5. **CDN**：前端静态资源使用CDN

## 数据流

```
用户 → 前端 (Vue)
     → chat-api.js 发送请求
     → FastAPI 后端
     → RAG处理器
     → ChromaDB 检索
     → DeepSeek API 调用
     → 返回结果
     → 前端展示
```

## 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-03-18 | 1.0 | 初始版本，完成API基础框架 |

## 联系方式

如有问题，请联系项目团队：
- 王崇宇: 前端开发
- 刘喻尧: 后端开发
- 程瑞鑫: AI集成
