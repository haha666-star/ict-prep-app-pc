import type { IQuizQuestion } from '@/data/quizzes';

/**
 * 解析展示增强工具
 *
 * 目标：把题库里「一整段大白话解析」拆成结构化的
 *   一句话结论 + 要点列表 + 术语高亮 + 记忆要点/易错点 + 关联知识点
 * 让使用者 3 秒抓住考点，而不是在长句里找答案。
 *
 * 说明：这里**不编造任何知识点**，只对已有 explanation 做分句与术语标注；
 * tip / pitfall 只在题目数据显式提供时展示。
 */

export interface IExplainParts {
  /** 一句话结论（第一句） */
  conclusion: string;
  /** 补充要点（后续句子/分句） */
  points: string[];
}

/** 句末标点（中英文） */
const SENT_END = /(?<=[。！？；!?;])/;

export function splitExplanation(text: string): IExplainParts {
  const t = (text ?? '').trim();
  if (!t) return { conclusion: '', points: [] };

  // 1) 按句末标点切句
  let sentences = t
    .split(SENT_END)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length >= 2) {
    return { conclusion: sentences[0], points: sentences.slice(1) };
  }

  // 2) 只有一句：若较长，再按逗号/顿号拆成要点
  if (t.length > 24 && /[，,、]/.test(t)) {
    const clauses = t
      .split(/(?<=[，,、])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);
    if (clauses.length >= 2) {
      return {
        conclusion: clauses[0].replace(/[，,、]$/, ''),
        points: clauses.slice(1).map((s) => s.replace(/[，,、]$/, '')),
      };
    }
  }

  return { conclusion: t, points: [] };
}

// ---------------- 术语高亮 ----------------

/** 领域术语表（华为 ICT 网络赛道高频词）。按长度倒序参与匹配，长词优先。 */
export const TECH_TERMS: string[] = [
  // 数通
  'OSPF', 'BGP', 'IS-IS', 'MPLS', 'SRv6', 'SR-MPLS', 'Segment Routing', 'LSA', 'LSDB',
  '区域', '骨干区域', '虚链路', '邻居', '邻居关系', '路由表', '转发表', 'FIB', 'RIB',
  'VRRP', 'BFD', 'NQA', 'DHCP', 'DNS', 'ARP', 'ICMP', 'IGMP', 'PIM', '组播',
  'NAT', 'NAPT', 'ACL', '策略路由', '路由策略', '前缀列表', '路由引入', '隧道',
  'VLAN', 'Super-VLAN', 'QinQ', 'Trunk', 'Hybrid', 'Access', 'PVID', 'GVRP',
  'STP', 'RSTP', 'MSTP', 'MSTI', 'BPDU', '根桥', '根端口', '指定端口', '边缘端口',
  'Eth-Trunk', '链路聚合', 'LACP', '堆叠', 'iStack', 'CSS', 'M-LAG',
  'PPP', 'PPPoE', 'HDLC', 'GRE', 'IPSec', 'IKE', 'ESP', 'AH', '预共享密钥',
  'TCP', 'UDP', '滑动窗口', '拥塞控制', '慢启动', '三次握手', '四次挥手',
  'IPv4', 'IPv6', 'IPv6地址', '子网掩码', '网关', '广播域', '冲突域', 'CIDR', 'VLSM',
  'OSI', 'TCP/IP', 'PDU', '封装', '解封装',
  // 安全
  '防火墙', '安全区域', '安全策略', '会话表', '状态检测', 'ASPF', 'Server-map',
  'NGFW', '入侵防御', '反病毒', 'URL过滤', '应用识别', '加密', '解密', '哈希', '数字签名',
  '证书', 'PKI', 'CA', 'AAA', 'RADIUS', 'HWTACACS', '等保', '等保2.0', '安全等级',
  '攻击', 'DDoS', 'ARP欺骗', 'IP欺骗', '泛洪', 'SIP Flood', '畸形报文', '端口扫描',
  // WLAN
  'WLAN', 'CAPWAP', 'SSID', 'VAP', 'AP', 'AC', 'AC6005', 'PoE', '射频', '信道',
  '2.4G', '5G', '频段', '漫游', '射频调优', '空口', 'wlan', 'WPA2', 'WPA3', 'PSK',
  '无线控制器', '无线接入点', '三层漫游', '二层漫游', '隧道转发', '直接转发',
  // DCN / 云
  'VXLAN', 'VNI', 'VTEP', 'EVPN', 'BD', 'Bridge-Domain', 'NVE', '大二层',
  'SAN', 'NAS', 'iSCSI', 'FCoE', 'RAID', 'RAID0', 'RAID1', 'RAID5', 'RAID6', 'RAID10',
  '分布式存储', '对象存储', '块存储', '文件存储', 'SSD', 'NVMe',
  'SDN', 'NFV', 'VNF', 'OpenFlow', '控制器', '虚拟化', 'KVM', '容器', 'Docker',
  'Kubernetes', '微服务', '负载均衡', '双活', '容灾', '备份', '快照', '主备',
  '计算虚拟化', '存储虚拟化', '网络虚拟化',
  // 设备
  'AR2220', 'S5700', 'S3700', 'USG6000V', 'CE12800', 'S12700',
];

const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;
function escapeRegExp(s: string): string {
  return s.replace(REGEX_SPECIAL, '\\$&');
}

let cachedTermRe: RegExp | null = null;

function termRegex(): RegExp {
  if (cachedTermRe) return cachedTermRe;
  const parts = [...TECH_TERMS]
    .sort((a, b) => b.length - a.length)
    .map((term) => {
      const escaped = escapeRegExp(term);
      // 纯 ASCII 术语加「前缀边界」：避免 "SIP" 中的 "IP"、"MAC" 中的 "AC" 被误标
      const isAscii = /^[\x20-\x7E]+$/.test(term);
      return isAscii ? `(?<![A-Za-z0-9_])${escaped}` : escaped;
    });
  cachedTermRe = new RegExp(`(${parts.join('|')})`, 'g');
  return cachedTermRe;
}

export interface ISegment {
  text: string;
  /** 是否为领域术语（用于高亮） */
  hit: boolean;
}

/** 把一段文字按术语切分为若干片段，hit=true 的片段做高亮渲染 */
export function segmentByTerms(text: string): ISegment[] {
  if (!text) return [];
  const re = termRegex();
  re.lastIndex = 0;
  const out: ISegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), hit: false });
    out.push({ text: m[0], hit: true });
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++; // 防御空匹配死循环
  }
  if (last < text.length) out.push({ text: text.slice(last), hit: false });
  return out.length ? out : [{ text, hit: false }];
}

// ---------------- 判断题辨析 ----------------

export interface IJudgeVerdict {
  /** 本题的判断结论文本，如「正确」「错误」 */
  verdict: string;
  isTrue: boolean;
}

const TRUE_PATTERN = /^(正确|对|是|true|√|T)$/i;

/** 判断题：提取「本题判断为」结论，用于解析面板的辨析框 */
export function judgeVerdict(q: IQuizQuestion): IJudgeVerdict | null {
  if (q.type !== 'judge') return null;
  const answer = Array.isArray(q.answer) ? q.answer[0] : q.answer;
  if (!answer) return null;
  return { verdict: answer, isTrue: TRUE_PATTERN.test(answer.trim()) };
}

/** 题干是否为否定式提问（判断题里最容易想当然的地方） */
export function isNegativeStem(stem: string): boolean {
  return /(不正确|错误的是|不属于|不包括|不需要|不能|不可以|并非|不是|有误|不合法)/.test(stem);
}

/** 把解析文本压成一行纯文本（用于 tooltip / 紧凑场景） */
export function plainExplain(text: string): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}
