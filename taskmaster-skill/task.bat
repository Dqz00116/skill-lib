@echo off
:: TaskMaster Skill - 任务管理 CLI 快捷脚本
:: 用法: task <command> [options]

set SCRIPT_DIR=%~dp0
set CLI_DIR=%SCRIPT_DIR%cli
set NODE_PATH=%CLI_DIR%\node_modules

if not exist "%CLI_DIR%\node_modules" (
    echo 正在安装 CLI 依赖...
    cd /d "%CLI_DIR%"
    call npm install
    if errorlevel 1 (
        echo 安装失败，请检查 Node.js 环境
        exit /b 1
    )
)

cd /d "%CLI_DIR%"
node task.js %*
