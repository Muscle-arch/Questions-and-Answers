"""
环境配置文件
"""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """项目配置"""
    # 应用配置
    APP_NAME: str = "四川大学校内问题解答网站"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    
    # DeepSeek API配置
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_MODEL: str = "deepseek-chat"
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+aiomysql://root:password@localhost/scu_qa")
    
    # ChromaDB配置
    CHROMA_DB_PATH: str = "./data/chroma_db"
    
    # JWT配置
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # CORS配置
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()
