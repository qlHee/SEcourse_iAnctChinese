@echo off
chcp 65001 >nul
title 停止 iAnctChinese 服务器
color 0C

echo ========================================
echo    停止 iAnctChinese 服务器
echo ========================================
echo.

echo 🛑 正在停止服务器进程...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im uvicorn.exe >nul 2>&1

echo ✅ 服务器已停止
echo 🗑️  清理进程完成

timeout /t 2 /nobreak >nul