#!/bin/bash

# 流媒体解锁检测脚本
# 支持: 所有Linux系统（无需root权限）
# 功能: 检测VPS的流媒体服务解锁情况及AI服务可用性
# 检测项目: Netflix、Disney+、YouTube Premium、HBO Max、Amazon Prime、TikTok、ChatGPT等
# 使用curl进行检测，无需安装额外依赖

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 检测结果状态
STATUS_UNLOCKED="unlocked"
STATUS_PARTIAL="partial"
STATUS_LOCKED="locked"
STATUS_NA="na"

# 结果计数
total_tests=0
unlocked_count=0
partial_count=0
locked_count=0
na_count=0

# 检测结果存储
declare -A results

# 显示状态标签
show_status() {
    local status=$1
    local name=$2
    local detail=$3

    case "$status" in
        "$STATUS_UNLOCKED")
            echo -e "  ${GREEN}[已解锁]${NC} ${name} - ${detail}"
            ;;
        "$STATUS_PARTIAL")
            echo -e "  ${YELLOW}[部分解锁]${NC} ${name} - ${detail}"
            ;;
        "$STATUS_LOCKED")
            echo -e "  ${RED}[未解锁]${NC} ${name} - ${detail}"
            ;;
        "$STATUS_NA")
            echo -e "  ${GRAY}[不支持]${NC} ${name} - ${detail}"
            ;;
    esac
}

# 更新计数
update_count() {
    local status=$1
    ((total_tests++)) || true
    case "$status" in
        "$STATUS_UNLOCKED") ((unlocked_count++)) || true ;;
        "$STATUS_PARTIAL") ((partial_count++)) || true ;;
        "$STATUS_LOCKED") ((locked_count++)) || true ;;
        "$STATUS_NA") ((na_count++)) || true ;;
    esac
}

# 显示检测进度
show_progress() {
    local current=$1
    local total=$2
    local name=$3
    local percent=$((current * 100 / total))
    local filled=$((percent / 5))
    local empty=$((20 - filled))

    local bar=""
    for ((i=0; i<filled; i++)); do bar+="█"; done
    for ((i=0; i<empty; i++)); do bar+="░"; done

    printf "\r  ${BLUE}[检测中]${NC} [%s] %d/%d - %s" "$bar" "$current" "$total" "$name"
}

# ============ 流媒体检测函数 ============

# 检测 Netflix
check_netflix() {
    local name="Netflix"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}" \
        "https://www.netflix.com/title/80018499" 2>/dev/null) || true

    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | head -n -1)

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 Netflix"
    elif [[ "$http_code" == "200" ]]; then
        # 检查页面内容判断是否解锁
        if echo "$body" | grep -qi "watch\|player\|shakti"; then
            # 进一步检查是否为自制剧区域
            local region_response=$(curl -s --connect-timeout 10 -m 15 \
                -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
                -w "\n%{http_code}" \
                "https://www.netflix.com/title/70143836" 2>/dev/null) || true
            local region_code=$(echo "$region_response" | tail -1)

            if [[ "$region_code" == "200" ]]; then
                status="$STATUS_UNLOCKED"
                detail="完整解锁（含自制剧）"
            else
                status="$STATUS_PARTIAL"
                detail="仅解锁自制剧"
            fi
        elif echo "$body" | grep -qi "Not Available\|unavailable\|blocked"; then
            status="$STATUS_LOCKED"
            detail="该地区不可用"
        else
            status="$STATUS_LOCKED"
            detail="未解锁"
        fi
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 Disney+
check_disney() {
    local name="Disney+"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}\n%{redirect_url}" \
        "https://www.disneyplus.com" 2>/dev/null) || true

    local http_code=$(echo "$response" | sed -n '1p')
    local redirect_url=$(echo "$response" | sed -n '2p')

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 Disney+"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    elif [[ "$http_code" == "302" || "$http_code" == "301" ]]; then
        if echo "$redirect_url" | grep -qi "unavailable\|blocked\|restrict"; then
            status="$STATUS_LOCKED"
            detail="该地区不可用"
        else
            status="$STATUS_PARTIAL"
            detail="可能部分解锁"
        fi
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 YouTube Premium
check_youtube_premium() {
    local name="YouTube Premium"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}" \
        "https://www.youtube.com/premium" 2>/dev/null) || true

    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | head -n -1)

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 YouTube"
    elif [[ "$http_code" == "200" ]]; then
        if echo "$body" | grep -qi "Premium is not available\|not available in your country\|不在"; then
            status="$STATUS_LOCKED"
            detail="该地区不支持 Premium"
        elif echo "$body" | grep -qi "premium\|Subscribe\|free.trial"; then
            status="$STATUS_UNLOCKED"
            detail="已解锁"
        else
            status="$STATUS_PARTIAL"
            detail="可能已解锁（需进一步确认）"
        fi
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 HBO Max
check_hbo_max() {
    local name="HBO Max"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}\n%{redirect_url}" \
        "https://play.hbomax.com" 2>/dev/null) || true

    local http_code=$(echo "$response" | sed -n '1p')
    local redirect_url=$(echo "$response" | sed -n '2p')

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 HBO Max"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    elif [[ "$http_code" == "302" || "$http_code" == "301" ]]; then
        if echo "$redirect_url" | grep -qi "geo\|block\|unavailable\|country"; then
            status="$STATUS_LOCKED"
            detail="该地区不可用"
        else
            status="$STATUS_PARTIAL"
            detail="可能部分解锁"
        fi
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 Amazon Prime Video
check_amazon_prime() {
    local name="Amazon Prime Video"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}" \
        "https://www.primevideo.com" 2>/dev/null) || true

    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | head -n -1)

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 Amazon Prime Video"
    elif [[ "$http_code" == "200" ]]; then
        if echo "$body" | grep -qi "unavailable\|not available in\|geoblock\|geo-restriction"; then
            status="$STATUS_LOCKED"
            detail="该地区不可用"
        elif echo "$body" | grep -qi "prime\|video\|watch\|sign.in"; then
            status="$STATUS_UNLOCKED"
            detail="已解锁"
        else
            status="$STATUS_PARTIAL"
            detail="可能已解锁（需进一步确认）"
        fi
    elif [[ "$http_code" == "503" || "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (HTTP $http_code)"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 TikTok
check_tiktok() {
    local name="TikTok"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" \
        -w "\n%{http_code}\n%{redirect_url}" \
        "https://www.tiktok.com" 2>/dev/null) || true

    local http_code=$(echo "$response" | sed -n '1p')
    local redirect_url=$(echo "$response" | sed -n '2p')

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 TikTok"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    elif [[ "$http_code" == "302" || "$http_code" == "301" ]]; then
        if echo "$redirect_url" | grep -qi "unavailable\|block\|restrict"; then
            status="$STATUS_LOCKED"
            detail="该地区不可用"
        else
            status="$STATUS_PARTIAL"
            detail="可能部分解锁"
        fi
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# ============ AI 服务检测函数 ============

# 检测 ChatGPT
check_chatgpt() {
    local name="ChatGPT"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}\n%{redirect_url}" \
        "https://chat.openai.com" 2>/dev/null) || true

    local http_code=$(echo "$response" | sed -n '1p')
    local redirect_url=$(echo "$response" | sed -n '2p')

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 ChatGPT"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    elif [[ "$http_code" == "302" || "$http_code" == "301" ]]; then
        if echo "$redirect_url" | grep -qi "blocked\|unsupported\|country"; then
            status="$STATUS_LOCKED"
            detail="该地区不可用"
        else
            status="$STATUS_PARTIAL"
            detail="可能可用（需进一步确认）"
        fi
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    elif [[ "$http_code" == "429" ]]; then
        # 429 表示可以连接但请求过多，说明服务可用
        status="$STATUS_UNLOCKED"
        detail="已解锁（请求频率限制）"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 Claude
check_claude() {
    local name="Claude"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}" \
        "https://claude.ai" 2>/dev/null) || true

    local http_code=$(echo "$response" | tail -1)

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 Claude"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    elif [[ "$http_code" == "429" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁（请求频率限制）"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 Copilot
check_copilot() {
    local name="Copilot"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}" \
        "https://copilot.microsoft.com" 2>/dev/null) || true

    local http_code=$(echo "$response" | tail -1)

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 Copilot"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# ============ 其他流媒体检测 ============

# 检测 Spotify
check_spotify() {
    local name="Spotify"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}" \
        "https://open.spotify.com" 2>/dev/null) || true

    local http_code=$(echo "$response" | tail -1)

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 Spotify"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 DAZN
check_dazn() {
    local name="DAZN"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}" \
        "https://www.dazn.com" 2>/dev/null) || true

    local http_code=$(echo "$response" | tail -1)

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 DAZN"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 YouTube（基础连通性）
check_youtube() {
    local name="YouTube"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}" \
        "https://www.youtube.com" 2>/dev/null) || true

    local http_code=$(echo "$response" | tail -1)

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 YouTube"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# 检测 Twitch
check_twitch() {
    local name="Twitch"
    show_progress $((++current_test)) "$total_services" "$name"

    local response=$(curl -s --connect-timeout 10 -m 15 \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
        -w "\n%{http_code}" \
        "https://www.twitch.tv" 2>/dev/null) || true

    local http_code=$(echo "$response" | tail -1)

    local status="$STATUS_LOCKED"
    local detail=""

    if [[ -z "$http_code" ]]; then
        status="$STATUS_NA"
        detail="无法连接到 Twitch"
    elif [[ "$http_code" == "200" ]]; then
        status="$STATUS_UNLOCKED"
        detail="已解锁"
    elif [[ "$http_code" == "403" ]]; then
        status="$STATUS_LOCKED"
        detail="被封锁 (403)"
    else
        status="$STATUS_NA"
        detail="连接异常 (HTTP $http_code)"
    fi

    echo ""
    show_status "$status" "$name" "$detail"
    results["$name"]="$status"
    update_count "$status"
}

# ============ 汇总报告 ============

# 显示汇总报告
show_summary() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           检测结果汇总                  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    # 流媒体结果
    echo -e "${YELLOW}流媒体服务:${NC}"
    for svc in Netflix "Disney+" "YouTube Premium" "HBO Max" "Amazon Prime Video" YouTube Twitch Spotify DAZN TikTok; do
        if [[ -n "${results[$svc]}" ]]; then
            case "${results[$svc]}" in
                "$STATUS_UNLOCKED") echo -e "  ${GREEN}✓${NC} $svc" ;;
                "$STATUS_PARTIAL")  echo -e "  ${YELLOW}◐${NC} $svc" ;;
                "$STATUS_LOCKED")   echo -e "  ${RED}✗${NC} $svc" ;;
                "$STATUS_NA")       echo -e "  ${GRAY}-${NC} $svc" ;;
            esac
        fi
    done

    echo ""

    # AI 服务结果
    echo -e "${YELLOW}AI 服务:${NC}"
    for svc in ChatGPT Claude Copilot; do
        if [[ -n "${results[$svc]}" ]]; then
            case "${results[$svc]}" in
                "$STATUS_UNLOCKED") echo -e "  ${GREEN}✓${NC} $svc" ;;
                "$STATUS_PARTIAL")  echo -e "  ${YELLOW}◐${NC} $svc" ;;
                "$STATUS_LOCKED")   echo -e "  ${RED}✗${NC} $svc" ;;
                "$STATUS_NA")       echo -e "  ${GRAY}-${NC} $svc" ;;
            esac
        fi
    done

    echo ""
    echo -e "${YELLOW}统计信息:${NC}"
    echo -e "  ${GREEN}已解锁:${NC}     $unlocked_count"
    echo -e "  ${YELLOW}部分解锁:${NC}   $partial_count"
    echo -e "  ${RED}未解锁:${NC}     $locked_count"
    echo -e "  ${GRAY}不支持:${NC}     $na_count"
    echo -e "  ${BLUE}总计:${NC}       $total_tests"
    echo ""
}

# 获取服务器IP信息
show_ip_info() {
    echo -e "${YELLOW}服务器网络信息:${NC}"

    # 获取IPv4
    local ipv4=$(curl -s --connect-timeout 5 -4 https://api.ip.sb/ip 2>/dev/null || curl -s --connect-timeout 5 -4 https://ifconfig.me 2>/dev/null || echo "获取失败")
    echo -e "  IPv4: $ipv4"

    # 获取IPv6
    local ipv6=$(curl -s --connect-timeout 5 -6 https://api.ip.sb/ip 2>/dev/null || echo "未启用")
    if [[ "$ipv6" == "未启用" ]]; then
        echo -e "  IPv6: ${GRAY}未启用${NC}"
    else
        echo -e "  IPv6: $ipv6"
    fi

    echo ""
}

# 主函数
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       流媒体解锁检测脚本               ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    # 检查curl是否可用
    if ! command -v curl >/dev/null 2>&1; then
        log_error "本脚本需要 curl 命令，请先安装 curl"
        log_info "Ubuntu/Debian: apt install curl"
        log_info "CentOS/RHEL: yum install curl"
        exit 1
    fi

    # 显示IP信息
    show_ip_info

    # 设置总检测数
    total_services=13
    current_test=0

    log_info "开始检测流媒体和AI服务解锁情况..."
    echo ""

    # 流媒体检测
    echo -e "${YELLOW}━━━ 流媒体服务检测 ━━━${NC}"
    echo ""
    check_netflix
    check_disney
    check_youtube_premium
    check_hbo_max
    check_amazon_prime
    check_youtube
    check_twitch
    check_spotify
    check_dazn
    check_tiktok

    echo ""
    echo -e "${YELLOW}━━━ AI 服务检测 ━━━${NC}"
    echo ""
    check_chatgpt
    check_claude
    check_copilot

    # 显示汇总
    show_summary

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}           检测完成${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    log_info "提示: 解锁状态可能会随时间变化，建议定期检测"
    echo ""
}

main
