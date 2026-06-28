#!/bin/bash

# YABS 性能测试封装脚本
# 支持: Ubuntu/Debian/CentOS
# 功能: 封装 YABS (Yet Another Bench Script) 一键运行，支持多种测试模式

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

# 检测并安装依赖
check_and_install_deps() {
    log_info "检测必要依赖..."

    local deps_to_install=()
    local missing_deps=()

    # 检查 curl
    if ! command -v curl &>/dev/null; then
        missing_deps+=("curl")
        deps_to_install+=("curl")
    fi

    # 检查 fio
    if ! command -v fio &>/dev/null; then
        missing_deps+=("fio")
        deps_to_install+=("fio")
    fi

    # 检查 iperf3
    if ! command -v iperf3 &>/dev/null; then
        missing_deps+=("iperf3")
        deps_to_install+=("iperf3")
    fi

    # 检查 bc (用于计算)
    if ! command -v bc &>/dev/null; then
        missing_deps+=("bc")
        deps_to_install+=("bc")
    fi

    if [[ ${#missing_deps[@]} -eq 0 ]]; then
        log_success "所有依赖已满足"
        return 0
    fi

    log_warning "缺少以下依赖: ${missing_deps[*]}"
    log_info "正在自动安装..."

    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get update -qq
        apt-get install -y -qq "${deps_to_install[@]}"
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]] || [[ "$OS" =~ "rocky" ]] || [[ "$OS" =~ "almalinux" ]]; then
        yum install -y -q "${deps_to_install[@]}"
    else
        log_error "不支持的操作系统，请手动安装: ${missing_deps[*]}"
        exit 1
    fi

    log_success "依赖安装完成"
}

# 运行 YABS 完整测试
run_full_test() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          YABS 完整性能测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    log_warning "完整测试预计耗时 10-30 分钟，请耐心等待"
    log_info "测试内容包括: CPU (Geekbench)、磁盘 I/O、网络速度"
    echo ""
    read -p "按 Enter 键开始测试，或 Ctrl+C 取消..."
    echo ""

    log_info "正在运行 YABS 完整测试..."
    curl -sL yabs.sh | bash -s -- -i

    show_completion_info
}

# 运行 YABS 快速模式（跳过 Geekbench）
run_fast_test() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          YABS 快速模式测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    log_warning "快速模式预计耗时 3-8 分钟（跳过 Geekbench）"
    log_info "测试内容包括: 磁盘 I/O、网络速度"
    echo ""
    read -p "按 Enter 键开始测试，或 Ctrl+C 取消..."
    echo ""

    log_info "正在运行 YABS 快速测试..."
    curl -sL yabs.sh | bash -s -- -i -n

    show_completion_info
}

# 仅运行磁盘测试
run_disk_only() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          YABS 磁盘性能测试${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    log_warning "磁盘测试预计耗时 2-5 分钟"
    echo ""
    read -p "按 Enter 键开始测试，或 Ctrl+C 取消..."
    echo ""

    log_info "正在运行 YABS 磁盘测试..."
    curl -sL yabs.sh | bash -s -- -i -n -s

    show_completion_info
}

# 显示测试完成后的信息
show_completion_info() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}          测试完成${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    log_info "测试结果已显示在上方的 YABS 输出中"
    echo ""

    echo -e "${GREEN}结果解读:${NC}"
    echo "  - Disk Speed (fio): 磁盘读写速度，越高越好"
    echo "    * 优秀: > 1 GB/s"
    echo "    * 良好: 300 MB/s - 1 GB/s"
    echo "    * 一般: 100 - 300 MB/s"
    echo "    * 较差: < 100 MB/s"
    echo ""
    echo "  - Network Speed (iperf3): 网络带宽，越高越好"
    echo "    * 优秀: > 1 Gbps"
    echo "    * 良好: 500 Mbps - 1 Gbps"
    echo "    * 一般: 100 - 500 Mbps"
    echo ""
    echo "  - Geekbench 6 Score: CPU 性能评分"
    echo "    * 单核分数: 反映单线程性能"
    echo "    * 多核分数: 反映多线程性能"
    echo ""

    echo -e "${GREEN}分享与对比:${NC}"
    echo "  您可以将结果上传至 VPSBenchmarks.com 进行对比"
    echo "  访问: https://www.vpsbenchmarks.com/"
    echo ""

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 显示主菜单
show_menu() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║      YABS 性能测试封装脚本             ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "  1. 完整跑分 (CPU + 磁盘 + 网络)"
    echo "  2. 快速模式 (磁盘 + 网络，跳过 Geekbench)"
    echo "  3. 仅磁盘测试"
    echo "  0. 退出"
    echo ""
    echo -n "请选择测试模式 [0-3]: "
}

# 主函数
main() {
    check_root
    detect_os
    check_and_install_deps

    while true; do
        show_menu
        read -r choice

        case $choice in
            1)
                run_full_test
                ;;
            2)
                run_fast_test
                ;;
            3)
                run_disk_only
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
        read -p "按 Enter 键返回主菜单..."
    done
}

main
