# 后端API服务

## 概述

这是基于大模型与RAG技术的四川大学校内问题解答网站的后端服务。

## 功能

- **智能问答**：基于RAG技术的问题解答
- **直接查询**：直接调用DeepSeek API
- **知识库管理**：支持动态加载和管理知识库
- **对话历史**：保存和检索对话记录

## 快速开始

### 1. 环境设置

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑.env文件，添加你的DeepSeek API密钥
# DEEPSEEK_API_KEY=your_key_here
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 启动服务

```bash
# 开发模式
python main.py

# 或使用uvicorn命令
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

服务将在 `http://localhost:8000` 启动

## API文档

启动服务后，访问以下地址查看API文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## API端点

### 1. 发送消息并获得回答

**请求:**
```
POST /api/chat/send
```

**请求体:**
```json
{
  "message": "四川大学在哪里？",
  "user_id": "user_123",
  "conversation_id": "conv_123"
}
```

**响应:**
```json
{
  "status": "success",
  "message": "消息处理成功",
  "data": {
    "question": "四川大学在哪里？",
    "answer": "四川大学位于成都市...",
    "sources": []
  },
  "timestamp": "2026-03-18T10:00:00"
}
```

### 2. 直接查询（不使用RAG）

**请求:**
```
POST /api/chat/direct-query
```

**请求体:**
```json
{
  "message": "今天天气怎样？"
}
```

**响应:**
```json
{
  "status": "success",
  "message": "查询成功",
  "data": {
    "question": "今天天气怎样？",
    "answer": "...",
    "method": "direct"
  },
  "timestamp": "2026-03-18T10:00:00"
}
```

### 3. 加载知识库

**请求:**
```
POST /api/chat/load-knowledge
```

**请求体:**
```json
{
  "documents": [
    "四川大学是一所综合性研究型大学...",
    "学校位于成都市高新区..."
  ],
  "category": "general"
}
```

### 4. 获取对话历史

**请求:**
```
GET /api/chat/history/{conversation_id}
```

### 5. 健康检查

**请求:**
```
GET /api/chat/health
```

## 项目结构

```
backend/
├── main.py                 # 主应用文件
├── config.py              # 配置文件
├── rag_processor.py       # RAG处理模块
├── requirements.txt       # 依赖列表
├── .env.example          # 环境变量示例
├── README.md             # 本文件
└── routes/
    └── chat.py           # 聊天API路由
```

## 技术栈

- **框架**: FastAPI
- **AI模型**: DeepSeek API
- **RAG框架**: LangChain
- **向量数据库**: ChromaDB
- **嵌入模型**: Sentence-Transformers (BAAI/bge-large-zh)
- **数据库**: MySQL + SQLAlchemy
- **认证**: JWT
- **服务器**: Uvicorn

## 配置

所有配置都可以通过`.env`文件或环境变量设置：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| DEEPSEEK_API_KEY | DeepSeek API密钥 | 必需 |
| DATABASE_URL | 数据库连接URL | mysql+aiomysql://... |
| JWT_SECRET_KEY | JWT签名密钥 | your-secret-key-here |
| DEBUG | 调试模式 | False |

## 注意事项

1. **API密钥保护**: 永远不要在代码中硬编码API密钥，使用环境变量
2. **CORS配置**: 修改`settings.CORS_ORIGINS`以添加允许的前端URL
3. **生产部署**: 在生产环境中设置`DEBUG=False`
4. **数据库**: 确保MySQL服务正在运行
5. **网络**: 需要稳定的互联网连接以调用DeepSeek API

## 开发指南

### 添加新的API路由

1. 在`routes/`目录下创建新的路由文件
2. 定义路由和API端点
3. 在`main.py`中注册路由

```python
from routes.new_route import router as new_router
app.include_router(new_router)
```

### 扩展RAG处理器

修改`rag_processor.py`文件以自定义RAG逻辑：

```python
class RAGProcessor:
    def custom_method(self):
        # 你的自定义逻辑
        pass
```

## 故障排除

### 问题1: DeepSeek API调用失败
- 检查`DEEPSEEK_API_KEY`是否正确设置
- 确认网络连接正常
- 查看API配额是否足够

### 问题2: 数据库连接失败
- 验证MySQL服务是否运行
- 检查数据库URL配置
- 确认用户名和密码

### 问题3: ChromaDB初始化失败
- 检查`./data/chroma_db`目录是否存在
- 确保有足够的磁盘空间
- 检查目录权限

## 许可证

MIT

## 作者

王崇宇 (2023141461054)  
刘喻尧 (2023141461040)  
程瑞鑫 (2023141461108)

## 更新日期

2026年3月18日
