# 运行项目指南

## 快速启动

### Windows
双击运行 `run-app.bat` 文件，将自动启动前端和后端服务。

```bash
.\run-app.bat
```

### Linux/Mac
运行启动脚本：

```bash
chmod +x run-app.sh
./run-app.sh
```

## 手动启动

### 1. 启动后端服务

```bash
cd backend
pip install -r requirements-minimal.txt
pip install pydantic-settings
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

后端将在 `http://localhost:8000` 启动

### 2. 启动前端服务

在另一个终端中：

```bash
cd frontend
npm install  # 如果未安装依赖
npm run dev
```

前端将在 `http://localhost:5173` 启动

## 访问应用

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **Swagger UI**: http://localhost:8000/docs

## 项目结构

```
intelligent-QA-sys/
├── frontend/               # Vue.js前端
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/                # FastAPI后端
│   ├── main.py            # 主应用
│   ├── requirements-minimal.txt
│   └── routes/
├── run-app.bat            # Windows启动脚本
├── run-app.sh             # Linux/Mac启动脚本
└── README.md
```

## 环境配置

### 后端配置

创建 `backend/.env` 文件（可选）：

```env
PORT=8000
DEBUG=True
```

### 前端配置

创建 `frontend/.env` 文件：

```env
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=true
```

## API端点

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/` | 根路由 |
| GET | `/api/status` | API状态 |
| POST | `/api/chat/send` | 发送消息（RAG模式） |
| POST | `/api/chat/direct-query` | 直接查询 |
| GET | `/api/chat/health` | 健康检查 |
| GET | `/api/chat/history/{conversation_id}` | 对话历史 |

## 常见问题

### 问题1：Backend无法连接
- 确保后端服务在8000端口运行
- 检查防火墙设置
- 查看后端日志中的错误信息

### 问题2：Frontend无法连接到Backend
- 检查 `VITE_API_URL` 配置
- 确保后端服务已启动
- 检查浏览器控制台获取更多错误信息

### 问题3：缺少Python模块
运行以下命令安装必要的模块：

```bash
pip install fastapi uvicorn python-dotenv pydantic-settings
```

## 开发模式

前端开发服务器支持热重载，修改代码后自动刷新。
后端开发服务器也支持 `--reload` 选项，代码更改后自动重启。

## 停止应用

按 `Ctrl+C` 停止服务器运行。

## 下一步

查看以下文档了解更多信息：
- [API集成指南](./API集成指南.md)
- [项目计划书](./Project.md)
- [技术规划](./技术规划.md)
- [后端README](./backend/README.md)

---

**最后更新**: 2026年3月18日
