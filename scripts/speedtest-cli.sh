#!/bin/bash

# 网络速度测试脚本
# 支持: 所有Linux系统
# 功能: 测试到各地区的网络速度

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

# 测试下载速度
test_download() {
    local url=$1
    local name=$2
    
    echo -n "$name: "
    
    local speed=$(curl -o /dev/null -s -w "%{speed_download}" "$url" 2>/dev/null || echo "0")
    
    if [[ "$speed" == "0" ]] || [[ -z "$speed" ]]; then
        echo -e "${RED}测试失败${NC}"
    else
        local speed_mbps=$(echo "scale=2; $speed / 1024 / 1024" | bc 2>/dev/null || echo "N/A")
        if [[ "$speed_mbps" != "N/A" ]]; then
            if (( $(echo "$speed_mbps > 10" | bc -l 2>/dev/null || echo 0) )); then
                echo -e "${GREEN}${speed_mbps} MB/s${NC}"
            elif (( $(echo "$speed_mbps > 1" | bc -l 2>/dev/null || echo 0) )); then
                echo -e "${YELLOW}${speed_mbps} MB/s${NC}"
            else
                echo -e "${RED}${speed_mbps} MB/s${NC}"
            fi
        else
            echo "$speed bytes/s"
        fi
    fi
}

# 测试延迟
test_ping() {
    local host=$1
    local name=$2
    
    echo -n "$name: "
    
    local result=$(ping -c 3 "$host" 2>/dev/null | tail -1 | awk -F'/' '{print $5}' || echo "")
    
    if [[ -n "$result" ]]; then
        local latency=$(echo "$result" | cut -d'.' -f1)
        if [[ "$latency" -lt 50 ]]; then
            echo -e "${GREEN}${result}ms${NC}"
        elif [[ "$latency" -lt 150 ]]; then
            echo -e "${YELLOW}${result}ms${NC}"
        else
            echo -e "${RED}${result}ms${NC}"
        fi
    else
        echo -e "${RED}测试失败${NC}"
    fi
}

# 主函数
main() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║      网络速度测试脚本                  ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    # 系统信息
    echo -e "${YELLOW}系统信息:${NC}"
    echo "  IP: $(curl -s ifconfig.me 2>/dev/null || echo '未知')"
    echo "  位置: $(curl -s ipinfo.io/city 2>/dev/null || echo '未知'), $(curl -s ipinfo.io/country 2>/dev/null || echo '未知')"
    echo ""
    
    # 延迟测试
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          延迟测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${YELLOW}国内节点:${NC}"
    test_ping "202.106.50.1" "北京联通  "
    test_ping "202.96.209.133" "上海电信  "
    test_ping "202.96.128.86" "广州电信  "
    test_ping "223.5.5.5" "阿里DNS   "
    test_ping "119.29.29.29" "腾讯DNS   "
    
    echo ""
    echo -e "${YELLOW}国际节点:${NC}"
    test_ping "8.8.8.8" "Google DNS"
    test_ping "1.1.1.1" "Cloudflare"
    test_ping "9.9.9.9" "Quad9     "
    
    echo ""
    
    # 下载速度测试
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          下载速度测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${YELLOW}国内节点:${NC}"
    test_download "http://speedtest1.sh.chinamobile.com:8080/speedtest/10MB.zip" "上海移动  "
    test_download "http://speedtest1.bj.chinamobile.com:8080/speedtest/10MB.zip" "北京移动  "
    test_download "http://speedtest1.gd.chinamobile.com:8080/speedtest/10MB.zip" "广东移动  "
    
    echo ""
    echo -e "${YELLOW}国际节点:${NC}"
    test_download "http://speedtest.tokyo.linode.com/10MB.zip" "日本东京  "
    test_download "http://speedtest.singapore.linode.com/10MB.zip" "新加坡    "
    test_download "http://speedtest.lax.linode.com/10MB.zip" "美国洛杉矶"
    test_download "http://speedtest.london.linode.com/10MB.zip" "英国伦敦  "
    test_download "http://speedtest.frankfurt.linode.com/10MB.zip" "德国法兰克福"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}           测试完成${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

main