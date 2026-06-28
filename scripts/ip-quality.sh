#!/bin/bash

# IP 质量体检脚本
# 支持: 所有 Linux 系统（无需 root 权限）
# 功能: 检测 VPS 的 IP 质量，包括欺诈分数、黑名单状态、流媒体解锁等
# 调用: Check.Place 的 IP 体检脚本
# 脚本地址: bash <(curl -Ls IP.Check.Place)

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
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

# 获取当前 IP 信息
show_ip_info() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         当前 IP 网络信息               ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    # 获取 IPv4
    local ipv4=$(curl -s --connect-timeout 5 -4 https://api.ip.sb/ip 2>/dev/null || curl -s --connect-timeout 5 -4 https://ifconfig.me 2>/dev/null || echo "获取失败")
    echo -e "  ${CYAN}IPv4 地址:${NC} $ipv4"

    # 获取 IPv6
    local ipv6=$(curl -s --connect-timeout 5 -6 https://api.ip.sb/ip 2>/dev/null || echo "")
    if [[ -n "$ipv6" ]]; then
        echo -e "  ${CYAN}IPv6 地址:${NC} $ipv6"
    else
        echo -e "  ${CYAN}IPv6 地址:${NC} ${GRAY}未启用${NC}"
    fi

    # 获取 ASN / 运营商信息
    local asn_info=$(curl -s --connect-timeout 5 -4 https://api.ip.sb/geoip 2>/dev/null | grep -E '"organization"|"isp"|"country"|"city"' | tr -d '",' | sed 's/^[[:space:]]*/    /' || echo "")
    if [[ -n "$asn_info" ]]; then
        echo ""
        echo -e "  ${CYAN}IP 归属信息:${NC}"
        echo "$asn_info"
    fi

    echo ""
}

# 执行 IP 质量检测
run_ip_check() {
    log_info "正在下载并执行 IP 质量检测脚本..."
    log_info "检测源: Check.Place (IP.Check.Place)"
    echo ""
    log_warning "=========================================="
    log_warning "  以下为 Check.Place 的检测界面"
    log_warning "  正在全面检测 IP 质量，请耐心等待..."
    log_warning "=========================================="
    echo ""

    # 执行上游检测脚本，并将输出保存到临时文件
    local temp_output="/tmp/ip-check-output-$$.txt"

    if bash <(curl -Ls IP.Check.Place) 2>&1 | tee "$temp_output"; then
        log_success "IP 质量检测完成"
    else
        log_warning "检测脚本执行完毕（部分检测项可能失败）"
    fi

    echo "$temp_output"
}

# 从检测结果中提取欺诈分数
extract_fraud_score() {
    local output_file=$1
    local score=""

    # 尝试多种可能的输出格式
    if [[ -f "$output_file" ]]; then
        # 查找 fraud score / 欺诈分数 / risk score 等关键词
        score=$(grep -iE "fraud.score|risk.score|欺诈分数|风险分数|scamalytics" "$output_file" 2>/dev/null | head -1 | grep -oE '[0-9]+' | head -1 || echo "")
    fi

    echo "$score"
}

# 从检测结果中提取 Cloudflare 状态
extract_cloudflare_status() {
    local output_file=$1
    local status="未知"

    if [[ -f "$output_file" ]]; then
        if grep -qiE "cloudflare.*challenge|cloudflare.*blocked|cf.*block" "$output_file" 2>/dev/null; then
            status="被拦截"
        elif grep -qiE "cloudflare.*ok|cloudflare.*pass|cf.*ok" "$output_file" 2>/dev/null; then
            status="正常"
        fi
    fi

    echo "$status"
}

# 从检测结果中提取 AWS 状态
extract_aws_status() {
    local output_file=$1
    local status="未知"

    if [[ -f "$output_file" ]]; then
        if grep -qiE "aws.*block|amazon.*block|aws.*ban" "$output_file" 2>/dev/null; then
            status="被拦截"
        elif grep -qiE "aws.*ok|amazon.*ok|aws.*pass" "$output_file" 2>/dev/null; then
            status="正常"
        fi
    fi

    echo "$status"
}

# 解读检测结果
analyze_results() {
    local output_file=$1

    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         检测结果解读                   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    # 提取欺诈分数
    local fraud_score=$(extract_fraud_score "$output_file")

    if [[ -n "$fraud_score" ]]; then
        echo -e "  ${CYAN}欺诈分数:${NC} ${fraud_score}"
        echo ""

        if [[ "$fraud_score" -gt 80 ]]; then
            echo -e "  ${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "  ${RED}  [高风险] 欺诈分数 > 80${NC}"
            echo -e "  ${RED}  建议: 考虑更换服务器或 IP${NC}"
            echo -e "  ${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "  ${YELLOW}说明:${NC}"
            echo "    该 IP 被多个数据库标记为高风险，"
            echo "    可能存在以下问题:"
            echo "      - 被用于垃圾邮件、欺诈活动"
            echo "      - 属于数据中心 IP，被部分服务限制"
            echo "      - 位于高风险地区或 ASN"
            echo ""
        elif [[ "$fraud_score" -ge 50 ]]; then
            echo -e "  ${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "  ${YELLOW}  [中风险] 欺诈分数 50-80${NC}"
            echo -e "  ${YELLOW}  建议: 谨慎使用，关注解锁情况${NC}"
            echo -e "  ${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "  ${YELLOW}说明:${NC}"
            echo "    该 IP 存在一定风险标记，"
            echo "    部分服务可能会限制或拦截此 IP，"
            echo "    建议实际测试流媒体解锁和网站访问情况。"
            echo ""
        else
            echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "  ${GREEN}  [低风险] 欺诈分数 < 50${NC}"
            echo -e "  ${GREEN}  该 IP 质量良好${NC}"
            echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "  ${GREEN}说明:${NC}"
            echo "    该 IP 未被标记为高风险，"
            echo "    适合用于代理、建站等用途。"
            echo ""
        fi
    else
        log_warning "未能从检测结果中提取欺诈分数"
        echo ""
        echo -e "  ${YELLOW}说明:${NC}"
        echo "    上游检测脚本可能未输出欺诈分数，"
        echo "    或输出格式与预期不符。"
        echo "    请查看上方原始检测结果获取详细信息。"
        echo ""
    fi

    # Cloudflare 状态
    local cf_status=$(extract_cloudflare_status "$output_file")
    echo -e "  ${CYAN}Cloudflare 状态:${NC} $cf_status"
    if [[ "$cf_status" == "被拦截" ]]; then
        echo -e "    ${YELLOW}说明: 访问 Cloudflare 保护的网站可能需要验证码${NC}"
    fi
    echo ""

    # AWS 状态
    local aws_status=$(extract_aws_status "$output_file")
    echo -e "  ${CYAN}AWS 状态:${NC} $aws_status"
    if [[ "$aws_status" == "被拦截" ]]; then
        echo -e "    ${YELLOW}说明: 可能无法正常使用 AWS 相关服务${NC}"
    fi
    echo ""
}

# 显示通用结果说明
show_result_guide() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         检测结果含义说明               ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "  ${CYAN}欺诈分数 (Fraud Score):${NC}"
    echo "    由多个 IP 信誉数据库综合评定的风险分数"
    echo "    分数越高，表示该 IP 被标记为恶意的概率越大"
    echo ""

    echo -e "  ${CYAN}Cloudflare 状态:${NC}"
    echo "    检测该 IP 访问 Cloudflare 保护网站时的表现"
    echo "    正常: 可直接访问"
    echo "    被拦截: 可能遇到验证码或 403 错误"
    echo ""

    echo -e "  ${CYAN}AWS 状态:${NC}"
    echo "    检测该 IP 是否被 Amazon AWS 服务限制"
    echo "    被拦截可能影响 AWS 控制台、S3 等服务使用"
    echo ""

    echo -e "  ${CYAN}流媒体解锁:${NC}"
    echo "    检测该 IP 能否解锁各大流媒体平台"
    echo "    包括 Netflix、Disney+、YouTube Premium 等"
    echo "    解锁状态与 IP 所在地区和 ISP 有关"
    echo ""

    echo -e "  ${CYAN}黑名单状态:${NC}"
    echo "    检测该 IP 是否被列入各类黑名单"
    echo "    包括 Spamhaus、Barracuda、AbuseIPDB 等"
    echo "    被列入黑名单可能影响邮件发送和网站访问"
    echo ""

    echo -e "  ${CYAN}IP 类型:${NC}"
    echo "    判断 IP 属于数据中心、住宅、商业或移动网络"
    echo "    住宅 IP 通常解锁能力最好，数据中心 IP 容易被限制"
    echo ""
}

# 显示菜单
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         IP 质量体检脚本                ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "  全面检测 VPS IP 质量，包括:"
    echo "    - 欺诈分数与风险评级"
    echo "    - 黑名单状态"
    echo "    - Cloudflare / AWS 拦截状态"
    echo "    - 流媒体解锁情况"
    echo "    - IP 类型与归属信息"
    echo ""
    echo "  1. 开始 IP 质量检测"
    echo "  2. 查看检测结果含义说明"
    echo "  3. 退出"
    echo ""
    echo -e "${YELLOW}提示: 检测过程会调用 Check.Place 的在线检测服务${NC}"
    echo ""
}

# 主函数
main() {
    show_menu

    while true; do
        read -p "请输入选项 [1-3]: " choice
        case "$choice" in
            1)
                echo ""

                # 检查 curl 是否可用
                if ! command -v curl >/dev/null 2>&1; then
                    log_error "本脚本需要 curl 命令，请先安装 curl"
                    log_info "Ubuntu/Debian: apt install curl"
                    log_info "CentOS/RHEL:  yum install curl"
                    exit 1
                fi

                # 显示当前 IP 信息
                show_ip_info

                # 执行检测
                local output_file=$(run_ip_check)

                # 解读结果
                analyze_results "$output_file"

                # 清理临时文件
                rm -f "$output_file"

                echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo -e "${GREEN}           检测完成${NC}"
                echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo ""
                log_info "提示: IP 质量可能随时间变化，建议定期检测"
                echo ""
                break
                ;;
            2)
                show_result_guide
                show_menu
                ;;
            3)
                log_info "已退出"
                exit 0
                ;;
            *)
                log_warning "无效选项，请输入 1-3"
                ;;
        esac
    done
}

main
