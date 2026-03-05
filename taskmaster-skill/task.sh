#!/bin/bash
# TaskMaster Skill - 任务管理 CLI 快捷脚本
# 用法: ./task.sh <command> [options]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="$SCRIPT_DIR/cli"

# 检查依赖
if [ ! -d "$CLI_DIR/node_modules" ]; then
    echo "正在安装 CLI 依赖..."
    cd "$CLI_DIR" || exit 1
    npm install
    if [ $? -ne 0 ]; then
        echo "安装失败，请检查 Node.js 环境"
        exit 1
    fi
fi

cd "$CLI_DIR" || exit 1
node task.js "$@"
