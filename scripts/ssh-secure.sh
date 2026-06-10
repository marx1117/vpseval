#!/bin/bash

# SSH 安全加固脚本
# 支持: 所有Linux系统
# 功能: 配置SSH安全选项

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

# 备份配置
backup_config() {
    local backup_file="/etc/ssh/sshd_config.bak.$(date +%Y%m%d_%H%M%S)"
    cp /etc/ssh/sshd_config "$backup_file"
    log_info "配置已备份到: $backup_file"
}

# 配置SSH
configure_ssh() {
    log_info "配置SSH安全选项..."
    
    # 询问新端口
    read -p "请输入新的SSH端口 (默认: 22): " new_port
    new_port=${new_port:-22}
    
    # 询问是否禁用root登录
    read -p "是否禁用root密码登录? (Y/n): " disable_root
    disable_root=${disable_root:-Y}
    
    # 询问是否使用密钥登录
    read -p "是否仅允许密钥登录? (Y/n): " key_only
    key_only=${key_only:-Y}
    
    # 创建新的配置
    cat > /etc/ssh/sshd_config <<EOF
# SSH安全配置
# 由 vps-scripts 自动生成

# 端口
Port $new_port

# 地址族
AddressFamily any
ListenAddress 0.0.0.0
ListenAddress ::

# 主机密钥
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

# 加密算法
Ciphers aes256-gcm@openssh.com,chacha20-poly1305@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com,hmac-sha2-512,hmac-sha2-256,umac-128@openssh.com
KexAlgorithms curve25519-sha256@libssh.org,ecdh-sha2-nistp521,ecdh-sha2-nistp384,ecdh-sha2-nistp256,diffie-hellman-group-exchange-sha256

# 认证设置
PermitRootLogin $(if [[ "$disable_root" =~ ^[Yy]$ ]]; then echo "prohibit-password"; else echo "yes"; fi)
PubkeyAuthentication yes
$(if [[ "$key_only" =~ ^[Yy]$ ]]; then echo "PasswordAuthentication no"; else echo "PasswordAuthentication yes"; fi)
PermitEmptyPasswords no
ChallengeResponseAuthentication no

# 限制
MaxAuthTries 3
MaxSessions 2
ClientAliveInterval 300
ClientAliveCountMax 2
LoginGraceTime 60

# 其他设置
UsePAM yes
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

    log_success "SSH配置已更新"
}

# 重启SSH服务
restart_ssh() {
    log_info "重启SSH服务..."
    
    if systemctl is-active --quiet sshd; then
        systemctl restart sshd
    elif systemctl is-active --quiet ssh; then
        systemctl restart ssh
    fi
    
    log_success "SSH服务已重启"
}

# 配置防火墙
configure_firewall() {
    local port=$1
    
    log_info "配置防火墙..."
    
    if command -v ufw >/dev/null 2>&1; then
        ufw allow $port/tcp
        ufw reload
        log_success "UFW规则已更新"
    elif command -v firewall-cmd >/dev/null 2>&1; then
        firewall-cmd --permanent --add-port=$port/tcp
        firewall-cmd --reload
        log_success "Firewalld规则已更新"
    fi
}

# 显示配置信息
show_config() {
    local port=$1
    
    echo ""
    echo "========================================"
    echo "         SSH 安全配置完成"
    echo "========================================"
    echo ""
    echo "配置摘要:"
    echo "  端口: $port"
    echo "  Root登录: $(grep "^PermitRootLogin" /etc/ssh/sshd_config | awk '{print $2}')"
    echo "  密码认证: $(grep "^PasswordAuthentication" /etc/ssh/sshd_config | awk '{print $2}')"
    echo ""
    echo "重要提醒:"
    echo "  1. 请确保已配置SSH密钥，否则可能无法登录"
    echo "  2. 如果使用非22端口，连接时需要指定: ssh -p $port user@host"
    echo "  3. 建议测试新配置后再关闭当前会话"
    echo ""
    echo "测试命令:"
    echo "  ssh -p $port $(whoami)@$(hostname -I | awk '{print $1}')"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "        SSH 安全加固脚本"
    echo "========================================"
    echo ""
    
    check_root
    backup_config
    configure_ssh
    
    # 获取配置的端口
    local port=$(grep "^Port" /etc/ssh/sshd_config | awk '{print $2}')
    
    configure_firewall $port
    restart_ssh
    show_config $port
}

main