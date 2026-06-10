#!/bin/bash

# Netdata 实时监控安装脚本
# 支持: Ubuntu/Debian/CentOS
# 功能: 安装和配置Netdata监控系统

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

# 安装依赖
install_dependencies() {
    log_info "安装依赖..."
    
    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get update
        apt-get install -y zlib1g-dev uuid-dev libuv1-dev liblz4-dev libjudy-dev libssl-dev libmnl-dev gcc make git autoconf autoconf-archive autogen automake pkg-config curl python3 python3-pip
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]]; then
        yum groupinstall -y "Development Tools"
        yum install -y zlib-devel libuuid-devel libuv-devel lz4-devel Judy-devel openssl-devel libmnl-devel gcc make git autoconf autoconf-archive autogen automake pkgconfig curl python3 python3-pip
    fi
    
    log_success "依赖安装完成"
}

# 安装Netdata
install_netdata() {
    log_info "安装Netdata..."
    
    # 使用官方安装脚本
    bash <(curl -Ss https://my-netdata.io/kickstart.sh) --stable-channel --disable-telemetry
    
    log_success "Netdata安装完成"
}

# 配置Netdata
configure_netdata() {
    log_info "配置Netdata..."
    
    local config_dir="/etc/netdata"
    
    # 配置访问控制
    cat > "$config_dir/stream.conf" <<EOF
[stream]
    enabled = no
    destination =
    api key =
EOF

    # 配置内存使用
    cat > "$config_dir/netdata.conf" <<EOF
[global]
    history = 3600
    memory mode = dbengine
    page cache size = 32
    dbengine disk space = 256
    update every = 1

[web]
    mode = static-threaded
    listen backlog = 4096
    default port = 19999
    bind to = *
    allow connections from = localhost 10.* 192.168.* 172.16.* 172.17.* 172.18.* 172.19.* 172.20.* 172.21.* 172.22.* 172.23.* 172.24.* 172.25.* 172.26.* 172.27.* 172.28.* 172.29.* 172.30.* 172.31.*
EOF

    log_success "Netdata配置完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw >/dev/null 2>&1; then
        ufw allow 19999/tcp
        ufw reload
    elif command -v firewall-cmd >/dev/null 2>&1; then
        firewall-cmd --permanent --add-port=19999/tcp
        firewall-cmd --reload
    fi
    
    log_success "防火墙配置完成"
}

# 启动Netdata
start_netdata() {
    log_info "启动Netdata..."
    
    systemctl enable netdata
    systemctl start netdata
    
    if systemctl is-active --quiet netdata; then
        log_success "Netdata已启动"
    else
        log_error "Netdata启动失败"
        exit 1
    fi
}

# 显示信息
show_info() {
    local ip=$(hostname -I | awk '{print $1}')
    
    echo ""
    echo "========================================"
    echo "         Netdata 安装完成"
    echo "========================================"
    echo ""
    echo "访问地址: http://${ip}:19999"
    echo ""
    echo "管理命令:"
    echo "  查看状态: systemctl status netdata"
    echo "  查看日志: journalctl -u netdata -f"
    echo "  重启服务: systemctl restart netdata"
    echo ""
    echo "配置文件: /etc/netdata/netdata.conf"
    echo ""
    echo "注意: 如果无法访问，请检查防火墙设置"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "      Netdata 安装脚本"
    echo "========================================"
    echo ""
    
    check_root
    detect_os
    install_dependencies
    install_netdata
    configure_netdata
    configure_firewall
    start_netdata
    show_info
}

main