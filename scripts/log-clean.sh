#!/bin/bash

# 日志清理脚本
# 支持: 所有Linux系统
# 功能: 清理系统日志和临时文件

set -e

# 配置
LOG_RETENTION_DAYS=7        # 日志保留天数
TMP_RETENTION_DAYS=3        # 临时文件保留天数
ENABLE_LOG_ROTATE=true      # 是否启用日志轮转

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

# 获取目录大小
get_dir_size() {
    du -sh "$1" 2>/dev/null | cut -f1
}

# 清理系统日志
clean_system_logs() {
    log_info "清理系统日志..."
    
    local before_size=$(get_dir_size /var/log)
    
    # 清理旧日志
    find /var/log -type f -name "*.log" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
    find /var/log -type f -name "*.log.*" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
    find /var/log -type f -name "*.gz" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
    
    # 清空当前日志
    find /var/log -type f -name "*.log" -exec sh -c '> "$1"' _ {} \; 2>/dev/null || true
    
    # 清理journal日志
    if command -v journalctl >/dev/null 2>&1; then
        journalctl --vacuum-time=${LOG_RETENTION_DAYS}d >/dev/null 2>&1 || true
    fi
    
    local after_size=$(get_dir_size /var/log)
    log_success "系统日志清理完成 (清理前: $before_size, 清理后: $after_size)"
}

# 清理应用日志
clean_app_logs() {
    log_info "清理应用日志..."
    
    # Nginx日志
    if [[ -d /var/log/nginx ]]; then
        local before_size=$(get_dir_size /var/log/nginx)
        find /var/log/nginx -type f -name "*.log" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
        find /var/log/nginx -type f -name "*.log.*" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
        local after_size=$(get_dir_size /var/log/nginx)
        log_success "Nginx日志清理完成 (清理前: $before_size, 清理后: $after_size)"
    fi
    
    # Apache日志
    if [[ -d /var/log/apache2 ]]; then
        local before_size=$(get_dir_size /var/log/apache2)
        find /var/log/apache2 -type f -name "*.log" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
        find /var/log/apache2 -type f -name "*.log.*" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
        local after_size=$(get_dir_size /var/log/apache2)
        log_success "Apache日志清理完成 (清理前: $before_size, 清理后: $after_size)"
    fi
    
    # MySQL日志
    if [[ -d /var/log/mysql ]]; then
        local before_size=$(get_dir_size /var/log/mysql)
        find /var/log/mysql -type f -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
        local after_size=$(get_dir_size /var/log/mysql)
        log_success "MySQL日志清理完成 (清理前: $before_size, 清理后: $after_size)"
    fi
}

# 清理临时文件
clean_temp_files() {
    log_info "清理临时文件..."
    
    local before_size=$(get_dir_size /tmp)
    
    # 清理/tmp
    find /tmp -type f -atime +$TMP_RETENTION_DAYS -delete 2>/dev/null || true
    find /tmp -type d -empty -delete 2>/dev/null || true
    
    # 清理/var/tmp
    find /var/tmp -type f -atime +$TMP_RETENTION_DAYS -delete 2>/dev/null || true
    find /var/tmp -type d -empty -delete 2>/dev/null || true
    
    local after_size=$(get_dir_size /tmp)
    log_success "临时文件清理完成 (清理前: $before_size, 清理后: $after_size)"
}

# 清理缓存
clean_cache() {
    log_info "清理缓存..."
    
    # 清理包管理器缓存
    if command -v apt-get >/dev/null 2>&1; then
        apt-get clean >/dev/null 2>&1 || true
        apt-get autoclean >/dev/null 2>&1 || true
    elif command -v yum >/dev/null 2>&1; then
        yum clean all >/dev/null 2>&1 || true
    fi
    
    # 清理旧内核
    if command -v apt-get >/dev/null 2>&1; then
        dpkg -l 'linux-*' | sed '/^ii/!d;/'"$(uname -r | sed "s/\(.*\)-\([^0-9]\+\)/\1/")"'/d;s/^[^ ]* [^ ]* \([^ ]*\).*/\1/;/[0-9]/!d' | xargs apt-get -y purge >/dev/null 2>&1 || true
    fi
    
    log_success "缓存清理完成"
}

# 清理Docker
clean_docker() {
    if command -v docker >/dev/null 2>&1; then
        log_info "清理Docker..."
        
        # 清理未使用的容器
        docker container prune -f >/dev/null 2>&1 || true
        
        # 清理未使用的镜像
        docker image prune -a -f >/dev/null 2>&1 || true
        
        # 清理未使用的卷
        docker volume prune -f >/dev/null 2>&1 || true
        
        # 清理构建缓存
        docker builder prune -f >/dev/null 2>&1 || true
        
        log_success "Docker清理完成"
    fi
}

# 配置日志轮转
setup_logrotate() {
    if [[ "$ENABLE_LOG_ROTATE" == "true" ]]; then
        log_info "配置日志轮转..."
        
        cat > /etc/logrotate.d/vps-custom <<EOF
/var/log/custom/*.log {
    daily
    rotate $LOG_RETENTION_DAYS
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
EOF
        
        log_success "日志轮转配置完成"
    fi
}

# 显示磁盘使用情况
show_disk_usage() {
    echo ""
    echo "========================================"
    echo "         磁盘使用情况"
    echo "========================================"
    echo ""
    df -h | grep -E "Filesystem|/dev/"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "        日志清理脚本"
    echo "========================================"
    echo ""
    
    check_root
    
    # 显示清理前状态
    show_disk_usage
    
    # 执行清理
    clean_system_logs
    clean_app_logs
    clean_temp_files
    clean_cache
    clean_docker
    setup_logrotate
    
    echo ""
    log_success "清理完成!"
    echo ""
    
    # 显示清理后状态
    show_disk_usage
}

main