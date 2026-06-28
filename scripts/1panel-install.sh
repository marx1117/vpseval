#!/bin/bash

# 1Panel 轻运维面板安装脚本
# 支持: Ubuntu/Debian/CentOS/RHEL 等主流Linux系统
# 功能: 安装和配置 1Panel 轻运维面板（30k+ star，宝塔替代品）
# 项目地址: https://github.com/1Panel-dev/1Panel
# 提供: 安装 / 卸载 / 查看状态等功能

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

# 从 1Panel 配置文件中读取信息
read_1panel_config() {
    local config_file="/opt/1panel/conf/app.yaml"
    local port=""
    local username=""
    local password=""
    local entrance=""

    if [[ -f "$config_file" ]]; then
        port=$(grep -oP '^port:\s*\K[0-9]+' "$config_file" 2>/dev/null || echo "")
        username=$(grep -oP '^username:\s*\K\S+' "$config_file" 2>/dev/null || echo "")
        password=$(grep -oP '^password:\s*\K\S+' "$config_file" 2>/dev/null || echo "")
        entrance=$(grep -oP '^entrance:\s*\K\S+' "$config_file" 2>/dev/null || echo "")
    fi

    # 如果配置文件读取失败，使用默认值
    [[ -z "$port" ]] && port="8090"
    [[ -z "$username" ]] && username="1panel"
    [[ -z "$password" ]] && password=""
    [[ -z "$entrance" ]] && entrance=""

    echo "${port}|${username}|${password}|${entrance}"
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

# 安装 1Panel
install_1panel() {
    log_info "开始安装 1Panel 轻运维面板..."
    log_info "项目地址: https://github.com/1Panel-dev/1Panel"
    echo ""

    # 检查是否已安装
    if command -v 1pctl >/dev/null 2>&1; then
        log_warning "检测到 1Panel 已安装"
        read -p "是否重新安装? [y/N]: " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            log_info "取消安装"
            return
        fi
    fi

    # 调用官方安装脚本
    log_info "正在下载并执行官方安装脚本..."
    local quick_start="/tmp/1panel_quick_start.sh"

    curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o "$quick_start"
    chmod +x "$quick_start"
    bash "$quick_start"
    rm -f "$quick_start"

    log_success "1Panel 安装完成"
    echo ""
}

# 卸载 1Panel
uninstall_1panel() {
    log_info "开始卸载 1Panel 面板..."

    if ! command -v 1pctl >/dev/null 2>&1; then
        log_warning "1Panel 未安装"
        return
    fi

    read -p "确定要卸载 1Panel 吗? 所有数据将被删除 [y/N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "取消卸载"
        return
    fi

    log_info "正在执行卸载..."
    1pctl uninstall

    log_success "1Panel 卸载完成"
    echo ""
}

# 查看状态
show_status() {
    if ! command -v 1pctl >/dev/null 2>&1; then
        log_warning "1Panel 未安装"
        return
    fi

    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}         1Panel 运行状态${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    1pctl status || true

    echo ""
    log_info "面板访问信息:"
    show_access_info
}

# 显示 1Panel 访问信息
show_access_info() {
    local local_ip=$(get_ip)
    local public_ip=$(get_public_ip)
    local config=$(read_1panel_config)
    local port=$(echo "$config" | cut -d'|' -f1)
    local username=$(echo "$config" | cut -d'|' -f2)
    local password=$(echo "$config" | cut -d'|' -f3)
    local entrance=$(echo "$config" | cut -d'|' -f4)

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}         1Panel 面板安装完成${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${CYAN}访问地址:${NC}"
    if [[ -n "$public_ip" ]]; then
        if [[ -n "$entrance" ]]; then
            echo -e "  公网访问: ${YELLOW}http://${public_ip}:${port}/${entrance}${NC}"
            echo -e "  公网访问: ${YELLOW}https://${public_ip}:${port}/${entrance}${NC} (HTTPS)"
        else
            echo -e "  公网访问: ${YELLOW}http://${public_ip}:${port}${NC}"
            echo -e "  公网访问: ${YELLOW}https://${public_ip}:${port}${NC} (HTTPS)"
        fi
    fi
    if [[ -n "$entrance" ]]; then
        echo -e "  本地访问: ${YELLOW}http://${local_ip}:${port}/${entrance}${NC}"
        echo -e "  本地访问: ${YELLOW}http://127.0.0.1:${port}/${entrance}${NC}"
    else
        echo -e "  本地访问: ${YELLOW}http://${local_ip}:${port}${NC}"
        echo -e "  本地访问: ${YELLOW}http://127.0.0.1:${port}${NC}"
    fi
    echo ""
    echo -e "${CYAN}默认端口:${NC}     ${YELLOW}${port}${NC}"
    echo -e "${CYAN}安全入口:${NC}     ${YELLOW}${entrance:-无}${NC}"
    echo -e "${CYAN}用户名:${NC}       ${YELLOW}${username}${NC}"
    if [[ -n "$password" ]]; then
        echo -e "${CYAN}密码:${NC}         ${YELLOW}${password}${NC}"
    else
        echo -e "${CYAN}密码:${NC}         ${YELLOW}（请在安装过程中设置的密码）${NC}"
    fi
    echo ""
    echo -e "${YELLOW}注意: 首次登录后请立即修改默认密码！${NC}"
    echo ""
    echo -e "${GREEN}========================================${NC}"
}

# 显示管理命令
show_management() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}         1Panel 管理命令${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${CYAN}服务管理:${NC}"
    echo "  查看状态:   1pctl status"
    echo "  启动服务:   1pctl start"
    echo "  停止服务:   1pctl stop"
    echo "  重启服务:   1pctl restart"
    echo "  查看日志:   1pctl logs"
    echo ""
    echo -e "${CYAN}用户管理:${NC}"
    echo "  重置密码:   1pctl reset-password"
    echo "  修改端口:   1pctl update port"
    echo "  修改入口:   1pctl update entrance"
    echo "  修改用户名: 1pctl update username"
    echo ""
    echo -e "${CYAN}其他命令:${NC}"
    echo "  卸载面板:   1pctl uninstall"
    echo "  数据目录:   /opt/1panel/"
    echo "  配置文件:   /opt/1panel/conf/app.yaml"
    echo ""
    echo -e "${BLUE}========================================${NC}"
}

# 显示菜单
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       1Panel 轻运维面板安装脚本        ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}  30k+ star 的现代化运维面板            ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  项目: github.com/1Panel-dev/1Panel    ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "  1) 安装 1Panel"
    echo "  2) 卸载 1Panel"
    echo "  3) 查看状态"
    echo "  0) 退出"
    echo ""
}

# 主函数
main() {
    check_root
    detect_os

    while true; do
        show_menu
        read -p "请选择操作 [0-3]: " choice
        echo ""

        case $choice in
            1)
                install_1panel
                local config=$(read_1panel_config)
                local port=$(echo "$config" | cut -d'|' -f1)
                configure_firewall "$port"
                show_access_info
                show_management
                ;;
            2)
                uninstall_1panel
                ;;
            3)
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
            install_1panel
            local config=$(read_1panel_config)
            local port=$(echo "$config" | cut -d'|' -f1)
            configure_firewall "$port"
            show_access_info
            show_management
            ;;
        uninstall)
            uninstall_1panel
            ;;
        status)
            show_status
            ;;
        *)
            echo "用法: $0 [install|uninstall|status]"
            exit 1
            ;;
    esac
else
    main
fi
