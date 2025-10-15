@echo off
chcp 65001 >nul
echo ========================================
echo    iAnctChinese 服务启动脚本
echo ========================================
echo.

echo [1/2] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Node.js，请先安装
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

echo.
echo [2/2] 检查依赖...
if not exist "server\node_modules" (
    echo 📦 首次运行，正在安装依赖...
    cd server
    call npm install
    cd ..
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)

echo.
echo ========================================
echo    启动 Express 服务器
echo ========================================
echo.
echo 💡 提示:
echo    - 前端地址: http://localhost:3000
echo    - 古文解析功能需要先启动 qwen.py
echo    - 启动方法: 在 PyCharm 中运行 qwen.py
echo.
echo 🚀 正在启动...
echo.

cd server
npm start

