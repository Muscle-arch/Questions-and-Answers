"""
FastAPI主应用文件 - 简化版本
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建FastAPI应用
app = FastAPI(
    title="四川大学校内问题解答网站",
    version="1.0.0",
    description="基于大模型与RAG技术的问答系统API"
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class ChatRequest(BaseModel):
    """聊天请求"""
    message: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    """聊天响应"""
    status: str
    message: str
    data: dict
    timestamp: datetime

# 模拟问答数据
MOCK_ANSWERS = {
    "四川大学": "四川大学是国家'双一流'建设高校，位于成都市，是西部地区最高学府之一。",
    "校名": "四川大学，简称川大，前身是1896年创立的四川中西学堂。",
    "地址": "四川大学主校区位于成都市高新区。",
    "宿舍": "学校提供多种宿舍类型，具体安排由学生工作部负责。",
}

# API路由
@app.get("/")
async def root():
    """根路由"""
    return {
        "message": "欢迎使用四川大学校内问题解答网站API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/api/status")
async def api_status():
    """API状态检查"""
    return {
        "status": "running",
        "app_name": "四川大学校内问题解答网站",
        "version": "1.0.0",
        "timestamp": datetime.now()
    }

@app.post("/api/chat/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    发送消息并获取AI回答
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="消息不能为空")
        
        # 简单的关键词匹配回答
        answer = "感谢您的提问。这是一个自动回答。"
        for keyword, response in MOCK_ANSWERS.items():
            if keyword in request.message:
                answer = response
                break
        
        return ChatResponse(
            status="success",
            message="消息处理成功",
            data={
                "question": request.message,
                "answer": answer,
                "method": "keyword-match",
                "sources": []
            },
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")

@app.post("/api/chat/direct-query", response_model=ChatResponse)
async def direct_query(request: ChatRequest):
    """
    直接查询（模拟）
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="消息不能为空")
        
        # 简单回答
        answer = "这是一个示例回答。实际应用中会调用DeepSeek API。"
        
        return ChatResponse(
            status="success",
            message="查询成功",
            data={
                "question": request.message,
                "answer": answer,
                "method": "direct"
            },
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@app.get("/api/chat/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "service": "Chat API",
        "timestamp": datetime.now()
    }

@app.get("/api/chat/history/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """获取对话历史"""
    return ChatResponse(
        status="success",
        message="获取历史记录成功",
        data={
            "conversation_id": conversation_id,
            "messages": []
        },
        timestamp=datetime.now()
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
