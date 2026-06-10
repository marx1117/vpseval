#!/bin/bash

# 自动备份脚本
# 支持: 所有Linux系统
# 功能: 备份指定目录到本地或远程

set -e

# 配置
BACKUP_DIR="/opt/backups"           # 备份存储目录
SOURCE_DIRS="/etc /root /home"      # 要备份的目录
RETENTION_DAYS=7                    # 保留天数
REMOTE_BACKUP=false                 # 是否启用远程备份
REMOTE_HOST=""                      # 远程服务器地址
REMOTE_USER=""                      # 远程用户名
REMOTE_PATH="/backups"              # 远程备份路径

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

# 创建备份目录
create_backup_dir() {
    local date_str=$(date +%Y%m%d_%H%M%S)
    local backup_path="${BACKUP_DIR}/backup_${date_str}"
    
    mkdir -p "$backup_path"
    echo "$backup_path"
}

# 备份目录
backup_directories() {
    local backup_path=$1
    
    log_info "开始备份目录..."
    
    for dir in $SOURCE_DIRS; do
        if [[ -d "$dir" ]]; then
            local dirname=$(basename "$dir")
            log_info "备份 $dir ..."
            
            tar czf "${backup_path}/${dirname}.tar.gz" -C "$(dirname $dir)" "$dirname" 2>/dev/null || {
                log_warning "备份 $dir 失败"
                continue
            }
            
            log_success "$dir 备份完成"
        else
            log_warning "目录 $dir 不存在，跳过"
        fi
    done
}

# 备份数据库
backup_databases() {
    local backup_path=$1
    
    log_info "检查数据库..."
    
    # MySQL/MariaDB
    if command -v mysql >/dev/null 2>&1; then
        log_info "备份MySQL数据库..."
        
        local mysql_backup="${backup_path}/mysql"
        mkdir -p "$mysql_backup"
        
        # 获取所有数据库
        local databases=$(mysql -e "SHOW DATABASES;" 2>/dev/null | grep -v Database | grep -v information_schema | grep -v performance_schema | grep -v mysql | grep -v sys)
        
        for db in $databases; do
            log_info "备份数据库: $db"
            mysqldump "$db" > "${mysql_backup}/${db}.sql" 2>/dev/null || {
                log_warning "备份数据库 $db 失败"
                continue
            }
        done
        
        # 压缩MySQL备份
        if [[ -d "$mysql_backup" ]] && [[ "$(ls -A $mysql_backup)" ]]; then
            tar czf "${backup_path}/mysql.tar.gz" -C "$backup_path" "mysql"
            rm -rf "$mysql_backup"
            log_success "MySQL备份完成"
        fi
    fi
    
    # PostgreSQL
    if command -v psql >/dev/null 2>&1; then
        log_info "备份PostgreSQL数据库..."
        
        local pg_backup="${backup_path}/postgresql"
        mkdir -p "$pg_backup"
        
        local databases=$(su - postgres -c "psql -t -c 'SELECT datname FROM pg_database WHERE datistemplate = false;'" 2>/dev/null)
        
        for db in $databases; do
            log_info "备份数据库: $db"
            su - postgres -c "pg_dump $db" > "${pg_backup}/${db}.sql" 2>/dev/null || {
                log_warning "备份数据库 $db 失败"
                continue
            }
        done
        
        # 压缩PostgreSQL备份
        if [[ -d "$pg_backup" ]] && [[ "$(ls -A $pg_backup)" ]]; then
            tar czf "${backup_path}/postgresql.tar.gz" -C "$backup_path" "postgresql"
            rm -rf "$pg_backup"
            log_success "PostgreSQL备份完成"
        fi
    fi
}

# 创建备份包
create_backup_archive() {
    local backup_path=$1
    local archive_name="$(basename $backup_path).tar.gz"
    
    log_info "创建备份包..."
    
    cd "$(dirname $backup_path)"
    tar czf "$archive_name" "$(basename $backup_path)"
    rm -rf "$backup_path"
    
    local archive_path="$(dirname $backup_path)/$archive_name"
    local archive_size=$(du -h "$archive_path" | cut -f1)
    
    log_success "备份包创建完成: $archive_path ($archive_size)"
    
    echo "$archive_path"
}

# 远程备份
remote_backup() {
    local archive_path=$1
    
    if [[ "$REMOTE_BACKUP" == "true" ]] && [[ -n "$REMOTE_HOST" ]] && [[ -n "$REMOTE_USER" ]]; then
        log_info "上传备份到远程服务器..."
        
        scp "$archive_path" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" 2>/dev/null || {
            log_error "远程备份失败"
            return 1
        }
        
        log_success "远程备份完成"
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理旧备份..."
    
    local deleted_count=$(find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS | wc -l)
    
    find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    log_success "已清理 $deleted_count 个旧备份"
}

# 发送通知
send_notification() {
    local status=$1
    local archive_path=$2
    
    # 这里可以添加邮件、Telegram等通知
    log_info "备份状态: $status"
    
    if [[ -f "$archive_path" ]]; then
        local size=$(du -h "$archive_path" | cut -f1)
        log_info "备份文件: $archive_path ($size)"
    fi
}

# 显示配置信息
show_config() {
    echo ""
    echo "========================================"
    echo "         备份配置"
    echo "========================================"
    echo ""
    echo "备份目录: $BACKUP_DIR"
    echo "备份源: $SOURCE_DIRS"
    echo "保留天数: $RETENTION_DAYS"
    echo "远程备份: $REMOTE_BACKUP"
    if [[ "$REMOTE_BACKUP" == "true" ]]; then
        echo "远程服务器: $REMOTE_HOST"
        echo "远程用户: $REMOTE_USER"
        echo "远程路径: $REMOTE_PATH"
    fi
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo "========================================"
    echo "        自动备份脚本"
    echo "========================================"
    echo ""
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    show_config
    
    local backup_path=$(create_backup_dir)
    
    # 执行备份
    backup_directories "$backup_path"
    backup_databases "$backup_path"
    
    # 创建备份包
    local archive_path=$(create_backup_archive "$backup_path")
    
    # 远程备份
    remote_backup "$archive_path"
    
    # 清理旧备份
    cleanup_old_backups
    
    # 发送通知
    send_notification "成功" "$archive_path"
    
    echo ""
    log_success "备份完成!"
    echo ""
}

# 如果直接运行脚本
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main
fi