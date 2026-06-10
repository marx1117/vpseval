#!/bin/bash

# 哪吒监控探针 Agent 安装脚本
# 支持: Ubuntu/Debian/CentOS/Alpine 等 Linux 系统
# 功能: 交互式安装、卸载哪吒监控探针（nezha-agent）
# 项目: https://github.com/naiba/nezha

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

# 检测系统架构
detect_arch() {
    local arch=$(uname -m)
    case "$arch" in
        x86_64|amd64)
            ARCH="amd64"
            ;;
        aarch64|arm64)
            ARCH="arm64"
            ;;
        armv7l|armhf)
            ARCH="armv7"
            ;;
        i386|i686)
            ARCH="386"
            ;;
        *)
            log_error "不支持的系统架构: $arch"
            exit 1
            ;;
    esac
    log_info "检测到系统架构: $arch ($ARCH)"
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

# 显示主菜单
show_menu() {
    echo ""
    echo "========================================"
    echo "      哪吒监控探针 Agent"
    echo "========================================"
    echo ""
    echo "  1) 安装探针"
    echo "  2) 卸载探针"
    echo "  3) 退出"
    echo ""
    read -p "请输入选项 [1-3]: " menu_choice

    case $menu_choice in
        1)
            install_agent
            ;;
        2)
            uninstall_agent
            ;;
        3)
            log_info "已退出"
            exit 0
            ;;
        *)
            log_error "无效选项，请重新运行脚本"
            exit 1
            ;;
    esac
}

# 交互式获取配置信息
get_config() {
    echo ""
    echo "---------- 安装配置 ----------"
    echo ""

    # 获取面板服务器地址
    read -p "请输入面板服务器地址（例如 nz.abc.com）: " PANEL_HOST
    if [[ -z "$PANEL_HOST" ]]; then
        log_error "面板地址不能为空"
        exit 1
    fi

    # 获取面板端口
    read -p "请输入面板RPC端口（默认: 5555）: " PANEL_PORT
    PANEL_PORT=${PANEL_PORT:-5555}

    # 获取Agent密钥
    read -p "请输入Agent密钥（在面板后台添加服务器时获取）: " AGENT_KEY
    if [[ -z "$AGENT_KEY" ]]; then
        log_error "Agent密钥不能为空"
        exit 1
    fi

    # 获取TLS配置
    echo ""
    read -p "是否启用TLS/SSL加密连接？(yes/no，默认no）: " TLS_CHOICE
    if [[ "$TLS_CHOICE" == "yes" || "$TLS_CHOICE" == "y" ]]; then
        TLS="--tls"
        log_info "已启用TLS加密连接"
    else
        TLS=""
        log_info "未启用TLS加密连接"
    fi

    echo ""
    echo "---------- 配置确认 ----------"
    echo "  面板地址: ${PANEL_HOST}:${PANEL_PORT}"
    echo "  Agent密钥: ${AGENT_KEY}"
    echo "  TLS加密: $([ -n "$TLS" ] && echo "已启用" || echo "未启用")"
    echo ""
    read -p "确认安装？(yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        log_info "已取消安装"
        exit 0
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装依赖..."

    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get update
        apt-get install -y curl wget
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]] || [[ "$OS" =~ "rocky" ]] || [[ "$OS" =~ "almalinux" ]]; then
        yum install -y curl wget
    elif [[ "$OS" =~ "alpine" ]]; then
        apk add curl wget
    fi

    log_success "依赖安装完成"
}

# 下载并安装nezha-agent
install_agent() {
    log_info "开始安装哪吒监控探针..."

    detect_arch
    detect_os
    get_config
    install_dependencies

    log_info "正在下载 nezha-agent..."

    # 获取最新版本号
    local latest_version=$(curl -s https://api.github.com/repos/naiba/nezha/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' | cut -c2-)

    if [[ -z "$latest_version" ]]; then
        log_warning "无法获取最新版本号，使用默认下载链接"
        local download_url="https://github.com/naiba/nezha/releases/latest/download/nezha-agent_linux_${ARCH}.zip"
    else
        local download_url="https://github.com/naiba/nezha/releases/download/v${latest_version}/nezha-agent_linux_${ARCH}.zip"
    fi

    log_info "下载地址: $download_url"

    # 下载并解压
    local tmp_dir="/tmp/nezha-agent"
    mkdir -p "$tmp_dir"

    if ! curl -L -o "${tmp_dir}/nezha-agent.zip" "$download_url"; then
        log_error "下载 nezha-agent 失败，请检查网络连接"
        exit 1
    fi

    # 解压
    if command -v unzip >/dev/null 2>&1; then
        unzip -o "${tmp_dir}/nezha-agent.zip" -d "$tmp_dir"
    else
        log_info "安装 unzip 工具..."
        if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
            apt-get install -y unzip
        elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]] || [[ "$OS" =~ "rocky" ]] || [[ "$OS" =~ "almalinux" ]]; then
            yum install -y unzip
        elif [[ "$OS" =~ "alpine" ]]; then
            apk add unzip
        fi
        unzip -o "${tmp_dir}/nezha-agent.zip" -d "$tmp_dir"
    fi

    # 安装二进制文件
    cp "${tmp_dir}/nezha-agent" /usr/local/bin/nezha-agent
    chmod +x /usr/local/bin/nezha-agent

    # 清理临时文件
    rm -rf "$tmp_dir"

    log_success "nezha-agent 下载完成"

    # 创建 systemd 服务
    create_service

    # 启动服务
    start_service

    # 显示完成信息
    show_info
}

# 创建 systemd 服务
create_service() {
    log_info "创建 systemd 服务..."

    cat > /etc/systemd/system/nezha-agent.service <<EOF
[Unit]
Description=Nezha Agent
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/nezha-agent -s ${PANEL_HOST}:${PANEL_PORT} -p ${AGENT_KEY} ${TLS}
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    log_success "systemd 服务创建完成"
}

# 启动服务
start_service() {
    log_info "启动 nezha-agent 服务..."

    systemctl enable nezha-agent
    systemctl start nezha-agent

    sleep 2

    if systemctl is-active --quiet nezha-agent; then
        log_success "nezha-agent 已启动并运行"
    else
        log_error "nezha-agent 启动失败，请检查配置"
        log_info "查看日志获取详细信息: journalctl -u nezha-agent -n 20"
        exit 1
    fi
}

# 卸载探针
uninstall_agent() {
    echo ""
    log_warning "即将卸载 nezha-agent"
    read -p "确认卸载？(yes/no): " confirm

    if [[ "$confirm" != "yes" ]]; then
        log_info "已取消卸载"
        exit 0
    fi

    log_info "正在停止 nezha-agent 服务..."
    systemctl stop nezha-agent 2>/dev/null || true
    systemctl disable nezha-agent 2>/dev/null || true

    log_info "正在删除服务文件..."
    rm -f /etc/systemd/system/nezha-agent.service
    systemctl daemon-reload

    log_info "正在删除 nezha-agent 程序..."
    rm -f /usr/local/bin/nezha-agent

    log_success "nezha-agent 已完全卸载"
}

# 显示完成信息
show_info() {
    echo ""
    echo "========================================"
    echo "      nezha-agent 安装完成"
    echo "========================================"
    echo ""
    echo "管理命令:"
    echo "  查看状态: systemctl status nezha-agent"
    echo "  查看日志: journalctl -u nezha-agent -f"
    echo "  重启服务: systemctl restart nezha-agent"
    echo "  停止服务: systemctl stop nezha-agent"
    echo "  启动服务: systemctl start nezha-agent"
    echo ""
    echo "卸载命令:"
    echo "  bash $(realpath "$0")"
    echo "  然后选择卸载选项"
    echo ""
    echo "配置信息:"
    echo "  面板地址: ${PANEL_HOST}:${PANEL_PORT}"
    echo "  服务文件: /etc/systemd/system/nezha-agent.service"
    echo "  程序路径: /usr/local/bin/nezha-agent"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "      哪吒监控探针 Agent"
    echo "========================================"
    echo ""
    echo "  项目: naiba/nezha"
    echo "  功能: 安装/卸载哪吒监控探针"
    echo ""

    check_root
    show_menu
}

main
