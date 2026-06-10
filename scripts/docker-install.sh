#!/bin/bash

# Docker 和 Docker Compose 安装脚本
# 支持: Ubuntu/Debian/CentOS
# 功能: 安装最新版Docker和Docker Compose

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

# 卸载旧版本
uninstall_old_docker() {
    log_info "卸载旧版本Docker..."
    
    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]]; then
        yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine 2>/dev/null || true
    fi
    
    log_success "旧版本卸载完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装依赖..."
    
    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get update
        apt-get install -y ca-certificates curl gnupg lsb-release
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]]; then
        yum install -y yum-utils
    fi
    
    log_success "依赖安装完成"
}

# 添加Docker仓库
add_docker_repo() {
    log_info "添加Docker官方仓库..."
    
    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        # 添加GPG密钥
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg
        
        # 添加仓库
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        apt-get update
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]]; then
        yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    fi
    
    log_success "仓库添加完成"
}

# 安装Docker
install_docker() {
    log_info "安装Docker..."
    
    if [[ "$OS" =~ "ubuntu" ]] || [[ "$OS" =~ "debian" ]]; then
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    elif [[ "$OS" =~ "centos" ]] || [[ "$OS" =~ "rhel" ]]; then
        yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    fi
    
    # 启动Docker
    systemctl start docker
    systemctl enable docker
    
    log_success "Docker安装完成"
}

# 安装Docker Compose
install_docker_compose() {
    log_info "安装Docker Compose..."
    
    # 检查是否已通过插件安装
    if docker compose version >/dev/null 2>&1; then
        log_success "Docker Compose插件已安装"
        return 0
    fi
    
    # 安装独立版本
    local compose_version=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    
    curl -L "https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # 创建软链接
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose安装完成"
}

# 配置Docker
configure_docker() {
    log_info "配置Docker..."
    
    # 创建docker组
    groupadd docker 2>/dev/null || true
    
    # 将当前用户添加到docker组
    if [[ -n "$SUDO_USER" ]]; then
        usermod -aG docker $SUDO_USER
        log_info "已将用户 $SUDO_USER 添加到docker组"
    fi
    
    # 配置Docker守护进程
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF
    
    # 重启Docker
    systemctl restart docker
    
    log_success "Docker配置完成"
}

# 验证安装
verify_installation() {
    log_info "验证安装..."
    
    echo ""
    echo "Docker版本:"
    docker --version
    
    echo ""
    echo "Docker Compose版本:"
    docker-compose --version 2>/dev/null || docker compose version
    
    echo ""
    echo "运行测试容器..."
    docker run --rm hello-world
    
    log_success "验证完成"
}

# 显示信息
show_info() {
    echo ""
    echo "========================================"
    echo "         Docker 安装完成"
    echo "========================================"
    echo ""
    echo "常用命令:"
    echo "  docker ps           - 查看运行中的容器"
    echo "  docker images       - 查看本地镜像"
    echo "  docker-compose up   - 启动Compose服务"
    echo ""
    echo "注意: 如果当前用户无法使用docker命令，请重新登录或运行:"
    echo "  newgrp docker"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "      Docker 安装脚本"
    echo "========================================"
    echo ""
    
    check_root
    detect_os
    uninstall_old_docker
    install_dependencies
    add_docker_repo
    install_docker
    install_docker_compose
    configure_docker
    verify_installation
    show_info
}

main