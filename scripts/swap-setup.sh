#!/bin/bash

# Swap 交换分区配置脚本
# 支持: 所有Linux系统
# 功能: 创建和配置Swap分区

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

# 获取内存大小
get_memory_size() {
    local mem_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    local mem_gb=$(echo "scale=1; $mem_kb / 1024 / 1024" | bc)
    echo $mem_gb
}

# 计算推荐的Swap大小
calculate_swap_size() {
    local mem_gb=$1
    local swap_gb
    
    if (( $(echo "$mem_gb < 2" | bc -l) )); then
        swap_gb=$(echo "$mem_gb * 2" | bc)
    elif (( $(echo "$mem_gb < 8" | bc -l) )); then
        swap_gb=$mem_gb
    elif (( $(echo "$mem_gb < 64" | bc -l) )); then
        swap_gb=$(echo "$mem_gb / 2" | bc)
    else
        swap_gb=4
    fi
    
    echo $swap_gb
}

# 创建Swap文件
create_swap() {
    local swap_size=$1
    local swap_file="/swapfile"
    
    log_info "创建 ${swap_size}GB 的Swap文件..."
    
    # 检查是否已有swap
    if swapon --show | grep -q "$swap_file"; then
        log_warning "Swap文件已存在"
        return 0
    fi
    
    # 创建swap文件
    fallocate -l ${swap_size}G $swap_file 2>/dev/null || \
        dd if=/dev/zero of=$swap_file bs=1G count=$swap_size
    
    # 设置权限
    chmod 600 $swap_file
    
    # 格式化为swap
    mkswap $swap_file
    
    # 启用swap
    swapon $swap_file
    
    # 添加到fstab
    if ! grep -q "$swap_file" /etc/fstab; then
        echo "$swap_file none swap sw 0 0" >> /etc/fstab
    fi
    
    log_success "Swap创建完成"
}

# 优化Swap参数
optimize_swap() {
    log_info "优化Swap参数..."
    
    # 降低swap使用倾向（0-100，值越低越不容易使用swap）
    sysctl vm.swappiness=10
    
    # 添加到sysctl.conf
    if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
        echo "vm.swappiness = 10" >> /etc/sysctl.conf
    fi
    
    log_success "Swap参数优化完成"
}

# 显示Swap状态
show_swap_status() {
    echo ""
    echo "========================================"
    echo "           Swap 状态"
    echo "========================================"
    echo ""
    free -h
    echo ""
    swapon --show
    echo ""
    echo "Swap使用倾向: $(sysctl vm.swappiness | awk '{print $3}')"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "         Swap 配置脚本"
    echo "========================================"
    echo ""
    
    check_root
    
    local mem_gb=$(get_memory_size)
    log_info "系统内存: ${mem_gb}GB"
    
    local swap_gb=$(calculate_swap_size $mem_gb)
    log_info "推荐Swap大小: ${swap_gb}GB"
    
    read -p "是否创建 ${swap_gb}GB 的Swap? (Y/n): " confirm
    
    if [[ -z "$confirm" ]] || [[ "$confirm" =~ ^[Yy]$ ]]; then
        create_swap $swap_gb
        optimize_swap
        show_swap_status
        log_success "Swap配置完成!"
    else
        log_info "操作已取消"
    fi
}

main