#!/bin/bash

# Xray 安装配置脚本
# 支持: 所有Linux系统
# 功能: 安装和配置Xray代理服务

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

# 生成随机字符串
generate_random() {
    local length=$1
    tr -dc 'a-zA-Z0-9' < /dev/urandom | head -c $length
}

# 生成UUID
generate_uuid() {
    cat /proc/sys/kernel/random/uuid
}

# 安装Xray
install_xray() {
    log_info "正在安装Xray..."
    
    # 使用官方安装脚本
    bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
    
    log_success "Xray安装完成"
}

# 配置Xray
configure_xray() {
    log_info "配置Xray..."
    
    # 生成配置
    local uuid=$(generate_uuid)
    local port=$((RANDOM % 50000 + 10000))
    
    # 创建配置目录
    mkdir -p /usr/local/etc/xray
    
    # 创建配置文件
    cat > /usr/local/etc/xray/config.json <<EOF
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": $port,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "$uuid",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "www.cloudflare.com:443",
          "xver": 0,
          "serverNames": [
            "www.cloudflare.com"
          ],
          "privateKey": "$(xray x25519 | head -1 | cut -d' ' -f3)",
          "shortIds": [
            "$(generate_random 8)"
          ]
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls",
          "quic"
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "tag": "block"
    }
  ],
  "routing": {
    "rules": [
      {
        "protocol": "bittorrent",
        "outboundTag": "block"
      }
    ]
  }
}
EOF

    log_success "Xray配置完成"
    
    # 保存配置信息
    cat > /root/xray-info.txt <<EOF
========================================
         Xray 配置信息
========================================

协议: VLESS + REALITY
端口: $port
UUID: $uuid

客户端配置:
  地址: $(curl -s ifconfig.me)
  端口: $port
  UUID: $uuid
  流控: xtls-rprx-vision
  安全: reality
  SNI: www.cloudflare.com

========================================
EOF

    log_info "配置信息已保存到 /root/xray-info.txt"
}

# 启动Xray
start_xray() {
    log_info "启动Xray服务..."
    
    systemctl enable xray
    systemctl start xray
    
    # 检查状态
    if systemctl is-active --quiet xray; then
        log_success "Xray服务已启动"
    else
        log_error "Xray服务启动失败"
        echo ""
        echo -e "${YELLOW}提示：如果自建代理遇到问题，也可以考虑使用现成的代理服务${NC}"
        echo -e "${YELLOW}比如搬瓦工官方的 Just My Socks，开箱即用，支持支付宝${NC}"
        echo -e "${YELLOW}注册时输入优惠码 JMS9272283 可享受循环折扣${NC}"
        echo -e "${YELLOW}了解更多: https://justmysocks6.net/members/aff.php?aff=37879${NC}"
        echo ""
        exit 1
    fi
}

# 配置防火墙
configure_firewall() {
    local port=$1
    
    log_info "配置防火墙..."
    
    if command -v ufw >/dev/null 2>&1; then
        ufw allow $port/tcp
        ufw reload
    elif command -v firewall-cmd >/dev/null 2>&1; then
        firewall-cmd --permanent --add-port=$port/tcp
        firewall-cmd --reload
    fi
    
    log_success "防火墙配置完成"
}

# 显示信息
show_info() {
    echo ""
    echo "========================================"
    echo "         Xray 安装完成"
    echo "========================================"
    echo ""
    cat /root/xray-info.txt
    echo ""
    echo "管理命令:"
    echo "  查看状态: systemctl status xray"
    echo "  查看日志: journalctl -u xray -f"
    echo "  重启服务: systemctl restart xray"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "        Xray 安装脚本"
    echo "========================================"
    echo ""
    
    check_root
    install_xray
    configure_xray
    
    # 获取配置的端口
    local port=$(grep '"port"' /usr/local/etc/xray/config.json | head -1 | grep -o '[0-9]*')
    
    configure_firewall $port
    start_xray
    show_info
}

main