#!/bin/bash

# Cloudflare WARP 安装脚本
# 支持: Ubuntu/Debian/CentOS
# 功能: 安装Cloudflare WARP客户端，为VPS添加IPv4/IPv6出口

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

# 获取当前IP信息
show_current_ip() {
    echo ""
    echo "当前IP信息:"
    echo "----------------------------------------"

    local ipv4=$(curl -4 -s --max-time 10 https://ifconfig.me 2>/dev/null || echo "无法获取")
    local ipv6=$(curl -6 -s --max-time 10 https://ifconfig.me 2>/dev/null || echo "无法获取")

    echo "  IPv4: $ipv4"
    echo "  IPv6: $ipv6"
    echo "----------------------------------------"
    echo ""
}

# 安装WARP官方客户端
install_warp_client() {
    log_info "正在安装Cloudflare WARP客户端..."

    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        # 添加Cloudflare GPG密钥
        curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg

        # 添加仓库
        echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflare-client.list >/dev/null

        # 安装
        apt-get update
        apt-get install -y cloudflare-warp
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]] || [[ "$OS" =~ "rocky" ]] || [[ "$OS" =~ "almalinux" ]]; then
        # 添加Cloudflare仓库
        curl -fsSL https://pkg.cloudflareclient.com/cloudflare-release-el${VERSION%%.*}.rpm -o /etc/yum.repos.d/cloudflare-release.rpm

        # 安装
        yum install -y cloudflare-warp || dnf install -y cloudflare-warp
    else
        log_error "不支持的操作系统: $OS"
        exit 1
    fi

    log_success "WARP客户端安装完成"
}

# 注册WARP
register_warp() {
    log_info "正在注册WARP..."

    warp-cli registration new

    log_success "WARP注册完成"
}

# 设置WARP为代理模式（仅出口流量走WARP）
set_warp_proxy() {
    log_info "正在配置WARP为代理模式..."

    # 设置为代理模式（仅作为出口，不影响SSH连接）
    warp-cli mode proxy

    # 设置代理监听端口
    warp-cli proxy port 40000

    log_success "WARP代理模式配置完成"
}

# 连接WARP
connect_warp() {
    log_info "正在连接WARP..."

    warp-cli connect

    sleep 3

    if warp-cli status | grep -q "Connected"; then
        log_success "WARP已连接"
    else
        log_error "WARP连接失败"
        exit 1
    fi
}

# 断开WARP
disconnect_warp() {
    log_info "正在断开WARP..."

    warp-cli disconnect

    log_success "WARP已断开"
}

# 安装WireGuard模式WARP
install_warp_wireguard() {
    log_info "正在安装WireGuard模式WARP..."

    # 安装WireGuard
    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get update
        apt-get install -y wireguard-tools curl
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]] || [[ "$OS" =~ "rocky" ]] || [[ "$OS" =~ "almalinux" ]]; then
        yum install -y wireguard-tools curl || dnf install -y wireguard-tools curl
    fi

    # 获取WARP配置
    log_info "正在获取WARP WireGuard配置..."

    # 安装wgcf工具
    local wgcf_version="2.2.22"
    curl -fsSL "https://github.com/ViRb3/wgcf/releases/download/v${wgcf_version}/wgcf_$(uname -m)_linux" -o /usr/local/bin/wgcf
    chmod +x /usr/local/bin/wgcf

    # 注册并生成配置
    cd /etc/wireguard
    wgcf register
    wgcf generate

    # 备份原始配置
    if [[ -f /etc/wireguard/warp.conf ]]; then
        cp /etc/wireguard/warp.conf /etc/wireguard/warp.conf.bak
    fi

    # 修改配置以避免路由冲突
    sed -i 's/DNS = 1.1.1.1/# DNS = 1.1.1.1/' /etc/wireguard/warp.conf
    sed -i 's/DNS = 2606:4700:4700::1111/# DNS = 2606:4700:4700::1111/' /etc/wireguard/warp.conf

    # 添加路由表配置（避免SSH断连）
    if ! grep -q "PostUp" /etc/wireguard/warp.conf; then
        sed -i '/^\[Interface\]/a PostUp = ip rule add ipproto 6 dport 22 table main priority 100\nPostDown = ip rule delete ipproto 6 dport 22 table main priority 100' /etc/wireguard/warp.conf
    fi

    log_success "WireGuard模式WARP配置完成"
}

# 启动WireGuard WARP
start_warp_wireguard() {
    log_info "正在启动WireGuard WARP..."

    wg-quick up warp 2>/dev/null

    if ip link show wgcf 2>/dev/null || ip link show warp 2>/dev/null; then
        log_success "WireGuard WARP已启动"
    else
        log_warning "WireGuard WARP启动可能失败，请检查日志"
    fi
}

# 停止WireGuard WARP
stop_warp_wireguard() {
    log_info "正在停止WireGuard WARP..."

    wg-quick down warp 2>/dev/null || true

    log_success "WireGuard WARP已停止"
}

# 查看WARP状态
show_warp_status() {
    echo ""
    echo "========================================"
    echo "         WARP 状态信息"
    echo "========================================"
    echo ""

    if command -v warp-cli >/dev/null 2>&1; then
        echo "warp-cli 状态:"
        warp-cli status 2>/dev/null || log_warning "warp-cli 状态获取失败"
        echo ""
    fi

    if command -v wg >/dev/null 2>&1; then
        echo "WireGuard 接口:"
        wg show 2>/dev/null || log_warning "没有活跃的WireGuard接口"
        echo ""
    fi

    show_current_ip
}

# 卸载WARP
uninstall_warp() {
    log_info "正在卸载WARP..."

    # 停止WireGuard WARP
    wg-quick down warp 2>/dev/null || true

    # 断开warp-cli
    if command -v warp-cli >/dev/null 2>&1; then
        warp-cli disconnect 2>/dev/null || true
    fi

    # 卸载warp-cli
    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get remove -y cloudflare-warp 2>/dev/null || true
        rm -f /etc/apt/sources.list.d/cloudflare-client.list
        rm -f /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg
        apt-get update
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]] || [[ "$OS" =~ "rocky" ]] || [[ "$OS" =~ "almalinux" ]]; then
        yum remove -y cloudflare-warp 2>/dev/null || dnf remove -y cloudflare-warp 2>/dev/null || true
        rm -f /etc/yum.repos.d/cloudflare-release.rpm
    fi

    # 清理WireGuard配置
    rm -f /etc/wireguard/warp.conf /etc/wireguard/warp.conf.bak
    rm -f /usr/local/bin/wgcf

    log_success "WARP卸载完成"
}

# 切换WARP出口
switch_warp_mode() {
    echo ""
    echo "请选择WARP模式:"
    echo "  1. warp-cli 代理模式（推荐，不影响SSH）"
    echo "  2. WireGuard 全局模式（所有流量走WARP）"
    echo "  3. 返回主菜单"
    echo ""
    read -p "请输入选项 [1-3]: " mode_choice

    case $mode_choice in
        1)
            if ! command -v warp-cli >/dev/null 2>&1; then
                log_error "warp-cli 未安装，请先安装WARP"
                return
            fi

            set_warp_proxy
            connect_warp

            echo ""
            log_info "WARP代理模式已启用"
            log_info "代理地址: socks5://127.0.0.1:40000"
            log_info "使用方式: 通过代理发送请求即可走WARP出口"
            echo ""
            log_info "例如: curl --socks5 127.0.0.1:40000 https://ifconfig.me"
            echo ""
            ;;
        2)
            if [[ ! -f /etc/wireguard/warp.conf ]]; then
                log_error "WireGuard WARP 未配置，请先安装WireGuard模式WARP"
                return
            fi

            stop_warp_wireguard 2>/dev/null || true
            start_warp_wireguard

            echo ""
            log_info "WireGuard全局模式已启用"
            log_warning "注意: 全局模式下所有流量走WARP，请确保不会影响SSH连接"
            echo ""
            ;;
        3)
            return
            ;;
        *)
            log_error "无效选项"
            ;;
    esac

    echo ""
    log_info "切换后IP信息:"
    show_current_ip
}

# 安装WARP（完整流程）
install_warp() {
    echo ""
    echo "请选择安装方式:"
    echo "  1. 安装 warp-cli 官方客户端（推荐）"
    echo "  2. 安装 WireGuard 模式 WARP"
    echo "  3. 两者都安装"
    echo "  4. 返回主菜单"
    echo ""
    read -p "请输入选项 [1-4]: " install_choice

    echo ""
    log_info "安装前的IP信息:"
    show_current_ip

    case $install_choice in
        1)
            install_warp_client
            register_warp
            set_warp_proxy
            connect_warp
            ;;
        2)
            install_warp_wireguard
            start_warp_wireguard
            ;;
        3)
            install_warp_client
            register_warp
            install_warp_wireguard
            set_warp_proxy
            connect_warp
            ;;
        4)
            return
            ;;
        *)
            log_error "无效选项"
            return
            ;;
    esac

    echo ""
    log_info "安装后的IP信息:"
    show_current_ip
}

# 显示管理信息
show_info() {
    echo ""
    echo "========================================"
    echo "      WARP 管理命令"
    echo "========================================"
    echo ""
    echo "warp-cli 命令:"
    echo "  查看状态:     warp-cli status"
    echo "  连接WARP:     warp-cli connect"
    echo "  断开WARP:     warp-cli disconnect"
    echo "  代理模式:     warp-cli mode proxy"
    echo "  全局模式:     warp-cli mode warp"
    echo "  设置代理端口: warp-cli proxy port <端口>"
    echo ""
    echo "WireGuard 命令:"
    echo "  启动WARP:     wg-quick up warp"
    echo "  停止WARP:     wg-quick down warp"
    echo "  查看状态:     wg show"
    echo ""
    echo "代理使用示例:"
    echo "  curl --socks5 127.0.0.1:40000 https://ifconfig.me"
    echo "  export https_proxy=socks5://127.0.0.1:40000"
    echo ""
    echo "配置文件位置:"
    echo "  /etc/wireguard/warp.conf    - WireGuard配置"
    echo ""
    echo "========================================"
}

# 显示主菜单
show_menu() {
    echo ""
    echo "========================================"
    echo "    Cloudflare WARP 安装管理脚本"
    echo "========================================"
    echo ""
    echo "  1. 安装 WARP"
    echo "  2. 切换 WARP 出口模式"
    echo "  3. 查看 WARP 状态"
    echo "  4. 卸载 WARP"
    echo "  5. 显示管理命令"
    echo "  0. 退出"
    echo ""
    read -p "请输入选项 [0-5]: " choice

    case $choice in
        1)
            install_warp
            ;;
        2)
            switch_warp_mode
            ;;
        3)
            show_warp_status
            ;;
        4)
            read -p "确定要卸载WARP吗? (y/N): " confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                uninstall_warp
                log_info "卸载后的IP信息:"
                show_current_ip
            else
                log_info "操作已取消"
            fi
            ;;
        5)
            show_info
            ;;
        0)
            log_info "再见!"
            exit 0
            ;;
        *)
            log_error "无效选项，请重新输入"
            ;;
    esac
}

# 主函数
main() {
    check_root
    detect_os

    while true; do
        show_menu
    done
}

main
