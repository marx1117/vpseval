#!/bin/bash

# Sing-box 代理安装配置脚本
# 支持: Ubuntu/Debian/CentOS/Alpine 等主流Linux系统
# 功能: 通过调用 fscarmen/sing-box 开源项目的一键脚本安装配置 Sing-box 代理
# 支持: VLESS、VMess、Trojan、Shadowsocks、Hysteria2 等多种协议
# 项目地址: https://github.com/fscarmen/sing-box

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
        log_info "请执行: sudo bash $0"
        exit 1
    fi
}

# 检查系统兼容性
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
        x86_64|aarch64|armv7l)
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

# 显示支持的协议信息
show_protocols() {
    echo ""
    echo -e "${YELLOW}支持的协议列表:${NC}"
    echo ""
    echo "  1. VLESS          - 轻量级代理协议，性能优秀"
    echo "  2. VMess          - V2Ray 原生协议，兼容性好"
    echo "  3. Trojan         - 伪装为 HTTPS 流量，抗检测能力强"
    echo "  4. Shadowsocks    - 经典代理协议，轻量高效"
    echo "  5. Hysteria2      - 基于 QUIC 的高速协议，适合高带宽场景"
    echo "  6. VLESS + Reality - 基于 TLS 指纹伪装，无需域名证书"
    echo ""
}

# 显示功能说明
show_features() {
    echo ""
    echo -e "${YELLOW}脚本功能:${NC}"
    echo ""
    echo "  - 支持交互式菜单选择协议和配置"
    echo "  - 支持 IPv4 和 IPv6 双栈部署"
    echo "  - 自动配置 TLS 证书（自签 / Let's Encrypt）"
    echo "  - 自动配置防火墙规则"
    echo "  - 支持 WebSocket / gRPC / HTTPUpgrade 等传输方式"
    echo "  - 安装完成后显示完整连接信息"
    echo ""
}

# 检查是否已安装 sing-box
check_installed() {
    if command -v sing-box >/dev/null 2>&1; then
        local version=$(sing-box version 2>/dev/null | head -1 || echo "未知")
        log_info "检测到已安装的 Sing-box: $version"
        return 0
    fi
    return 1
}

# 下载并执行 fscarmen 的 sing-box 安装脚本
install_singbox() {
    log_info "正在下载 Sing-box 安装脚本..."
    log_info "项目地址: https://github.com/fscarmen/sing-box"

    local install_url="https://raw.githubusercontent.com/fscarmen/sing-box/main/sing-box.sh"

    # 检查是否能下载脚本
    if ! curl -s --connect-timeout 15 -fSL -o /tmp/sing-box.sh "$install_url" 2>/dev/null; then
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

    # 执行安装脚本（传递所有参数）
    log_info "正在启动 Sing-box 安装程序..."
    log_info "安装过程中会弹出交互式菜单，请根据提示操作"
    echo ""
    log_warning "=========================================="
    log_warning "  以下为 fscarmen/sing-box 的安装界面"
    log_warning "  请按照菜单提示选择协议和配置参数"
    log_warning "=========================================="
    echo ""

    chmod +x /tmp/sing-box.sh
    bash /tmp/sing-box.sh "$@"

    # 清理临时文件
    rm -f /tmp/sing-box.sh
}

# 显示安装后的管理信息
show_management() {
    echo ""
    echo "========================================"
    echo "       Sing-box 管理命令"
    echo "========================================"
    echo ""
    echo "  查看状态:   systemctl status sing-box"
    echo "  启动服务:   systemctl start sing-box"
    echo "  停止服务:   systemctl stop sing-box"
    echo "  重启服务:   systemctl restart sing-box"
    echo "  开机自启:   systemctl enable sing-box"
    echo "  查看日志:   journalctl -u sing-box -f"
    echo "  查看配置:   cat /etc/sing-box/config.json"
    echo ""
    echo "  卸载 Sing-box:"
    echo "    bash <(curl -L https://raw.githubusercontent.com/fscarmen/sing-box/main/sing-box.sh) uninstall"
    echo ""
    echo "========================================"
}

# 显示菜单
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       Sing-box 代理安装脚本            ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "  1. 安装 Sing-box（交互式菜单）"
    echo "  2. 查看支持的协议"
    echo "  3. 查看脚本功能说明"
    echo "  4. 退出"
    echo ""
    echo -e "${YELLOW}提示: 安装过程会调用 fscarmen/sing-box 开源项目的一键脚本${NC}"
    echo -e "${YELLOW}      该脚本提供完整的交互式配置菜单${NC}"
    echo ""
}

# 主函数
main() {
    show_menu

    while true; do
        read -p "请输入选项 [1-4]: " choice
        case "$choice" in
            1)
                echo ""
                check_root
                check_system

                if check_installed; then
                    echo ""
                    read -p "检测到已安装 Sing-box，是否重新安装？[y/N]: " reinstall
                    case "$reinstall" in
                        [yY]|[yY][eE][sS])
                            log_info "开始重新安装..."
                            ;;
                        *)
                            log_info "已取消安装"
                            show_management
                            exit 0
                            ;;
                    esac
                fi

                install_singbox
                show_management
                break
                ;;
            2)
                show_protocols
                show_menu
                ;;
            3)
                show_features
                show_menu
                ;;
            4)
                log_info "已退出"
                exit 0
                ;;
            *)
                log_warning "无效选项，请输入 1-4"
                ;;
        esac
    done
}

main
