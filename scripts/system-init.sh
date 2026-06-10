#!/bin/bash

# VPS 系统初始化脚本
# 支持: Ubuntu/Debian/CentOS
# 功能: 系统更新、安装基础工具、优化设置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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
        OS=$NAME
        VERSION=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VERSION=$(lsb_release -sr)
    elif [[ -f /etc/lsb-release ]]; then
        . /etc/lsb-release
        OS=$DISTRIB_ID
        VERSION=$DISTRIB_RELEASE
    else
        OS=$(uname -s)
        VERSION=$(uname -r)
    fi
    
    log_info "检测到系统: $OS $VERSION"
}

# 更新系统
update_system() {
    log_info "正在更新系统..."
    
    if [[ "$OS" =~ "Ubuntu" ]] || [[ "$OS" =~ "Debian" ]]; then
        apt-get update -y
        apt-get upgrade -y
        apt-get autoremove -y
        apt-get autoclean
    elif [[ "$OS" =~ "CentOS" ]] || [[ "$OS" =~ "Red Hat" ]]; then
        yum update -y
        yum autoremove -y
    else
        log_warning "未知的系统类型，跳过系统更新"
    fi
    
    log_success "系统更新完成"
}

# 安装基础工具
install_basic_tools() {
    log_info "正在安装基础工具..."
    
    local tools="curl wget git vim nano unzip tar htop iotop iftop net-tools dnsutils jq"
    
    if [[ "$OS" =~ "Ubuntu" ]] || [[ "$OS" =~ "Debian" ]]; then
        apt-get install -y $tools
        apt-get install -y software-properties-common apt-transport-https ca-certificates gnupg
    elif [[ "$OS" =~ "CentOS" ]] || [[ "$OS" =~ "Red Hat" ]]; then
        yum install -y $tools
        yum install -y epel-release
    fi
    
    log_success "基础工具安装完成"
}

# 设置时区
setup_timezone() {
    log_info "设置时区为 Asia/Shanghai..."
    
    timedatectl set-timezone Asia/Shanghai
    
    log_success "时区设置完成"
    log_info "当前时间: $(date)"
}

# 配置SSH
configure_ssh() {
    log_info "配置SSH..."
    
    # 备份原配置
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
    
    # 禁用root密码登录（保留密钥登录）
    sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
    
    # 禁用空密码
    sed -i 's/#PermitEmptyPasswords no/PermitEmptyPasswords no/' /etc/ssh/sshd_config
    
    # 重启SSH服务
    if systemctl is-active --quiet sshd; then
        systemctl restart sshd
    elif systemctl is-active --quiet ssh; then
        systemctl restart ssh
    fi
    
    log_success "SSH配置完成"
}

# 优化系统参数
optimize_sysctl() {
    log_info "优化系统内核参数..."
    
    cat >> /etc/sysctl.conf << EOF

# VPS优化参数
# 增加文件描述符限制
fs.file-max = 65535

# 网络优化
net.core.rmem_max = 67108864
net.core.wmem_max = 67108864
net.core.netdev_max_backlog = 250000
net.core.somaxconn = 4096

# TCP优化
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_max_tw_buckets = 5000
net.ipv4.tcp_fastopen = 3
net.ipv4.tcp_mtu_probing = 1

# 禁用IPv6（如需使用请注释掉）
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
EOF

    sysctl -p
    
    log_success "系统参数优化完成"
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw >/dev/null 2>&1; then
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow ssh
        ufw allow http
        ufw allow https
        ufw --force enable
        log_success "UFW防火墙配置完成"
    elif command -v firewall-cmd >/dev/null 2>&1; then
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        log_success "Firewalld配置完成"
    else
        log_warning "未检测到支持的防火墙工具"
    fi
}

# 创建常用目录
create_directories() {
    log_info "创建常用目录..."
    
    mkdir -p /opt/scripts
    mkdir -p /opt/backups
    mkdir -p /var/log/vps
    
    log_success "目录创建完成"
}

# 显示系统信息
show_system_info() {
    echo ""
    echo "========================================"
    echo "         系统初始化完成"
    echo "========================================"
    echo ""
    echo "系统信息:"
    echo "  OS: $OS $VERSION"
    echo "  主机名: $(hostname)"
    echo "  IP地址: $(hostname -I | awk '{print $1}')"
    echo "  时区: $(timedatectl | grep 'Time zone' | awk '{print $3}')"
    echo ""
    echo "已完成操作:"
    echo "  ✓ 系统更新"
    echo "  ✓ 基础工具安装"
    echo "  ✓ 时区设置"
    echo "  ✓ SSH安全配置"
    echo "  ✓ 系统参数优化"
    echo "  ✓ 防火墙配置"
    echo ""
    echo "建议下一步:"
    echo "  1. 配置Swap分区: sudo bash swap-setup.sh"
    echo "  2. 启用BBR加速: sudo bash bbr-enable.sh"
    echo "  3. 安装Docker: sudo bash docker-install.sh"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "      VPS 系统初始化脚本"
    echo "========================================"
    echo ""
    
    check_root
    detect_os
    update_system
    install_basic_tools
    setup_timezone
    configure_ssh
    optimize_sysctl
    setup_firewall
    create_directories
    show_system_info
}

# 运行主函数
main