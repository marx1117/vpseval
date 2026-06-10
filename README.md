# 服务器工具箱

> 一套实用的服务器运维脚本合集，帮你快速完成系统初始化、网络优化、安全加固等常见操作，省去翻文档的麻烦。

[![GitHub stars](https://img.shields.io/github/stars/marx1117/vps-toolbox?style=social)](https://github.com/marx1117/vps-toolbox)
[![License](https://img.shields.io/github/license/marx1117/vps-toolbox)](LICENSE)

## 目录

- [快速开始](#快速开始)
- [脚本分类](#脚本分类)
  - [系统初始化](#系统初始化)
  - [网络优化](#网络优化)
  - [安全加固](#安全加固)
  - [代理工具](#代理工具)
  - [监控工具](#监控工具)
  - [实用工具](#实用工具)
- [使用示例](#使用示例)
- [国内镜像加速](#国内镜像加速)
- [免责声明](#免责声明)
- [贡献指南](#贡献指南)
- [开源协议](#开源协议)

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/marx1117/vps-toolbox.git
cd vps-toolbox

# 查看可用脚本
ls scripts/

# 运行脚本（需要 root 权限）
sudo bash scripts/system-init.sh
```

## 脚本分类

### 系统初始化

| 脚本 | 说明 | 支持系统 |
|------|------|----------|
| `system-init.sh` | 系统基础设置和更新 | Ubuntu/Debian/CentOS |
| `swap-setup.sh` | 配置 Swap 交换分区 | 通用 |
| `timezone-setup.sh` | 设置时区为 Asia/Shanghai | 通用 |
| `docker-install.sh` | 安装 Docker 和 Docker Compose | Ubuntu/Debian/CentOS |
| `dd-reinstall.sh` | DD一键重装系统，支持Debian/Ubuntu/CentOS/Alpine/Windows，自动检测国内外线路选择镜像源 | 通用 |
| `warp-install.sh` | Cloudflare WARP安装，为VPS添加IPv4/IPv6出口，支持warp-cli和WireGuard两种模式 | Ubuntu/Debian/CentOS |

### 网络优化

| 脚本 | 说明 | 支持系统 |
|------|------|----------|
| `bbr-enable.sh` | 启用 BBR 拥塞控制算法 | Ubuntu/Debian |
| `speedtest-cli.sh` | 网络速度测试 | 通用 |
| `ping-optimize.sh` | 网络延迟优化 | Ubuntu/Debian |

### 安全加固

| 脚本 | 说明 | 支持系统 |
|------|------|----------|
| `ssh-secure.sh` | SSH 安全加固（禁用 root 登录、修改端口） | 通用 |
| `fail2ban-setup.sh` | Fail2ban防暴力破解，自动配置SSH保护规则，支持自定义封禁策略 | Ubuntu/Debian |
| `ufw-setup.sh` | 配置 UFW 防火墙 | Ubuntu/Debian |
| `ssl-cert.sh` | 自动申请 Let's Encrypt 证书 | 通用 |

### 代理工具

| 脚本 | 说明 | 支持系统 |
|------|------|----------|
| `xray-install.sh` | 安装 Xray 代理服务 | 通用 |
| `shadowsocks-install.sh` | 安装 Shadowsocks 服务 | 通用 |
| `singbox-install.sh` | Sing-box代理安装，支持VLESS/VMess/Trojan/Shadowsocks/Hysteria2等多种协议 | Ubuntu/Debian/CentOS |

### 监控工具

| 脚本 | 说明 | 支持系统 |
|------|------|----------|
| `node-exporter.sh` | 安装 Node Exporter 监控 | 通用 |
| `netdata-install.sh` | 安装 Netdata 实时监控 | Ubuntu/Debian |
| `nezha-agent.sh` | 哪吒监控探针安装，支持多面板、TLS加密 | 通用 |

### 实用工具

| 脚本 | 说明 | 支持系统 |
|------|------|----------|
| `bench.sh` | VPS 性能测试综合脚本 | 通用 |
| `backup-script.sh` | 自动备份脚本 | 通用 |
| `log-clean.sh` | 日志清理脚本 | 通用 |
| `streaming-unlock.sh` | 流媒体解锁检测，检测Netflix/Disney+/YouTube/ChatGPT等13项服务 | 通用 |

## 使用示例

### 系统初始化

```bash
# 下载并运行系统初始化脚本
wget https://raw.githubusercontent.com/marx1117/vps-toolbox/main/scripts/system-init.sh
sudo bash system-init.sh
```

### 启用 BBR 加速

```bash
sudo bash scripts/bbr-enable.sh
```

### 安装 Xray

```bash
sudo bash scripts/xray-install.sh
```

## 国内镜像加速

在国内服务器上使用脚本时，访问 GitHub 和一些国外软件源可能会比较慢。建议提前配置镜像加速：

### GitHub 镜像

```bash
# 使用 ghproxy 代理加速下载
wget https://ghproxy.com/https://raw.githubusercontent.com/marx1117/vps-toolbox/main/scripts/system-init.sh

# 或者使用 gitclone.com
git clone https://gitclone.com/github.com/marx1117/vps-toolbox.git
```

### Docker 镜像源

```bash
# 配置 Docker 国内镜像源（以阿里云为例）
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### pip / npm 镜像

```bash
# pip 使用清华源
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# npm 使用淘宝源
npm config set registry https://registry.npmmirror.com
```

## 免责声明

本仓库提供的脚本仅供学习和研究使用，请遵守当地法律法规。使用脚本造成的任何问题由使用者自行承担。

## 贡献指南

欢迎大家一起完善这个项目！无论是修 Bug、加新脚本，还是改进文档，都非常感谢。

1. Fork 本仓库
2. 创建你的特性分支（`git checkout -b feature/你的新功能`）
3. 提交你的修改（`git commit -m '添加了某个新功能'`）
4. 推送到分支（`git push origin feature/你的新功能`）
5. 打开一个 Pull Request

提交前请注意：
- 脚本请在主流 Linux 发行版上测试通过
- 添加必要的注释说明
- 如果是新脚本，请在 README 中补充对应说明

## 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 致谢

感谢以下开源项目和工具：
- [Xray-core](https://github.com/XTLS/Xray-core)
- [Shadowsocks-libev](https://github.com/shadowsocks/shadowsocks-libev)
- [BBR](https://github.com/google/bbr)

---

如果这个项目对你有帮助，欢迎点个 Star！
