export interface Article {
  slug: string;
  title: string;
  category: string;
  level: string;
  time: string;
  summary: string;
  content: string;
}

export const articles: Article[] = [
  // ============================================================
  // 一、行业认知（3篇）
  // ============================================================
  {
    slug: 'vps-history',
    title: 'VPS 发展简史：从物理服务器到云原生的技术演进',
    category: '行业认知',
    level: '入门',
    time: '8 min',
    summary: '了解 VPS 这个行业是怎么来的、经历了哪些技术拐点，帮助理解当下的市场格局。',
    content: `
<p>要理解今天的 VPS 市场为什么长这样，得先知道它是怎么一步步走过来的。整个服务器产业的演进，大致可以分成四个阶段。</p>

<h2>第一阶段：物理服务器时代（1990s-2001）</h2>
<p>互联网早期，网站都跑在物理服务器上。一台机器一个用途，CPU 大部分时间在空转，但老板得为一整台机器付钱。这个阶段的核心矛盾是<strong>资源利用率极低</strong>——典型服务器的 CPU 利用率不到 15%。</p>
<p>主机托管（Colocation）是这个阶段的产物：你自己买服务器，拉到 IDC 机房，付机柜费和带宽费。至今仍有人这么干，但运维成本太高了。</p>

<h2>第二阶段：虚拟化破局（2001-2006）</h2>
<p>2001 年，一家叫 Virtuozzo 的公司发布了操作系统级虚拟化软件 VE，允许在一台物理机上跑多个隔离的 Linux 环境。这就是 VPS 的雏形。</p>
<p>同期的技术路线还有两条：</p>
<ul>
  <li><strong>OpenVZ</strong>（Virtuozzo 开源版）：容器式虚拟化，共享内核，轻量但隔离弱</li>
  <li><strong>Xen</strong>（2003 年剑桥大学）：半虚拟化，需要修改 Guest OS 内核，性能接近裸机</li>
</ul>
<p>这个阶段诞生了最早的 VPS 主机商，价格从每月 $20-50 不等，主要客户是开发者和技术爱好者。</p>

<h2>第三阶段：KVM 一统江湖（2007-2015）</h2>
<p>2007 年，KVM（Kernel-based Virtual Machine）被合并到 Linux 内核主线。这是一个转折点：KVM 利用 Intel VT-x / AMD-V 硬件虚拟化扩展，实现了<strong>全虚拟化</strong>——Guest OS 不需要任何修改。</p>
<p>2010 年后，几个关键事件重塑了市场：</p>
<ul>
  <li>SolusVM / Virtualizor 等面板让 VPS 开通自动化</li>
  <li>SSD 价格跳水，VPS 普遍标配 SSD</li>
  <li>低价商家涌入（年付 $10-20 的 VPS 开始出现）</li>
  <li>DigitalOcean（2011）和 Vultr（2014）把"按小时计费"变成标配</li>
</ul>

<h2>第四阶段：云计算与容器化（2016-至今）</h2>
<p>2016 年之后，"VPS"的概念开始跟"云服务器"融合。AWS Lightsail、阿里云 ECS、腾讯云 Lighthouse 本质就是包装过的 VPS。真正的技术变革包括：</p>
<ul>
  <li><strong>NVMe 普及</strong>：IOPS 从 SATA SSD 的万级跳到数十万级</li>
  <li><strong>ARM 入场</strong>：Oracle Cloud 免费机用的 Ampere Altra，单核性能追平 x86</li>
  <li><strong>KVM 虚拟化的极致优化</strong>：virtio 驱动让网络/磁盘开销降到 3% 以内</li>
  <li><strong>Docker/K8s 催生"不可变基础设施"理念</strong></li>
</ul>

<h2>对中国用户的影响</h2>
<p>中国用户经历的 VPS 演进跟全球基本同步，但多了一层"线路"维度。2015 年之前，海外 VPS 到中国的连接质量普遍很差（163 骨干网拥塞）。CN2 GIA 的商用化（2016 前后）和搬瓦工等商家的推广，让"精品线路 VPS"成为独立品类。2020 年后，AS9929（联通精品）和 CMIN2（移动精品）相继商用，三网精品线路格局基本成型。</p>

<h2>关键启示</h2>
<p>理解这段历史，你就知道为什么：</p>
<ul>
  <li>KVM 是今天 VPS 的绝对主流（全虚拟化 + 内核主线 + 性能好）</li>
  <li>OpenVZ 的廉价 VPS 要小心（超售严重，内核无法升级）</li>
  <li>线路对国内用户的重要性不亚于硬件配置</li>
</ul>`,
  },
  {
    slug: 'x86-vs-arm',
    title: 'x86 vs ARM 架构：VPS 两种"芯"怎么选？',
    category: '行业认知',
    level: '入门',
    time: '6 min',
    summary: 'ARM 服务器越来越多出现在 VPS 市场。x86 和 ARM 到底有什么区别？买 VPS 时该怎么选？',
    content: `
<p>过去，VPS 清一色用 Intel/AMD 的 x86 处理器。但近两年 ARM 架构的 VPS 越来越多——Oracle Cloud 免费机、Hetzner 的 ARM 实例、AWS Graviton 系列都是 ARM。两种架构到底哪个更适合你？</p>

<h2>CPU 架构的本质区别</h2>
<table>
  <tr><th></th><th>x86 (Intel/AMD)</th><th>ARM (Ampere/Graviton/鲲鹏)</th></tr>
  <tr><td>指令集</td><td>CISC（复杂指令集）</td><td>RISC（精简指令集）</td></tr>
  <tr><td>设计哲学</td><td>向后兼容，指令多而复杂</td><td>精简高效，固定长度指令</td></tr>
  <tr><td>功耗</td><td>偏高（桌面/服务器优化）</td><td>偏低（移动端优化基因）</td></tr>
  <tr><td>单核性能</td><td>强（高频 + 大缓存）</td><td>接近但仍有差距</td></tr>
  <tr><td>多核扩展</td><td>中规中矩</td><td>优势明显（核心数可以更多）</td></tr>
</table>

<h2>在 VPS 场景下的实际表现</h2>
<ul>
  <li><strong>Web 服务（Nginx/Apache）</strong>：ARM 表现优秀，多核优势显著，单核也完全够用</li>
  <li><strong>数据库（MySQL/PostgreSQL）</strong>：x86 单核优势体现，但 ARM 核多可以并行查询补偿</li>
  <li><strong>编译/构建</strong>：x86 单核编译更快，ARM 多核并行编译有时更快</li>
  <li><strong>Docker</strong>：大部分官方镜像同时提供 x86 和 ARM 版本，兼容性不是问题</li>
  <li><strong>代理/Xray</strong>：性能差异可以忽略，完全够用</li>
</ul>

<h2>ARM VPS 的核心优势</h2>
<p>价格便宜。Oracle Cloud 免费 ARM 实例给到 4 核 24GB——这在 x86 世界是不可想象的。ARM 芯片制造成本低，主机商给 ARM 实例定价通常比同配置 x86 便宜 20-40%。</p>

<h2>ARM VPS 需要注意的地方</h2>
<ul>
  <li><strong>部分软件不提供 ARM 二进制</strong>：虽然越来越少，但有些小众软件只发 x86 版本。大部分可以通过 Docker 解决</li>
  <li><strong>不要比较 GHz 的绝对值</strong>：ARM 的 2.8GHz 跟 x86 的 2.8GHz 不是一回事，看实际跑分</li>
  <li><strong>Oracle ARM 有隐形限制</strong>：免费实例每月 10TB 出站流量，超出收费不低</li>
</ul>

<h2>决策建议</h2>
<ul>
  <li><strong>跑 Web/代理/Docker → ARM 完全够用</strong>，便宜是王道</li>
  <li><strong>跑编译/密集计算 → 选 x86</strong>，单核性能更重要</li>
  <li><strong>依赖特定 x86 软件 → 别纠结，x86</strong></li>
  <li><strong>Oracle 免费 ARM → 只要能申请到，先占坑再说</strong></li>
</ul>`,
  },
  {
    slug: 'vps-trends-2026',
    title: '2026 VPS 行业趋势：IPv6 纯栈、绿色数据中心、AI 融合',
    category: '行业认知',
    level: '进阶',
    time: '6 min',
    summary: '了解 2026 年 VPS 行业正在发生的三大变革，帮助你做更长远的选型决策。',
    content: `
<p>2026 年 VPS 行业正在经历三个结构性变化。这些变化现在只是开端，但未来 2-3 年会彻底影响你买 VPS 的方式。</p>

<h2>趋势一：IPv6 纯栈 VPS 兴起</h2>
<p>IPv4 地址已经彻底枯竭。一个 IPv4 地址的二手市场价在 $30-50，主机商光 IP 成本就很难受。于是出现了 <strong>IPv6-only VPS</strong>：只给 IPv6 地址，通过 Cloudflare 等 CDN 代理实现 IPv4 访问。</p>
<ul>
  <li>代表商家：BuyVM（$2/月的 VPS 可选 IPv6-only 或加 $3/月买 IPv4）</li>
  <li>优势：价格极低，1/3 的 IPv4 VPS 价格</li>
  <li>代价：需要 Cloudflare 代理，直连 IPv4 用户访问不了</li>
  <li>适合：套了 CDN 的网站、纯代理节点、后端服务</li>
</ul>

<h2>趋势二：绿色数据中心成为卖点</h2>
<p>欧盟新规要求数据中心披露 PUE（能源使用效率），头部主机商开始把"碳中和"当成营销点。对用户的实际影响：</p>
<ul>
  <li>北欧机房越来越受欢迎（免费自然冷却，PUE 低至 1.1）</li>
  <li>部分商家开始用 PUE 作为差异化（Hetzner 芬兰机房、GreenCloud 的"绿色"品牌）</li>
  <li>趋势本身不影响 VPS 性能，但可能影响机房选址——冰岛和挪威的数据中心在增多</li>
</ul>

<h2>趋势三：AI 推理走向 VPS</h2>
<p>大模型本地部署以前是"有 GPU 才能玩"，但现在：</p>
<ul>
  <li>Ollama 支持 CPU 推理（Q4 量化模型在普通 VPS 上也能跑）</li>
  <li>轻量模型（1.5B-4B）在 2 核 4G 的 VPS 上可达到可用速度</li>
  <li>GPU VPS 的供应在增加（Vultr、Latitude.sh 提供 A100/H100 实例）</li>
  <li>边缘推理成为新场景：在 VPS 上跑一个小模型做个人助手</li>
</ul>

<h2>其他值得关注的趋势</h2>
<ul>
  <li><strong>KVM 虚拟化已经一统天下</strong>：OpenVZ 和 Xen 基本退出主流市场</li>
  <li><strong>AMD EPYC 取代 Intel Xeon</strong>：新一代 VPS 母机越来越多用 EPYC（核多、便宜、功耗低）</li>
  <li><strong>Pay-as-you-go 模式下沉</strong>：按小时计费从高端云厂商扩展到中小 VPS 商</li>
</ul>

<h2>对选机的实际影响</h2>
<ul>
  <li>如果你不依赖 IPv4 直连，IPv6-only VPS 能省一半钱</li>
  <li>ARM + AMD EPYC 是未来 3 年 VPS 的主流 CPU</li>
  <li>AI 部署会成为 VPS 的新刚需场景，2 核 4G 会成为"AI 入门配置"</li>
</ul>`,
  },

  // ============================================================
  // 二、新手入门（8篇）
  // ============================================================
  {
    slug: 'what-is-vps',
    title: '什么是 VPS？一文讲透虚拟化原理',
    category: '新手入门',
    level: '入门',
    time: '7 min',
    summary: '从零理解 VPS：物理服务器怎么变成多个"虚拟服务器"，KVM 和 OpenVZ 到底有什么区别。',
    content: `
<p>VPS 的全称是 Virtual Private Server（虚拟专用服务器）。简单说：<strong>一台物理服务器被软件切成了多个"小服务器"，每个小服务器看起来、用起来都像一台独立的机器</strong>。</p>

<h2>一个比喻：公寓楼 vs 独栋别墅</h2>
<ul>
  <li><strong>独栋别墅 = 物理独立服务器</strong>：整块地都是你的，想怎么盖就怎么盖。贵，但没人跟你抢资源。</li>
  <li><strong>公寓楼 = VPS</strong>：一栋楼隔成多个单元，每家有自己的门锁、水电表。邻居开派对可能吵到你，但大部分时间互不影响。</li>
  <li><strong>青年旅舍床位 = 虚拟主机（Shared Hosting）</strong>：很多人共用一间房，资源混在一起，一个室友打呼噜全屋受影响。</li>
</ul>

<h2>虚拟化是怎么做到的？</h2>
<p>核心技术叫 <strong>Hypervisor</strong>（虚拟机监视器），它跑在物理服务器上，负责把物理资源（CPU、内存、硬盘、网卡）分配给各个虚拟机。</p>

<p><strong>KVM（Kernel-based Virtual Machine）</strong>是今天最常见的方案：</p>
<ul>
  <li>内置于 Linux 内核，不需要额外授权费</li>
  <li>利用 Intel VT-x / AMD-V 硬件加速，性能损耗 < 5%</li>
  <li>每个 VPS 有自己完整的内核，可以装任何操作系统</li>
  <li>资源隔离严格——隔壁 VPS 跑满 CPU 不会影响你</li>
</ul>

<p><strong>OpenVZ</strong>是另一种方案（正在被淘汰）：</p>
<ul>
  <li>共享宿主机内核，本质上是个容器</li>
  <li>开销更低，但隔离性差——商家可以严重超售</li>
  <li>不能装 Windows，内核模块受限（比如没法装 WireGuard）</li>
</ul>

<h2>买 VPS 时，你实际拿到什么？</h2>
<ul>
  <li>一个 root 账号（最高权限）</li>
  <li>独享的 CPU 核心（或 vCPU 时间片）</li>
  <li>独享的内存（标多少就是多少，不会被抢）</li>
  <li>一块虚拟硬盘（SSD 或 NVMe）</li>
  <li>至少一个公网 IPv4/IPv6 地址</li>
  <li>可以自由重装系统、装任何软件</li>
</ul>

<h2>为什么叫"虚拟专用服务器"而不是"虚拟机"？</h2>
<p>VPS 强调"专用"两个字。虚拟机的概念更泛，可以指你本地 VirtualBox 里跑的测试环境。VPS 特指由主机商提供、7×24 在线、有公网 IP、面向生产环境使用的虚拟机。</p>`,
  },
  {
    slug: 'vps-vs-shared-vs-dedicated',
    title: 'VPS vs 虚拟主机 vs 独立服务器 vs 云服务器',
    category: '新手入门',
    level: '入门',
    time: '5 min',
    summary: '四种主流托管方案的价格、性能、自由度全面对比，帮你找到最适合的方案。',
    content: `
<p>很多人建站的第一道选择题就是"我该买什么？"四个选项摆面前，价格差十倍，到底哪个适合你？</p>

<h2>四种方案速览</h2>
<table>
  <tr><th></th><th>虚拟主机</th><th>VPS</th><th>云服务器</th><th>独立服务器</th></tr>
  <tr><td>月费</td><td>¥5-50</td><td>¥15-400</td><td>¥30-5000+</td><td>¥300-5000+</td></tr>
  <tr><td>Root 权限</td><td>❌</td><td>✅</td><td>✅</td><td>✅</td></tr>
  <tr><td>资源独享</td><td>❌ 共享</td><td>✅</td><td>✅</td><td>✅</td></tr>
  <tr><td>弹性扩容</td><td>❌</td><td>有限</td><td>✅</td><td>❌</td></tr>
  <tr><td>性能天花板</td><td>低</td><td>中</td><td>高</td><td>极高</td></tr>
  <tr><td>运维门槛</td><td>零</td><td>中</td><td>中高</td><td>高</td></tr>
</table>

<h2>虚拟主机 — 绝对新手的第一站</h2>
<p>适合：纯展示网站、WordPress 博客、日均 PV < 1000。</p>
<ul>
  <li>商家帮你管好一切（Apache/Nginx、PHP、MySQL），你只要上传文件</li>
  <li>没法装自定义软件、不能跑代理</li>
  <li>同服务器上的其他网站出问题会牵连你</li>
</ul>

<h2>VPS — 技术用户的性价比之选</h2>
<p>适合：个人博客/企业站、代理/梯子、Docker 实验、学习 Linux。本站（机鉴）推荐的主力方案。</p>
<ul>
  <li>完全控制权：从内核版本到防火墙规则，你说了算</li>
  <li>价格跨度大：年付 $10 的备用机到月付 $50 的精品线路机都有</li>
  <li>需要基本的 Linux 技能（但 1Panel 面板可以让你不敲命令也能用）</li>
</ul>

<h2>云服务器 — 生产环境的标配</h2>
<p>适合：商业项目、高流量网站、需要自动扩容的业务。</p>
<ul>
  <li>本质也是 VPS，但多了弹性伸缩、负载均衡、自动备份等企业特性</li>
  <li>国内云（阿里云/腾讯云）需要 ICP 备案</li>
  <li>按量付费，用多少付多少</li>
</ul>

<h2>独立服务器 — 预算够就上</h2>
<p>适合：高并发网站、游戏服务器、大规模数据处理。</p>
<ul>
  <li>整台物理机器都是你的，没有邻居，没有超售</li>
  <li>月费 $30 起步，加上带宽费可能上百美元</li>
  <li>硬件出问题要等机房换件，没有 VPS 的快照/迁移方便</li>
</ul>

<h2>决策树</h2>
<ul>
  <li>只建站、不会 Linux → 虚拟主机</li>
  <li>学技术、搭梯子、Docker 实验 → <strong>VPS（本站主推）</strong></li>
  <li>商业项目、需要备案 → 国内云服务器</li>
  <li>日均万级以上流量 → 独立服务器或云服务器集群</li>
</ul>`,
  },
  {
    slug: 'vps-glossary',
    title: 'VPS 核心术语百科：50 个必知名词速查',
    category: '新手入门',
    level: '入门',
    time: '10 min',
    summary: '从 CN2 GIA 到 QoS，从 Anycast 到 BBR——VPS 圈最常用的 50 个术语，一文扫盲。',
    content: `
<p>VPS 圈子有自己的"黑话"。以下 50 个术语按类别整理，覆盖选购、线路、运维三大场景。</p>

<h2>🖥️ 基础概念</h2>
<dl>
  <dt><strong>VPS</strong> (Virtual Private Server)</dt>
  <dd>虚拟专用服务器。一台物理机切成多台虚拟机，每台独立运行。</dd>
  <dt><strong>Hypervisor</strong></dt>
  <dd>虚拟机管理器。KVM、Xen、VMware ESXi 都是 Hypervisor。</dd>
  <dt><strong>KVM</strong></dt>
  <dd>基于 Linux 内核的虚拟化技术，全虚拟化，Google 和 AWS 都在用。是现在 VPS 主流方案。</dd>
  <dt><strong>OpenVZ</strong></dt>
  <dd>容器式虚拟化，共享宿主机内核。便宜但隔离差，正在被淘汰。</dd>
  <dt><strong>vCPU</strong></dt>
  <dd>虚拟 CPU 核心。1 vCPU 通常对应物理 CPU 的一个线程/分片。</dd>
  <dt><strong>NVMe</strong></dt>
  <dd>新一代 SSD 接口协议，IOPS 是 SATA SSD 的 3-5 倍。当下 VPS 的标配。</dd>
  <dt><strong>IOPS</strong></dt>
  <dd>每秒输入输出操作数，衡量磁盘性能。NVMe SSD 轻松 50 万+ IOPS。</dd>
</dl>

<h2>🌐 网络与线路（中国用户重点）</h2>
<dl>
  <dt><strong>CN2 GIA</strong></dt>
  <dd>中国电信顶级精品线路，AS 号 4809，核心路由器 IP 以 59.43 开头。延迟最低、最稳定、最贵。</dd>
  <dt><strong>CN2 GT</strong></dt>
  <dd>中国电信次顶级线路，IP 以 202.97 开头。比 GIA 便宜但高峰期有拥堵风险。</dd>
  <dt><strong>163 骨干网</strong></dt>
  <dd>中国电信普通线路，承载了大多数普通 VPS 的回国流量。高峰期严重拥堵。</dd>
  <dt><strong>AS9929</strong></dt>
  <dd>中国联通精品线路，对应 CN2 GIA 的联通版。</dd>
  <dt><strong>CMIN2</strong></dt>
  <dd>中国移动精品线路，IP 以 223.120 开头。</dd>
  <dt><strong>BGP</strong> (Border Gateway Protocol)</dt>
  <dd>边界网关协议。多线 BGP 指一个 IP 同时接入多条运营商线路，自动选最优路径。</dd>
  <dt><strong>Anycast</strong></dt>
  <dd>任播技术。同一个 IP 在全球多个节点同时宣告，用户自动连接到最近的节点。Cloudflare 的核心技术。</dd>
  <dt><strong>回程路由</strong></dt>
  <dd>从 VPS 返回中国用户的数据走的路径。用 nexttrace 可以看回程经过哪些路由节点。</dd>
  <dt><strong>QoS</strong> (Quality of Service)</dt>
  <dd>服务质量等级。精品线路的 QoS 高——数据中心给它们的带宽优先级高，拥堵时不丢包。</dd>
  <dt><strong>原生 IP</strong></dt>
  <dd>IP 的实际地理位置跟注册地一致。流媒体解锁通常需要原生 IP。</dd>
  <dt><strong>广播 IP</strong></dt>
  <dd>IP 注册在一个国家，但通过 BGP 在另一个国家宣告使用。便宜但流媒体解锁能力差。</dd>
  <dt><strong>三网</strong></dt>
  <dd>指中国电信、中国联通、中国移动三大运营商。</dd>
</dl>

<h2>💰 购买与计费</h2>
<dl>
  <dt><strong>年付/月付</strong></dt>
  <dd>按年或按月付费。年付通常有折扣（7-8 折），但商家跑路风险也更高。</dd>
  <dt><strong>Pay-as-you-go</strong></dt>
  <dd>按使用时长/流量计费。Vultr、DigitalOcean 的标配，适合短时间测试。</dd>
  <dt><strong>超售</strong></dt>
  <dd>商家卖出的总资源超过物理服务器实际资源。OpenVZ 重灾区，KVM 也有但更隐蔽。</dd>
</dl>

<h2>⚙️ 运维与性能</h2>
<dl>
  <dt><strong>root</strong></dt>
  <dd>Linux 系统最高权限用户。拿到 root 意味着你对这台 VPS 有完全控制权。</dd>
  <dt><strong>SSH</strong></dt>
  <dd>安全 Shell，远程连接 Linux 服务器的标准协议。默认端口 22。</dd>
  <dt><strong>BBR</strong></dt>
  <dd>Google 开发的 TCP 拥塞控制算法。启用后网络吞吐量可提升 2-10 倍。新机到手第一步。</dd>
  <dt><strong>YABS</strong></dt>
  <dd>Yet Another Benchmark Script。一键测试 VPS 的 CPU/磁盘/网络性能。</dd>
  <dt><strong>SLA</strong></dt>
  <dd>服务可用性承诺。99.9% 意味着一年允许 8.76 小时宕机。99.99% 是 52 分钟。</dd>
  <dt><strong>快照/快照备份</strong></dt>
  <dd>把 VPS 当前完整状态存成镜像，随时可以恢复。SolusVM 和 Virtualizor 面板都支持。</dd>
  <dt><strong>ISO 挂载</strong></dt>
  <dd>挂载操作系统安装镜像，可以自己装任何系统。KVM 支持，OpenVZ 不支持。</dd>
</dl>

<h2>📊 流媒体与解锁</h2>
<dl>
  <dt><strong>流媒体解锁</strong></dt>
  <dd>VPS 能否访问 Netflix、Disney+、YouTube Premium 等流媒体。取决于 IP 类型和地理位置。</dd>
  <dt><strong>DNS 解锁</strong></dt>
  <dd>通过自建或第三方 DNS 服务绕过流媒体的区域限制。比换 IP 更灵活。</dd>
</dl>`,
  },
  {
    slug: 'virtualization-deep-dive',
    title: '虚拟化技术深度对比：KVM / OpenVZ / Xen / LXC',
    category: '新手入门',
    level: '进阶',
    time: '8 min',
    summary: '四种虚拟化技术的原理、性能、隔离性和适用场景深度解析，买 VPS 前必读。',
    content: `
<p>VPS 配置单上总能看到"虚拟化：KVM"或"基于 KVM 虚拟化"。这个参数决定了你的 VPS 底层怎么运行，直接影响性能、隔离性和功能支持。</p>

<h2>四种方案总览</h2>
<table>
  <tr><th></th><th>KVM</th><th>OpenVZ</th><th>Xen</th><th>LXC</th></tr>
  <tr><td>类型</td><td>全虚拟化</td><td>容器</td><td>半/全虚拟化</td><td>容器</td></tr>
  <tr><td>独立内核</td><td>✅</td><td>❌ 共享</td><td>✅</td><td>❌ 共享</td></tr>
  <tr><td>Windows 支持</td><td>✅</td><td>❌</td><td>✅</td><td>❌</td></tr>
  <tr><td>内核模块</td><td>任意</td><td>受限</td><td>任意</td><td>受限</td></tr>
  <tr><td>性能开销</td><td>3-5%</td><td>1-2%</td><td>5-10%</td><td>近乎为0</td></tr>
  <tr><td>超售风险</td><td>低</td><td>高</td><td>中</td><td>高</td></tr>
  <tr><td>市场份额</td><td>~85%</td><td>~5%</td><td>~5%</td><td>~5%</td></tr>
</table>

<h2>KVM — 绝对的王者</h2>
<p>KVM 在 2007 年进入 Linux 内核主线，此后逐步淘汰了 Xen 和 OpenVZ。AWS、Google Cloud、国内阿里云腾讯云全部基于 KVM。</p>
<p><strong>核心优势</strong>：</p>
<ul>
  <li>硬件辅助虚拟化（Intel VT-x/AMD-V）让性能损耗极低</li>
  <li>VirtIO 驱动进一步优化磁盘和网络 I/O</li>
  <li>每个 VPS 独立内核，真正的资源隔离</li>
  <li>可以装 Docker、WireGuard、BBR 等需要内核模块的软件</li>
  <li>支持 ISO 自定义安装任何操作系统</li>
</ul>
<p><strong>选购建议</strong>：KVM 是默认选项。只要商家标注了 KVM，放心买。</p>

<h2>OpenVZ — 正在被淘汰</h2>
<p>OpenVZ 本质是容器技术（Linux Container 的前身），所有 VPS 共享宿主机的 Linux 内核。</p>
<p><strong>致命缺点</strong>：</p>
<ul>
  <li>商家可以极严重超售——标 2G 内存实际可能只给你 512MB</li>
  <li>不能装 WireGuard、不能自选内核、不能升级内核版本</li>
  <li>Docker 支持不完整</li>
</ul>
<p><strong>什么情况下可以买</strong>：年付 $10 以下的"玩具机"，你对性能没有要求，只是想要个 IP 地址。否则一律选 KVM。</p>

<h2>Xen — 历史遗迹</h2>
<p>Xen 曾是 AWS 的底层虚拟化技术（2017 年前），后被 KVM 取代。现在只有极少数商家还在用。</p>
<p>Xen PV（半虚拟化）需要修改 Guest OS，性能好但兼容性差。Xen HVM（全虚拟化）类似 KVM，但性能损耗更高。除非你的应用明确要求 Xen，否则不要买。</p>

<h2>LXC — 介于 VPS 和 Docker 之间</h2>
<p>LXC 是现代的 Linux 容器方案，比 OpenVZ 先进得多。Proxmox VE 面板支持 LXC 容器。它像 VPS（有独立 IP、独立文件系统），但共享内核。</p>
<p>适合：需要"像 VPS"但追求极致轻量的场景。不适合：需要完整内核控制的选择。</p>

<h2>一句话总结</h2>
<p>买 VPS，认准 <strong>KVM</strong>。其他虚拟化只有在特定场景下考虑，默认不要碰。</p>`,
  },
  {
    slug: 'linux-distro-choice',
    title: 'Linux 发行版选型：Debian vs Ubuntu vs Rocky Linux',
    category: '新手入门',
    level: '入门',
    time: '6 min',
    summary: 'VPS 上最常见的三种 Linux 发行版怎么选？从稳定性、软件源、社区支持三个维度对比。',
    content: `
<p>打开 VPS 重装系统页面，通常能看到 10+ 个 Linux 发行版。对新手来说，Debian、Ubuntu、Rocky Linux（以及它的前身 CentOS）是最常见的选择。</p>

<h2>快速决策</h2>
<ul>
  <li><strong>新手、想省心</strong> → Ubuntu 22.04 LTS</li>
  <li><strong>追求稳定、生产环境</strong> → Debian 12</li>
  <li><strong>企业环境、需要 RHEL 兼容</strong> → Rocky Linux 9</li>
</ul>

<h2>详细对比</h2>
<table>
  <tr><th></th><th>Debian 12</th><th>Ubuntu 22.04 LTS</th><th>Rocky Linux 9</th></tr>
  <tr><td>上游</td><td>独立社区</td><td>基于 Debian</td><td>RHEL 兼容</td></tr>
  <tr><td>发布周期</td><td>~2年</td><td>2年(LTS)</td><td>跟随 RHEL</td></tr>
  <tr><td>软件包数量</td><td>极多(59000+)</td><td>极多</td><td>较少(EPEL补)</td></tr>
  <tr><td>默认软件版本</td><td>偏保守</td><td>较新</td><td>保守</td></tr>
  <tr><td>中文社区</td><td>中等</td><td>庞大</td><td>较小</td></tr>
  <tr><td>教程数量</td><td>多</td><td>最多</td><td>少</td></tr>
</table>

<h2>Debian — 稳如老狗</h2>
<p>Debian 是 Linux 世界的基石之一。Ubuntu 基于它，Raspberry Pi OS 基于它，无数发行版基于它。它不以新功能著称，但以"装上去就不需要管"的稳定性闻名。</p>
<p>特别适合：需要长期运行不折腾的服务器、跑 Docker 的生产环境、对稳定性要求高于一切的系统管理员。</p>

<h2>Ubuntu — 新手友好之王</h2>
<p>Ubuntu 是目前用户量最大的 Linux 发行版。Canonical 公司维护，商业支持到位。网上搜任何 Linux 问题的解决方案，大概率第一条就是 Ubuntu 的答案。</p>
<p>特别适合：刚接触 Linux 的用户、需要大量中文教程支持的人、装 1Panel/宝塔面板等图形化管理工具的环境。</p>

<h2>Rocky Linux — CentOS 的精神继承者</h2>
<p>Red Hat 在 2020 年终止了 CentOS 的传统发行模式（CentOS 8 提前 EOL，CentOS 7 也将在 2024 年停止维护），Rocky Linux 由 CentOS 创始团队创建，旨在 100% 兼容 RHEL。</p>
<p>特别适合：需要 RHEL 兼容环境的企业用户、从 CentOS 迁移的用户。对个人用户来说，选 Debian 或 Ubuntu 更省事。</p>

<h2>其他值得关注的</h2>
<ul>
  <li><strong>Alpine Linux</strong>：极致轻量（Docker 镜像常用），但不适合新手</li>
  <li><strong>Arch Linux</strong>：滚动更新，永远最新。适合折腾，不适合服务器</li>
  <li><strong>Fedora Server</strong>：Red Hat 的技术试验田，新但小众</li>
</ul>`,
  },
  {
    slug: 'first-vps-purchase',
    title: '第一次买 VPS：注册到开机的完整流程',
    category: '新手入门',
    level: '入门',
    time: '8 min',
    summary: '手把手教你从零购买第一台 VPS：选择服务商、下单、选系统、获取 IP 和密码。',
    content: `
<p>以 RackNerd（性价比极高、支持支付宝）为例，演示第一次买 VPS 的完整流程。其他商家的操作大同小异。</p>

<h2>第 1 步：选择配置</h2>
<p>进入官网找到 VPS 套餐列表。注意几个关键参数：</p>
<ul>
  <li><strong>CPU 核心数</strong>：1 核够玩，2 核够用，4 核算高配</li>
  <li><strong>内存</strong>：1GB 起，跑 Docker 建议 2GB+</li>
  <li><strong>硬盘</strong>：20GB SSD 起，放网站和少量数据够用</li>
  <li><strong>流量</strong>：1TB/月是常见水平，代理用户建议 500GB+</li>
  <li><strong>机房位置</strong>：对国内用户，洛杉矶是万能选择（延迟 150-180ms）</li>
</ul>

<h2>第 2 步：注册并下单</h2>
<ol>
  <li>填写邮箱（用常用邮箱，VPS 信息会发到这里）</li>
  <li>选择付款方式（支付宝/微信/PayPal）</li>
  <li>注意看有没有优惠码输入框（促销期通常有）</li>
  <li>确认金额无误后付款</li>
</ol>

<h2>第 3 步：等待开通</h2>
<p>部分商家即时开通（付款后秒出机器），部分需要人工审核（几小时到一天）。收到开通邮件后，邮件里一般包含：</p>
<ul>
  <li>IP 地址</li>
  <li>root 密码（或 SSH 密钥已配置）</li>
  <li>控制面板地址（SolusVM / Virtualizor）</li>
</ul>

<h2>第 4 步：重装系统（建议）</h2>
<p>商家默认装的系统可能不是你想要的版本。登录控制面板：</p>
<ol>
  <li>找到 "Reinstall" 或 "重建" 选项</li>
  <li>选择 Debian 12 或 Ubuntu 22.04</li>
  <li>设置新的 root 密码</li>
  <li>确认重装，等待 2-5 分钟</li>
</ol>

<h2>第 5 步：SSH 连接</h2>
<p>重装完成后，打开终端（Mac 用 Terminal.app，Windows 用 PowerShell 或 PuTTY）：</p>
<pre><code>ssh root@你的IP地址
# 输入密码（不会显示，直接盲打然后回车）</code></pre>
<p>看到命令行提示符（root@xxx:~#），恭喜你，第一台 VPS 已经就绪。</p>

<h2>第 6 步：第一件事——更新系统</h2>
<pre><code>apt update && apt upgrade -y   # Debian/Ubuntu
# 或
dnf update -y                   # Rocky Linux</code></pre>
<p>然后去读本站的《新机到手第一个小时必做清单》，完成安全初始化。</p>`,
  },
  {
    slug: 'new-vps-checklist',
    title: '新机到手第一个小时必做清单',
    category: '新手入门',
    level: '入门',
    time: '8 min',
    summary: '拿到新 VPS 的 60 分钟内，完成 10 项安全初始化和性能检查，让机器进入生产就绪状态。',
    content: `
<p>拿到一台新 VPS 就像拿到一套毛坯房。下面 10 步，按顺序做完，耗时约 40-60 分钟。</p>

<h2>1. 更新系统（必做，5分钟）</h2>
<pre><code>apt update && apt upgrade -y</code></pre>
<p>把系统软件包更新到最新，修复已知漏洞。</p>

<h2>2. 创建普通用户（必做，2分钟）</h2>
<pre><code>adduser yourname
usermod -aG sudo yourname</code></pre>
<p>日常操作用普通用户，避免误操作。需要权限时用 sudo。</p>

<h2>3. 配置 SSH 密钥登录（强烈推荐，5分钟）</h2>
<pre><code># 在本地电脑生成密钥对
ssh-keygen -t ed25519 -C "your-email"

# 把公钥复制到 VPS
ssh-copy-id yourname@你的IP</code></pre>
<p>密钥登录比密码安全百倍，且不用每次输密码。</p>

<h2>4. 修改 SSH 端口（推荐，2分钟）</h2>
<pre><code># 编辑 SSH 配置
nano /etc/ssh/sshd_config
# 找到 #Port 22，改成 Port 2222（或其他 1024-65535 之间的数字）
systemctl restart sshd</code></pre>
<p>改端口不能防止专业攻击，但能过滤掉 99% 的扫描机器人。</p>

<h2>5. 禁止 root SSH 登录（推荐）</h2>
<pre><code>nano /etc/ssh/sshd_config
# 找到 PermitRootLogin yes，改成 no
# 确保已有普通用户且能用 sudo 再执行这一步！</code></pre>

<h2>6. 安装并配置防火墙（必做）</h2>
<pre><code>apt install ufw -y
ufw default deny incoming
ufw default allow outgoing
ufw allow 2222/tcp    # 你修改后的 SSH 端口
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable</code></pre>

<h2>7. 设置时区（推荐）</h2>
<pre><code>timedatectl set-timezone Asia/Shanghai</code></pre>

<h2>8. 开启 BBR 加速（强烈推荐）</h2>
<pre><code>echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
# 验证
sysctl net.ipv4.tcp_congestion_control
# 应输出: net.ipv4.tcp_congestion_control = bbr</code></pre>

<h2>9. 创建 Swap（内存小于 2G 时推荐）</h2>
<pre><code>fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab</code></pre>

<h2>10. 安装 Fail2ban（强烈推荐）</h2>
<pre><code>apt install fail2ban -y
systemctl enable fail2ban --now</code></pre>
<p>自动封禁暴力破解 SSH 的 IP。</p>

<h2>完成检查</h2>
<p>这 10 步做完，你的 VPS 已经从"裸机"变成"基本安全"的状态。接下来可以愉快地装 Docker、搭网站、或者配代理了。</p>`,
  },
  {
    slug: 'newbie-mistakes',
    title: '新手最容易踩的 10 个坑：老手忠告',
    category: '新手入门',
    level: '入门',
    time: '7 min',
    summary: '老玩家用真金白银换来的教训。买 VPS 前看一遍，省下几百刀的冤枉钱。',
    content: `
<p>以下 10 个坑，每个都有人花真金白银踩过。提前知道，能省不少钱和时间。</p>

<h2>坑 1：只看价格不看线路</h2>
<p>年付 $10 的机子看起来很香，但如果你在国内用它，延迟可能 300ms+，高峰期丢包率 30%。对国内用户来说，<strong>线路比配置更重要</strong>。$2/月的优化线路 VPS 体验完爆 $20/月的普通线路。</p>

<h2>坑 2：年付小商家 = 赌博</h2>
<p>年付通常有 7-8 折优惠，但你赌的是商家一年内不会跑路。小商家（运营不到 2 年、没有口碑积累）不建议年付。即使年付，也控制在你能承受损失的范围。</p>

<h2>坑 3：买了才发现不能用 Docker</h2>
<p>OpenVZ 虚拟化的 VPS 对 Docker 支持不完整。买之前确认虚拟化类型是 KVM。</p>

<h2>坑 4：装了宝塔面板然后被黑</h2>
<p>宝塔/1Panel 是方便，但默认端口 8888 全网都知道。装上之前先改端口，装上之后第一时间改默认密码。</p>

<h2>坑 5：SSH 用 22 端口 + root + 弱密码</h2>
<p>这种组合是欢迎黑客来搞。一台全新的 VPS 上线 5 分钟内就会被扫描机器人发现，然后开始暴力破解。</p>

<h2>坑 6：硬盘被日志撑爆</h2>
<p>Nginx、Docker、系统日志如果不做 rotation，几个月就能吃光 20G 硬盘。装完服务就配置 logrotate。</p>

<h2>坑 7：买了 JP 机房以为延迟低，结果走 NTT 绕美</h2>
<p>日本机房到国内不一定延迟低。有些日本机房的回程路由会绕道美国再回国（NTT 线路），延迟反而比洛杉矶还高。看评测比看地理位置重要。</p>

<h2>坑 8：不备份就开始搞</h2>
<p>改配置前不做快照、不备份。一个 rm -rf / 的误操作就能让你一夜回到解放前。</p>

<h2>坑 9：滥用免费 SSL</h2>
<p>Let's Encrypt 每周只能申请 5 次同一个域名。反复测试部署时可能触发限频，然后网站挂了 7 天没 SSL。</p>

<h2>坑 10：同时买多家小商家的年付套餐</h2>
<p>"这家 $10/年，那家 $15/年，都便宜，全买了" → 一年后发现 5 台 VPS 都在吃灰，$100 打了水漂。先明确需求，再买对应的机器。</p>`,
  },
  {
    slug: 'domain-and-dns',
    title: '域名选购与 DNS 解析：Namesilo + Cloudflare 一条龙',
    category: '新手入门',
    level: '入门',
    time: '6 min',
    summary: '从选购域名到配置 DNS 解析的完整指南。推荐 Namesilo 买域名 + Cloudflare 管理 DNS。',
    content: `
<p>有了 VPS 只是有了服务器，要让别人通过网址访问还需要域名。这里推荐一条最省心的路径：<strong>Namesilo 买域名 → Cloudflare 管理 DNS</strong>。</p>

<h2>为什么选 Namesilo？</h2>
<ul>
  <li>价格透明，续费不涨价（很多商家首年 $1，续费 $15）</li>
  <li>免费 WHOIS 隐私保护（隐藏你的姓名/邮箱/地址）</li>
  <li>支持支付宝</li>
  <li>没有套路（不像 GoDaddy 各种隐藏收费）</li>
</ul>

<h2>选购域名原则</h2>
<ul>
  <li><strong>短</strong>：越短越好记（6 个字符以内算好）</li>
  <li><strong>.com 优先</strong>：国际通用，SEO 友好。个人博客可以考虑 .me / .blog</li>
  <li><strong>避免连字符</strong>：my-blog.com 看着像骗子站</li>
  <li><strong>避免数字替代字母</strong>：gr8.com 过时又山寨</li>
</ul>

<h2>DNS 托管到 Cloudflare</h2>
<p>买完域名后，不要用 Namesilo 的 DNS。Cloudflare 免费提供：</p>
<ul>
  <li>全球最快的 DNS 解析（1ms 级别）</li>
  <li>CDN 加速（缓存静态文件，减轻 VPS 压力）</li>
  <li>DDoS 防护（免费版已有基础防护）</li>
  <li>免费 SSL 证书（自动续期）</li>
  <li>隐藏真实 IP（开启代理模式后）</li>
</ul>

<h2>配置步骤</h2>
<ol>
  <li>在 Namesilo 买域名</li>
  <li>注册 Cloudflare 账号，添加你的域名</li>
  <li>Cloudflare 会扫描出当前的 DNS 记录</li>
  <li>Cloudflare 会给你两个新的 Name Server 地址</li>
  <li>回到 Namesilo，把域名的 Name Server 改成 Cloudflare 给的那两个</li>
  <li>等待 DNS 生效（几分钟到 48 小时不等，通常很快）</li>
</ol>

<h2>添加 A 记录指向你的 VPS</h2>
<p>在 Cloudflare DNS 面板添加一条 A 记录：</p>
<ul>
  <li><strong>名称</strong>：@（代表根域名）或 www</li>
  <li><strong>IPv4 地址</strong>：你的 VPS IP</li>
  <li><strong>代理状态</strong>：开启（橙色云朵图标）→ 用 Cloudflare CDN 隐藏真实 IP</li>
</ul>
<p>如果你是用来搭梯子或需要暴露真实 IP 的服务，把代理关掉（灰色云朵）。</p>`,
  },
  {
    slug: 'cn2-gia-guide',
    title: 'CN2 GIA / 9929 / CMIN2 线路完全解读',
    category: '线路与网络',
    level: '进阶',
    time: '10 min',
    summary: '中国三大运营商的精品线路分级体系详解：什么是 CN2 GIA？和 CN2 GT 有什么区别？怎么判断商家有没有虚标线路？',
    content: `
<p>买 VPS 的中国用户，70% 的选择取决于一句话：<strong>"走什么线路？"</strong> 这篇文章把三网精品线路体系讲清楚。</p>

<h2>为什么线路这么重要？</h2>
<p>中国大陆到海外的网络连接经过多个运营商和海底光缆。普通线路（163 骨干网）承载了巨量流量，高峰期就像节假日的高速公路——堵到你怀疑人生。精品线路就像 ETC 专用道，车少、速度快、不堵。</p>

<h2>中国电信线路分级</h2>
<table>
  <tr><th>等级</th><th>名称</th><th>特征</th><th>月费参考</th></tr>
  <tr><td>🥇 顶级</td><td>CN2 GIA</td><td>59.43.x.x 路由，全程 CN2，回国走 59.43</td><td>$6.9+</td></tr>
  <tr><td>🥈 次顶级</td><td>CN2 GT</td><td>202.97.x.x 路由，国际段 CN2、国内段 163</td><td>$4.99+</td></tr>
  <tr><td>🥉 普通</td><td>163 骨干</td><td>202.97 路由，高峰期严重拥堵</td><td>$1.92+</td></tr>
</table>

<h2>怎么验证商家是不是真 GIA？</h2>
<p>两个方法：</p>
<ol>
  <li><strong>看回程路由</strong>：用 nexttrace 工具，回国路径中如果有多个 59.43.x.x 的路由节点，就是真 GIA</li>
  <li><strong>看延迟稳定性</strong>：真 GIA 的延迟波动很小（±5ms），普通线路高峰期能翻倍</li>
</ol>

<h2>中国联通精品：AS9929</h2>
<p>联通用户的首选。9929 是联通高端政企线路，走 10099 路由。效果相当于电信的 CN2 GIA。目前提供 9929 线路的商家：V.PS、DMIT（部分机房）、丽萨主机等。</p>

<h2>中国移动精品：CMIN2</h2>
<p>移动用户的首选。IP 以 223.120 开头。移动的国际带宽相对充裕，普通 CMI 线路表现也不错。CMIN2 是目前移动体系最好的线路。提供商家：DMIT、V.PS。</p>

<h2>三网优化是什么意思？</h2>
<p>一台 VPS 同时接入电信 CN2 GIA、联通 9929、移动 CMI/CMIN2，三家用户都能获得低延迟。通常通过 BGP 实现，成本最高。代表：DMIT 的 PVM.LAX.Pro 系列。</p>

<h2>选购建议</h2>
<ul>
  <li><strong>只看不买</strong>：商家写的"CN2"或"优化线路"没有法律效力，看实测数据</li>
  <li><strong>电信用户</strong>：优先 CN2 GIA，预算有限选 CN2 GT</li>
  <li><strong>联通用户</strong>：优先 9929，其次 CN2 GIA</li>
  <li><strong>移动用户</strong>：优先 CMIN2，其次 CMI，普通线路也能接受</li>
  <li><strong>追求极致</strong>：三网优化 BGP（DMIT、V.PS 旗舰产品）</li>
</ul>`,
  },
  {
    slug: 'return-route',
    title: '三网回程路由怎么看？实测教学',
    category: '线路与网络',
    level: '进阶',
    time: '8 min',
    summary: '手把手教你用 nexttrace 测试 VPS 的三网回程路由，判断线路真实质量。',
    content: `
<p>商家说"CN2 GIA"你就信？用 nexttrace 实测一把，是骡子是马立刻现形。</p>

<h2>安装 nexttrace</h2>
<pre><code># 一键安装
curl nxtrace.org/nt | bash

# 或手动
wget https://github.com/nxtrace/NTrace-core/releases/latest/download/nexttrace_linux_amd64 -O /usr/local/bin/nexttrace
chmod +x /usr/local/bin/nexttrace</code></pre>

<h2>基础用法</h2>
<pre><code># 测试回国路由（从 VPS 到国内 IP）
nexttrace 180.101.50.242   # 电信南京
nexttrace 112.80.248.74    # 联通南京
nexttrace 221.130.33.52    # 移动上海</code></pre>

<h2>怎么看结果？</h2>
<p>nexttrace 会逐跳显示数据包经过的路由节点。重点关注：</p>
<ul>
  <li><strong>59.43.x.x</strong> → CN2 GIA 路由节点，越多越好</li>
  <li><strong>202.97.x.x</strong> → 电信 163 骨干网或 CN2 GT</li>
  <li><strong>10099.x.x</strong> → 联通 9929 精品网</li>
  <li><strong>223.120.x.x</strong> → 移动 CMIN2</li>
</ul>

<h2>常见路线解读</h2>
<h3>真 CN2 GIA 范例</h3>
<pre><code>3  59.43.182.xxx   1.2ms  中国电信 CN2
4  59.43.246.xxx   128ms  中国电信 CN2（洛杉矶节点）
5  59.43.188.xxx   130ms  中国电信 CN2
...
10 180.101.50.242  156ms  中国电信南京</code></pre>
<p>特征：全程 59.43，没有 202.97 节点。延迟稳定。</p>

<h3>普通线路范例</h3>
<pre><code>3  xe-0-0-1.edge.lax  1.0ms  HE.net
4  100ge.lax          1.3ms  中国电信
5  202.97.90.xxx      152ms  中国电信国际
6  202.97.33.xxx      198ms  中国电信骨干（开始堵）
...
12 180.101.50.242     280ms  中国电信南京</code></pre>
<p>特征：202.97 节点延迟从 150ms 跳到 280ms——典型的高峰期拥堵。</p>

<h2>一键三网回程测试</h2>
<pre><code># 用 besttrace 同时测三网
wget -qO- git.io/besttrace | bash</code></pre>
<p>看到三组回程路由结果：去程是用户到你 VPS 的路径（由用户当地运营商决定，测试意义有限），回程是 VPS 到用户的路径（由 VPS 网络决定，这是选机关键）。</p>

<h2>判断标准</h2>
<table>
  <tr><th>延迟</th><th>丢包</th><th>评级</th></tr>
  <tr><td>150-170ms（洛杉矶）</td><td>&lt;1%</td><td>🟢 优秀</td></tr>
  <tr><td>170-200ms（洛杉矶）</td><td>1-3%</td><td>🟡 可接受</td></tr>
  <tr><td>200-250ms（洛杉矶）</td><td>3-8%</td><td>🟠 较差</td></tr>
  <tr><td>&gt;250ms / 严重抖动</td><td>&gt;8%</td><td>🔴 不适合</td></tr>
</table>`,
  },
  {
    slug: 'latency-bandwidth-packetloss',
    title: '延迟 vs 带宽 vs 丢包率：三个核心指标讲透',
    category: '线路与网络',
    level: '入门',
    time: '6 min',
    summary: '延迟低不代表快，带宽大不代表不卡。三个网络指标的正确理解方式和关系。',
    content: `
<p>买 VPS 时你总会看到"延迟"和"带宽"两个数字。但它们到底表示什么？延迟 100ms 是好是坏？</p>

<h2>延迟 (Latency)</h2>
<p>一个数据包从你的电脑到 VPS 再回来，花的时间。单位：毫秒（ms）。</p>
<p>比喻：你家到超市的距离。洛杉矶到上海物理距离约 10000km，光速在光纤中约 200000km/s，理论最低延迟约 100ms（往返 20000km）。加上路由器转发延迟，<strong>洛杉矶到中国的实际最低延迟在 130-150ms 之间</strong>。</p>
<p>任何宣称"洛杉矶到中国 50ms"的商家，要么在吹牛，要么有物理上不可能的黑科技。</p>

<h2>带宽 (Bandwidth)</h2>
<p>每秒能传输的最大数据量。单位：Mbps 或 Gbps。</p>
<p>比喻：高速公路有几条车道。带宽越大，同时能跑的数据越多。看 4K 视频需要 25Mbps+，代理上网 10Mbps 够用。</p>

<h2>丢包率 (Packet Loss)</h2>
<p>发送的数据包没有到达目的地的比例。</p>
<p>比喻：快递丢失率。丢包率 1% 看起来不多，但 TCP 协议发现丢包后会重传，实际有效带宽可能掉 30-50%。丢包率 > 3% 的线路体验很差。</p>

<h2>三者的关系</h2>
<ul>
  <li><strong>延迟低 + 带宽大 = 下载快</strong>（Steam 下载游戏秒好）</li>
  <li><strong>延迟低 + 带宽小 = 网页秒开但大文件慢</strong></li>
  <li><strong>延迟高 + 带宽大 = 下载最终能满速但每一口数据都要等</strong></li>
  <li><strong>丢包率高的线路，带宽再大也没用</strong></li>
</ul>

<h2>不同用途的敏感度</h2>
<table>
  <tr><th>场景</th><th>延迟</th><th>带宽</th><th>丢包</th></tr>
  <tr><td>SSH 操作</td><td>🔴 高度敏感</td><td>🟢 不敏感</td><td>🟡 中度</td></tr>
  <tr><td>网页浏览</td><td>🟡 中度</td><td>🟡 中度</td><td>🟡 中度</td></tr>
  <tr><td>看视频</td><td>🟢 不敏感</td><td>🔴 高度敏感</td><td>🔴 高度敏感</td></tr>
  <tr><td>代理/梯子</td><td>🔴 高度敏感</td><td>🟡 中度</td><td>🔴 高度敏感</td></tr>
  <tr><td>API 后端</td><td>🔴 高度敏感</td><td>🟡 中度</td><td>🔴 高度敏感</td></tr>
</table>

<h2>推荐阈值（洛杉矶机房到中国大陆）</h2>
<ul>
  <li>延迟 &lt; 170ms：优秀</li>
  <li>带宽 &gt; 100Mbps：够用</li>
  <li>丢包 &lt; 0.5%：优秀</li>
  <li>丢包 &lt; 2%：可用</li>
</ul>`,
  },
  {
    slug: 'ip-types',
    title: 'IP 属性全解析：原生IP / 广播IP / Anycast',
    category: '线路与网络',
    level: '进阶',
    time: '6 min',
    summary: '你的 VPS IP 是原生还是广播的？能不能解锁 Netflix？Anycast IP 又是什么？',
    content: `
<p>买 VPS 时，"原生 IP"是流媒体解锁的关键。但原生和广播有什么区别？Anycast 又是什么？</p>

<h2>原生 IP (Native IP)</h2>
<p>IP 地址在物理上归属于它注册的国家/地区。一个原生美国 IP 意味着：</p>
<ul>
  <li>IP WHOIS 查询显示注册地为美国</li>
  <li>这个 IP 实际部署在美国的数据中心</li>
  <li>GeoIP 数据库将其标记为美国</li>
  <li>大概率能解锁美国 Netflix、Hulu 等流媒体</li>
</ul>
<p><strong>怎么判断</strong>：访问 ipinfo.io 或 whatismyipaddress.com，看 "Country" 是否与机房所在地一致。</p>

<h2>广播 IP (Announced/Broadcast IP)</h2>
<p>IP 注册在一个国家，但通过 BGP 技术在另一个国家宣告使用。比如一个 IP 注册在 APNIC（亚太区），但被某美国商家在美国数据中心广播。</p>
<p>带来的问题：</p>
<ul>
  <li>流媒体平台可能根据 WHOIS 判断你在亚太，但实际你在美国 → 解锁混乱</li>
  <li>部分网站会因为 GeoIP 不一致而拒绝服务</li>
  <li>价格通常更便宜（广播 IP 不需要为每个地区购买 IP 段）</li>
</ul>

<h2>Anycast IP</h2>
<p>同一个 IP 地址在全球多个位置同时宣告。用户访问这个 IP 时，BGP 协议自动把流量路由到最近的节点。</p>
<p><strong>这不是 VPS 给你的 IP 类型</strong>，而是 Cloudflare CDN 等服务使用的技术。你的网站套了 Cloudflare 后，别人访问的是 Cloudflare 的 Anycast IP，回源才到你的 VPS。</p>

<h2>流媒体解锁能力</h2>
<p>想用 VPS 看 Netflix / Disney+ / YouTube Premium，需要：</p>
<ul>
  <li>IP 是原生 IP（或广播 IP 但 GeoIP 正确）</li>
  <li>IP 不在流媒体平台的黑名单中（数据中心 IP 容易被识别并封禁）</li>
  <li>有些商家专门优化过流媒体解锁（如 DMIT、Cloudie）</li>
</ul>
<p>测试命令：</p>
<pre><code>bash <(curl -sSL https://raw.githubusercontent.com/lmc999/RegionRestrictionCheck/main/check.sh)</code></pre>

<h2>选购建议</h2>
<ul>
  <li><strong>需要流媒体解锁</strong> → 确认是原生 IP，最好找有"流媒体解锁"标签的商家</li>
  <li><strong>只需要梯子/建站</strong> → 广播 IP 完全够用，省钱</li>
  <li><strong>跨境电商/SEO</strong> → 必须原生 IP，广播 IP 可能被搜索引擎判为异常</li>
</ul>`,
  },
  {
    slug: 'cloudflare-cdn',
    title: 'Cloudflare CDN 从入门到精通',
    category: '线路与网络',
    level: '进阶',
    time: '8 min',
    summary: 'Cloudflare 免费 CDN 的全部玩法：加速、防 DDoS、隐藏真实 IP、优选 IP 让国内访问更快。',
    content: `
<p>Cloudflare 几乎是 VPS 用户的标配。免费版已经足够个人和小团队使用。</p>

<h2>核心功能一览（免费版）</h2>
<ul>
  <li>全球 CDN（330+ 节点）</li>
  <li>DDoS 防护（无限量，L3/L4）</li>
  <li>免费 SSL 证书（自动续期）</li>
  <li>隐藏源站真实 IP</li>
  <li>DNS 解析（全球最快之一）</li>
  <li>Page Rules（3 条免费）</li>
  <li>Workers（10万次/天免费）</li>
</ul>

<h2>1. 基础配置：隐藏真实 IP</h2>
<p>在 Cloudflare DNS 面板中，把 A 记录的代理状态设为"已代理"（橙色云朵）。此时用户访问你的域名时：</p>
<pre><code>用户 → Cloudflare CDN → 你的 VPS（源站）</code></pre>
<p>用户的请求先到 Cloudflare，Cloudflare 再去你的 VPS 取数据。你的真实 IP 被隐藏了。</p>

<h2>2. SSL 模式选择</h2>
<table>
  <tr><th>模式</th><th>说明</th><th>推荐</th></tr>
  <tr><td>Flexible</td><td>用户→CF(HTTPS) → 源站(HTTP)</td><td>❌ 不安全</td></tr>
  <tr><td>Full</td><td>用户→CF(HTTPS) → 源站(HTTPS,自签)</td><td>⚠️ 凑合</td></tr>
  <tr><td>Full (Strict)</td><td>用户→CF(HTTPS) → 源站(HTTPS,有效证书)</td><td>✅ 推荐</td></tr>
</table>
<p>源站可以用 Cloudflare 颁发的 Origin Certificate，免费且自动信任。</p>

<h2>3. 缓存规则优化</h2>
<p>在 Page Rules 中设置：</p>
<pre><code>URL: example.com/wp-content/*
设置: Cache Level = Cache Everything, Edge Cache TTL = 1 month</code></pre>
<p>静态资源（CSS/JS/图片）缓存到 CF 边缘节点，用户秒开，源站压力降到零。</p>

<h2>4. 防火墙规则（WAF）</h2>
<pre><code># 封禁特定国家
(http.request.uri.path contains "/wp-admin") and (ip.geoip.country ne "CN")

# 限频
http.request.uri.path eq "/wp-login.php" → Rate Limit 5次/分钟</code></pre>

<h2>5. Cloudflare Tunnel（替代端口转发）</h2>
<p>传统做法：开端口 → 配 Nginx 反代 → 担心安全。Cloudflare Tunnel 直接在 VPS 和 CF 之间建立加密隧道，无需开放任何端口：</p>
<pre><code># 安装 cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# 创建隧道
cloudflared tunnel login
cloudflared tunnel create my-tunnel
# 配置路由 → 指向本地 localhost:8080</code></pre>

<h2>国内访问优化：优选 IP</h2>
<p>Cloudflare 默认分配的 Anycast IP 在国内可能不是最快的。可以手动指定更快的 IP：</p>
<ul>
  <li>使用 CloudflareSpeedTest 等工具测速</li>
  <li>优选延迟最低的 Cloudflare IP</li>
  <li>在域名 DNS 中用 CNAME 指向优选 IP（需要用 SaaS 方式或 Partner 接入）</li>
</ul>`,
  },
  {
    slug: 'ssh-security',
    title: 'SSH 安全配置：密钥登录 + 改端口 + 禁 root',
    category: '安全与优化',
    level: '入门',
    time: '6 min',
    summary: '三招让你的 VPS 远离 99% 的 SSH 暴力破解攻击。密钥登录、非标端口、禁止 root 直接登录。',
    content: `
<p>一台全新的 VPS 上线后，SSH 端口 22 会在几分钟内被全球扫描机器人发现，然后开始用常见密码字典暴力破解。以下三招能挡住 99% 的攻击。</p>

<h2>第 1 招：SSH 密钥登录</h2>
<p>密码可以被暴力破解，但 256 位的 Ed25519 密钥破解需要的时间比宇宙年龄还长。</p>
<pre><code># 在本地电脑生成密钥（不要输密码短语以方便自动化）
ssh-keygen -t ed25519 -C "my-vps-key"

# 复制公钥到 VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@你的IP

# 测试密钥登录
ssh -i ~/.ssh/id_ed25519 root@你的IP</code></pre>
<p>成功后，再关闭密码登录（见下）。</p>

<h2>第 2 招：修改 SSH 端口</h2>
<pre><code># 编辑 SSH 配置
nano /etc/ssh/sshd_config

# 修改/添加：
Port 22222              # 改成任意 1024-65535 之间的端口

# 重启 SSH
systemctl restart sshd</code></pre>
<p><strong>重要</strong>：新终端测试新端口能连上后，再关闭旧端口的会话！</p>

<h2>第 3 招：禁止密码登录 + 禁止 root 登录</h2>
<pre><code>nano /etc/ssh/sshd_config

# 确保以下配置：
PermitRootLogin no           # 禁止 root 直接 SSH
PasswordAuthentication no    # 禁止密码登录
PubkeyAuthentication yes     # 只允许密钥登录

# 重启
systemctl restart sshd</code></pre>
<p>以后登录只能用普通用户 + 密钥：<code>ssh -p 22222 yourname@你的IP</code>，需要 root 权限时用 <code>sudo</code>。</p>

<h2>验证安全性</h2>
<pre><code># 查看最近的失败登录尝试
grep "Failed password" /var/log/auth.log | tail -20
# 如果配置正确，应该看不到新的失败记录了</code></pre>

<h2>多台设备用同一个 VPS</h2>
<p>把每台设备的公钥都追加到 VPS 的 <code>~/.ssh/authorized_keys</code> 文件中：</p>
<pre><code>cat ~/.ssh/new_device_key.pub >> ~/.ssh/authorized_keys</code></pre>`,
  },
  {
    slug: 'ufw-fail2ban',
    title: 'UFW 防火墙入门 + Fail2ban 防爆破',
    category: '安全与优化',
    level: '入门',
    time: '5 min',
    summary: 'UFW 让你只开放必要的端口，Fail2ban 自动封禁暴力破解的 IP。五分钟配好基础防线。',
    content: `
<h2>UFW — 端口级防火墙</h2>
<p>UFW (Uncomplicated Firewall) 是 iptables 的友好包装。Linux 自带的 iptables 太复杂，UFW 把常用操作简化到一行命令。</p>
<pre><code># 安装
apt install ufw -y

# 默认策略：拒绝所有入站，允许所有出站
ufw default deny incoming
ufw default allow outgoing

# 开放需要的端口
ufw allow 22222/tcp     # SSH（你改过的端口）
ufw allow 80/tcp        # HTTP
ufw allow 443/tcp       # HTTPS

# 开启
ufw enable

# 查看状态
ufw status verbose</code></pre>

<h2>常用 UFW 规则</h2>
<pre><code># 只允许特定 IP 访问 SSH
ufw allow from 1.2.3.4 to any port 22222 proto tcp

# 开放端口范围
ufw allow 8000:8100/tcp

# 删除规则
ufw delete allow 80/tcp

# 查看带编号的规则列表（方便删除）
ufw status numbered</code></pre>

<h2>Fail2ban — 自动封禁暴力破解 IP</h2>
<p>Fail2ban 监控日志文件，如果某个 IP 在一定时间内失败尝试超过阈值，自动用防火墙封禁该 IP 一段时间。</p>
<pre><code># 安装
apt install fail2ban -y

# 创建本地配置（不要直接改 jail.conf）
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# 编辑配置
nano /etc/fail2ban/jail.local

# 关键配置：
[DEFAULT]
bantime = 3600          # 封禁 1 小时
findtime = 600          # 10 分钟内的失败算连续
maxretry = 5            # 失败 5 次就封

[sshd]
enabled = true
port = 22222            # 你的 SSH 端口

# 启动
systemctl enable fail2ban --now

# 查看封禁状态
fail2ban-client status sshd

# 手动解封某个 IP
fail2ban-client set sshd unbanip 1.2.3.4</code></pre>

<h2>效果验证</h2>
<pre><code># 查看被封禁的 IP 列表
fail2ban-client status sshd</code></pre>
<p>一台公开的 VPS，配置 Fail2ban 后通常每天会自动封禁几十到上百个扫描 IP。没有 Fail2ban 的话，这些 IP 会持续尝试暴力破解你的密码。</p>`,
  },
  {
    slug: 'bbr-acceleration',
    title: 'BBR / BBRv3 加速一键开启 + 内核优化',
    category: '安全与优化',
    level: '入门',
    time: '5 min',
    summary: 'Google BBR 让 VPS 网络吞吐量提升 2-10 倍。一行命令开启，新机到手必做。',
    content: `
<p>BBR (Bottleneck Bandwidth and Round-trip propagation time) 是 Google 开发的 TCP 拥塞控制算法。简单说：<strong>让数据传得更快、更稳</strong>。</p>

<h2>为什么 BBR 对 VPS 特别有效？</h2>
<p>默认的 TCP 拥塞控制算法（CUBIC）是为局域网设计的——假设丢包就是网络拥堵了，会立即降速。但在 VPS 跨国场景中，丢包可能是物理距离和中间路由导致的，并非真正的拥堵。BBR 不依赖丢包来判断带宽，而是持续探测实际可用带宽，在高延迟跨国链路中效果拔群。</p>

<h2>一键开启（Linux 4.9+ 内核）</h2>
<pre><code># 写入配置
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf

# 使生效
sysctl -p

# 验证是否开启
sysctl net.ipv4.tcp_congestion_control
# 输出应为: net.ipv4.tcp_congestion_control = bbr

# 查看可用的拥塞控制算法
sysctl net.ipv4.tcp_available_congestion_control</code></pre>

<h2>BBR 版本演进</h2>
<table>
  <tr><th>版本</th><th>内核要求</th><th>特点</th></tr>
  <tr><td>BBRv1</td><td>4.9+</td><td>经典版，稳定可靠，所有 VPS 都能用</td></tr>
  <tr><td>BBRv2</td><td>5.x+</td><td>改善了公平性（不抢其他连接的带宽），但吞吐量略低于 v1</td></tr>
  <tr><td>BBRv3</td><td>6.x+</td><td>最新版，结合 v1 的速度和 v2 的公平性。需手动编译内核或等发行版更新</td></tr>
</table>
<p>目前绝大多数 VPS 用的都是 BBRv1（内核自带），已经足够了。</p>

<h2>效果对比</h2>
<table>
  <tr><th>场景</th><th>CUBIC（默认）</th><th>BBR</th><th>提升</th></tr>
  <tr><td>洛杉矶→国内下载</td><td>2-5 MB/s</td><td>10-30 MB/s</td><td>3-5x</td></tr>
  <tr><td>欧洲→国内</td><td>1-3 MB/s</td><td>5-15 MB/s</td><td>3-10x</td></tr>
  <tr><td>丢包 1% 时</td><td>几乎不可用</td><td>影响不大</td><td>天差地别</td></tr>
</table>

<h2>进阶：内核参数优化</h2>
<pre><code># 追加到 /etc/sysctl.conf
net.ipv4.tcp_fastopen = 3
net.ipv4.tcp_slow_start_after_idle = 0
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216

sysctl -p</code></pre>`,
  },
  {
    slug: 'backup-strategy',
    title: '数据备份与恢复：3-2-1 策略实战',
    category: '安全与优化',
    level: '进阶',
    time: '6 min',
    summary: '3 份副本、2 种介质、1 份异地。VPS 数据的完整备份策略和自动化脚本。',
    content: `
<p>3-2-1 备份原则：<strong>3</strong> 份数据副本，<strong>2</strong> 种不同存储介质，至少 <strong>1</strong> 份异地备份。</p>

<h2>VPS 上需要备份什么？</h2>
<ul>
  <li>数据库（MySQL/PostgreSQL）：数据无价，最重要</li>
  <li>配置文件（Nginx/Docker Compose/.env）：丢了要重写</li>
  <li>用户上传文件（WordPress 的 wp-content/uploads 等）</li>
  <li>SSL 证书（如果用 Let's Encrypt 自动续期的，不用手动备份）</li>
</ul>
<p>系统文件不需要备份——重装比恢复快。</p>

<h2>方案一：Rclone + 云存储（推荐）</h2>
<p>Rclone 支持 40+ 种云存储，把文件自动同步到 Google Drive / OneDrive / Backblaze B2。</p>
<pre><code># 安装
curl https://rclone.org/install.sh | bash

# 配置（交互式）
rclone config

# 备份脚本 backup.sh
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# 导出数据库
mysqldump -u root --all-databases > $BACKUP_DIR/all_db.sql

# 打包配置文件
tar -czf $BACKUP_DIR/configs.tar.gz /etc/nginx /etc/fail2ban /root/docker-compose

# 上传到云端
rclone copy $BACKUP_DIR remote:vps-backup/$(date +%Y%m%d)/

# 删除 30 天前的本地备份
find /backup -mtime +30 -delete</code></pre>

<h2>方案二：自动快照（最省心）</h2>
<p>大部分 VPS 控制面板（SolusVM / Virtualizor）支持自动快照：</p>
<ul>
  <li>每日快照，保留最近 7 天</li>
  <li>每周快照，保留 4 周</li>
  <li>注意：快照存在同一数据中心，不算"异地"</li>
</ul>

<h2>方案三：Duplicati（GUI 备份）</h2>
<p>适合不习惯命令行的用户。Web UI 操作，支持加密、增量备份、定时任务。</p>

<h2>定时执行</h2>
<pre><code># 每天凌晨 3 点自动备份
crontab -e
# 添加：
0 3 * * * /root/backup.sh >> /var/log/backup.log 2>&1</code></pre>

<h2>恢复演练（必须做）</h2>
<p>备份不验证等于没备份。每月至少做一次恢复测试：</p>
<ol>
  <li>开一台最便宜的临时 VPS（$2/月按小时计费的）</li>
  <li>从备份恢复数据库和配置</li>
  <li>确认网站能正常访问</li>
  <li>销毁临时 VPS</li>
</ol>
<p>这个流程验证了两件事：备份文件是完整的、你确实会恢复。</p>`,
  },
  {
    slug: 'panel-comparison',
    title: '1Panel / 宝塔面板对比与安装',
    category: '建站部署',
    level: '入门',
    time: '6 min',
    summary: '两个最热门的面板怎么选？从安装、功能、安全性、资源占用四个维度详细对比。',
    content: `
<p>面板让 Linux 新手也能建站——不用记命令，网页上点点就能装网站、配 SSL、管数据库。</p>

<h2>1Panel — 新一代面板（推荐）</h2>
<ul>
  <li><strong>开源</strong>：完全开源（GPL v3），代码透明</li>
  <li><strong>技术栈现代化</strong>：Go + Vue3，跑在 Docker 里</li>
  <li><strong>功能全面</strong>：网站管理、数据库、Docker 管理、文件管理、防火墙、监控</li>
  <li><strong>默认安全</strong>：安装后随机生成端口和密码，不暴露默认端口</li>
  <li><strong>资源占用</strong>：内存约 200-300MB</li>
</ul>

<h2>宝塔面板 — 老牌选手</h2>
<ul>
  <li><strong>用户量大</strong>：国内用户最多的面板，教程最多</li>
  <li><strong>功能更全</strong>：软件商店丰富，插件生态成熟</li>
  <li><strong>兼容性好</strong>：支持 CentOS / Ubuntu / Debian 全系列</li>
  <li><strong>⚠️ 安全问题</strong>：默认端口 8888 人尽皆知，历史上多次爆出漏洞。装完第一件事改端口</li>
  <li><strong>资源占用</strong>：内存约 300-500MB</li>
</ul>

<h2>安装 1Panel（推荐）</h2>
<pre><code>curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && bash quick_start.sh</code></pre>
<p>安装完成后会显示：面板地址、端口、用户名、密码。<strong>立即截图保存！</strong></p>

<h2>安装宝塔</h2>
<pre><code># Ubuntu/Debian
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && bash install.sh</code></pre>

<h2>两者的共同功能</h2>
<ul>
  <li>一键安装 Nginx / Apache / MySQL / PHP / Redis</li>
  <li>一键申请 Let's Encrypt SSL 证书并自动续期</li>
  <li>可视化文件管理器</li>
  <li>防火墙管理</li>
  <li>系统监控（CPU / 内存 / 磁盘）</li>
</ul>

<h2>选哪个？</h2>
<ul>
  <li><strong>新手 → 1Panel</strong>（安装简单、默认安全、界面现代）</li>
  <li><strong>需要丰富插件 → 宝塔</strong>（但注意安全配置）</li>
  <li><strong>Docker 玩家 → 1Panel</strong>（原生 Docker 管理）</li>
  <li><strong>低配 VPS（1G 内存） → 不用面板</strong>，直接命令行</li>
</ul>`,
  },
  {
    slug: 'nginx-basics',
    title: 'Nginx 入门：虚拟主机 + 反向代理 + SSL',
    category: '建站部署',
    level: '入门',
    time: '8 min',
    summary: '从零配置 Nginx：多个网站共用一个 80 端口、反向代理到后端服务、Let\'s Encrypt 免费 SSL。',
    content: `
<p>Nginx 是世界上最流行的 Web 服务器。学会 Nginx 的基本操作，你的 VPS 就能同时跑多个网站。</p>

<h2>安装</h2>
<pre><code>apt install nginx -y
systemctl enable nginx --now

# 验证：访问 http://你的IP，应该看到 Nginx 欢迎页</code></pre>

<h2>虚拟主机：一台 VPS 跑 N 个网站</h2>
<p>Nginx 根据请求的域名来判断该返回哪个网站的内容。</p>
<pre><code># 创建站点配置
nano /etc/nginx/sites-available/site1.com

# 内容：
server {
    listen 80;
    server_name site1.com www.site1.com;
    root /var/www/site1;
    index index.html index.php;

    location / {
        try_files $uri $uri/ =404;
    }
}

# 启用站点
ln -s /etc/nginx/sites-available/site1.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx</code></pre>
<p>同样的方式创建 site2.com 的配置，两个网站互不影响。</p>

<h2>反向代理：把流量转到后端服务</h2>
<p>你的 Node.js 应用跑在 localhost:3000，但用户需要访问 80/443 端口。用 Nginx 反向代理：</p>
<pre><code>server {
    listen 80;
    server_name app.mydomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}</code></pre>

<h2>Let's Encrypt 免费 SSL</h2>
<pre><code># 安装 certbot
apt install certbot python3-certbot-nginx -y

# 一键申请 SSL
certbot --nginx -d site1.com -d www.site1.com

# 自动续期（certbot 已自带定时器）
systemctl status certbot.timer

# 测试续期
certbot renew --dry-run</code></pre>

<h2>常用 Nginx 命令</h2>
<pre><code>nginx -t              # 测试配置是否有语法错误
nginx -s reload       # 平滑重载配置（不中断服务）
nginx -s stop         # 立即停止
systemctl reload nginx</code></pre>

<h2>性能调优</h2>
<pre><code># /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;

# 开启 gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_min_length 1000;</code></pre>`,
  },
  {
    slug: 'wordpress-halo',
    title: 'WordPress / Halo 博客部署实战',
    category: '建站部署',
    level: '入门',
    time: '8 min',
    summary: '两种最流行的博客系统对比：WordPress（生态庞大）vs Halo（Java/现代化），以及 Docker 一键部署。',
    content: `
<h2>WordPress — 全球 43% 的网站</h2>
<p>优势：插件生态全球第一、主题无数、SEO 友好、有 1Panel/宝塔一键安装。</p>
<p>劣势：PHP 架构老旧、性能需要插件优化、安全问题多（需经常更新）。</p>

<h2>Docker 部署 WordPress（推荐方式）</h2>
<pre><code># docker-compose.yml
version: '3'
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: your_password
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - ./wp-content:/var/www/html/wp-content
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: your_password
    volumes:
      - ./db:/var/lib/mysql

# 启动
docker compose up -d</code></pre>
<p>然后用 Nginx 反向代理 8080 端口到域名，配好 SSL 即可。</p>

<h2>Halo — 现代化博客</h2>
<p>Java 开发，界面现代，自带 Markdown 编辑器。适合开发者和技术博客。</p>
<pre><code>docker run -d --name halo \
  -p 8090:8090 \
  -v ~/.halo2:/root/.halo2 \
  halohub/halo:2</code></pre>
<p>Halo 的优势：Markdown 原生支持、速度飞快、界面干净、API 完善。</p>
<p>劣势：生态远不如 WordPress，插件和主题数量有限。</p>

<h2>选哪个？</h2>
<ul>
  <li><strong>追求功能丰富 + SEO → WordPress</strong></li>
  <li><strong>追求速度 + 简洁 → Halo</strong></li>
  <li><strong>电商网站 → WordPress + WooCommerce</strong></li>
  <li><strong>纯技术博客 → Halo 或静态博客（Hugo/Hexo）</strong></li>
</ul>`,
  },
  {
    slug: 'docker-quickstart',
    title: 'Docker 与 Docker Compose 极简入门',
    category: '建站部署',
    level: '入门',
    time: '8 min',
    summary: 'Docker 到底是什么？为什么 VPS 上所有服务都推荐用 Docker 部署？10 分钟上手。',
    content: `
<p>Docker 把应用程序和它需要的所有依赖打包在一起，一个命令就能在任何 Linux 服务器上跑起来。你不需要手动装 MySQL、配 PHP、解决版本冲突——Docker 镜像已经做好了。</p>

<h2>安装</h2>
<pre><code>curl -fsSL https://get.docker.com | bash
systemctl enable docker --now

# 验证
docker run hello-world</code></pre>

<h2>核心概念</h2>
<ul>
  <li><strong>镜像 (Image)</strong>：应用程序的打包模板。类似操作系统的 ISO 文件</li>
  <li><strong>容器 (Container)</strong>：镜像的运行实例。你可以同时跑多个 Wordpress 容器，它们共享镜像但各自独立</li>
  <li><strong>Docker Compose</strong>：用 YAML 文件定义多个容器怎么组合（比如 WordPress + MySQL）</li>
</ul>

<h2>常用命令</h2>
<pre><code># 运行一个容器
docker run -d --name mynginx -p 80:80 nginx

# 查看运行中的容器
docker ps

# 查看日志
docker logs mynginx

# 进入容器
docker exec -it mynginx bash

# 停止/启动/删除
docker stop mynginx
docker start mynginx
docker rm mynginx

# 清理垃圾（停掉的容器、未使用的镜像）
docker system prune -a</code></pre>

<h2>Docker Compose 使用</h2>
<pre><code># docker-compose.yml
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: unless-stopped

# 启动
docker compose up -d

# 停止
docker compose down

# 更新镜像并重启
docker compose pull
docker compose up -d</code></pre>

<h2>为什么 VPS 上推荐用 Docker？</h2>
<ul>
  <li><strong>不污染系统</strong>：删容器等于删所有痕迹，主机始终保持干净</li>
  <li><strong>迁移简单</strong>：换 VPS 时只需要 docker-compose.yml + 数据卷，10 分钟迁移完成</li>
  <li><strong>版本隔离</strong>：一台机器上可以同时跑 MySQL 5.7 和 MySQL 8.0，互不冲突</li>
  <li><strong>自动重启</strong>：restart: unless-stopped 让服务挂了自动拉起来</li>
  <li><strong>安全</strong>：容器默认隔离，应用被黑不会直接拿到宿主机权限</li>
</ul>`,
  },
  {
    slug: 'selfhosted-cloud',
    title: '私有云盘搭建：AList + Nextcloud',
    category: '建站部署',
    level: '进阶',
    time: '7 min',
    summary: '在 VPS 上搭建私人网盘。AList 聚合多个云盘，Nextcloud 提供完整的私有云体验。',
    content: `
<h2>AList — 万能网盘聚合器</h2>
<p>AList 可以把阿里云盘、百度网盘、OneDrive、Google Drive、123 网盘等全部聚到一个界面，支持 WebDAV 协议——你可以用任何支持 WebDAV 的播放器直接看网盘里的视频。</p>

<h3>Docker 部署</h3>
<pre><code>docker run -d \
  --name alist \
  -p 5244:5244 \
  -v /etc/alist:/opt/alist/data \
  xhofe/alist:latest

# 查看初始密码
docker exec -it alist ./alist admin random</code></pre>
<p>访问 http://你的IP:5244，用 admin + 生成的密码登录，然后在管理后台添加各种存储。</p>

<h2>Nextcloud — 完整的私有云</h2>
<p>Nextcloud 提供：文件同步（类似 Dropbox）、日历、联系人、在线 Office 编辑、视频会议。</p>

<h3>Docker Compose 部署</h3>
<pre><code>services:
  nextcloud:
    image: nextcloud:latest
    ports:
      - "8080:80"
    volumes:
      - ./nextcloud:/var/www/html
      - ./data:/var/www/html/data
    environment:
      - MYSQL_HOST=db
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=your_password
  db:
    image: mariadb:10.6
    volumes:
      - ./db:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_PASSWORD=your_password</code></pre>

<h2>对比：AList vs Nextcloud</h2>
<table>
  <tr><th></th><th>AList</th><th>Nextcloud</th></tr>
  <tr><td>定位</td><td>网盘聚合器</td><td>私有云平台</td></tr>
  <tr><td>存储</td><td>挂载第三方</td><td>自建存储</td></tr>
  <tr><td>资源占用</td><td>极低（~50MB）</td><td>较高（~500MB+）</td></tr>
  <tr><td>WebDAV</td><td>✅ 原生</td><td>✅</td></tr>
  <tr><td>在线 Office</td><td>❌</td><td>✅ Collabora</td></tr>
  <tr><td>适合</td><td>已有多个网盘想整合</td><td>想完全自建不需要第三方</td></tr>
</table>

<h2>安全提醒</h2>
<ul>
  <li>一定要配 Nginx 反代 + SSL 再对外开放</li>
  <li>设置强密码，开启 2FA 双因素认证</li>
  <li>限制访问 IP（如果你只在家里用）</li>
</ul>`,
  },
  {
    slug: 'mysql-postgresql',
    title: 'MySQL / PostgreSQL 安装与安全配置',
    category: '数据库',
    level: '入门',
    time: '6 min',
    summary: '两种关系型数据库的 Docker 安装方式，以及安全初始化三件事：改密码、禁远程、限用户。',
    content: `
<h2>MySQL 8.0 Docker 部署</h2>
<pre><code>docker run -d --name mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=ChangeMe123! \
  -v ./mysql-data:/var/lib/mysql \
  mysql:8.0</code></pre>

<h2>PostgreSQL Docker 部署</h2>
<pre><code>docker run -d --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=ChangeMe123! \
  -e POSTGRES_USER=myapp \
  -e POSTGRES_DB=myapp \
  -v ./pg-data:/var/lib/postgresql/data \
  postgres:16-alpine</code></pre>

<h2>安全初始化三件事</h2>

<h3>1. 禁止远程 root 登录</h3>
<pre><code># MySQL
docker exec -it mysql mysql -u root -p
# 进入后执行：
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1');
FLUSH PRIVILEGES;</code></pre>

<h3>2. 创建专用用户（最小权限原则）</h3>
<pre><code># MySQL: 只给特定数据库的权限
CREATE USER 'app_user'@'%' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON myapp.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

# PostgreSQL
docker exec -it postgres psql -U myapp
CREATE USER app_user WITH PASSWORD 'StrongPassword123!';
GRANT CONNECT ON DATABASE myapp TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;</code></pre>

<h3>3. 防火墙限制</h3>
<pre><code># 如果只需本机访问（比如 Web 应用和数据库在同一台机器）
# Docker 内部网络通信不需要暴露端口
docker run -d --name mysql --network mynet mysql:8.0
# 不映射 -p 3306，外部完全不可访问

# 如果需要外部访问，只允许特定 IP
ufw allow from 1.2.3.4 to any port 3306</code></pre>

<h2>选 MySQL 还是 PostgreSQL？</h2>
<ul>
  <li><strong>MySQL</strong>：WordPress、大多数 PHP 项目默认选择。简单、快、资料多</li>
  <li><strong>PostgreSQL</strong>：更严格的标准兼容、JSON 支持更好、GIS 地理数据强。现代 Node.js/Python 项目的首选</li>
  <li><strong>对 VPS 的影响</strong>：两者在 2GB 内存的 VPS 上都跑得很好</li>
</ul>

<h2>自动备份</h2>
<pre><code># crontab 每天备份
0 4 * * * docker exec mysql mysqldump -u root -p'password' --all-databases | gzip > /backup/mysql-$(date +\%Y\%m\%d).sql.gz</code></pre>`,
  },
  {
    slug: 'redis-cache',
    title: 'Redis 缓存加速实战',
    category: '数据库',
    level: '进阶',
    time: '5 min',
    summary: 'Redis 是什么？怎么用 Docker 装？WordPress 缓存加速、Session 存储、API 限流的配置方法。',
    content: `
<h2>Redis 是什么？</h2>
<p>简单说：一个存在内存里的超级快的数据库。MySQL 查一次要 10ms，Redis 只要 0.1ms。</p>
<p>典型用途：缓存数据库查询结果、存储用户 Session、API 请求限流、消息队列。</p>

<h2>Docker 安装</h2>
<pre><code>docker run -d --name redis \
  -p 6379:6379 \
  -v ./redis-data:/data \
  redis:7-alpine redis-server --requirepass YourPassword123</code></pre>

<h2>WordPress 缓存加速</h2>
<p>安装 Redis Object Cache 插件，然后在 wp-config.php 添加：</p>
<pre><code>define('WP_REDIS_HOST', 'localhost');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_PASSWORD', 'YourPassword123');</code></pre>
<p>启用插件后，数据库查询减少 80%+，页面加载速度提升 2-5 倍。</p>

<h2>API 请求限流（保护后端）</h2>
<p>用 Redis 实现简易限流：每个 IP 每分钟最多 60 次请求。</p>

<h2>Redis 持久化</h2>
<p>默认数据只在内存里，重启就没了。启用持久化：</p>
<pre><code># redis.conf
save 900 1       # 15 分钟内至少 1 次修改就存盘
save 300 10      # 5 分钟内 10 次修改就存盘
save 60 10000    # 1 分钟内 10000 次修改就存盘</code></pre>

<h2>安全提醒</h2>
<ul>
  <li>设置强密码（Redis 默认无密码，被扫到就是灾难）</li>
  <li>不要暴露 6379 端口到公网</li>
  <li>禁用危险命令：rename-command FLUSHDB ""；rename-command FLUSHALL ""</li>
</ul>`,
  },
  {
    slug: 'proxy-protocols',
    title: '代理协议全景：Xray / Sing-box / Hysteria2 怎么选',
    category: '代理与网络工具',
    level: '进阶',
    time: '8 min',
    summary: '三种主流代理协议的对比：谁最快、谁最稳、谁最不容易被封锁。帮你选对第一个协议。',
    content: `
<p>这篇文章不是教程，是选型指南。帮你搞清楚三种主流代理框架各自适合什么场景，以及它们底层的核心协议。</p>

<h2>三大框架对比</h2>
<table>
  <tr><th></th><th>Xray-core</th><th>Sing-box</th><th>Hysteria2</th></tr>
  <tr><td>语言</td><td>Go</td><td>Go</td><td>Go</td></tr>
  <tr><td>协议支持</td><td>VMess/VLESS/Trojan/Shadowsocks</td><td>全部主流协议</td><td>仅 QUIC/Hysteria2</td></tr>
  <tr><td>社区生态</td><td>最大、教程最多</td><td>快速增长中</td><td>专注一个协议</td></tr>
  <tr><td>配置复杂度</td><td>中等（JSON）</td><td>中等（JSON）</td><td>低（极简）</td></tr>
  <tr><td>抗封锁</td><td>REALITY 最强</td><td>支持 REALITY</td><td>QUIC 本身抗封锁</td></tr>
  <tr><td>速度</td><td>快</td><td>快</td><td>极快（暴力发包）</td></tr>
  <tr><td>资源占用</td><td>低</td><td>极低</td><td>低</td></tr>
</table>

<h2>核心选型建议</h2>
<ul>
  <li><strong>新手 → Xray + VLESS + REALITY</strong>：社区最大，出问题十分钟内必有答案。REALITY 伪装成别人网站，封锁难度最高</li>
  <li><strong>有经验的 → Sing-box</strong>：一个二进制搞定所有协议，配置更现代，性能更好</li>
  <li><strong>追求极速 → Hysteria2</strong>：基于 QUIC，暴力发包模式在高延迟跨国链路上速度惊人。但流量特征比较明显</li>
</ul>`,
  },
  {
    slug: 'adguard-home',
    title: '自建安全 DNS：AdGuard Home 去广告 + 防劫持',
    category: '代理与网络工具',
    level: '入门',
    time: '5 min',
    summary: '在 VPS 上自建 AdGuard Home，全网设备去广告 + 防 DNS 劫持 + 自定义过滤规则。',
    content: `
<h2>AdGuard Home 是什么？</h2>
<p>一个自建 DNS 服务器，在你的网络请求到达广告服务器之前就拦截掉。相当于在 DNS 层面装了一个广告过滤器，你的手机、电脑、智能电视全部受益。</p>

<h2>Docker 一键部署</h2>
<pre><code>docker run -d --name adguardhome \
  -p 53:53/tcp -p 53:53/udp \
  -p 3000:3000 \
  -p 853:853/tcp \
  -v ./work:/opt/adguardhome/work \
  -v ./conf:/opt/adguardhome/conf \
  adguard/adguardhome</code></pre>
<p>访问 http://你的IP:3000 完成初始化设置。</p>

<h2>核心功能</h2>
<ul>
  <li><strong>去广告</strong>：内置多个广告过滤规则，覆盖国内外主流广告网络</li>
  <li><strong>防追踪</strong>：拦截已知的追踪器和遥测域名</li>
  <li><strong>家长控制</strong>：屏蔽成人内容 + 强制安全搜索</li>
  <li><strong>自定义规则</strong>：可以添加你自己的黑白名单</li>
  <li><strong>DNS-over-HTTPS / DNS-over-TLS</strong>：加密 DNS，运营商看不到你访问了什么网站</li>
</ul>

<h2>配置客户端</h2>
<p>把路由器或设备的 DNS 设置指向你的 VPS IP，所有设备自动获得去广告能力。</p>

<h2>注意事项</h2>
<ul>
  <li>53 端口需要开放 UDP 和 TCP</li>
  <li>建议配合 UFW 限制访问来源 IP</li>
  <li>公网 DNS 服务器可能被滥用做放大攻击，建议只允许你家里的 IP 访问</li>
</ul>`,
  },
  {
    slug: 'tailscale-zerotier',
    title: '异地组网：Tailscale / ZeroTier 虚拟局域网',
    category: '代理与网络工具',
    level: '进阶',
    time: '6 min',
    summary: '让多台 VPS 和你的电脑组成一个虚拟局域网，像在同一个路由器下一样互相访问。',
    content: `
<h2>为什么需要虚拟局域网？</h2>
<p>你的所有设备——家里的电脑、公司的笔记本、几台 VPS——原本分散在互联网的不同角落。Tailscale 或 ZeroTier 用加密隧道把它们连成一个"虚拟局域网"，每台设备有一个内网 IP，像在同一个路由器下一样自由互访。</p>

<h2>Tailscale（推荐新手）</h2>
<p>基于 WireGuard，配置极其简单。免费版支持 100 台设备。</p>
<pre><code># 所有设备（Mac/Windows/Linux/iOS/Android）一键安装
curl -fsSL https://tailscale.com/install.sh | sh

# 登录
tailscale up</code></pre>
<p>装完后每台设备自动获得一个 100.x.y.z 的内网 IP，互相直接用这个 IP 访问。</p>

<h2>ZeroTier（推荐自建）</h2>
<p>更灵活，支持自建 Moon/Planet 节点（用自己的服务器当中继）。免费版 25 台设备。</p>
<pre><code># 安装
curl -s https://install.zerotier.com | bash

# 加入网络（先在 my.zerotier.com 创建网络获取 Network ID）
zerotier-cli join YOUR_NETWORK_ID</code></pre>

<h2>两者对比</h2>
<table>
  <tr><th></th><th>Tailscale</th><th>ZeroTier</th></tr>
  <tr><td>上手难度</td><td>极简</td><td>中等</td></tr>
  <tr><td>底层协议</td><td>WireGuard</td><td>自研</td></tr>
  <tr><td>免费上限</td><td>100 设备</td><td>25 设备</td></tr>
  <tr><td>自建控制面</td><td>Headscale</td><td>Moon/Planet</td></tr>
  <tr><td>NAT 穿透</td><td>优秀</td><td>良好</td></tr>
</ul>

<h2>实际用途举例</h2>
<ul>
  <li>用家里的电脑 SSH 到 VPS，不需要暴露 SSH 端口到公网</li>
  <li>多台 VPS 之间互通（数据库主从同步、文件传输）</li>
  <li>在外面用手机访问家里的 NAS</li>
</ul>`,
  },
  {
    slug: 'frp-cloudflare-tunnel',
    title: '内网穿透：frp / Cloudflare Tunnel 实战',
    category: '代理与网络工具',
    level: '进阶',
    time: '6 min',
    summary: '把家里没有公网 IP 的电脑/树莓派/NAS 暴露到互联网。frp 和 Cloudflare Tunnel 两种方案。',
    content: `
<h2>场景：家里有一台树莓派，想在外面访问它的 Web 界面</h2>
<p>问题是：家里的宽带没有公网 IP（或者有公网 IP 但运营商封了入站端口）。内网穿透就是在这种情况下让外部能访问到内网服务。</p>

<h2>方案一：Cloudflare Tunnel（推荐，零成本）</h2>
<p>不需要自己有公网 IP 的 VPS，Cloudflare 帮你中转。</p>
<pre><code># 在树莓派上安装 cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# 登录并创建隧道
cloudflared tunnel login
cloudflared tunnel create my-tunnel

# 配置隧道指向本地服务
# config.yml
tunnel: TUNNEL_ID
credentials-file: /root/.cloudflared/TUNNEL_ID.json
ingress:
  - hostname: pi.mydomain.com
    service: http://localhost:8080
  - service: http_status:404

# 运行
cloudflared tunnel run my-tunnel</code></pre>
<p>之后访问 pi.mydomain.com 就等于访问树莓派的 8080 端口。全程零端口开放。</p>

<h2>方案二：frp（需要一台有公网 IP 的 VPS）</h2>
<p>VPS 做服务端，内网设备做客户端。</p>
<pre><code># 服务端（VPS 上）
# frps.toml
bindPort = 7000
vhostHTTPPort = 8080

# 客户端（树莓派上）
# frpc.toml
serverAddr = "你的VPS的IP"
serverPort = 7000
[[proxies]]
name = "web"
type = "http"
localPort = 8080
customDomains = ["pi.yourdomain.com"]</code></pre>

<h2>选哪个？</h2>
<ul>
  <li><strong>有域名 + 不想维护 VPS → Cloudflare Tunnel</strong>（最省心）</li>
  <li><strong>需要 TCP/UDP 端口转发（比如远程桌面/SSH）→ frp</strong></li>
  <li><strong>流量大（CF Tunnel 免费版有隐性限速）→ frp</strong></li>
</ul>`,
  },
  {
    slug: 'ollama-ai-deploy',
    title: 'AI 大模型本地部署：Ollama + DeepSeek / Qwen 实战',
    category: '特色用途',
    level: '进阶',
    time: '8 min',
    summary: '在 VPS 上用 Ollama 跑本地大模型：安装、选模型、调参、Open WebUI 搭建。4G 内存就能跑 4B 模型。',
    content: `
<h2>为什么在 VPS 上跑 AI？</h2>
<p>把 AI 跑在自己的 VPS 上有三个好处：数据不离开你的服务器（隐私）、不需要 API 密钥（省钱）、7×24 在线（随时用）。VPS 的 CPU 推理速度虽然慢于 GPU，但 1-4B 的量化模型已经可以做到实用。</p>

<h2>安装 Ollama</h2>
<pre><code>curl -fsSL https://ollama.com/install.sh | sh</code></pre>

<h2>选模型（基于内存限制）</h2>
<table>
  <tr><th>内存</th><th>推荐模型</th><th>能力水平</th></tr>
  <tr><td>2GB</td><td>qwen3:0.6b</td><td>基础对话</td></tr>
  <tr><td>4GB</td><td>qwen3:1.7b / minicpm5</td><td>一般问答</td></tr>
  <tr><td>8GB</td><td>qwen3:4b</td><td>良好（≈Qwen2.5-7B）</td></tr>
  <tr><td>16GB</td><td>qwen3:8b</td><td>优秀（≈Qwen2.5-14B）</td></tr>
</table>

<h2>基本使用</h2>
<pre><code># 拉取模型
ollama pull qwen3:4b

# 命令行对话
ollama run qwen3:4b

# API 调用（兼容 OpenAI 格式）
curl http://localhost:11434/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"qwen3:4b","messages":[{"role":"user","content":"你好"}]}'</code></pre>

<h2>搭 Web 界面（Open WebUI）</h2>
<pre><code>docker run -d --name open-webui \
  -p 3000:8080 \
  -v open-webui:/app/backend/data \
  ghcr.io/open-webui/open-webui:main</code></pre>
<p>访问 http://你的IP:3000，注册账号，选择模型，跟 ChatGPT 几乎一样的体验。</p>

<h2>性能优化</h2>
<ul>
  <li>模型加载需要几十秒，用 <code>OLLAMA_KEEP_ALIVE=24h</code> 让模型常驻内存</li>
  <li>加 swap（至少同等于模型大小）防止 OOM</li>
  <li>设置 num_ctx=4096 或 8192 控制上下文窗口，越长越吃内存</li>
</ul>`,
  },
  {
    slug: 'mail-server',
    title: '自建邮件服务器：Docker Mailserver 企业邮局',
    category: '特色用途',
    level: '进阶',
    time: '8 min',
    summary: '用 Docker Mailserver 在自己的 VPS 上搭建完整的邮件服务器，拥有 yourname@yourdomain.com。',
    content: `
<p>拥有 yourname@yourdomain.com 是极客的浪漫。但自建邮局是运维"深水区"——搞不好发出的邮件全进垃圾箱。</p>

<h2>Docker Mailserver 部署</h2>
<p>这是一个打包了 Postfix + Dovecot + Rspamd 的瑞士军刀。</p>
<pre><code># docker-compose.yml
services:
  mailserver:
    image: docker.io/mailserver/docker-mailserver:latest
    hostname: mail.yourdomain.com
    ports:
      - "25:25"      # SMTP
      - "143:143"    # IMAP
      - "587:587"    # SMTP Submission
      - "993:993"    # IMAPS
    volumes:
      - ./data:/var/mail
      - ./config:/tmp/docker-mailserver
    environment:
      - ENABLE_SPAMASSASSIN=1
      - ENABLE_CLAMAV=0
      - ENABLE_FAIL2BAN=1
      - ENABLE_POSTSCREEN=1

# 首次配置
docker compose up -d
docker exec -it mailserver setup email add user@yourdomain.com</code></pre>

<h2>邮件服务器必须做的四件事</h2>
<ol>
  <li><strong>SPF 记录</strong>：在 DNS 中添加 TXT 记录，声明哪些服务器有权用你的域名发邮件</li>
  <li><strong>DKIM 签名</strong>：给每封邮件加数字签名，证明没有被篡改</li>
  <li><strong>DMARC 策略</strong>：告诉接收方如果 SPF/DKIM 失败该怎么处理</li>
  <li><strong>PTR 反向解析</strong>：让 VPS 商家设置 IP 的反向 DNS，指向你的邮件域名</li>
</ol>
<p>四者缺一不可。缺任何一个，Gmail/Outlook 都会把你的邮件扔进垃圾箱。</p>

<h2>大坑预警</h2>
<ul>
  <li>很多 VPS 商家封了 25 端口（防止滥发垃圾邮件）——买之前确认 25 端口可用</li>
  <li>大厂（Gmail/Yahoo）新规要求自建邮件服务器有极高的发送信誉</li>
  <li>维护成本高：需要持续监控黑名单、处理退信、保持 IP 信誉</li>
</ul>

<h2>替代方案（推荐）</h2>
<p>对于大多数用户，用第三方邮件服务绑定自己的域名更实际：</p>
<ul>
  <li>Zoho Mail：免费 5 用户，支持自定义域名</li>
  <li>Cloudflare Email Routing：免费转发，不存储邮件</li>
  <li>Microsoft 365 / Google Workspace：付费但省心</li>
</ul>
<p>自建邮件服务器是个好项目，但如果你只是想要 yourname@yourdomain.com，上面这些方案一天搞完且不会进垃圾箱。</p>`,
  },
  {
    slug: 'game-server',
    title: '游戏服务器搭建：Minecraft / Palworld 一条龙',
    category: '特色用途',
    level: '进阶',
    time: '6 min',
    summary: '用 VPS 搭建 Minecraft 和幻兽帕鲁私服，叫上朋友一起玩。Docker 一条龙部署。',
    content: `
<h2>为什么用 VPS 开游戏服务器？</h2>
<ul>
  <li>自己电脑关机了朋友就玩不了 → VPS 7×24 在线</li>
  <li>家庭宽带上行带宽小 → VPS 有对称带宽</li>
  <li>不用折腾端口映射和动态 DNS</li>
</ul>

<h2>Minecraft Java 版服务器</h2>
<p>内存要求：2-4 人 2GB，10 人+ 4GB+。</p>
<pre><code>docker run -d --name mc \
  -p 25565:25565 \
  -e EULA=TRUE \
  -e MEMORY=2G \
  -v ./mc-data:/data \
  itzg/minecraft-server</code></pre>

<h2>幻兽帕鲁 (Palworld) 服务器</h2>
<pre><code>docker run -d --name palworld \
  -p 8211:8211/udp \
  -v ./pal-data:/palworld \
  -e PLAYERS=16 \
  thijsvanloef/palworld-server-docker</code></pre>

<h2>服务器配置建议</h2>
<table>
  <tr><th>游戏</th><th>最低 CPU</th><th>最低内存</th><th>推荐内存</th></tr>
  <tr><td>Minecraft（原版）</td><td>2 核</td><td>2GB</td><td>4GB</td></tr>
  <tr><td>Minecraft（Mod）</td><td>4 核</td><td>4GB</td><td>8GB</td></tr>
  <tr><td>Palworld</td><td>4 核</td><td>8GB</td><td>16GB</td></tr>
  <tr><td>Terraria</td><td>1 核</td><td>1GB</td><td>2GB</td></tr>
</table>

<h2>重要提示</h2>
<ul>
  <li>游戏服务器对 CPU 单核性能敏感，不要用超售严重的低价 VPS</li>
  <li>Minecraft 吃单核，AMD EPYC 或 Intel 高频型号更合适</li>
  <li>记得定时备份世界存档</li>
  <li>关闭不需要的游戏服务器以节省资源</li>
</ul>`,
  },
  {
    slug: 'media-server',
    title: '媒体服务器 + PT下载：Plex / Jellyfin + qBittorrent',
    category: '特色用途',
    level: '进阶',
    time: '7 min',
    summary: '用 VPS 搭建私人流媒体服务器：随时随地看自己的影视库 + PT/BT 下载一站搞定。',
    content: `
<h2>Jellyfin — 免费开源的流媒体服务器</h2>
<p>自建 Netflix。把你的电影/电视剧/音乐库放进去，Jellyfin 自动抓取封面和元数据，在任何设备上流畅播放。</p>
<pre><code>docker run -d --name jellyfin \
  -p 8096:8096 \
  -v ./media:/media \
  -v ./jellyfin-config:/config \
  jellyfin/jellyfin</code></pre>

<h2>Plex — 体验更好的付费方案</h2>
<p>Jellyfin 的开源竞争者，界面和客户端更精致。免费版够用，Plex Pass 付费后解锁硬件转码。</p>

<h2>硬件转码注意</h2>
<p>如果直接在 VPS 上转码 4K 视频，CPU 会爆炸。要么：</p>
<ul>
  <li>选支持硬件转码的 VPS（有 GPU 或 Intel QSV 的很少）</li>
  <li>直接用原始格式播放，不做转码（需要客户端支持）</li>
  <li>提前把视频压成客户端能直接播放的格式</li>
</ul>

<h2>qBittorrent — BT/PT 下载</h2>
<pre><code>docker run -d --name qbittorrent \
  -p 8080:8080 \
  -v ./downloads:/downloads \
  -v ./qb-config:/config \
  linuxserver/qbittorrent</code></pre>

<h2>⚠️ 合规提醒</h2>
<ul>
  <li>下载受版权保护的内容在大多数国家是非法的</li>
  <li>VPS 商家通常会因为 DMCA 投诉而直接封机</li>
  <li>如果一定要玩 PT，选 DMCA 忽略机房的商家（如 BuyVM 卢森堡、Naranja 荷兰）</li>
  <li>建议开一个 VPN 或只用私有 tracker</li>
</ul>`,
  },
  {
    slug: 'cron-python-automation',
    title: '自动化脚本部署：Cron + Python 定时任务',
    category: '特色用途',
    level: '入门',
    time: '5 min',
    summary: '让 VPS 自动帮你干活：定时爬虫、自动备份、健康检查、每日报告。Cron 和 Python 的最佳组合。',
    content: `
<h2>Cron 定时任务基础</h2>
<pre><code># 编辑定时任务
crontab -e

# 格式：分 时 日 月 周 命令
0 3 * * * /root/backup.sh          # 每天凌晨 3 点备份
*/5 * * * * /root/healthcheck.sh   # 每 5 分钟健康检查
0 * * * * python3 /root/crawler.py # 每小时运行爬虫

# 查看当前定时任务
crontab -l</code></pre>

<h2>实用脚本示例：VPS 健康检查</h2>
<pre><code>#!/bin/bash
# healthcheck.sh — 检查服务是否存活
services=("nginx" "mysql" "docker")
for s in "\${services[@]}"; do
  if ! systemctl is-active --quiet $s; then
    echo "$s is DOWN! Restarting..." | tee -a /var/log/health.log
    systemctl restart $s
  fi
done

# 磁盘使用率超过 90% 时告警
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $USAGE -gt 90 ]; then
  echo "Disk usage at \${USAGE}%!" | tee -a /var/log/health.log
fi</code></pre>

<h2>实用脚本示例：Python 定时爬虫</h2>
<pre><code># crawler.py — 定时抓取数据
import requests
from datetime import datetime

url = "https://api.example.com/data"
data = requests.get(url).json()
with open(f"/data/snapshot-{datetime.now():%Y%m%d-%H%M}.json", "w") as f:
    import json; json.dump(data, f)</code></pre>

<h2>日志管理</h2>
<p>Cron 任务的输出默认会发邮件（需要配邮件服务）。更好的做法是重定向到日志文件：</p>
<pre><code>0 * * * * python3 /root/crawler.py >> /var/log/crawler.log 2>&1</code></pre>`,
  },
  {
    slug: 'server-monitoring',
    title: '哪吒探针 + Uptime Kuma 服务器监控搭建',
    category: '监控运维',
    level: '入门',
    time: '6 min',
    summary: '两套开源监控工具：哪吒探针监控多台 VPS 的资源，Uptime Kuma 监控网站是否在线。',
    content: `
<h2>哪吒探针 — 多服务器监控面板</h2>
<p>一个 Dashboard 看所有 VPS 的 CPU / 内存 / 磁盘 / 网络 / 在线状态。支持 Telegram / 微信通知。</p>
<pre><code># 服务端（主控面板）
curl -L https://raw.githubusercontent.com/naiba/nezha/master/script/install.sh -o nezha.sh
chmod +x nezha.sh
./nezha.sh install_dashboard

# 客户端（每台被监控的 VPS 上）
curl -L https://raw.githubusercontent.com/naiba/nezha/master/script/install.sh -o nezha.sh
chmod +x nezha.sh
./nezha.sh install_agent --server 面板IP --port 面板gRPC端口 --secret 密钥</code></pre>

<h2>Uptime Kuma — 网站可用性监控</h2>
<p>监控你的网站/API 是否在线，挂了立刻通知。支持 HTTP/TCP/DNS/Ping 多种检测方式。</p>
<pre><code>docker run -d --name uptime-kuma \
  -p 3001:3001 \
  -v ./uptime-data:/app/data \
  louislam/uptime-kuma:1</code></pre>
<p>访问 http://你的IP:3001，添加监控目标（URL/IP），设置通知方式（Telegram / 邮件 / Webhook）。</p>

<h2>两者配合</h2>
<ul>
  <li><strong>哪吒探针</strong>：VPS 本身有没有问题（CPU 满载、内存泄漏、磁盘快满）</li>
  <li><strong>Uptime Kuma</strong>：服务有没有问题（网站挂了、API 超时、SSL 证书快过期）</li>
</ul>
<p>两个配合使用，出问题 30 秒内收到通知。</p>`,
  },
  {
    slug: 'vps-benchmark',
    title: '新机到手 30 分钟检测：YABS + 回程 + IP 质量',
    category: '监控运维',
    level: '入门',
    time: '6 min',
    summary: '拿到新 VPS 的三步验货流程：YABS 性能跑分、三网回程路由、流媒体解锁 + IP 风险评估。',
    content: `
<p>VPS 到手第一件事不是装软件，是验货——看你买的配置跟你拿到的是不是一回事。</p>

<h2>第 1 步：YABS 综合跑分（10 分钟）</h2>
<pre><code>curl -sL yabs.sh | bash</code></pre>
<p>测试项目：</p>
<ul>
  <li><strong>磁盘 IO</strong>：NVMe 应该 > 500 MB/s，SATA SSD > 200 MB/s。低于 100 就是被超售了</li>
  <li><strong>网络速度</strong>：测试到全球多个测速点的上下行带宽</li>
  <li><strong>Geekbench 6</strong>：CPU 单核/多核跑分（可选，耗时较长）</li>
</ul>

<h2>第 2 步：三网回程路由（5 分钟）</h2>
<pre><code># nexttrace 测试
nexttrace 180.101.50.242   # 电信
nexttrace 112.80.248.74    # 联通
nexttrace 221.130.33.52    # 移动</code></pre>
<p>看每家运营商的回国路径，确认线路跟商家宣传的一致。</p>

<h2>第 3 步：流媒体解锁 + IP 风险评估（5 分钟）</h2>
<pre><code># 流媒体解锁
bash <(curl -sSL https://raw.githubusercontent.com/lmc999/RegionRestrictionCheck/main/check.sh)

# IP 风险评估
curl ipinfo.io
# 重点看：IP 类型（hosting/business/isp）、是否在黑名单中</code></pre>

<h2>验货通过标准</h2>
<table>
  <tr><th>项目</th><th>合格</th><th>优秀</th></tr>
  <tr><td>磁盘 IO（NVMe）</td><td>&gt; 300 MB/s</td><td>&gt; 1 GB/s</td></tr>
  <tr><td>带宽</td><td>≥ 标称值 80%</td><td>≥ 标称值</td></tr>
  <tr><td>回国延迟</td><td>≤ 商家宣称 + 20ms</td><td>≤ 商家宣称</td></tr>
  <tr><td>丢包率</td><td>&lt; 2%</td><td>&lt; 0.5%</td></tr>
  <tr><td>流媒体</td><td>至少解锁 1 个</td><td>解锁目标区域主力平台</td></tr>
</table>
<p>三项检测全过 → 这台机器可以留。任何一项严重不符 → 联系客服或退款。</p>`,
  },
  {
    slug: 'free-vps',
    title: '免费 VPS 完全攻略：Oracle Cloud 申请 + 学生优惠',
    category: '免费与省钱',
    level: '进阶',
    time: '10 min',
    summary: 'Oracle Cloud 4核24G永久免费、GitHub 学生包、AWS/GCP 免费额度——手把手申请教程。',
    content: `
<h2>Oracle Cloud Always Free — 最慷慨的免费 VPS</h2>
<p>Oracle 提供永久免费的云资源，最著名的是 ARM Ampere 实例：<strong>最多 4 核 24GB 内存，完全免费</strong>。</p>

<h3>申请流程</h3>
<ol>
  <li>访问 cloud.oracle.com，点击"免费试用"</li>
  <li>填写邮箱、地区选"首尔"或"东京"（最近中国大陆）</li>
  <li>验证手机号（中国大陆手机号可以）</li>
  <li>添加信用卡（只验证，不扣费。借记卡可能被拒，建议用信用卡）</li>
  <li>等待验证（1 分钟到 24 小时不等）</li>
</ol>

<h3>常见翻车原因</h3>
<ul>
  <li>IP 被判定为高风险（用手机流量 + 无痕模式试试）</li>
  <li>信用卡被拒（换一张卡，不要用虚拟卡）</li>
  <li>信息不一致（姓名/地址要和银行记录完全一致）</li>
  <li>同 IP 多次注册（换个网络环境）</li>
</ul>

<h3>开户成功后</h3>
<ol>
  <li>创建 ARM 实例：选 Ampere、4 OCPU、24GB RAM</li>
  <li>注意免费额度：每月 10TB 出站流量，超出会收费</li>
  <li>创建后保持活跃：运行一些轻量服务防止被回收</li>
</ol>

<h2>GitHub 学生包</h2>
<p>如果你有 .edu 邮箱，GitHub Student Developer Pack 包含 $100+ 的云服务额度。</p>

<h2>其他免费/试用方案</h2>
<table>
  <tr><th>平台</th><th>免费内容</th><th>时效</th></tr>
  <tr><td>Oracle Cloud</td><td>4核24GB ARM</td><td>永久免费</td></tr>
  <tr><td>AWS Free Tier</td><td>t2.micro 1GB</td><td>12 个月</td></tr>
  <tr><td>GCP Free Tier</td><td>e2-micro 1GB</td><td>永久免费</td></tr>
  <tr><td>Azure 免费</td><td>B1s 1GB</td><td>12 个月</td></tr>
  <tr><td>腾讯云 Lighthouse</td><td>新人免费试用</td><td>7-30 天</td></tr>
</table>

<h2>免费 VPS 的真实成本</h2>
<ul>
  <li><strong>时间成本</strong>：Oracle 申请可能要试很多次</li>
  <li><strong>心智成本</strong>：担心资源被回收、超额账单</li>
  <li><strong>建议</strong>：有能力的话，花 $2/月买一台正经 VPS，省下的时间更值钱</li>
</ul>`,
  },
  {
    slug: 'vps-deals',
    title: 'VPS 省钱大全：黑五 / 促销 / 优惠码 / 年付策略',
    category: '免费与省钱',
    level: '入门',
    time: '6 min',
    summary: 'VPS 什么时候买最便宜？黑五能便宜多少？年付省多少但有风险？实惠购机全攻略。',
    content: `
<h2>什么时候买最便宜？</h2>
<table>
  <tr><th>时间</th><th>折扣力度</th><th>适合买什么</th></tr>
  <tr><td>11 月黑五/网一</td><td>30-50% OFF</td><td>年付套餐，一年屯一次</td></tr>
  <tr><td>7 月美国独立日</td><td>20-40% OFF</td><td>年中补货</td></tr>
  <tr><td>圣诞/新年</td><td>20-40% OFF</td><td>年底促销</td></tr>
  <tr><td>新品上线</td><td>首发特价</td><td>新商家需要口碑时最实惠</td></tr>
  <tr><td>平日</td><td>5-10% OFF</td><td>用优惠码</td></tr>
</table>

<h2>年付 vs 月付策略</h2>
<ul>
  <li><strong>年付</strong>：通常省 20-30%，但你赌商家一年不跑路</li>
  <li><strong>月付</strong>：随时可换，风险为零</li>
  <li><strong>策略</strong>：月付试用 1-2 个月 → 满意后年付。不要上来就年付一个陌生的商家</li>
</ul>

<h2>省钱技巧</h2>
<ul>
  <li><strong>关注 LowEndTalk/低端论坛</strong>：商家经常在这里发专属优惠码</li>
  <li><strong>叠加优惠</strong>：有些商家允许优惠码 + 年付折扣同时使用</li>
  <li><strong>大厂免费额度组合</strong>：AWS Lightsail 首月免费 + GCP $300 试用额度</li>
</ul>

<h2>避坑</h2>
<ul>
  <li>"原价 $100，现价 $10" 是营销套路——看看同配置其他商家卖多少钱</li>
  <li>促销价可能是"续费原价"，注意看 renewal price</li>
  <li>按小时计费的 VPS（Vultr/DigitalOcean）没有促销压力，随时买都合理</li>
</ul>`,
  },
  {
    slug: 'icp-compliance',
    title: 'ICP 备案与海外 VPS 合规指南：法律红线一览',
    category: '合规与法律',
    level: '入门',
    time: '7 min',
    summary: '用海外 VPS 建站需要备案吗？哪些用途合法哪些可能违法？国内国外 VPS 的法律边界全解析。',
    content: `
<p>首先明确：<strong>海外 VPS 本身是合法的</strong>。是否需要备案取决于你的使用方式。</p>

<h2>需要 ICP 备案的情况</h2>
<ul>
  <li>网站服务器在中国大陆（用国内云服务器比如阿里云/腾讯云）→ <strong>必须备案</strong></li>
  <li>域名通过中国大陆的 CDN 节点提供服务 → 必须备案</li>
  <li>备案是网站的"身份证"，没有备案号的网站在国内访问会被拦截</li>
</ul>

<h2>不需要备案的情况</h2>
<ul>
  <li>服务器在海外，域名在海外注册商，用户访问不走中国境内 CDN → <strong>不需要备案</strong></li>
  <li>海外 VPS 搭建的个人博客、企业展示站、代理服务</li>
</ul>

<h2>海外 VPS 合法用途</h2>
<ul>
  <li>✅ 个人博客/技术文章</li>
  <li>✅ 跨境电商独立站</li>
  <li>✅ 企业海外官网</li>
  <li>✅ 自用代理/VPN（仅限个人合法用途）</li>
  <li>✅ 学习和实验</li>
</ul>

<h2>明确违法或灰色地带的用途</h2>
<ul>
  <li>🚫 提供公开 VPN 服务给他人使用</li>
  <li>🚫 搭建赌博/色情/诈骗网站</li>
  <li>🚫 侵犯知识产权（盗版网站）</li>
  <li>🚫 未经授权的渗透测试（黑客攻击）</li>
  <li>🚫 加密货币交易所（需取得相关牌照）</li>
  <li>⚠️ 面向国内用户提供视频/社交服务（可能被墙，但不算违法）</li>
</ul>

<h2>数据跨境注意事项</h2>
<ul>
  <li>如果收集中国用户的个人信息，根据《个人信息保护法》需要遵守数据出境规定</li>
  <li>欧盟用户适用 GDPR</li>
  <li>建议：在网站上添加隐私政策页面，说明数据存储位置和使用方式</li>
</ul>

<h2>实用建议</h2>
<ul>
  <li>个人博客/技术站 → 海外 VPS 完全够用，不需要备案</li>
  <li>面向国内用户的商业网站 → 老实备案用国内服务器</li>
  <li>不想备案又需要国内用户访问 → 海外 VPS + Cloudflare CDN（但速度不如国内）</li>
  <li>不确定合不合法？→ 不要做，或者咨询律师</li>
</ul>`,
  },
  // ============================================================
  // 十二、国内VPS（3篇）
  // ============================================================
  {
    slug: 'icp-practical-guide',
    title: 'ICP 备案全流程实操：从零到备案号到手',
    category: '国内VPS',
    level: '进阶',
    time: '10 min',
    summary: '手把手带你把 ICP 备案走完，包括资料准备、提交流程、审核时间线和常见被拒原因。',
    content: `
<p>上篇 <a href="/knowledge/icp-compliance">ICP 备案合规指南</a> 讲的是法律边界——什么情况需要备案、什么情况不需要。这篇讲实操：<strong>真要备案，每一步怎么走</strong>。</p>

<h2>备案前准备：三样东西缺一不可</h2>
<table>
  <tr><td>1. 身份证</td><td>个人备案只需身份证正反面照片。企业备案需要营业执照、法人身份证。</td></tr>
  <tr><td>2. 域名</td><td>已通过实名认证的域名。.cn /.com /.net 均可，但域名实名信息必须和备案主体一致。</td></tr>
  <tr><td>3. 云服务器</td><td>有效期 3 个月以上的国内云服务器。阿里云、腾讯云等大厂都会在购买页明确标注"可用于备案"。</td></tr>
</table>
<p><strong>关键点</strong>：域名实名和备案主体必须是同一个人/同一家公司。张三的域名用李四的身份备案，会被直接驳回。</p>

<h2>第一步：在云服务商提交备案申请</h2>
<ol>
  <li>登录阿里云/腾讯云控制台，进入"备案"页面</li>
  <li>填写主体信息：姓名、身份证号、住址、手机号</li>
  <li>填写网站信息：域名、网站名称（不能太宽泛如"个人网站"）、网站简介</li>
  <li>上传身份证正反面照片、手持身份证照片</li>
  <li>进行人脸识别验证</li>
</ol>
<p>网站名称是高频踩坑点。"我的博客""个人主页"这类名字可能被驳回。建议用具体的如"老张的技术笔记"或你的域名去掉后缀。</p>

<h2>第二步：服务商初审（1-2 个工作日）</h2>
<p>提交后，云服务商会先审核一遍。他们有专门的备案审核团队，会检查：</p>
<ul>
  <li>身份证照片是否清晰（反光、模糊、遮挡都会被驳回）</li>
  <li>网站名称是否符合规范</li>
  <li>域名实名信息和备案主体是否一致</li>
</ul>
<p>初审通过后会收到短信通知。如果不通过，会告诉你具体原因，改完重新提交即可，不限次数。</p>

<h2>第三步：管局审核（各省时间不同）</h2>
<table>
  <tr><th>省份</th><th>预计审核时间</th><th>备注</th></tr>
  <tr><td>上海</td><td>5-7 个工作日</td><td>全国最快之一</td></tr>
  <tr><td>广东</td><td>7-12 个工作日</td><td>个人备案较宽松</td></tr>
  <tr><td>北京</td><td>10-15 个工作日</td><td>审核较严</td></tr>
  <tr><td>浙江</td><td>7-10 个工作日</td><td>企业备案快，个人中等</td></tr>
  <tr><td>其他省份</td><td>10-20 个工作日</td><td>平均 2-3 周</td></tr>
</table>
<p>服务商初审通过后，备案会自动提交到对应的通信管理局。你不需要自己去管局，服务商会帮你转交。管局审核期间，你的手机会收到一条工信部验证短信，<strong>必须在 24 小时内回复</strong>，否则备案会被驳回。</p>

<h2>第四步：备案号下发 + 网站上线</h2>
<p>管局审核通过后：</p>
<ol>
  <li>你会收到备案号，格式如"沪ICP备XXXXXXXX号"</li>
  <li>在网站底部添加备案号，并链接到 <a href="https://beian.miit.gov.cn" target="_blank" rel="nofollow noopener">beian.miit.gov.cn</a></li>
  <li>部分省份还要求公安备案（网安备案），在备案号下发后 30 天内完成</li>
</ol>

<h2>常见被驳回原因和解决方法</h2>
<table>
  <tr><th>驳回原因</th><th>解决方法</th></tr>
  <tr><td>身份证照片模糊/反光</td><td>白天自然光下重拍，确保四角完整、字迹清晰</td></tr>
  <tr><td>网站名称不合规</td><td>不用"博客""论坛""商城"等敏感词，改成具体描述</td></tr>
  <tr><td>域名实名信息不一致</td><td>去域名注册商修改实名信息，和备案主体一致</td></tr>
  <tr><td>手机号非本人实名</td><td>备案手机号必须是备案人本人的实名手机号</td></tr>
  <tr><td>域名未满 3 天</td><td>部分管局要求域名注册满 3 天后才能提交</td></tr>
</table>

<h2>备案后维护</h2>
<ul>
  <li>每年至少登录一次云服务商备案系统，确认信息有效</li>
  <li>手机号换了要及时更新备案信息</li>
  <li>域名过期不续费，备案号会被注销</li>
  <li>网站内容变了（比如个人变企业），需要变更备案</li>
</ul>
<p><strong>全程免费</strong>。ICP 备案本身不收费，任何说备案要收费的都是第三方代办，没必要花钱。</p>`,
  },
  {
    slug: 'domestic-vs-overseas-vps',
    title: '国内 vs 海外 VPS 怎么选：一张表帮你做决定',
    category: '国内VPS',
    level: '入门',
    time: '8 min',
    summary: '从价格、速度、合规、自由度四个维度全面对比，按你的使用场景给出明确推荐。',
    content: `
<p>这可能是 VPS 选购中最灵魂拷问的问题：<strong>国内云服务器还是海外 VPS？</strong> 答案不是谁好谁坏，而是你的需求是什么。</p>

<h2>核心差异一表对比</h2>
<table>
  <tr><th>维度</th><th>国内云服务器</th><th>海外 VPS</th></tr>
  <tr><td>国内访问速度</td><td>极快（1-30ms）</td><td>取决于线路，CN2 GIA 约 30-80ms，普通线路 150-300ms</td></tr>
  <tr><td>起步价格</td><td>新用户约 40-100 元/年（1C1G）</td><td>年付 $10-30（约 70-200 元），但配置通常更高</td></tr>
  <tr><td>续费价格</td><td>新用户优惠后恢复正常价，约 300-600 元/年</td><td>续费同价或小幅上涨，年付 $15-40</td></tr>
  <tr><td>ICP 备案</td><td>必须备案，否则域名无法访问</td><td>不需要备案</td></tr>
  <tr><td>带宽</td><td>通常 1-5Mbps 小水管，按带宽计费</td><td>通常 100Mbps-1Gbps 共享，按流量计费</td></tr>
  <tr><td>内容合规</td><td>严格审查，敏感内容直接拦截</td><td>相对宽松，但不能违法</td></tr>
  <tr><td>支付方式</td><td>支付宝/微信</td><td>PayPal/信用卡/虚拟币，部分支持支付宝</td></tr>
  <tr><td>线路质量</td><td>国内 BGP 三网直连，延迟极低</td><td>看商家线路，CN2 GIA/9929/CMIN2 是天花板</td></tr>
  <tr><td>防御能力</td><td>自带基础 DDoS 防护，可升级高防</td><td>大部分无防护，少数提供基础清洗</td></tr>
</table>

<h2>国内云服务器优势场景</h2>
<ul>
  <li><strong>面向国内用户的商业网站</strong>：电商、企业官网、SaaS 服务。国内用户打开秒级响应，转化率高</li>
  <li><strong>需要备案的正规项目</strong>：备案号是你的"营业执照"，微信小程序、支付接入都要求备案域名</li>
  <li><strong>微信生态</strong>：公众号、小程序的后端必须用备案域名，海外机无法接入微信支付</li>
  <li><strong>低延迟刚需</strong>：在线教育、直播、游戏服务器，国内机和国内用户之间的延迟可以做到 10ms 以内</li>
</ul>

<h2>海外 VPS 优势场景</h2>
<ul>
  <li><strong>个人博客/技术站</strong>：不需要备案，开了就能用。晚高峰速度慢点也不影响阅读</li>
  <li><strong>不想备案的开发者</strong>：省事。备案流程走下来最快也要一周，慢的可能拖一个月</li>
  <li><strong>跨境业务</strong>：面向海外用户的网站用海外机，全球 CDN 一挂，哪个国家都快</li>
  <li><strong>代理/TUN 流量</strong>：海外机天然适合，国内机做这个违规</li>
  <li><strong>高带宽需求</strong>：海外 VPS 的带宽通常是国内机的 10-100 倍，跑下载、流媒体、大文件传输很合适</li>
  <li><strong>实验/折腾</strong>：海外 VPS 几美元一个月，重装系统、换 IP 随便玩，不怕搞坏</li>
</ul>

<h2>决策框架：按场景选择</h2>
<table>
  <tr><th>你的场景</th><th>推荐</th><th>理由</th></tr>
  <tr><td>个人博客，受众在国内</td><td>海外 VPS + CDN</td><td>免备案，Cloudflare CDN 能弥补速度短板</td></tr>
  <tr><td>商业网站 / 电商 / SaaS</td><td>国内云服务器</td><td>备案是门槛，但速度、支付、微信生态都强依赖</td></tr>
  <tr><td>面向海外用户的产品</td><td>海外 VPS</td><td>海外机在全球网络好，且面向海外用户不需要备案</td></tr>
  <tr><td>学习 Linux / DevOps</td><td>海外 VPS</td><td>便宜、开箱即用、随便折腾，重装不用等</td></tr>
  <tr><td>自建代理 / 跨境访问</td><td>海外 VPS</td><td>国内机做这个违规，只考虑海外线路好的机器</td></tr>
  <tr><td>混合需求（官网+API+代理）</td><td>混合组网</td><td>国内机备案建站，海外机做后端和代理</td></tr>
</table>

<h2>常见误区</h2>
<ul>
  <li><strong>"海外 VPS 国内打不开"</strong>：不是打不开，是慢。线路好的 VPS（CN2 GIA/9929/CMIN2）国内访问体验接近国内机</li>
  <li><strong>"国内机更贵"</strong>：新用户首年确实便宜（甚至免费试用），但续费原价后比海外 VPS 贵不少。长期持有的话海外机更划算</li>
  <li><strong>"海外机不安全"</strong>：安全不取决于位置，取决于你的配置。SSH 密钥登录、UFW、Fail2ban 配好，在哪都安全</li>
  <li><strong>"大厂比小厂靠谱"</strong>：不一定。AWS/阿里云也会宕机，很多小 VPS 商家跑了好多年比大厂还稳</li>
</ul>`,
  },
  {
    slug: 'hybrid-vps-network',
    title: '国内外 VPS 混合组网：一套架构吃遍双线优势',
    category: '国内VPS',
    level: '进阶',
    time: '12 min',
    summary: '国内机备案建站 + 海外机后端加速的混合架构，四种方案从简到繁，带完整配置示例。',
    content: `
<p>聪明的玩法不是二选一，而是<strong>两个都要</strong>。国内机负责面向用户的 Web 服务，海外机负责不需要备案的后端、API、代理流量。这篇文章讲清楚怎么把它们串起来。</p>

<h2>方案一：国内机 Web + 海外机 API（最简单）</h2>
<p>适合场景：国内机备案建站，海外机跑数据密集型的后端服务。</p>

<h3>架构</h3>
<pre><code>用户浏览器
    │
    ▼
国内云服务器（Nginx 前端, 备案域名）
    │  静态文件直接返回
    │  动态请求 proxy_pass
    ▼
海外 VPS（后端 API / 数据库 / Python 脚本）</code></pre>

<h3>国内机 Nginx 配置</h3>
<pre><code>server {
    listen 80;
    server_name example.com;

    # 静态文件直接返回
    location / {
        root /var/www/html;
    }

    # API 请求转发到海外机
    location /api/ {
        proxy_pass https://api.overseas.example.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}</code></pre>
<p>优点：实现简单，一条 proxy_pass 搞定。缺点：API 请求走国内→海外，延迟 100-200ms，不适合实时性要求高的场景。</p>

<h2>方案二：海外机建站 + 国内 CDN（需备案）</h2>
<p>适合场景：你的主站在海外，但想让国内用户访问更快。</p>

<h3>架构</h3>
<pre><code>用户（国内）
    │
    ▼
国内 CDN 节点（缓存静态资源）
    │  回源请求
    ▼
海外 VPS（源站）</code></pre>

<h3>操作步骤</h3>
<ol>
  <li>海外 VPS 正常搭建网站，绑定域名</li>
  <li>域名在国内 CDN 厂商完成备案（这一步需要国内服务器辅助）</li>
  <li>CDN 配置回源到海外 VPS IP</li>
  <li>域名 CNAME 指向 CDN 加速域名</li>
</ol>
<p>核心逻辑：静态资源（图片、CSS、JS）缓存到国内 CDN 节点，用户访问时从最近的节点拉取，只有动态请求才回源海外。对于内容型网站，缓存命中率可以到 90% 以上，实际体验接近国内机。</p>

<h2>方案三：Tailscale 异地组网</h2>
<p>适合场景：个人开发者、小团队，想用最简单的方式打通国内外机器。</p>

<h3>搭建（3 步搞定）</h3>
<pre><code># 每台机器上都执行
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# 国内机
tailscale up --advertise-routes=10.0.1.0/24

# 海外机
tailscale up --advertise-routes=10.0.2.0/24

# 在 Tailscale 管理后台启用 subnet routes</code></pre>

<p>配好后，国内机和海外机可以通过 Tailscale 内网 IP 直接通信，延迟虽然受物理距离影响但连接稳定。你可以：</p>
<ul>
  <li>海外机的数据库只监听 Tailscale IP，国内机通过内网 IP 直连，不用暴露公网端口</li>
  <li>用 Tailscale SSH 远程管理，不需要开放 22 端口</li>
  <li>海外机下载的文件通过 Tailscale 直接传到国内机</li>
</ul>

<h2>方案四：frp 内网穿透 + Nginx 反代</h2>
<p>适合场景：你需要把海外机的某个服务"搬"到国内域名下，让用户感觉不到跨境的延迟。</p>

<h3>架构</h3>
<pre><code>用户（国内）
    │
    ▼
国内云服务器（frp 客户端 + Nginx, 备案域名）
    │  通过 frp 加密隧道
    ▼
海外 VPS（frp 服务端, 实际服务）</code></pre>

<h3>海外机 - frp 服务端</h3>
<pre><code># frps.toml
bindPort = 7000

[[proxies]]
name = "web"
type = "tcp"
localIP = "127.0.0.1"
localPort = 8080
remotePort = 8080</code></pre>

<h3>国内机 - frp 客户端 + Nginx</h3>
<pre><code># frpc.toml
serverAddr = "海外机IP"
serverPort = 7000

[[proxies]]
name = "web"
type = "tcp"
localIP = "127.0.0.1"
localPort = 8080
remotePort = 8080</code></pre>

<pre><code># 国内机 Nginx
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}</code></pre>

<p>用户访问国内域名，Nginx 反代到 frp 隧道，数据加密传输到海外 VPS 的真实服务。</p>

<h2>方案选型总结</h2>
<table>
  <tr><th>方案</th><th>复杂度</th><th>延迟</th><th>适用场景</th></tr>
  <tr><td>国内 Web + 海外 API</td><td>低</td><td>中（100-200ms）</td><td>前端国内、后端海外</td></tr>
  <tr><td>海外站 + 国内 CDN</td><td>中</td><td>低（静态资源）</td><td>内容型网站，需要备案</td></tr>
  <tr><td>Tailscale 组网</td><td>低</td><td>取决于线路</td><td>个人/小团队，内网互通</td></tr>
  <tr><td>frp + Nginx 反代</td><td>中</td><td>中</td><td>特定服务对外暴露在国内域名</td></tr>
</table>

<h2>安全提醒</h2>
<ul>
  <li>海外机和国内机之间的通信尽量走加密隧道（frp 自带加密，Tailscale 用 WireGuard）</li>
  <li>海外机不要开放 22 端口到公网，用 Tailscale SSH 管理</li>
  <li>Nginx 反代时配置好限流和 IP 白名单，防止海外端口被扫</li>
  <li>定期检查 frp 和 Tailscale 版本更新，这些工具修漏洞很快</li>
</ul>`,
  },
  {
    slug: 'troubleshooting',
    title: '常见故障速查手册：SSH / Nginx / DNS / Docker',
    category: '故障排查',
    level: '入门',
    time: '8 min',
    summary: '四个最高频故障的排查思路和解决命令。出问题时对着清单逐项检查，80% 的问题都能自己搞定。',
    content: `
<h2>SSH 连不上</h2>
<h3>1. VPS 有没有在运行？</h3>
<pre><code># 登录 VPS 控制面板，查看状态是否为 "Running"
# 如果不是，启动它</code></pre>

<h3>2. IP 和端口对不对？</h3>
<pre><code># 确认 IP 没变（有些商家不保证固定 IP）
ssh -p 端口号 user@IP -v   # -v 查看详细连接过程</code></pre>

<h3>3. 防火墙有没有开放端口？</h3>
<pre><code># 通过 VNC/控制台登录 VPS
ufw status
# 如果没看到你的 SSH 端口，执行：
ufw allow 端口号/tcp</code></pre>

<h3>4. SSH 服务有没有运行？</h3>
<pre><code>systemctl status sshd
systemctl restart sshd</code></pre>

<h3>5. 被 Fail2ban 封了？</h3>
<pre><code>fail2ban-client status sshd
# 如果被误封，在 VNC/控制台里解封</code></pre>

<h2>Nginx 502 Bad Gateway</h2>
<p>502 意味着 Nginx 是正常的，但后端服务（PHP-FPM / Node.js 应用）挂了。</p>
<pre><code># 检查后端服务
systemctl status php8.1-fpm   # PHP
docker ps | grep myapp        # Docker

# 重启后端
systemctl restart php8.1-fpm
docker restart myapp-container

# 看 Nginx 日志找原因
tail -50 /var/log/nginx/error.log</code></pre>

<h2>Nginx 403 Forbidden</h2>
<pre><code># 403 = 权限问题
# 检查文件和目录权限
ls -la /var/www/你的网站/
# 目录需要 755，文件需要 644，owner 应为 www-data

# 修复：
chown -R www-data:www-data /var/www/你的网站/
find /var/www/你的网站/ -type d -exec chmod 755 {} \\;
find /var/www/你的网站/ -type f -exec chmod 644 {} \\;</code></pre>

<h2>DNS 解析不到</h2>
<h3>1. 域名有没有过期？</h3>
<pre><code>whois yourdomain.com | grep "Expir"</code></pre>

<h3>2. DNS 记录配置正确吗？</h3>
<pre><code># 在本地查询
nslookup yourdomain.com
dig yourdomain.com

# 如果用的 Cloudflare，确认 A 记录指向正确 IP
# 代理状态（橙色云朵）开启意味着指向 CF IP 而非你的 IP</code></pre>

<h3>3. DNS 传播需要时间</h3>
<p>修改 DNS 后等 5 分钟到 48 小时（通常几分钟就生效）。</p>

<h2>Docker 容器异常</h2>
<pre><code># 查看所有容器状态
docker ps -a

# 查看容器日志
docker logs --tail 100 容器名

# 磁盘满了？（Docker 日志/镜像很占空间）
df -h
docker system df

# 清理
docker system prune -a -f</code></pre>

<h2>通用检查清单</h2>
<ol>
  <li>服务在运行吗？→ systemctl status / docker ps</li>
  <li>端口开放了吗？→ ufw status / ss -tlnp</li>
  <li>日志说了什么？→ tail -50 /var/log/xxx</li>
  <li>磁盘满了吗？→ df -h</li>
  <li>内存够吗？→ free -h</li>
</ol>
<p>这 5 个问题能解释 80% 的故障。</p>`,
  },

  // DMIT 选购参考：高端 CN2 GIA 线路，延迟极低
  {
    slug: 'dmit-overview',
    title: 'DMIT 选购参考：高端 CN2 GIA 线路，延迟极低',
    category: '商家测评',
    level: '入门',
    time: '5 min',
    summary: 'DMIT 主打高端 CN2 GIA 和 CMIN2 精品线路，覆盖洛杉矶、香港、东京三大核心节点，延迟低、稳定性好，适合对线路质量有较高要求的用户。',
    content: `<h2>关于 DMIT</h2>
<p>DMIT 是一家专注于亚太地区精品线路的 VPS 服务商，成立于 2017 年，自有 ASN（AS906/AS54574），在洛杉矶、香港、东京拥有自营机房。其核心卖点是<strong>CN2 GIA（电信精品线路）和 CMIN2（移动精品线路）</strong>，到中国大陆的延迟和丢包率控制在行业顶级水平。</p>
<p>官网：<a href="https://dmit.io/" target="_blank" rel="nofollow noopener">https://dmit.io/</a></p>
<h2>机房与线路</h2><ul><li><strong>美国洛杉矶</strong>：CN2 GIA / CMIN2，电信约 142ms，联通约 151ms，移动约 175ms</li><li><strong>中国香港</strong>：CN2 GIA，电信约 35ms，联通约 40ms，移动约 28ms</li><li><strong>日本东京</strong>：CN2 GIA，电信约 55ms，联通约 62ms，移动约 48ms</li></ul>
<p>DMIT 提供三个网络等级：Premium（CN2 GIA）、Eyeball（CMIN2/CMI）、Tier 1（标准国际），其中 Premium 系列是面向中国大陆用户的主力产品。</p>
<h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 1G 20G SSD</td><td>1 TB</td><td>1Gbps</td><td>\$36.90/年</td></tr></table>
<p>DMIT 价格在 VPS 市场中属于中高端，但考虑到 CN2 GIA 线路的带宽成本，性价比在精品线路中算是合理。</p>
<h2>优点</h2><ul><li>线路质量行业顶级，CN2 GIA 到中国大陆延迟极低、丢包极少</li><li>自有 ASN 和 IP 资源，非租用线路，稳定性有保障</li><li>洛杉矶、香港、东京三个核心节点覆盖主要亚太市场</li><li>支持支付宝、PayPal 等多种支付方式</li><li>控制面板功能完善，支持快照、备份、防火墙</li></ul>
<h2>缺点/注意事项</h2><ul><li>价格偏高，入门款 \$36.90/年，不适合预算紧张的用户</li><li>香港和东京节点经常缺货，需关注补货通知</li><li>流量限制偏紧（入门款仅 1TB）</li><li>退款政策较严格</li><li>工单响应速度一般</li></ul>
<h2>适合人群</h2><p>适合对线路质量有刚性需求的用户：外贸建站、跨境电商、游戏加速、视频会议等需要稳定低延迟连接的场景。<em>（注：本文为基于公开信息的选购参考，非实测测评）</em></p>`,
  },
  // BandwagonHost（搬瓦工）选购参考：CN2 GIA 线路标杆
  {
    slug: 'bandwagonhost-overview',
    title: 'BandwagonHost（搬瓦工）选购参考：CN2 GIA 线路标杆',
    category: '商家测评',
    level: '入门',
    time: '5 min',
    summary: 'BandwagonHost 是中文 VPS 圈知名度最高的服务商之一，以 CN2 GIA 线路和 KiwiVM 面板著称，提供洛杉矶、东京、阿姆斯特丹三大节点。',
    content: `<h2>关于 BandwagonHost</h2>
<p>BandwagonHost（中文圈俗称"搬瓦工"）成立于 2012 年，总部位于加拿大，是中文 VPS 用户群体中知名度最高的海外服务商之一。早年以超低价 OpenVZ VPS 闻名，后全面转型 KVM 架构，主打<strong>CN2 GIA、CMIN2、AS9929 三网精品线路</strong>。</p>
<p>官网：<a href="https://bandwagonhost.com/" target="_blank" rel="nofollow noopener">https://bandwagonhost.com/</a></p>
<h2>机房与线路</h2><ul><li><strong>美国洛杉矶</strong>：CN2 GIA / CMIN2 / AS9929，三网回程均为精品线路</li><li><strong>日本东京</strong>：软银 + IIJ 混合线路</li><li><strong>荷兰阿姆斯特丹</strong>：CN2 GIA 回程优化</li></ul>
<p>搬瓦工的核心竞争力在于自研的 KiwiVM 控制面板，支持一键迁移数据中心、实时流量监控、快照备份等功能。</p>
<h2>套餐与价格</h2><table><tr><th>线路</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>CN2 GIA</td><td>2C 1G 20G SSD</td><td>1 TB</td><td>2.5Gbps</td><td>\$49.99/季</td></tr></table>
<h2>优点</h2><ul><li>KiwiVM 面板功能强大：一键换 IP、快照、迁移机房、流量统计</li><li>线路稳定，CN2 GIA 到中国大陆丢包率极低</li><li>品牌信誉好，运营超过 10 年，几乎没有跑路风险</li><li>自有机房和 IP 资源，非代理商模式</li><li>经常有节日促销，折扣力度大</li></ul>
<h2>缺点/注意事项</h2><ul><li>价格偏高，CN2 GIA 线路 \$49.99/季度起步</li><li>流量限制较紧（入门款 1TB/月），超出后降速而非断网</li><li>不提供 24/7 技术支持</li><li>IP 被墙后可付费更换</li></ul>
<h2>适合人群</h2><p>适合愿意为线路质量付费的用户：科学上网、外贸建站、跨境电商等。<em>（注：本文为基于公开信息的选购参考，非实测测评）</em></p>`,
  },
  // RackNerd 选购参考：极致低价的美国 VPS
  {
    slug: 'racknerd-overview',
    title: 'RackNerd 选购参考：极致低价的美国 VPS',
    category: '商家测评',
    level: '入门',
    time: '4 min',
    summary: 'RackNerd 以超低价格闻名，主营美国多机房 VPS，适合预算有限、对线路要求不高的用户。经常有节日闪购活动。',
    content: `<h2>关于 RackNerd</h2><p>RackNerd 成立于 2019 年，是一家主打极致低价的美国 VPS 服务商。凭借激进的价格策略（黑五 \$10/年以下套餐）和稳定的服务，迅速在 VPS 圈积累了口碑。KVM 虚拟化，SolusVM 面板。</p><p>官网：<a href="https://my.racknerd.com/" target="_blank" rel="nofollow noopener">https://my.racknerd.com/</a></p><h2>机房与线路</h2><ul><li><strong>美国洛杉矶</strong>：普通国际 BGP，约 168-185ms</li><li><strong>美国达拉斯</strong>：普通国际，约 210ms</li><li><strong>美国芝加哥</strong>：普通国际，约 225ms</li><li><strong>美国纽约</strong>：普通国际，约 240ms</li></ul><p>全部为普通国际线路，无中国方向优化，晚高峰有明显衰减。</p><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 512M 15G SSD</td><td>2 TB</td><td>1Gbps</td><td>\$3/月</td></tr></table><p>黑五期间常有 \$10-15/年的闪购套餐。</p><h2>优点</h2><ul><li>价格极低，适合练手、测试、学习 Linux</li><li>大流量（入门款 2TB/月）</li><li>多个美国机房可选</li><li>支持支付宝付款</li><li>经常有促销活动</li></ul><h2>缺点</h2><ul><li>普通国际线路，晚高峰到中国延迟高、丢包多</li><li>低价套餐性能有限</li><li>SolusVM 面板功能不如 KiwiVM</li><li>换 IP 需付费（\$3/次）</li></ul><h2>适合人群</h2><p>适合预算极其有限的用户：学习 Linux、搭建个人博客、跑轻量脚本。不适合对线路质量有要求的场景。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // Vultr 选购参考：全球 30+ 节点的开发者友好 VPS
  {
    slug: 'vultr-overview',
    title: 'Vultr 选购参考：全球 30+ 节点的开发者友好 VPS',
    category: '商家测评',
    level: '入门',
    time: '4 min',
    summary: 'Vultr 是老牌云服务商，全球 30+ 数据中心，按小时计费，API 友好，适合开发者和需要全球部署的用户。',
    content: `<h2>关于 Vultr</h2><p>Vultr 成立于 2014 年，总部位于美国佛罗里达州，是全球知名的云服务商。全球 30+ 数据中心，按小时计费，API 自动化部署，开发者友好。</p><p>官网：<a href="https://www.vultr.com/" target="_blank" rel="nofollow noopener">https://www.vultr.com/</a></p><h2>机房与线路</h2><ul><li><strong>日本东京</strong>：普通国际，联通约 98ms，移动约 82ms</li><li><strong>新加坡</strong>：普通国际，电信约 90ms</li><li><strong>韩国首尔、美国洛杉矶</strong>等 30+ 节点</li></ul><p>全部为普通国际线路，无中国方向优化。但节点数量多，可用性高。</p><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 512M 10G NVMe</td><td>500 GB</td><td>1Gbps</td><td>\$2.50/月</td></tr></table><p>按小时计费，随时可销毁。实际最低 \$6/月。</p><h2>优点</h2><ul><li>全球 30+ 数据中心</li><li>按小时计费，灵活试用</li><li>API 和 Terraform 支持完善</li><li>支持支付宝</li><li>品牌信誉好，上市公司</li></ul><h2>缺点</h2><ul><li>普通国际线路，到中国延迟偏高</li><li>换 IP 需销毁重建</li><li>部分 IP 段可能被标记为机房 IP</li></ul><h2>适合人群</h2><p>适合开发者和企业：API 自动化、CI/CD、全球负载均衡、临时测试环境。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // BuyVM 选购参考：不限流量 + 可附加存储块
  {
    slug: 'buyvm-overview',
    title: 'BuyVM 选购参考：不限流量 + 可附加存储块',
    category: '商家测评',
    level: '入门',
    time: '4 min',
    summary: 'BuyVM 以不限流量、可附加大容量存储块（$1.25/TB/月）著称，适合 BT/PT 下载和存储型用户。',
    content: `<h2>关于 BuyVM</h2><p>BuyVM 是 FranTech 旗下的 VPS 品牌，成立于 2010 年，以不限流量和可附加超大容量存储块闻名。数据中心位于拉斯维加斯、皮斯卡特维和卢森堡。</p><p>官网：<a href="https://my.frantech.ca/" target="_blank" rel="nofollow noopener">https://my.frantech.ca/</a></p><h2>机房与线路</h2><ul><li><strong>美国拉斯维加斯</strong>：普通国际，约 195ms</li><li><strong>美国皮斯卡特维</strong>：普通国际，约 235ms</li><li><strong>卢森堡</strong>：普通国际，约 210ms</li></ul><p>全部普通国际线路，无中国方向优化。</p><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 1G 250G HDD</td><td>不限流量</td><td>1Gbps</td><td>\$7/月</td></tr></table><p>存储块（Slab）可单独购买：256GB/\$1.25/月，1TB/\$5/月。</p><h2>优点</h2><ul><li>不限流量</li><li>存储块价格极低（\$5/TB/月）</li><li>运营 10+ 年，信誉可靠</li><li>支持支付宝</li></ul><h2>缺点</h2><ul><li>普通线路，到中国延迟高</li><li>TOS 较严格，BT 需注意版权</li><li>面板功能简单</li></ul><h2>适合人群</h2><p>适合 BT/PT 下载、文件存储、个人网盘等大流量/大存储场景。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // CloudCone 选购参考：按小时计费的洛杉矶 VPS
  {
    slug: 'cloudcone-overview',
    title: 'CloudCone 选购参考：按小时计费的洛杉矶 VPS',
    category: '商家测评',
    level: '入门',
    time: '3 min',
    summary: 'CloudCone 主打按小时计费和灵活升降级，仅有洛杉矶一个机房，适合短期测试和轻量应用。',
    content: `<h2>关于 CloudCone</h2><p>CloudCone 是一家以灵活计费著称的 VPS 服务商，仅提供美国洛杉矶 Multacom 机房的 VPS。支持按小时计费、随时销毁退款。</p><p>官网：<a href="https://app.cloudcone.com/" target="_blank" rel="nofollow noopener">https://app.cloudcone.com/</a></p><h2>机房与线路</h2><ul><li><strong>美国洛杉矶</strong>：普通国际 BGP，约 170ms</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 1G 14G SSD</td><td>1 TB</td><td>1Gbps</td><td>\$2.00/月</td></tr></table><h2>优点</h2><ul><li>按小时计费，灵活</li><li>控制面板功能全面</li><li>价格低廉</li><li>支持支付宝</li></ul><h2>缺点</h2><ul><li>仅一个机房</li><li>普通线路</li><li>换 IP 只能销毁重建</li></ul><h2>适合人群</h2><p>适合短期测试、临时项目的用户。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // V.PS 选购参考：三网精品线路的亚太 VPS
  {
    slug: 'vps-overview',
    title: 'V.PS 选购参考：三网精品线路的亚太 VPS',
    category: '商家测评',
    level: '入门',
    time: '4 min',
    summary: 'V.PS 主打 CN2 GIA、AS9929、CMI 三网精品线路，覆盖东京、香港、新加坡、伦敦，性价比突出。',
    content: `<h2>关于 V.PS</h2><p>V.PS（原名 VPS.RE）是一家主打亚太精品线路的 VPS 服务商，以 CN2 GIA、AS9929、CMI 三网优化线路为核心卖点，覆盖东京、香港、新加坡、伦敦四个核心节点。</p><p>官网：<a href="https://v.ps/" target="_blank" rel="nofollow noopener">https://v.ps/</a></p><h2>机房与线路</h2><ul><li><strong>日本东京</strong>：CN2 GIA / AS9929 / CMI 三网精品</li><li><strong>中国香港</strong>：CN2 GIA / CMI</li><li><strong>新加坡</strong>：CN2 GIA / CMI</li><li><strong>英国伦敦</strong>：CN2 GIA</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 1G 20G NVMe</td><td>1 TB</td><td>1Gbps</td><td>\$5.99/月</td></tr></table><h2>优点</h2><ul><li>三网精品线路</li><li>东京节点对移动和联通友好</li><li>NVMe 存储</li></ul><h2>缺点</h2><ul><li>香港和东京节点经常缺货</li><li>品牌知名度不如老牌</li></ul><h2>适合人群</h2><p>适合需要三网优化线路的用户：科学上网、跨境电商等。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // GigsGigs 选购参考：老牌亚太精品线路服务商
  {
    slug: 'gigsgigs-overview',
    title: 'GigsGigs 选购参考：老牌亚太精品线路服务商',
    category: '商家测评',
    level: '入门',
    time: '4 min',
    summary: 'GigsGigs 是运营多年的老牌 VPS 服务商，主打 CN2 GIA、CMI、AS9929 三条精品线路，覆盖香港、东京、新加坡、洛杉矶。',
    content: `<h2>关于 GigsGigs</h2><p>GigsGigs 成立于 2015 年，总部位于马来西亚，以亚太精品线路为主要卖点。覆盖香港、东京、新加坡、洛杉矶四个节点，均提供三网精品线路。</p><p>官网：<a href="https://gigsgigscloud.com/" target="_blank" rel="nofollow noopener">https://gigsgigscloud.com/</a></p><h2>机房与线路</h2><ul><li><strong>中国香港</strong>：CN2 GIA / CMI / AS9929，三网<40ms</li><li><strong>日本东京</strong>：CN2 GIA / CMI / AS9929</li><li><strong>新加坡</strong>：CN2 GIA / CMI</li><li><strong>美国洛杉矶</strong>：CN2 GIA / CMI / AS9929</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 512M 20G SSD</td><td>1 TB</td><td>1Gbps</td><td>\$12/月</td></tr></table><h2>优点</h2><ul><li>老牌服务商，运营稳定</li><li>三网精品线路完整</li><li>香港节点延迟极低</li></ul><h2>缺点</h2><ul><li>价格偏高，\$12/月起</li><li>库存有限</li></ul><h2>适合人群</h2><p>适合预算充足、对线路质量要求高的用户。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // CloudSilk（白丝云）选购参考：AS9929 优化线路入门选择
  {
    slug: 'cloudsilk-overview',
    title: 'CloudSilk（白丝云）选购参考：AS9929 优化线路入门选择',
    category: '商家测评',
    level: '入门',
    time: '3 min',
    summary: 'CloudSilk（白丝云）主打美国圣何塞的 AS9929 联通精品线路，价格低廉，适合联通用户入门体验精品线路。',
    content: `<h2>关于 CloudSilk</h2><p>CloudSilk（白丝云）主打联通 AS9929 精品线路，仅提供美国圣何塞机房，以低价和 AS9929 优化线路为核心卖点。</p><p>官网：<a href="https://cloudsilk.io/" target="_blank" rel="nofollow noopener">https://cloudsilk.io/</a></p><h2>机房与线路</h2><ul><li><strong>美国圣何塞</strong>：AS9929 联通精品线路</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 512M 10G SSD</td><td>500 GB</td><td>500Mbps</td><td>\$3/月</td></tr></table><h2>优点</h2><ul><li>价格低廉（\$3/月起）</li><li>AS9929 联通精品线路</li></ul><h2>缺点</h2><ul><li>仅一个机房</li><li>主要优化联通，电信和移动一般</li></ul><h2>适合人群</h2><p>适合联通用户体验精品线路。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // ColoCrossing 选购参考：大带宽美国 VPS
  {
    slug: 'colocrossing-overview',
    title: 'ColoCrossing 选购参考：大带宽美国 VPS',
    category: '商家测评',
    level: '入门',
    time: '3 min',
    summary: 'ColoCrossing 提供美国洛杉矶的大带宽 VPS（20TB/月），适合流量密集型应用，价格适中。',
    content: `<h2>关于 ColoCrossing</h2><p>ColoCrossing 是美国老牌数据中心运营商，同时对外提供 VPS 服务。拥有自营洛杉矶机房，以超大带宽（20TB/月）为主要卖点。</p><p>官网：<a href="https://cloud.colocrossing.com/" target="_blank" rel="nofollow noopener">https://cloud.colocrossing.com/</a></p><h2>机房与线路</h2><ul><li><strong>美国洛杉矶</strong>：普通国际 BGP，约 168ms</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 1G 25G SSD</td><td>20 TB</td><td>1Gbps</td><td>\$4/月</td></tr></table><h2>优点</h2><ul><li>超大流量 20TB/月</li><li>自营机房，基础设施可靠</li></ul><h2>缺点</h2><ul><li>普通线路，到中国延迟高</li><li>仅一个机房</li></ul><h2>适合人群</h2><p>适合大流量下载、转码、备份。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // DigitalOcean 选购参考：全球部署的开发者云平台
  {
    slug: 'digitalocean-overview',
    title: 'DigitalOcean 选购参考：全球部署的开发者云平台',
    category: '商家测评',
    level: '入门',
    time: '4 min',
    summary: 'DigitalOcean 是全球知名的云计算平台，提供全球多地 VPS，以文档完善、API 友好、社区活跃著称。',
    content: `<h2>关于 DigitalOcean</h2><p>DigitalOcean 成立于 2011 年，2021 年上市，是全球最知名的云计算平台之一。以简单易用、文档完善和开发者友好著称。</p><p>官网：<a href="https://www.digitalocean.com/" target="_blank" rel="nofollow noopener">https://www.digitalocean.com/</a></p><h2>机房与线路</h2><ul><li><strong>新加坡</strong>：普通国际，约 90ms</li><li><strong>伦敦 / 法兰克福 / 阿姆斯特丹 / 纽约 / 班加罗尔</strong>：普通国际</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 512M 10G NVMe</td><td>500 GB</td><td>1Gbps</td><td>\$4/月</td></tr></table><h2>优点</h2><ul><li>文档和教程非常完善</li><li>API 和 CLI 强大</li><li>上市公司，信誉好</li><li>产品线齐全</li></ul><h2>缺点</h2><ul><li>普通线路，到中国一般</li><li>不支持支付宝</li></ul><h2>适合人群</h2><p>适合开发者：Web 应用、API 后端、微服务。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // HostDare 选购参考：美西 CN2 GIA 入门选择
  {
    slug: 'hostdare-overview',
    title: 'HostDare 选购参考：美西 CN2 GIA 入门选择',
    category: '商家测评',
    level: '入门',
    time: '3 min',
    summary: 'HostDare 主打美国洛杉矶 CN2 GIA 线路，以入门级价格提供精品线路，适合预算有限的用户体验 CN2 GIA。',
    content: `<h2>关于 HostDare</h2><p>HostDare 主打美西 CN2 GIA 线路，仅提供美国洛杉矶机房，以相对较低的价格体验 CN2 GIA 精品线路。</p><p>官网：<a href="https://hostdare.com/" target="_blank" rel="nofollow noopener">https://hostdare.com/</a></p><h2>机房与线路</h2><ul><li><strong>美国洛杉矶</strong>：CN2 GIA</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 756M 35G HDD</td><td>500 GB</td><td>50Mbps</td><td>\$55.99/年</td></tr></table><h2>优点</h2><ul><li>CN2 GIA 入门价格较低</li><li>年付套餐性价比高</li></ul><h2>缺点</h2><ul><li>带宽仅 50Mbps</li><li>HDD 硬盘</li><li>仅一个机房</li></ul><h2>适合人群</h2><p>适合预算有限但想体验 CN2 GIA 的用户。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // HostHatch 选购参考：全球多节点 NVMe VPS
  {
    slug: 'hosthatch-overview',
    title: 'HostHatch 选购参考：全球多节点 NVMe VPS',
    category: '商家测评',
    level: '入门',
    time: '4 min',
    summary: 'HostHatch 提供全球多地 NVMe 高性能 VPS，覆盖阿姆斯特丹、洛杉矶、斯德哥尔摩、东京。',
    content: `<h2>关于 HostHatch</h2><p>HostHatch 成立于 2011 年，以全球多节点和 NVMe 存储为主要卖点，覆盖阿姆斯特丹、洛杉矶、斯德哥尔摩、东京。</p><p>官网：<a href="https://cloud.hosthatch.com/" target="_blank" rel="nofollow noopener">https://cloud.hosthatch.com/</a></p><h2>机房与线路</h2><ul><li><strong>荷兰阿姆斯特丹</strong>：普通国际，约 180ms</li><li><strong>美国洛杉矶</strong>：普通国际，约 168ms</li><li><strong>瑞典斯德哥尔摩</strong>：普通国际，约 200ms</li><li><strong>日本东京</strong>：普通国际，约 108ms</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 2G 10G NVMe</td><td>1 TB</td><td>1Gbps</td><td>\$4/月</td></tr></table><h2>优点</h2><ul><li>全球多地可选</li><li>NVMe 高性能</li><li>入门款 2G 内存</li><li>运营 10+ 年</li></ul><h2>缺点</h2><ul><li>普通线路</li><li>存储空间偏小</li></ul><h2>适合人群</h2><p>适合多地域部署：Web 应用、数据库、开发测试。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // LisaHost（丽萨主机）选购参考：香港/东京 CN2 GIA 精品 VPS
  {
    slug: 'lisa-overview',
    title: 'LisaHost（丽萨主机）选购参考：香港/东京 CN2 GIA 精品 VPS',
    category: '商家测评',
    level: '入门',
    time: '3 min',
    summary: 'LisaHost（丽萨主机）主打香港和东京的 CN2 GIA 精品线路，NVMe 存储，适合对延迟要求极高的用户。',
    content: `<h2>关于 LisaHost</h2><p>LisaHost（丽萨主机）主打香港和东京 CN2 GIA/CMI 精品线路，NVMe 高性能存储。</p><p>官网：<a href="https://lisahost.com/" target="_blank" rel="nofollow noopener">https://lisahost.com/</a></p><h2>机房与线路</h2><ul><li><strong>中国香港</strong>：CN2 GIA / CMI，延迟 20-40ms</li><li><strong>日本东京</strong>：CN2 GIA / CMI</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 1G 15G NVMe</td><td>1 TB</td><td>1Gbps</td><td>\$4.99/月</td></tr></table><h2>优点</h2><ul><li>香港/东京双精品节点</li><li>NVMe 存储</li><li>延迟极低</li></ul><h2>缺点</h2><ul><li>品牌知名度较低</li></ul><h2>适合人群</h2><p>适合需要极低延迟的用户：游戏加速、企业远程办公。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // VirMach 选购参考：极致低价的练手 VPS
  {
    slug: 'virmach-overview',
    title: 'VirMach 选购参考：极致低价的练手 VPS',
    category: '商家测评',
    level: '入门',
    time: '3 min',
    summary: 'VirMach 以极端低价（$1/月起）闻名，适合零基础练手和学习 Linux，但性能和稳定性较差。',
    content: `<h2>关于 VirMach</h2><p>VirMach 是美国极端低价 VPS 服务商，最低配仅 \$1/月（256M 内存）。黑五常有神价促销。</p><p>官网：<a href="https://billing.virmach.com/" target="_blank" rel="nofollow noopener">https://billing.virmach.com/</a></p><h2>机房与线路</h2><ul><li>洛杉矶、达拉斯、芝加哥、凤凰城、阿姆斯特丹</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 256M 10G SSD</td><td>500 GB</td><td>1Gbps</td><td>\$1.00/月</td></tr></table><h2>优点</h2><ul><li>价格极低，练手成本几乎为零</li><li>支持支付宝</li></ul><h2>缺点</h2><ul><li>性能和稳定性差，超售严重</li><li>TOS 严格</li><li>工单响应极慢</li><li>晚高峰几乎不可用</li></ul><h2>适合人群</h2><p>仅适合零基础新手练习 Linux。不建议用于任何生产环境。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // WebHorizon 选购参考：全球多节点 NVMe VPS
  {
    slug: 'webhorizon-overview',
    title: 'WebHorizon 选购参考：全球多节点 NVMe VPS',
    category: '商家测评',
    level: '入门',
    time: '3 min',
    summary: 'WebHorizon 提供新加坡、东京、伦敦等地的 NVMe VPS，也有低价 NAT VPS 可选。',
    content: `<h2>关于 WebHorizon</h2><p>WebHorizon 提供全球多节点 VPS，位于新加坡、东京、伦敦、阿姆斯特丹、纽约。以 NVMe 存储和 NAT VPS 为特色。</p><p>官网：<a href="https://webhorizon.in/" target="_blank" rel="nofollow noopener">https://webhorizon.in/</a></p><h2>机房与线路</h2><ul><li>新加坡、东京、伦敦、阿姆斯特丹、纽约</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 1G 20G NVMe</td><td>2 TB</td><td>1Gbps</td><td>\$3.99/月</td></tr></table><h2>优点</h2><ul><li>全球多节点</li><li>NVMe 存储</li><li>NAT VPS 价格更低</li></ul><h2>缺点</h2><ul><li>普通线路</li><li>品牌规模较小</li></ul><h2>适合人群</h2><p>适合轻量 Web 应用、开发测试。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // YxVM 选购参考：亚太 CMI 优化线路
  {
    slug: 'yxvm-overview',
    title: 'YxVM 选购参考：亚太 CMI 优化线路',
    category: '商家测评',
    level: '入门',
    time: '3 min',
    summary: 'YxVM 主打香港、东京、新加坡的 CMI 优化线路，以较低价格提供移动优化的亚太 VPS。',
    content: `<h2>关于 YxVM</h2><p>YxVM 主打亚太 CMI 优化线路，覆盖香港、东京、新加坡，以移动线路优化为主要特色。</p><p>官网：<a href="https://yxvm.com/" target="_blank" rel="nofollow noopener">https://yxvm.com/</a></p><h2>机房与线路</h2><ul><li><strong>中国香港</strong>：CMI / 优化线路</li><li><strong>日本东京</strong>：CMI / 优化线路</li><li><strong>新加坡</strong>：CMI / 优化线路</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 1G 15G SSD</td><td>1 TB</td><td>1Gbps</td><td>\$3.50/月</td></tr></table><h2>优点</h2><ul><li>CMI 线路对移动用户友好</li><li>亚太三节点</li></ul><h2>缺点</h2><ul><li>电信和联通线路一般</li><li>品牌较小</li></ul><h2>适合人群</h2><p>适合移动用户寻找低价亚太优化线路。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
  // ZgoVPS 选购参考：美西 CN2 GIA + AS4837 双线路
  {
    slug: 'zgovps-overview',
    title: 'ZgoVPS 选购参考：美西 CN2 GIA + AS4837 双线路',
    category: '商家测评',
    level: '入门',
    time: '3 min',
    summary: 'ZgoVPS 提供美国洛杉矶和西雅图的 VPS，主打 CN2 GIA 和 AS4837 双线路，NVMe 存储。',
    content: `<h2>关于 ZgoVPS</h2><p>ZgoVPS 主打美西 CN2 GIA 和 AS4837 双线路，提供洛杉矶和西雅图两个机房，NVMe 高性能存储。</p><p>官网：<a href="https://zgovps.com/" target="_blank" rel="nofollow noopener">https://zgovps.com/</a></p><h2>机房与线路</h2><ul><li><strong>美国洛杉矶</strong>：CN2 GIA / AS4837</li><li><strong>美国西雅图</strong>：CN2 GIA / AS4837</li></ul><h2>套餐与价格</h2><table><tr><th>套餐</th><th>配置</th><th>流量</th><th>带宽</th><th>价格</th></tr><tr><td>入门款</td><td>1C 1G 20G NVMe</td><td>1 TB</td><td>1Gbps</td><td>\$4.99/月</td></tr></table><h2>优点</h2><ul><li>CN2 GIA + AS4837 双线路</li><li>NVMe 存储</li></ul><h2>缺点</h2><ul><li>品牌较小</li><li>移动线路一般</li></ul><h2>适合人群</h2><p>适合电信和联通用户寻找美西精品线路。<em>（注：基于公开信息的选购参考）</em></p>`,
  },
];

// Helper: get article by slug
export function getArticle(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug);
}

// Helper: get unique categories
export function getCategories(): string[] {
  return [...new Set(articles.map(a => a.category))];
}