"""
FastAPI主应用文件
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
from config import settings
from routes.chat import router as chat_router

# 应用启动和关闭事件
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动事件
    print("应用启动中...")
    yield
    # 关闭事件
    print("应用关闭中...")

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="基于大模型与RAG技术的四川大学校内问题解答网站API",
    lifespan=lifespan
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TrustedHost中间件 - 安全防护
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1"]
)

# 注册路由
app.include_router(chat_router)

# 根路由
@app.get("/")
async def root():
    """根路由"""
    return {
        "message": "欢迎使用四川大学校内问题解答网站API",
        "version": settings.APP_VERSION,
        "api_docs": "/docs",
        "openapi_schema": "/openapi.json"
    }

@app.get("/api/status")
async def status():
    """API状态检查"""
    return {
        "status": "running",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG
    }

# 错误处理
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """通用异常处理"""
    return {
        "status": "error",
        "message": str(exc),
        "detail": "内部服务器错误"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else 4
    )
