#!/bin/bash

# Fail2ban 防暴力破解安装脚本
# 支持: Ubuntu/Debian/CentOS
# 功能: 安装和配置Fail2ban来防止SSH暴力破解

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

# 安装Fail2ban
install_fail2ban() {
    log_info "正在安装Fail2ban..."

    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get update
        apt-get install -y fail2ban
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]] || [[ "$OS" =~ "rocky" ]] || [[ "$OS" =~ "almalinux" ]]; then
        yum install -y epel-release || dnf install -y epel-release
        yum install -y fail2ban || dnf install -y fail2ban
    else
        log_error "不支持的操作系统: $OS"
        exit 1
    fi

    log_success "Fail2ban安装完成"
}

# 配置Fail2ban
configure_fail2ban() {
    log_info "正在配置Fail2ban..."

    local max_retry=${1:-3}
    local ban_time=${2:-3600}
    local find_time=${3:-600}

    # 创建自定义配置
    cat > /etc/fail2ban/jail.local <<EOF
# Fail2ban 自定义配置
# 由 vps-scripts 自动生成

[DEFAULT]
# 封禁时间（秒），默认1小时
bantime  = ${ban_time}

# 在find_time时间内达到max_retry次失败后封禁
findtime = ${find_time}

# 最大重试次数
maxretry = ${max_retry}

# 封禁动作：使用iptables防火墙
banaction = iptables-multiport

# 封禁后发送邮件（可选，默认关闭）
action = %(action_mwl)s

# 忽略的IP（白名单）
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled  = true
port     = ssh
filter   = sshd
logpath  = %(sshd_log)s
backend  = %(sshd_backend)s
maxretry = ${max_retry}
bantime  = ${ban_time}
findtime = ${find_time}
EOF

    log_success "Fail2ban配置完成"
}

# 启动Fail2ban服务
start_fail2ban() {
    log_info "正在启动Fail2ban服务..."

    systemctl enable fail2ban
    systemctl start fail2ban

    if systemctl is-active --quiet fail2ban; then
        log_success "Fail2ban服务已启动"
    else
        log_error "Fail2ban服务启动失败"
        exit 1
    fi
}

# 检查Fail2ban状态
check_status() {
    log_info "检查Fail2ban状态..."

    if systemctl is-active --quiet fail2ban; then
        log_success "Fail2ban服务正在运行"
    else
        log_warning "Fail2ban服务未运行"
    fi

    echo ""
    echo "当前被封禁的IP:"
    fail2ban-client status sshd 2>/dev/null || log_warning "无法获取SSH封禁列表"
    echo ""
}

# 显示管理信息
show_info() {
    echo ""
    echo "========================================"
    echo "      Fail2ban 安装配置完成"
    echo "========================================"
    echo ""
    echo "配置摘要:"
    echo "  最大重试次数: $MAX_RETRY"
    echo "  封禁时间: $BAN_TIME 秒"
    echo "  检测时间窗口: $FIND_TIME 秒"
    echo ""
    echo "管理命令:"
    echo "  查看服务状态:   systemctl status fail2ban"
    echo "  查看SSH封禁列表: fail2ban-client status sshd"
    echo "  解封指定IP:     fail2ban-client set sshd unbanip <IP地址>"
    echo "  查看所有封禁IP: fail2ban-client banned"
    echo "  查看日志:       journalctl -u fail2ban -f"
    echo "  重启服务:       systemctl restart fail2ban"
    echo "  停止服务:       systemctl stop fail2ban"
    echo ""
    echo "配置文件位置:"
    echo "  /etc/fail2ban/jail.local    - 主配置文件"
    echo "  /etc/fail2ban/jail.conf     - 默认配置文件"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "    Fail2ban 防暴力破解安装脚本"
    echo "========================================"
    echo ""

    check_root
    detect_os

    # 检查是否已安装
    if command -v fail2ban-client >/dev/null 2>&1; then
        log_warning "Fail2ban已安装"
        read -p "是否重新配置? (y/N): " reconfigure
        if [[ ! "$reconfigure" =~ ^[Yy]$ ]]; then
            check_status
            exit 0
        fi
    fi

    # 自定义配置参数
    read -p "请输入最大重试次数 (默认: 3): " MAX_RETRY
    MAX_RETRY=${MAX_RETRY:-3}

    read -p "请输入封禁时间（秒，默认3600即1小时）: " BAN_TIME
    BAN_TIME=${BAN_TIME:-3600}

    read -p "请输入检测时间窗口（秒，默认600即10分钟）: " FIND_TIME
    FIND_TIME=${FIND_TIME:-600}

    echo ""
    log_info "配置参数: 最大重试=${MAX_RETRY}次, 封禁时间=${BAN_TIME}秒, 检测窗口=${FIND_TIME}秒"
    echo ""

    install_fail2ban
    configure_fail2ban "$MAX_RETRY" "$BAN_TIME" "$FIND_TIME"
    start_fail2ban
    check_status
    show_info
}

main
