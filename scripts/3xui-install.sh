#!/bin/bash

# 3X-UI 可视化面板安装脚本
# 支持: Ubuntu/Debian/CentOS 等主流Linux系统
# 功能: 安装和配置 3X-UI 代理管理面板（基于 Xray 内核）
# 项目地址: https://github.com/mhsanaei/3x-ui
# 提供: 安装 / 卸载 / 重置面板设置 / 查看状态等功能

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
        log_info "请执行: sudo bash $0"
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

# 获取本机IP
get_ip() {
    local ip=$(hostname -I | awk '{print $1}')
    echo "$ip"
}

# 获取公网IP
get_public_ip() {
    local ip=""
    ip=$(curl -s --connect-timeout 5 https://api.ipify.org 2>/dev/null || true)
    if [[ -z "$ip" ]]; then
        ip=$(curl -s --connect-timeout 5 http://ipv4.icanhazip.com 2>/dev/null || true)
    fi
    echo "$ip"
}

# 配置防火墙
detect_panel_port() {
    local port=2053
    # 尝试从3x-ui配置中读取端口
    if [[ -f /usr/local/x-ui/bin/config.json ]]; then
        port=$(grep -oP '"port":\s*\K[0-9]+' /usr/local/x-ui/bin/config.json 2>/dev/null | head -1 || echo 2053)
    fi
    echo "$port"
}

# 配置防火墙放行端口
configure_firewall() {
    local port=$1

    log_info "配置防火墙放行端口 ${port}..."

    if command -v ufw >/dev/null 2>&1; then
        ufw allow ${port}/tcp >/dev/null 2>&1 || true
        ufw reload >/dev/null 2>&1 || true
        log_success "ufw 已放行端口 ${port}"
    elif command -v firewall-cmd >/dev/null 2>&1; then
        firewall-cmd --permanent --add-port=${port}/tcp >/dev/null 2>&1 || true
        firewall-cmd --reload >/dev/null 2>&1 || true
        log_success "firewalld 已放行端口 ${port}"
    elif command -v iptables >/dev/null 2>&1; then
        iptables -I INPUT -p tcp --dport ${port} -j ACCEPT 2>/dev/null || true
        # 尝试保存规则
        if command -v netfilter-persistent >/dev/null 2>&1; then
            netfilter-persistent save >/dev/null 2>&1 || true
        fi
        log_success "iptables 已放行端口 ${port}"
    else
        log_warning "未检测到支持的防火墙工具，请手动放行端口 ${port}"
    fi
}

# 安装 3X-UI
install_3xui() {
    log_info "开始安装 3X-UI 面板..."
    log_info "项目地址: https://github.com/mhsanaei/3x-ui"
    echo ""

    # 检查是否已安装
    if [[ -f /usr/local/x-ui/x-ui ]]; then
        log_warning "检测到 3X-UI 已安装"
        read -p "是否重新安装? [y/N]: " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            log_info "取消安装"
            return
        fi
    fi

    # 调用官方安装脚本
    log_info "正在下载并执行官方安装脚本..."
    bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)

    log_success "3X-UI 安装完成"
    echo ""
}

# 卸载 3X-UI
uninstall_3xui() {
    log_info "开始卸载 3X-UI 面板..."

    if [[ ! -f /usr/local/x-ui/x-ui ]]; then
        log_warning "3X-UI 未安装"
        return
    fi

    read -p "确定要卸载 3X-UI 吗? 所有配置将被删除 [y/N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "取消卸载"
        return
    fi

    # 调用官方卸载脚本
    log_info "正在执行卸载..."
    bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh) uninstall

    log_success "3X-UI 卸载完成"
    echo ""
}

# 重置面板设置
reset_3xui() {
    log_info "开始重置 3X-UI 面板设置..."

    if [[ ! -f /usr/local/x-ui/x-ui ]]; then
        log_error "3X-UI 未安装，无法重置"
        return
    fi

    read -p "确定要重置面板设置吗? [y/N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "取消重置"
        return
    fi

    # 调用官方脚本进行重置
    log_info "正在重置面板设置..."
    /usr/local/x-ui/x-ui setting -reset

    log_success "3X-UI 面板设置已重置"
    echo ""
}

# 显示 3X-UI 访问信息
show_access_info() {
    local local_ip=$(get_ip)
    local public_ip=$(get_public_ip)
    local port=$(detect_panel_port)

    # 尝试从配置中获取用户名密码
    local username="admin"
    local password="admin"

    if [[ -f /usr/local/x-ui/bin/config.json ]]; then
        username=$(grep -oP '"username":\s*"\K[^"]+' /usr/local/x-ui/bin/config.json 2>/dev/null || echo "admin")
        password=$(grep -oP '"password":\s*"\K[^"]+' /usr/local/x-ui/bin/config.json 2>/dev/null || echo "admin")
    fi

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}         3X-UI 面板安装完成${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${CYAN}访问地址:${NC}"
    if [[ -n "$public_ip" ]]; then
        echo -e "  公网访问: ${YELLOW}http://${public_ip}:${port}${NC}"
        echo -e "  公网访问: ${YELLOW}https://${public_ip}:${port}${NC} (HTTPS)"
    fi
    echo -e "  本地访问: ${YELLOW}http://${local_ip}:${port}${NC}"
    echo -e "  本地访问: ${YELLOW}http://127.0.0.1:${port}${NC}"
    echo ""
    echo -e "${CYAN}默认端口:${NC} ${YELLOW}${port}${NC}"
    echo -e "${CYAN}用户名:${NC}   ${YELLOW}${username}${NC}"
    echo -e "${CYAN}密码:${NC}     ${YELLOW}${password}${NC}"
    echo ""
    echo -e "${YELLOW}注意: 首次登录后请立即修改默认用户名和密码！${NC}"
    echo ""
    echo -e "${GREEN}========================================${NC}"
}

# 显示管理命令
show_management() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}         3X-UI 管理命令${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${CYAN}服务管理:${NC}"
    echo "  查看状态:   systemctl status x-ui"
    echo "  启动服务:   systemctl start x-ui"
    echo "  停止服务:   systemctl stop x-ui"
    echo "  重启服务:   systemctl restart x-ui"
    echo "  开机自启:   systemctl enable x-ui"
    echo ""
    echo -e "${CYAN}面板管理:${NC}"
    echo "  查看日志:   journalctl -u x-ui -f"
    echo "  面板设置:   /usr/local/x-ui/x-ui setting"
    echo "  重置设置:   /usr/local/x-ui/x-ui setting -reset"
    echo "  修改端口:   /usr/local/x-ui/x-ui setting -port <端口号>"
    echo "  修改路径:   /usr/local/x-ui/x-ui setting -path <路径>"
    echo ""
    echo -e "${CYAN}其他命令:${NC}"
    echo "  查看配置:   cat /usr/local/x-ui/bin/config.json"
    echo "  数据目录:   /etc/x-ui/"
    echo ""
    echo -e "${BLUE}========================================${NC}"
}

# 显示菜单
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       3X-UI 可视化面板安装脚本         ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}  基于 Xray 内核的代理管理面板          ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  项目: github.com/mhsanaei/3x-ui       ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "  1) 安装 3X-UI"
    echo "  2) 卸载 3X-UI"
    echo "  3) 重置面板设置"
    echo "  4) 查看状态"
    echo "  0) 退出"
    echo ""
}

# 查看状态
show_status() {
    if [[ ! -f /usr/local/x-ui/x-ui ]]; then
        log_warning "3X-UI 未安装"
        return
    fi

    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}         3X-UI 运行状态${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    systemctl status x-ui --no-pager || true

    echo ""
    log_info "面板访问信息:"
    show_access_info
}

# 主函数
main() {
    check_root
    detect_os

    while true; do
        show_menu
        read -p "请选择操作 [0-4]: " choice
        echo ""

        case $choice in
            1)
                install_3xui
                local port=$(detect_panel_port)
                configure_firewall "$port"
                show_access_info
                show_management
                ;;
            2)
                uninstall_3xui
                ;;
            3)
                reset_3xui
                show_access_info
                ;;
            4)
                show_status
                ;;
            0)
                log_info "退出脚本"
                exit 0
                ;;
            *)
                log_error "无效选项，请重新选择"
                ;;
        esac

        echo ""
        read -p "按回车键继续..."
    done
}

# 如果直接传参则执行对应功能
if [[ $# -gt 0 ]]; then
    check_root
    detect_os

    case "$1" in
        install)
            install_3xui
            local port=$(detect_panel_port)
            configure_firewall "$port"
            show_access_info
            show_management
            ;;
        uninstall)
            uninstall_3xui
            ;;
        reset)
            reset_3xui
            show_access_info
            ;;
        status)
            show_status
            ;;
        *)
            echo "用法: $0 [install|uninstall|reset|status]"
            exit 1
            ;;
    esac
else
    main
fi
