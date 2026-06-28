#!/bin/bash

# BBR / BBR Plus / 锐速(Lotserver) 综合加速脚本
# 支持: Ubuntu/Debian/CentOS
# 功能: 一键开启BBR、BBR Plus或安装锐速内核
# 基于 chiakge/Linux-NetSpeed 项目封装

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

# 检测系统类型
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi
    
    log_info "检测到系统: $OS $VERSION"
}

# 检查当前加速状态
check_current_status() {
    log_info "检查当前加速状态..."
    
    local congestion=$(sysctl net.ipv4.tcp_congestion_control 2>/dev/null | awk '{print $3}' || echo "unknown")
    local qdisc=$(sysctl net.core.default_qdisc 2>/dev/null | awk '{print $3}' || echo "unknown")
    local kernel=$(uname -r)
    
    echo ""
    echo -e "${CYAN}当前状态:${NC}"
    echo -e "  内核版本: ${kernel}"
    echo -e "  拥塞控制: ${congestion}"
    echo -e "  队列算法: ${qdisc}"
    echo ""
    
    if [[ "$congestion" == "bbr" ]]; then
        log_success "当前已启用 BBR"
    elif [[ "$congestion" == "bbrplus" ]]; then
        log_success "当前已启用 BBR Plus"
    elif [[ "$congestion" == "lotserver" ]]; then
        log_success "当前已启用 锐速(Lotserver)"
    else
        log_info "当前未启用任何加速算法"
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装必要依赖..."
    
    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get update -y
        apt-get install -y wget curl bc
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]] || [[ "$OS" =~ "rocky" ]] || [[ "$OS" =~ "almalinux" ]]; then
        yum install -y wget curl bc
    fi
    
    log_success "依赖安装完成"
}

# 选项1: 开启原版BBR
enable_bbr() {
    log_info "正在开启原版BBR..."
    
    local kernel_major=$(uname -r | cut -d. -f1)
    local kernel_minor=$(uname -r | cut -d. -f2)
    
    if [[ $kernel_major -lt 4 ]] || ([[ $kernel_major -eq 4 ]] && [[ $kernel_minor -lt 9 ]]); then
        log_error "内核版本过低，需要4.9+才能使用BBR"
        log_info "建议先升级内核，或使用BBR Plus/锐速"
        return 1
    fi
    
    # 添加BBR配置
    if ! grep -q "tcp_congestion_control = bbr" /etc/sysctl.conf 2>/dev/null; then
        cat >> /etc/sysctl.conf << 'EOF'

# TCP加速 - BBR
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr
EOF
    fi
    
    sysctl -p >/dev/null 2>&1
    
    local congestion=$(sysctl net.ipv4.tcp_congestion_control 2>/dev/null | awk '{print $3}')
    if [[ "$congestion" == "bbr" ]]; then
        log_success "BBR 开启成功!"
        return 0
    else
        log_error "BBR 开启失败"
        return 1
    fi
}

# 选项2: 开启BBR Plus
enable_bbrplus() {
    log_info "正在安装 BBR Plus..."
    log_warning "BBR Plus 需要更换内核，可能需要重启服务器"
    
    read -p "确认安装 BBR Plus 吗? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "已取消"
        return 0
    fi
    
    # 下载并运行BBR Plus安装脚本
    local tmp_script="/tmp/tcp_bbrplus.sh"
    
    log_info "正在下载安装脚本..."
    if ! wget -qO "$tmp_script" "https://raw.githubusercontent.com/chiakge/Linux-NetSpeed/master/tcp.sh" 2>/dev/null; then
        log_error "下载脚本失败，请检查网络连接"
        return 1
    fi
    
    chmod +x "$tmp_script"
    
    log_info "开始安装 BBR Plus 内核..."
    log_warning "此过程可能需要 5-15 分钟，请勿中断"
    echo ""
    
    # 运行脚本并选择BBR Plus选项
    bash "$tmp_script"
    
    rm -f "$tmp_script"
    
    log_success "BBR Plus 安装完成"
    log_warning "请重启服务器使新内核生效: reboot"
}

# 选项3: 安装锐速(Lotserver)
enable_lotserver() {
    log_info "正在安装 锐速(Lotserver)..."
    log_warning "锐速 需要更换内核，可能需要重启服务器"
    
    read -p "确认安装 锐速 吗? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "已取消"
        return 0
    fi
    
    # 下载并运行锐速安装脚本
    local tmp_script="/tmp/tcp_lotserver.sh"
    
    log_info "正在下载安装脚本..."
    if ! wget -qO "$tmp_script" "https://raw.githubusercontent.com/chiakge/Linux-NetSpeed/master/tcp.sh" 2>/dev/null; then
        log_error "下载脚本失败，请检查网络连接"
        return 1
    fi
    
    chmod +x "$tmp_script"
    
    log_info "开始安装 锐速 内核..."
    log_warning "此过程可能需要 5-15 分钟，请勿中断"
    echo ""
    
    # 运行脚本并选择锐速选项
    bash "$tmp_script"
    
    rm -f "$tmp_script"
    
    log_success "锐速 安装完成"
    log_warning "请重启服务器使新内核生效: reboot"
}

# 显示加速算法对比
show_comparison() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          加速算法对比${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}原版 BBR${NC}     - Google官方算法，内核4.9+原生支持"
    echo -e "  优点: 零风险，无需换内核，效果稳定"
    echo -e "  缺点: 高丢包环境效果一般"
    echo -e "  推荐: ${YELLOW}所有用户首选${NC}"
    echo ""
    echo -e "${GREEN}BBR Plus${NC}     - BBR修改版，优化了拥塞控制"
    echo -e "  优点: 高丢包环境表现更好"
    echo -e "  缺点: 需要更换内核，有重启风险"
    echo -e "  推荐: ${YELLOW}网络质量较差的环境${NC}"
    echo ""
    echo -e "${GREEN}锐速(Lotserver)${NC} - 商业级加速，Kernel-based"
    echo -e "  优点: 速度提升最明显，适合大带宽"
    echo -e "  缺点: 需要更换内核，部分系统兼容性差"
    echo -e "  推荐: ${YELLOW}追求极致速度的用户${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 显示菜单
show_menu() {
    echo ""
    echo "========================================"
    echo "      TCP 加速综合脚本"
    echo "========================================"
    echo ""
    echo "  1. 开启原版 BBR (推荐，零风险)"
    echo "  2. 安装 BBR Plus (需换内核)"
    echo "  3. 安装 锐速 Lotserver (需换内核)"
    echo "  4. 查看当前加速状态"
    echo "  5. 查看加速算法对比"
    echo "  0. 退出"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "      TCP 加速综合脚本"
    echo "========================================"
    echo ""
    echo -e "${YELLOW}说明:${NC}"
    echo -e "  原版BBR: 内核4.9+原生支持，零风险"
    echo -e "  BBR Plus: 需更换内核，高丢包环境更优"
    echo -e "  锐速: 需更换内核，速度提升最明显"
    echo ""
    
    check_root
    detect_os
    install_dependencies
    
    while true; do
        show_menu
        read -p "请选择操作 [0-5]: " choice
        
        case $choice in
            1)
                enable_bbr
                ;;
            2)
                enable_bbrplus
                ;;
            3)
                enable_lotserver
                ;;
            4)
                check_current_status
                ;;
            5)
                show_comparison
                ;;
            0)
                echo ""
                log_info "感谢使用，再见!"
                exit 0
                ;;
            *)
                log_warning "无效选项，请重新选择"
                ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
    done
}

main
