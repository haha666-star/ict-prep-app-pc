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

export interface IExplainNumberedItem {
  /** 原文里的编号（原样保留，不重排） */
  n: number;
  text: string;
}

export interface IExplainNumberedList {
  /** 列表引子，如「OFDMA原理：」；无引子则为空串 */
  lead: string;
  items: IExplainNumberedItem[];
}

export interface IExplainParts {
  /** 一句话结论：仅当解析开头确实是**完整判断句**时才有值 */
  conclusion: string;
  /** 话题引子：解析以「…：」直接进入编号列表时，引子放在这里 —— 它是标题，不是结论 */
  topic: string;
  /** 编号列表（可能多组：例如「OFDMA原理 1~5」+「与 MU-MIMO 的区别 1~4」） */
  lists: IExplainNumberedList[];
  /** 无编号的补充要点（列表收尾句也归到这里） */
  points: string[];
}

/** 句末标点（中英文） */
const SENT_END = /(?<=[。！？；!?;])/;

/** 编号标记：1~2 位数字 + 分隔符（. ． 、 ) ）） */
const MARKER_RE = /(\d{1,2})([.．、)）])/g;

/**
 * 扫描解析里的「内联编号」标记。
 *
 * ⚠️ 必须写得足够严格，否则会误伤这些完全正常的文本：
 *   802.11ax / 2.4G / 5G / 10.x / 1024-QAM / 25% / 16x16 / 1.5 倍
 * 判据（三条同时满足才算编号）：
 *   ① 标记前一个字符是**边界**（串首 / 空白 / 标点）—— 排除 "802.11ax" 里被切出来的 "02."
 *   ② 分隔符后紧跟的字符不是**小数点**（排除 "1.2.3" 这种层级）——
 *   ③ 若分隔符是「.」且后面紧跟数字，则这一串数字必须 **≥3 位**：
 *      "3.1024-QAM"（1024 是 4 位）算编号；"2.4G"、"5.8GHz"、"1.5 倍"、"802.11" 都不算
 *      （题面里 2.4G/5.8G 这类频段写法极其常见，第 ③ 条就是为它们定的）
 *
 * 背景（2026-10-13 用户反馈的渲染错乱）：题库 964 题里有 256 题（26.6%）解析自带
 *   「1.xxx 2.xxx 3.xxx」内联编号。旧实现只按句号切句、再给每条加一个「•」，
 *   于是出现「编号 + 圆点」双重装饰，而且第 1 条被并进首句（若首句是「…关键技术：1.…」
 *   这种没有句号的写法），造成「结论框里塞了一个要点、要点列表从 2. 开始」的现象。
 */
function scanMarkers(t: string): { n: number; start: number; end: number }[] {
  const out: { n: number; start: number; end: number }[] = [];
  MARKER_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MARKER_RE.exec(t)) !== null) {
    const n = Number(m[1]);
    const end = m.index + m[0].length;
    const prev = m.index > 0 ? t[m.index - 1] : '';
    // ⚠️ 这里必须取一段「窗口」而不是单个字符：判据 ③ 要数分隔符后面连续数字的位数。
    //   首版写成 t[end]（单字符）→ digitRun 恒为 0/1，"3.1024-QAM" 被误判成非编号。
    const next = t.slice(end, end + 8);
    const prevOk = m.index === 0 || /[\s。；;：:，,、（()【】）]/.test(prev);
    let digitRun = 0;
    while (digitRun < next.length && /\d/.test(next[digitRun])) digitRun++;
    const nextOk = next !== '' && (digitRun === 0 || digitRun >= 3);
    if (prevOk && nextOk && n >= 1 && n <= 50) out.push({ n, start: m.index, end });
  }
  return out;
}

/** 列表项的收尾整理：去掉尾部的句号/分号（编号项目不需要句号收尾），并去掉开头的顿号 */
function cleanItem(s: string): string {
  return s.replace(/^[、,，]\s*/, '').replace(/[。；;]\s*$/, '').trim();
}

/**
 * 从一段文本尾部剥离「下一组列表的引子」。
 * 例："…提高资源利用率。OFDMA与MU-MIMO的区别：" → body="…提高资源利用率。" lead="OFDMA与MU-MIMO的区别："
 * 只认**最短**的、以「：」结尾的尾段，并且要求它是真的一个引子（不带句号、长度有限）。
 */
function peelTrailingLead(s: string): { body: string; lead: string } {
  const idxs: number[] = [];
  const re = /[。；;！？!?]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) idxs.push(m.index + 1);
  idxs.push(0);
  for (const p of idxs) {
    const tail = s.slice(p).trim();
    if (!tail) continue;
    if (/[：:]$/.test(tail) && tail.length <= 40 && !/[。；;]/.test(tail)) {
      return { body: s.slice(0, p).trim(), lead: tail };
    }
  }
  return { body: s, lead: '' };
}

/** 把引子拆成「结论 + 话题」：引子里若有完整句，则句号前的部分是真结论 */
function splitLead(lead: string): { conclusion: string; topic: string } {
  const t = lead.trim();
  if (!t) return { conclusion: '', topic: '' };
  const idx = t.lastIndexOf('。');
  if (idx >= 0) {
    const head = t.slice(0, idx + 1).trim();
    const tail = t.slice(idx + 1).trim();
    if (!tail) return { conclusion: head, topic: '' };
    if (/[：:]$/.test(tail) || tail.length <= 24) return { conclusion: head, topic: tail };
    return { conclusion: `${head}${tail}`, topic: '' };
  }
  // 整段没有一个句号 → 它是标题式的引子，不是结论
  return { conclusion: '', topic: t };
}

export function splitExplanation(text: string): IExplainParts {
  const t = (text ?? '').trim();
  const empty: IExplainParts = { conclusion: '', topic: '', lists: [], points: [] };
  if (!t) return empty;

  // ---------- ① 优先按「内联编号」解析（题库里 26.6% 的解析是这种形态）----------
  const markers = scanMarkers(t);
  if (markers.length >= 2 && markers[0].n === 1) {
    // 按「编号递增」切组：+1 视为同组，编号回退（如重新从 1 开始）视为新组
    // 组内保存的是**扁平标记数组的下标**，这样才能跨组取「下一个标记」——
    //   ⚠️ 若按组内下标取切片，每组最后一项会一路吃到文末（把后面整组吞掉）。
    //   实测：wlan-f001 首版即因此把「区别 1-4」整组重复吞进「原理」第 5 项。
    const groups: number[][] = [];
    let i = 0;
    while (i < markers.length) {
      if (markers[i].n !== 1) {
        i++; // 非列表起点（例如误命中的 "10.x"）：不建组，其文字保留在上面一项里
        continue;
      }
      const g = [i];
      let j = i + 1;
      while (j < markers.length && markers[j].n === markers[j - 1].n + 1) {
        g.push(j);
        j++;
      }
      groups.push(g);
      i = j;
    }

    if (groups.length > 0) {
      const used = groups.flat();
      // 某个已被采用的标记，其文本切片到哪里结束 = 下一个「被采用的」标记，都没有则到文末
      const sliceEndOf = (fi: number): number => {
        const pos = used.indexOf(fi);
        const nxt = pos >= 0 && pos + 1 < used.length ? used[pos + 1] : -1;
        return nxt === -1 ? t.length : markers[nxt].start;
      };
      const itemTexts: string[][] = groups.map((g) =>
        g.map((fi) => t.slice(markers[fi].end, sliceEndOf(fi)).trim())
      );

      // 引子：第 0 组来自串首（可能同时含真结论 + 话题）；第 k 组藏在上组最后一项的尾部
      const head = splitLead(t.slice(0, markers[groups[0][0]].start).trim());
      const leads: string[] = new Array(groups.length).fill('');
      leads[0] = head.topic;
      for (let gi = 1; gi < groups.length; gi++) {
        const prev = itemTexts[gi - 1];
        const { body, lead } = peelTrailingLead(prev[prev.length - 1]);
        prev[prev.length - 1] = body;
        leads[gi] = lead;
      }

      // 末组最后一项：首句仍属该项，其余句子升格为「无编号补充要点」
      const points: string[] = [];
      const lastRaw = itemTexts[itemTexts.length - 1];
      const cur = lastRaw[lastRaw.length - 1];
      const sents = cur
        .split(SENT_END)
        .map((s) => s.trim())
        .filter(Boolean);
      if (sents.length > 1) {
        lastRaw[lastRaw.length - 1] = sents[0];
        sents.slice(1).forEach((s) => points.push(s));
      }

      const lists: IExplainNumberedList[] = groups.map((g, gi) => ({
        lead: leads[gi],
        items: g.map((fi, idx) => ({ n: markers[fi].n, text: cleanItem(itemTexts[gi][idx]) })),
      }));

      if (lists.some((l) => l.items.length > 0) || head.conclusion || leads[0] || points.length) {
        return { conclusion: head.conclusion, topic: leads[0], lists, points };
      }
    }
  }

  // ---------- ② 退化：按句末标点切句（原行为）----------
  const sentences = t
    .split(SENT_END)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length >= 2) {
    return { conclusion: sentences[0], topic: '', lists: [], points: sentences.slice(1) };
  }

  if (t.length > 24 && /[，,、]/.test(t)) {
    const clauses = t
      .split(/(?<=[，,、])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);
    if (clauses.length >= 2) {
      return {
        conclusion: clauses[0].replace(/[，,、]$/, ''),
        topic: '',
        lists: [],
        points: clauses.slice(1).map((s) => s.replace(/[，,、]$/, '')),
      };
    }
  }

  return { conclusion: t, topic: '', lists: [], points: [] };
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
