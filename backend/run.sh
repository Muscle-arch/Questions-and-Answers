#!/bin/bash
# 启动FastAPI后端服务脚本（Linux/Mac）

echo "为后端应用启动FastAPI服务..."
echo

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python，请先安装Python 3.14+"
    exit 1
fi

# 检查依赖是否安装
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "依赖未安装，正在安装..."
    pip3 install -r requirements.txt
fi

# 启动应用
echo "启动后端服务..."
echo "API文档地址: http://localhost:8000/docs"
echo

python3 main.py
