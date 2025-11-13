#!/bin/bash

# 聖誕貪食蛇開發服務器管理腳本
# Christmas Snake Development Server Management Script

echo "🎄 聖誕貪食蛇 - 開發服務器管理工具"
echo "========================================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查現有服務器進程
check_servers() {
    echo -e "${BLUE}🔍 檢查現有服務器進程...${NC}"
    existing=$(ps aux | grep "python.*http.server" | grep -v grep)
    if [ -n "$existing" ]; then
        echo -e "${YELLOW}⚠️  發現運行中的服務器:${NC}"
        echo "$existing"
        return 1
    else
        echo -e "${GREEN}✅ 沒有發現運行中的 HTTP 服務器${NC}"
        return 0
    fi
}

# 清理所有現有服務器
cleanup_servers() {
    echo -e "${BLUE}🧹 清理現有服務器...${NC}"
    pkill -f "python.*http.server" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 服務器清理完成${NC}"
    else
        echo -e "${YELLOW}ℹ️  沒有需要清理的服務器${NC}"
    fi
    sleep 1
}

# 檢查端口是否被占用
check_port() {
    local port=$1
    if lsof -ti:$port >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# 智能啟動服務器
start_smart_server() {
    echo -e "${BLUE}🚀 智能啟動服務器...${NC}"
    
    # 端口優先順序
    for port in 8000 8001 8002 8003; do
        if check_port $port; then
            echo -e "${GREEN}✅ 在端口 $port 啟動服務器${NC}"
            echo -e "${BLUE}🌐 訪問地址: http://localhost:$port${NC}"
            echo -e "${YELLOW}💡 按 Ctrl+C 停止服務器${NC}"
            echo "========================================="
            python3 -m http.server $port --directory .
            return 0
        fi
    done
    
    echo -e "${RED}❌ 錯誤: 端口 8000-8003 都被占用${NC}"
    echo -e "${YELLOW}💡 請執行清理後重試: $0 cleanup${NC}"
    return 1
}

# 顯示幫助信息
show_help() {
    echo "用法: $0 [command]"
    echo ""
    echo "可用命令:"
    echo "  start    - 智能啟動開發服務器 (默認)"
    echo "  cleanup  - 清理所有現有服務器"
    echo "  check    - 檢查現有服務器狀態"  
    echo "  restart  - 清理並重新啟動服務器"
    echo "  help     - 顯示此幫助信息"
    echo ""
    echo "範例:"
    echo "  $0           # 智能啟動服務器"
    echo "  $0 cleanup   # 清理所有服務器"
    echo "  $0 restart   # 重新啟動服務器"
}

# 主邏輯
case "${1:-start}" in
    "start")
        if check_servers; then
            start_smart_server
        else
            echo -e "${YELLOW}⚠️  發現現有服務器進程${NC}"
            echo -e "${BLUE}💡 建議選項:${NC}"
            echo "   1. 執行 '$0 cleanup' 清理後重新啟動"
            echo "   2. 執行 '$0 restart' 直接重新啟動"
            echo "   3. 使用現有服務器 (如果端口正確)"
        fi
        ;;
    "cleanup")
        cleanup_servers
        ;;
    "check")
        check_servers
        echo -e "${BLUE}🔍 端口使用情況:${NC}"
        for port in 8000 8001 8002 8003; do
            if check_port $port; then
                echo -e "${GREEN}  端口 $port: 可用${NC}"
            else
                echo -e "${RED}  端口 $port: 被占用${NC}"
            fi
        done
        ;;
    "restart")
        cleanup_servers
        start_smart_server
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ 未知命令: $1${NC}"
        show_help
        exit 1
        ;;
esac