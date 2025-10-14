@echo off
chcp 65001 >nul
title iAnctChinese Launcher
color 0A

echo ========================================
echo    iAnctChinese 智能标注平台启动器
echo ========================================
echo.

:CHECK_SERVER
echo [1/3] 检查服务器状态...
curl -s http://localhost:8000/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 服务器已在运行
    goto OPEN_BROWSER
) else (
    echo 🔄 启动服务器...
)

:START_SERVER
echo [2/3] 启动FastAPI服务器...
cd /d "%~dp0backend"
call ..\venv\Scripts\activate
start "iAnctChinese Server" /min python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

:WAIT_FOR_SERVER
echo [3/3] 等待服务器就绪...
timeout /t 5 /nobreak >nul

:OPEN_BROWSER
echo 🌐 打开浏览器...
start http://localhost:8000

echo.
echo ✅ iAnctChinese 已启动！
echo 📍 访问: http://localhost:8000
echo ⏹️  要停止服务器，请运行 stop_server.bat
echo.
pause