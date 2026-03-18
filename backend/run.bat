@echo off
REM 启动FastAPI后端服务脚本（Windows）

echo 为后端应用启动FastAPI服务...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请先安装Python 3.14+
    pause
    exit /b 1
)

REM 检查依赖是否安装
pip list | find "fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo 依赖未安装，正在安装...
    pip install -r requirements.txt
)

REM 启动应用
echo 启动后端服务...
echo API文档地址: http://localhost:8000/docs
echo.

python main.py

pause
