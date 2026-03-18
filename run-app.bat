@echo off
REM 启动整个应用 - 前端 + 后端

echo ========================================
echo  启动四川大学校内问题解答网站
echo ========================================
echo.

REM 增加terminal宽度和高度
mode con: cols=120 lines=30

REM 启动后端（新窗口）
echo 启动后端服务...
start "SCU-QA Backend" cmd /k "cd /d %~dp0backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM 等待后端启动
timeout /t 3

REM 启动前端（新窗口）
echo 启动前端服务...
start "SCU-QA Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo  应用启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:5173
echo 后端API: http://localhost:8000
echo API文档: http://localhost:8000/docs
echo.
echo 按任意键关闭此窗口...
pause >nul
