#!/bin/bash

# NextTrace 回程路由检测安装脚本
# 支持: Ubuntu/Debian/CentOS
# 功能: 安装 NextTrace 回程路由检测工具，并引导用户测试三网回程

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

# 检查 nexttrace 是否已安装
check_nexttrace() {
    if command -v nexttrace &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# 安装 nexttrace
install_nexttrace() {
    log_info "正在安装 NextTrace..."

    # 使用官方安装脚本
    bash <(curl -Ls nxtrace.org/nt) || {
        log_error "NextTrace 安装失败"
        exit 1
    }

    if check_nexttrace; then
        log_success "NextTrace 安装成功"
        local version=$(nexttrace --version 2>/dev/null | head -n 1 || echo "未知")
        log_info "版本: $version"
    else
        log_error "NextTrace 安装后未找到命令"
        exit 1
    fi
}

# 卸载 nexttrace
uninstall_nexttrace() {
    log_info "正在卸载 NextTrace..."

    if ! check_nexttrace; then
        log_warning "NextTrace 未安装，无需卸载"
        return
    fi

    # 查找安装路径并删除
    local nt_path=$(command -v nexttrace 2>/dev/null || true)
    if [[ -n "$nt_path" ]]; then
        rm -f "$nt_path"
        log_info "已删除: $nt_path"
    fi

    # 清理可能存在的其他文件
    rm -f /usr/local/bin/nexttrace
    rm -f /usr/bin/nexttrace

    log_success "NextTrace 卸载完成"
}

# 测试三网回程
test_three_networks() {
    if ! check_nexttrace; then
        log_error "NextTrace 未安装，请先安装"
        return 1
    fi

    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          三网回程路由测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    log_info "测试目标: 上海电信、北京联通、广州移动"
    log_info "测试过程可能需要 1-3 分钟，请耐心等待..."
    echo ""

    # 上海电信
    echo -e "${YELLOW}>>> 上海电信 (202.96.209.133)${NC}"
    nexttrace -T 202.96.209.133 || log_warning "上海电信测试失败"
    echo ""

    # 北京联通
    echo -e "${YELLOW}>>> 北京联通 (202.106.50.1)${NC}"
    nexttrace -T 202.106.50.1 || log_warning "北京联通测试失败"
    echo ""

    # 广州移动
    echo -e "${YELLOW}>>> 广州移动 (120.196.165.24)${NC}"
    nexttrace -T 120.196.165.24 || log_warning "广州移动测试失败"
    echo ""

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log_success "三网回程测试完成"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 显示线路解读
show_line_guide() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          常见线路特征 IP 解读${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    echo -e "${GREEN}中国电信线路:${NC}"
    echo "  59.43.x.x      - CN2 GIA (优质线路，低延迟高稳定)"
    echo "  202.97.x.x     - 163 普通线路 (常见默认线路)"
    echo "  218.30.x.x     - CN2 GT (比163好，次于GIA)"
    echo ""

    echo -e "${GREEN}中国联通线路:${NC}"
    echo "  219.158.x.x    - 联通 AS4837 普通线路"
    echo "  210.78.x.x     - 联通 A网 (优质线路)"
    echo "  113.207.x.x    - 联通国际出口"
    echo ""

    echo -e "${GREEN}中国移动线路:${NC}"
    echo "  223.120.x.x    - CMIN2 (移动国际优质线路)"
    echo "  223.118.x.x    - CMI (移动国际普通线路)"
    echo "  221.183.x.x    - 移动铁通线路"
    echo ""

    echo -e "${GREEN}其他常见特征:${NC}"
    echo "  63.218.x.x     - PCCW (香港常见)"
    echo "  202.77.x.x     - PCCW"
    echo "  154.54.x.x     - Cogent"
    echo "  4.68.x.x       - Level3"
    echo "  129.250.x.x    - NTT"
    echo ""

    echo -e "${YELLOW}提示:${NC}"
    echo "  - 看到 59.43.x.x 表示走了电信 CN2 GIA，线路质量优秀"
    echo "  - 看到 202.97.x.x 表示走了电信 163 普通线路"
    echo "  - 看到 223.120.x.x 表示走了移动 CMIN2 优质线路"
    echo "  - 路由追踪结果中 '* * *' 表示该跳点未响应，属于正常现象"
    echo ""

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 显示使用指南
show_usage() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          NextTrace 使用指南${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    echo -e "${GREEN}基本命令:${NC}"
    echo "  nexttrace <IP/域名>          - 追踪到目标的路由"
    echo "  nexttrace -T <IP/域名>       - 使用 TCP SYN 追踪"
    echo "  nexttrace -U <IP/域名>       - 使用 UDP 追踪"
    echo "  nexttrace -M <IP/域名>       - 使用 ICMP 追踪"
    echo ""

    echo -e "${GREEN}常用选项:${NC}"
    echo "  -n                           - 禁用路由可视化"
    echo "  -p <端口>                    - 指定目标端口"
    echo "  -t <次数>                    - 设置最大跳数"
    echo "  --table                      - 以表格形式输出"
    echo ""

    echo -e "${GREEN}示例:${NC}"
    echo "  nexttrace www.baidu.com"
    echo "  nexttrace -T 1.1.1.1"
    echo "  nexttrace -T -p 443 www.google.com"
    echo ""

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 显示主菜单
show_menu() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║      NextTrace 回程路由检测工具        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""

    if check_nexttrace; then
        local version=$(nexttrace --version 2>/dev/null | head -n 1 || echo "未知")
        echo -e "${GREEN}状态: 已安装 ($version)${NC}"
    else
        echo -e "${YELLOW}状态: 未安装${NC}"
    fi

    echo ""
    echo "  1. 安装 NextTrace"
    echo "  2. 测试三网回程"
    echo "  3. 查看线路解读"
    echo "  4. 卸载 NextTrace"
    echo "  0. 退出"
    echo ""
    echo -n "请选择操作 [0-4]: "
}

# 主函数
main() {
    check_root
    detect_os

    while true; do
        show_menu
        read -r choice

        case $choice in
            1)
                echo ""
                if check_nexttrace; then
                    log_warning "NextTrace 已安装"
                    read -p "是否重新安装? (y/N): " confirm
                    if [[ "$confirm" =~ ^[Yy]$ ]]; then
                        uninstall_nexttrace
                        install_nexttrace
                        show_usage
                    fi
                else
                    install_nexttrace
                    show_usage
                fi
                ;;
            2)
                test_three_networks
                ;;
            3)
                show_line_guide
                ;;
            4)
                echo ""
                read -p "确认卸载 NextTrace? (y/N): " confirm
                if [[ "$confirm" =~ ^[Yy]$ ]]; then
                    uninstall_nexttrace
                else
                    log_info "已取消卸载"
                fi
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
        read -p "按 Enter 键继续..."
    done
}

main
