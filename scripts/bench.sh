#!/bin/bash

# VPS 性能测试脚本
# 支持: 所有Linux系统
# 功能: CPU、内存、磁盘、网络性能测试

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

# 系统信息
system_info() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          系统信息${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${YELLOW}主机名:${NC} $(hostname)"
    echo -e "${YELLOW}操作系统:${NC} $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
    echo -e "${YELLOW}内核版本:${NC} $(uname -r)"
    echo -e "${YELLOW}架构:${NC} $(uname -m)"
    echo -e "${YELLOW}虚拟化:${NC} $(systemd-detect-virt 2>/dev/null || echo '未知')"
    echo ""
    
    echo -e "${YELLOW}CPU 信息:${NC}"
    echo "  型号: $(grep 'model name' /proc/cpuinfo | head -1 | cut -d':' -f2 | sed 's/^ *//')"
    echo "  核心数: $(nproc)"
    echo "  频率: $(grep 'cpu MHz' /proc/cpuinfo | head -1 | cut -d':' -f2 | sed 's/^ *//' | cut -d'.' -f1) MHz"
    echo ""
    
    echo -e "${YELLOW}内存 信息:${NC}"
    free -h | grep -E "Mem|Swap" | while read line; do
        echo "  $line"
    done
    echo ""
    
    echo -e "${YELLOW}磁盘 信息:${NC}"
    df -h / | tail -1 | awk '{print "  总容量: " $2 "  已用: " $3 "  可用: " $4 "  使用率: " $5}'
    echo ""
}

# CPU测试
cpu_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          CPU 性能测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    log_info "运行CPU基准测试..."
    
    # 单核性能测试
    local start_time=$(date +%s.%N)
    echo "scale=5000; 4*a(1)" | bc -l >/dev/null 2>&1 || echo "scale=5000; a=1; for(i=0;i<5000;i++){a=a*1.0001}; a" | bc >/dev/null
    local end_time=$(date +%s.%N)
    local single_core_time=$(echo "$end_time - $start_time" | bc)
    
    echo -e "${YELLOW}单核测试:${NC} ${single_core_time}s"
    
    # 多核性能测试
    start_time=$(date +%s.%N)
    echo "scale=5000; 4*a(1)" | bc -l >/dev/null 2>&1 &
    echo "scale=5000; 4*a(1)" | bc -l >/dev/null 2>&1 &
    echo "scale=5000; 4*a(1)" | bc -l >/dev/null 2>&1 &
    echo "scale=5000; 4*a(1)" | bc -l >/dev/null 2>&1 &
    wait
    end_time=$(date +%s.%N)
    local multi_core_time=$(echo "$end_time - $start_time" | bc)
    
    echo -e "${YELLOW}多核测试:${NC} ${multi_core_time}s"
    echo ""
}

# 内存测试
memory_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          内存 性能测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    log_info "运行内存速度测试..."
    
    # 测试内存写入速度
    local mem_size="100M"
    local write_speed=$(dd if=/dev/zero of=/dev/shm/test_mem bs=1M count=100 2>&1 | grep -oP '\d+\.?\d* [KMGT]B/s')
    
    echo -e "${YELLOW}内存写入速度:${NC} $write_speed"
    
    # 测试内存读取速度
    local read_speed=$(dd if=/dev/shm/test_mem of=/dev/null bs=1M count=100 2>&1 | grep -oP '\d+\.?\d* [KMGT]B/s')
    rm -f /dev/shm/test_mem
    
    echo -e "${YELLOW}内存读取速度:${NC} $read_speed"
    echo ""
}

# 磁盘测试
disk_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          磁盘 性能测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    log_info "运行磁盘I/O测试..."
    
    # 测试写入速度
    echo -e "${YELLOW}写入测试 (4K块):${NC}"
    dd if=/dev/zero of=/tmp/test_disk bs=4k count=64k conv=fdatasync 2>&1 | grep -E "copied|MB/s"
    
    echo -e "${YELLOW}写入测试 (1M块):${NC}"
    dd if=/dev/zero of=/tmp/test_disk bs=1M count=1k conv=fdatasync 2>&1 | grep -E "copied|MB/s"
    
    # 测试读取速度
    echo -e "${YELLOW}读取测试:${NC}"
    dd if=/tmp/test_disk of=/dev/null bs=1M count=1k 2>&1 | grep -E "copied|MB/s"
    
    rm -f /tmp/test_disk
    echo ""
}

# 网络测试
network_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          网络 性能测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    log_info "运行网络速度测试..."
    
    # 测试到不同地区的速度
    echo -e "${YELLOW}国内节点测试:${NC}"
    
    # 上海电信
    echo -n "上海电信: "
    curl -o /dev/null -s -w "%{speed_download}" http://speedtest1.sh.chinamobile.com:8080/speedtest/10MB.zip 2>/dev/null | awk '{printf "%.2f MB/s\n", $1/1024/1024}' || echo "测试失败"
    
    # 北京联通
    echo -n "北京联通: "
    curl -o /dev/null -s -w "%{speed_download}" http://speedtest1.bj.chinamobile.com:8080/speedtest/10MB.zip 2>/dev/null | awk '{printf "%.2f MB/s\n", $1/1024/1024}' || echo "测试失败"
    
    # 广州电信
    echo -n "广州电信: "
    curl -o /dev/null -s -w "%{speed_download}" http://speedtest1.gd.chinamobile.com:8080/speedtest/10MB.zip 2>/dev/null | awk '{printf "%.2f MB/s\n", $1/1024/1024}' || echo "测试失败"
    
    echo ""
    echo -e "${YELLOW}国际节点测试:${NC}"
    
    # 日本
    echo -n "日本东京: "
    curl -o /dev/null -s -w "%{speed_download}" http://speedtest.tokyo.linode.com/10MB.zip 2>/dev/null | awk '{printf "%.2f MB/s\n", $1/1024/1024}' || echo "测试失败"
    
    # 美国
    echo -n "美国洛杉矶: "
    curl -o /dev/null -s -w "%{speed_download}" http://speedtest.lax.linode.com/10MB.zip 2>/dev/null | awk '{printf "%.2f MB/s\n", $1/1024/1024}' || echo "测试失败"
    
    # 欧洲
    echo -n "德国法兰克福: "
    curl -o /dev/null -s -w "%{speed_download}" http://speedtest.frankfurt.linode.com/10MB.zip 2>/dev/null | awk '{printf "%.2f MB/s\n", $1/1024/1024}' || echo "测试失败"
    
    echo ""
}

# 延迟测试
latency_test() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          网络延迟测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    log_info "测试到各地区的延迟..."
    
    # 国内节点
    echo -e "${YELLOW}国内节点:${NC}"
    echo -n "北京联通: "
    ping -c 5 202.106.50.1 2>/dev/null | tail -1 | awk -F'/' '{print $5 " ms"}' || echo "测试失败"
    
    echo -n "上海电信: "
    ping -c 5 202.96.209.133 2>/dev/null | tail -1 | awk -F'/' '{print $5 " ms"}' || echo "测试失败"
    
    echo -n "广州电信: "
    ping -c 5 202.96.128.86 2>/dev/null | tail -1 | awk -F'/' '{print $5 " ms"}' || echo "测试失败"
    
    echo ""
    
    # 国际节点
    echo -e "${YELLOW}国际节点:${NC}"
    echo -n "Google DNS: "
    ping -c 5 8.8.8.8 2>/dev/null | tail -1 | awk -F'/' '{print $5 " ms"}' || echo "测试失败"
    
    echo -n "Cloudflare: "
    ping -c 5 1.1.1.1 2>/dev/null | tail -1 | awk -F'/' '{print $5 " ms"}' || echo "测试失败"
    
    echo ""
}

# 主函数
main() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║      VPS 综合性能测试脚本              ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    system_info
    cpu_test
    memory_test
    disk_test
    network_test
    latency_test
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}           测试完成${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

main