#!/bin/bash

# Hysteria2 一键安装脚本
# 支持: 所有主流 Linux 系统
# 功能: 安装和配置 Hysteria2 代理服务（无需域名，UDP/QUIC 极速协议）
# 调用: everett7623/hy2 项目的一键脚本
# 项目地址: https://github.com/everett7623/hy2

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

# 检查 root 权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用 root 权限运行此脚本"
        log_info "请执行: sudo bash $0"
        exit 1
    fi
}

# 检查系统环境
check_system() {
    log_info "正在检查系统环境..."

    # 检查操作系统
    if [[ -f /etc/os-release ]]; then
        local os_name=$(grep PRETTY_NAME /etc/os-release | cut -d'"' -f2)
        log_info "当前系统: $os_name"
    else
        log_warning "无法识别操作系统版本"
    fi

    # 检查架构
    local arch=$(uname -m)
    log_info "系统架构: $arch"

    case "$arch" in
        x86_64|aarch64|armv7l|armv8l)
            log_success "系统架构支持"
            ;;
        *)
            log_warning "当前架构 $arch 可能不被支持，继续安装可能会失败"
            ;;
    esac

    # 检查网络连通性
    if curl -s --connect-timeout 10 https://www.google.com > /dev/null 2>&1; then
        log_success "网络连接正常"
    else
        log_warning "无法连接到 Google，网络可能受限"
    fi
}

# 检查端口占用
check_port_usage() {
    log_info "检查端口占用情况..."

    # Hysteria2 常用端口范围
    local common_ports="443 8443 8080 3000-4000"
    local occupied_ports=""

    for port in $common_ports; do
        if [[ "$port" == *"-"* ]]; then
            # 范围端口
            local start_port=$(echo "$port" | cut -d'-' -f1)
            local end_port=$(echo "$port" | cut -d'-' -f2)
            for ((p=start_port; p<=end_port; p++)); do
                if ss -tuln 2>/dev/null | grep -q ":$p "; then
                    occupied_ports="$occupied_ports $p"
                fi
            done
        else
            if ss -tuln 2>/dev/null | grep -q ":$port "; then
                occupied_ports="$occupied_ports $port"
            fi
        fi
    done

    if [[ -n "$occupied_ports" ]]; then
        log_warning "以下端口已被占用:$occupied_ports"
        log_info "Hysteria2 安装程序会自动选择可用端口"
    else
        log_success "常用端口未被占用"
    fi
}

# 检查防火墙状态
check_firewall() {
    log_info "检查防火墙状态..."

    local firewall_active=false

    # 检查 ufw
    if command -v ufw >/dev/null 2>&1; then
        if ufw status 2>/dev/null | grep -q "Status: active"; then
            log_warning "UFW 防火墙已启用，请确保允许 UDP 端口"
            firewall_active=true
        fi
    fi

    # 检查 firewalld
    if command -v firewall-cmd >/dev/null 2>&1; then
        if firewall-cmd --state 2>/dev/null | grep -q "running"; then
            log_warning "Firewalld 防火墙已启用，请确保允许 UDP 端口"
            firewall_active=true
        fi
    fi

    # 检查 iptables
    if command -v iptables >/dev/null 2>&1; then
        if iptables -L -n 2>/dev/null | grep -q "DROP\|REJECT"; then
            log_warning "检测到 iptables 规则，请确保允许 UDP 端口"
            firewall_active=true
        fi
    fi

    if [[ "$firewall_active" == false ]]; then
        log_success "未检测到活跃防火墙"
    fi
}

# 检查是否已安装 Hysteria2
check_installed() {
    if command -v hysteria >/dev/null 2>&1; then
        local version=$(hysteria version 2>/dev/null | head -1 || echo "未知")
        log_info "检测到已安装的 Hysteria2: $version"
        return 0
    fi
    return 1
}

# 下载并执行 everett7623 的 Hysteria2 安装脚本
install_hy2() {
    log_info "正在下载 Hysteria2 安装脚本..."
    log_info "项目地址: https://github.com/everett7623/hy2"

    local install_url="https://raw.githubusercontent.com/everett7623/hy2/main/hy2.sh"

    # 检查是否能下载脚本
    if ! curl -s --connect-timeout 15 -fSL -o /tmp/hy2.sh "$install_url" 2>/dev/null; then
        log_error "下载安装脚本失败，请检查网络连接"
        log_info "您可以手动访问: $install_url"
        echo ""
        echo -e "${YELLOW}提示：如果网络环境受限导致安装困难，可以考虑使用现成的代理服务${NC}"
        echo -e "${YELLOW}比如搬瓦工官方的 Just My Socks，无需搭建，配置即用${NC}"
        echo -e "${YELLOW}注册时输入优惠码 JMS9272283 可享受循环折扣${NC}"
        echo -e "${YELLOW}了解更多: https://justmysocks6.net/members/aff.php?aff=37879${NC}"
        echo ""
        exit 1
    fi

    log_success "安装脚本下载完成"
    echo ""

    # 执行安装脚本
    log_info "正在启动 Hysteria2 安装程序..."
    log_info "安装过程中会弹出交互式菜单，请根据提示操作"
    echo ""
    log_warning "=========================================="
    log_warning "  以下为 everett7623/hy2 的安装界面"
    log_warning "  请按照菜单提示选择配置参数"
    log_warning "=========================================="
    echo ""

    chmod +x /tmp/hy2.sh
    bash /tmp/hy2.sh "$@"

    # 清理临时文件
    rm -f /tmp/hy2.sh
}

# 获取 Hysteria2 配置信息
get_config_info() {
    local config_file="/etc/hysteria/config.yaml"
    local config_file_alt="/root/hysteria/config.yaml"

    if [[ -f "$config_file" ]]; then
        echo "$config_file"
    elif [[ -f "$config_file_alt" ]]; then
        echo "$config_file_alt"
    else
        echo ""
    fi
}

# 显示连接信息
show_connection_info() {
    echo ""
    echo "========================================"
    echo "       Hysteria2 连接信息"
    echo "========================================"
    echo ""

    local config_file=$(get_config_info)
    local server_ip=$(curl -s --connect-timeout 5 https://api.ip.sb/ip 2>/dev/null || curl -s --connect-timeout 5 https://ifconfig.me 2>/dev/null || echo "获取失败")

    if [[ -n "$config_file" && -f "$config_file" ]]; then
        log_info "配置文件路径: $config_file"

        # 尝试提取端口
        local port=$(grep -E "^listen:" "$config_file" 2>/dev/null | grep -oE '[0-9]+' | head -1 || echo "未知")

        # 尝试提取密码
        local password=$(grep -E "^  password:" "$config_file" 2>/dev/null | head -1 | cut -d':' -f2- | sed 's/^[[:space:]]*//' || echo "未知")

        echo ""
        echo -e "${CYAN}服务器地址:${NC} $server_ip"
        echo -e "${CYAN}服务器端口:${NC} $port"
        echo -e "${CYAN}连接密码:${NC}  $password"
        echo -e "${CYAN}传输协议:${NC}  UDP / QUIC (Hysteria2)"
        echo -e "${CYAN}混淆协议:${NC}  支持"
        echo ""
        echo -e "${YELLOW}客户端配置提示:${NC}"
        echo "  在客户端中填入上述信息即可连接"
        echo "  Hysteria2 支持多平台客户端:"
        echo "    - Windows: Hysteria2 官方客户端 / v2rayN"
        echo "    - macOS:   Shadowrocket / Surge"
        echo "    - Android: Surfboard / v2rayNG"
        echo "    - iOS:     Shadowrocket / Surge"
        echo ""
    else
        log_warning "未找到配置文件，连接信息可能由上游脚本保存至其他位置"
        echo ""
        echo -e "${CYAN}服务器公网IP:${NC} $server_ip"
        echo ""
        log_info "请检查 /root/ 目录下是否有相关配置信息文件"
    fi

    echo "========================================"
}

# 显示管理命令
show_management() {
    echo ""
    echo "========================================"
    echo "       Hysteria2 管理命令"
    echo "========================================"
    echo ""
    echo "  查看状态:   systemctl status hysteria-server"
    echo "  启动服务:   systemctl start hysteria-server"
    echo "  停止服务:   systemctl stop hysteria-server"
    echo "  重启服务:   systemctl restart hysteria-server"
    echo "  开机自启:   systemctl enable hysteria-server"
    echo "  查看日志:   journalctl -u hysteria-server -f"
    echo "  查看配置:   cat /etc/hysteria/config.yaml"
    echo ""
    echo "  卸载 Hysteria2:"
    echo "    bash <(curl -fsSL https://raw.githubusercontent.com/everett7623/hy2/main/hy2.sh) uninstall"
    echo ""
    echo "========================================"
}

# 显示菜单
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       Hysteria2 一键安装脚本           ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "  Hysteria2 是基于 QUIC 协议的高速代理工具"
    echo "  无需域名和证书，UDP 传输，抗封锁能力强"
    echo ""
    echo "  1. 安装 Hysteria2（交互式菜单）"
    echo "  2. 查看 Hysteria2 介绍"
    echo "  3. 退出"
    echo ""
    echo -e "${YELLOW}提示: 安装过程会调用 everett7623/hy2 开源项目的一键脚本${NC}"
    echo -e "${YELLOW}      该脚本提供完整的交互式配置菜单${NC}"
    echo ""
}

# 显示 Hysteria2 介绍
show_intro() {
    echo ""
    echo -e "${YELLOW}Hysteria2 简介:${NC}"
    echo ""
    echo "  Hysteria2 是一个基于 QUIC 协议的高性能代理工具，"
    echo "  专为恶劣网络环境设计，具有以下特点:"
    echo ""
    echo "  - 无需域名: 直接使用 IP 地址，省去域名和证书配置"
    echo "  - UDP/QUIC 协议: 基于 UDP 的 QUIC 传输，延迟低、速度快"
    echo "  - 抗封锁: 协议特征与普通 HTTPS 流量相似，难以识别"
    echo "  - 多路复用: 单连接即可承载多路数据，资源占用低"
    echo "  - 带宽放大: 支持带宽放大，充分利用服务器带宽"
    echo ""
    echo -e "${YELLOW}适用场景:${NC}"
    echo "  - 无域名的 VPS 服务器"
    echo "  - 需要低延迟、高速度的网络环境"
    echo "  - 对 UDP 支持良好的网络环境"
    echo ""
}

# 主函数
main() {
    show_menu

    while true; do
        read -p "请输入选项 [1-3]: " choice
        case "$choice" in
            1)
                echo ""
                check_root
                check_system
                check_port_usage
                check_firewall

                if check_installed; then
                    echo ""
                    read -p "检测到已安装 Hysteria2，是否重新安装？[y/N]: " reinstall
                    case "$reinstall" in
                        [yY]|[yY][eE][sS])
                            log_info "开始重新安装..."
                            ;;
                        *)
                            log_info "已取消安装"
                            show_management
                            show_connection_info
                            exit 0
                            ;;
                    esac
                fi

                install_hy2
                show_connection_info
                show_management
                break
                ;;
            2)
                show_intro
                show_menu
                ;;
            3)
                log_info "已退出"
                exit 0
                ;;
            *)
                log_warning "无效选项，请输入 1-3"
                ;;
        esac
    done
}

main
