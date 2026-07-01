export interface KnowledgeItem {
  key: string;
  name: string;
  brief: string;
  ipRange: string;
  category: string;
}

export const knowledgeBase: KnowledgeItem[] = [
  {
    key: 'CN2 GIA',
    name: 'CN2 GIA',
    brief: '中国电信顶级国际线路，QoS 保障，低延迟低丢包，晚高峰表现稳定',
    ipRange: '59.43.x.x',
    category: '线路',
  },
  {
    key: 'CN2 GT',
    name: 'CN2 GT',
    brief: '中国电信次顶级线路，共享 CN2 骨干但无 QoS 保障，性价比之选',
    ipRange: '202.97.x.x',
    category: '线路',
  },
  {
    key: '163骨干',
    name: '163 骨干网',
    brief: '中国电信普通国际线路，晚高峰易拥塞，延迟和丢包率较高',
    ipRange: '202.97.x.x',
    category: '线路',
  },
  {
    key: 'AS9929',
    name: 'AS9929',
    brief: '中国联通精品线路（原网通 A 网），媲美 CN2 GIA 的联通顶级线路',
    ipRange: '10099.x.x',
    category: '线路',
  },
  {
    key: 'AS4837',
    name: 'AS4837',
    brief: '中国联通普通国际线路，晚高峰略有衰减，日常使用尚可',
    ipRange: '219.158.x.x',
    category: '线路',
  },
  {
    key: 'CMIN2',
    name: 'CMIN2',
    brief: '中国移动精品国际线路，移动用户的顶级选择，延迟极低',
    ipRange: '223.120.x.x',
    category: '线路',
  },
  {
    key: 'CMI',
    name: 'CMI',
    brief: '中国移动普通国际线路，香港方向表现不错，其他方向延迟偏高',
    ipRange: '221.183.x.x',
    category: '线路',
  },
  {
    key: '普通国际',
    name: '普通国际 BGP',
    brief: '标准 BGP 国际线路，无中国方向优化，适合非延迟敏感场景',
    ipRange: '-',
    category: '线路',
  },
  {
    key: '优化线路',
    name: '优化线路',
    brief: '服务商自行优化的中国方向路由，含部分 CN2/9929/CMIN2 段，具体因商家而异',
    ipRange: '-',
    category: '线路',
  },
  {
    key: 'KiwiVM',
    name: 'KiwiVM',
    brief: 'BandwagonHost 自研的 VPS 管理面板，支持一键换 IP、快照、重装系统等功能',
    ipRange: '-',
    category: '面板',
  },
  {
    key: 'VPS',
    name: 'VPS',
    brief: '虚拟专用服务器，将一台物理服务器划分成多个虚拟环境，每个都独立运行，拥有独立 IP 和系统权限',
    ipRange: '-',
    category: '概念',
  },
  {
    key: 'BGP',
    name: 'BGP',
    brief: '边界网关协议，用于在不同网络之间交换路由信息。多线 BGP 意味着自动选择最优路径',
    ipRange: '-',
    category: '概念',
  },
  {
    key: 'BBR',
    name: 'BBR',
    brief: 'Google 开发的 TCP 拥塞控制算法，能显著提升吞吐量、减少丢包。大部分 VPS 开箱即用',
    ipRange: '-',
    category: '概念',
  },
  {
    key: 'NVMe',
    name: 'NVMe SSD',
    brief: '新一代存储协议，读写速度远超传统 SATA SSD，适合数据库和高 IO 场景',
    ipRange: '-',
    category: '概念',
  },
  {
    key: 'GIA',
    name: 'GIA (Global Internet Access)',
    brief: '中国电信国际精品线路，全称为 CN2 GIA，是中国方向最优的国际线路之一',
    ipRange: '59.43.x.x',
    category: '线路',
  },
];

export function getKnowledge(key: string): KnowledgeItem | undefined {
  return knowledgeBase.find(item => item.key === key);
}
