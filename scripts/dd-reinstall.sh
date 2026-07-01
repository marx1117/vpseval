#!/bin/bash

# DD 重装系统脚本
# 支持: Debian 11/12、Ubuntu 20.04/22.04/24.04、CentOS 7/8/9、Alpine、Windows
# 功能: 通过调用 bin456789/reinstall 开源项目实现VPS一键重装系统
# 注意: 此脚本为封装脚本，核心逻辑调用 bin456789/reinstall 的 reinstall.sh

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

# 检测服务器位置（国内/国外）
detect_region() {
    log_info "正在检测服务器位置..."

    # 通过访问速度判断是否在国内
    local test_url="https://www.baidu.com"
    local start_time=$(date +%s%N)

    if curl -s --connect-timeout 3 --max-time 5 "$test_url" >/dev/null 2>&1; then
        local end_time=$(date +%s%N)
        local elapsed=$(( (end_time - start_time) / 1000000 ))
        if [[ $elapsed -lt 3000 ]]; then
            log_info "检测到服务器位于国内（响应时间: ${elapsed}ms）"
            REGION="cn"
        else
            log_info "检测到服务器位于国外（响应时间: ${elapsed}ms）"
            REGION="global"
        fi
    else
        log_info "无法连接国内站点，判定为国外服务器"
        REGION="global"
    fi
}

# 选择操作系统
select_os() {
    echo ""
    echo "========================================"
    echo "      请选择要安装的操作系统"
    echo "========================================"
    echo ""
    echo "  1) Debian 12"
    echo "  2) Debian 11"
    echo "  3) Ubuntu 24.04"
    echo "  4) Ubuntu 22.04"
    echo "  5) Ubuntu 20.04"
    echo "  6) CentOS 9"
    echo "  7) CentOS 8"
    echo "  8) CentOS 7"
    echo "  9) Alpine"
    echo "  10) Windows"
    echo "  0) 取消"
    echo ""
    read -p "请输入选项 [0-10]: " os_choice

    case $os_choice in
        1)
            OS_IMAGE="debian"
            OS_VERSION="12"
            log_info "已选择: Debian 12"
            ;;
        2)
            OS_IMAGE="debian"
            OS_VERSION="11"
            log_info "已选择: Debian 11"
            ;;
        3)
            OS_IMAGE="ubuntu"
            OS_VERSION="24.04"
            log_info "已选择: Ubuntu 24.04"
            ;;
        4)
            OS_IMAGE="ubuntu"
            OS_VERSION="22.04"
            log_info "已选择: Ubuntu 22.04"
            ;;
        5)
            OS_IMAGE="ubuntu"
            OS_VERSION="20.04"
            log_info "已选择: Ubuntu 20.04"
            ;;
        6)
            OS_IMAGE="centos"
            OS_VERSION="9"
            log_info "已选择: CentOS 9"
            ;;
        7)
            OS_IMAGE="centos"
            OS_VERSION="8"
            log_info "已选择: CentOS 8"
            ;;
        8)
            OS_IMAGE="centos"
            OS_VERSION="7"
            log_info "已选择: CentOS 7"
            ;;
        9)
            OS_IMAGE="alpine"
            OS_VERSION="latest"
            log_info "已选择: Alpine"
            ;;
        10)
            OS_IMAGE="windows"
            OS_VERSION="default"
            log_info "已选择: Windows"
            ;;
        0)
            log_info "已取消操作"
            exit 0
            ;;
        *)
            log_error "无效选项，请重新运行脚本"
            exit 1
            ;;
    esac
}

# 设置root密码
set_password() {
    echo ""
    read -p "请设置root密码（留空则使用默认密码: 123456789）: " ROOT_PASSWORD

    if [[ -z "$ROOT_PASSWORD" ]]; then
        ROOT_PASSWORD="123456789"
        log_warning "将使用默认密码: 123456789"
        log_warning "请在重装完成后立即修改默认密码！"
    fi
}

# 确认操作
confirm_reinstall() {
    echo ""
    echo "========================================"
    echo "      即将执行DD重装系统"
    echo "========================================"
    echo ""
    echo "  目标系统: ${OS_IMAGE} ${OS_VERSION}"
    echo "  服务器位置: $([ "$REGION" = "cn" ] && echo "国内" || echo "国外")"
    echo "  Root密码: ${ROOT_PASSWORD}"
    echo ""
    log_warning "此操作将清除服务器上所有数据，请确认已做好备份！"
    echo ""
    read -p "确认执行重装？(yes/no): " confirm

    if [[ "$confirm" != "yes" ]]; then
        log_info "已取消操作"
        exit 0
    fi
}

# 执行重装
do_reinstall() {
    log_info "正在下载并执行重装脚本..."

    local reinstall_url
    if [[ "$REGION" == "cn" ]]; then
        # 国内使用镜像源
        reinstall_url="https://ghfast.top/https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh"
    else
        reinstall_url="https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh"
    fi

    # 构建命令参数
    local cmd_args=""

    case "$OS_IMAGE" in
        debian)
            cmd_args="--image-name debian-${OS_VERSION}-x64"
            ;;
        ubuntu)
            cmd_args="--image-name ubuntu-${OS_VERSION}-x64"
            ;;
        centos)
            cmd_args="--image-name centos-${OS_VERSION}-x64"
            ;;
        alpine)
            cmd_args="--image-name alpine-x64"
            ;;
        windows)
            cmd_args="--image-name win2022-x64"
            ;;
    esac

    cmd_args="${cmd_args} --password '${ROOT_PASSWORD}'"

    log_info "执行命令: bash <(curl ...) ${cmd_args}"
    echo ""

    # 执行重装
    eval "bash <(curl -sS ${reinstall_url}) ${cmd_args}"
}

# 显示完成信息
show_info() {
    echo ""
    echo "========================================"
    echo "      DD重装系统脚本"
    echo "========================================"
    echo ""
    echo "注意事项:"
    echo "  1. 重装过程中请勿关闭终端"
    echo "  2. 重装完成后使用 root / ${ROOT_PASSWORD} 登录"
    echo "  3. 首次登录后请立即修改密码: passwd"
    echo ""
    echo "  修改密码命令: passwd"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "      DD 重装系统脚本"
    echo "========================================"
    echo ""
    echo "  项目: bin456789/reinstall"
    echo "  支持: Debian/Ubuntu/CentOS/Alpine/Windows"
    echo ""

    check_root
    detect_region
    select_os
    set_password
    confirm_reinstall
    do_reinstall
    show_info
}

main
