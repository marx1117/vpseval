#!/bin/bash

# BBR 拥塞控制算法启用脚本
# 支持: Ubuntu/Debian (内核4.9+)
# 功能: 检查并启用BBR加速

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 检查root权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用root权限运行此脚本"
        exit 1
    fi
}

# 检查内核版本
check_kernel() {
    local kernel_version=$(uname -r | cut -d- -f1)
    local major=$(echo $kernel_version | cut -d. -f1)
    local minor=$(echo $kernel_version | cut -d. -f2)
    
    log_info "当前内核版本: $kernel_version"
    
    if [[ $major -gt 4 ]] || ([[ $major -eq 4 ]] && [[ $minor -ge 9 ]]); then
        log_success "内核版本支持BBR"
        return 0
    else
        log_error "内核版本过低，需要4.9+才能使用BBR"
        log_info "请先升级内核: sudo apt install --install-recommends linux-generic-hwe-18.04"
        return 1
    fi
}

# 检查是否已启用BBR
check_bbr_status() {
    local bbr_status=$(sysctl net.ipv4.tcp_congestion_control | awk '{print $3}')
    
    if [[ "$bbr_status" == "bbr" ]]; then
        log_success "BBR已启用"
        return 0
    else
        log_info "BBR未启用，当前算法: $bbr_status"
        return 1
    fi
}

# 启用BBR
enable_bbr() {
    log_info "正在启用BBR..."
    
    # 添加BBR配置
    cat >> /etc/sysctl.conf << EOF

# BBR拥塞控制算法
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr
EOF

    # 应用配置
    sysctl -p
    
    # 验证
    local qdisc=$(sysctl net.core.default_qdisc | awk '{print $3}')
    local congestion=$(sysctl net.ipv4.tcp_congestion_control | awk '{print $3}')
    
    if [[ "$qdisc" == "fq" ]] && [[ "$congestion" == "bbr" ]]; then
        log_success "BBR启用成功!"
        log_info "队列算法: $qdisc"
        log_info "拥塞控制: $congestion"
    else
        log_error "BBR启用失败"
        return 1
    fi
}

# 显示状态
show_status() {
    echo ""
    echo "========================================"
    echo "           BBR 状态信息"
    echo "========================================"
    echo ""
    echo "内核版本: $(uname -r)"
    echo "队列算法: $(sysctl net.core.default_qdisc | awk '{print $3}')"
    echo "拥塞控制: $(sysctl net.ipv4.tcp_congestion_control | awk '{print $3}')"
    echo ""
    
    # 测试网络速度
    log_info "正在进行网络速度测试..."
    if command -v curl >/dev/null 2>&1; then
        local download_speed=$(curl -o /dev/null -s -w "%{speed_download}" https://speed.hetzner.de/100MB.bin 2>/dev/null || echo "0")
        if [[ "$download_speed" != "0" ]]; then
            local speed_mbps=$(echo "scale=2; $download_speed / 1024 / 1024" | bc 2>/dev/null || echo "N/A")
            echo "下载速度: ${speed_mbps} MB/s"
        fi
    fi
    
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "         BBR 启用脚本"
    echo "========================================"
    echo ""
    
    check_root
    
    if check_bbr_status; then
        show_status
        exit 0
    fi
    
    if check_kernel; then
        enable_bbr
        show_status
    fi
}

main