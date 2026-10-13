/**
 * 12 天校赛冲刺计划（10-13 → 10-24）
 *
 * 设计前提（2026-10-12 用户确认）：
 *   1) 校赛 2026-10-24，只剩 12 天
 *   2) 目标：校一等奖 → 出线；主攻省一等奖（省复赛参赛队前 10%），能进国赛最好
 *   3) 三人分散使用不同设备，进度各自独立，队长汇总
 *
 * 量化依据（按当前题库 964 题实测，命令见 ict-audit-v2/）：
 *   【刷题侧】高概率题（真题同源 real ∪ 高频 hot）= 442 题，占 45.9%
 *     —— 实测命令：node ict-audit-v2/diag-plan-quota.mjs（口径与 src/lib/tags.ts 的
 *        effectiveTag 逐行一致：只补多选/判断，真题保持严格）
 *     为什么要「补齐」：标签是逐题手标的，且几乎只落在单选上 ——
 *       真题严格 95 = 单选 85 / 多选 10 / 判断 0
 *       高频严格 167 = 单选 148 / 判断 18 / 多选 1
 *       ⇒ 「高频 × 多选」全库只剩 1 道、「真题 × 判断」为 0，滤镜点开等于空壳。
 *       而「考点是不是高频」是知识点级属性，同考点的多选/判断自然也是高频。
 *     补齐后按题型：单选 233 / 多选 103 / 判断 106（合计 442）
 *       单选不补（本身已充分标注）；「真题」不扩（真题同源是来源属性，
 *       靠知识点推导等于伪造出处 —— 判断题没有真题同源是事实，UI 里直说）。
 *     ★ 本文件用的是刷题侧口径；组卷侧（src/lib/exam.ts 的 tagRank / countLikely）
 *       仍走严格手标的 262 道窄集 —— 押题要稀缺性、练题要覆盖面，两套口径并存。
 *     按方向：数通 145 / 安全 110 / WLAN 102 / DCN 85
 *     按难度：IA 135 / IP 176 / IE 131（IA + IP 基础难度 = 311）
 *   判断题 132 道 —— 省赛必考、最易「想当然」失分；
 *     其中 106 道已落在高概率集合内，余下 26 道必须单独排，不能指望真题环节覆盖
 *   真题同源 95 道 —— 正好 2 天 × 48 道
 *   全库 964 题 ÷ (12 天 × 3 人) ≈ 27 题/人/天 → 分工后跑完全库可行
 */

import { SCHOOL_CONTEST_DATE } from './contest';

export interface IQuota {
  label: string;
  value: string;
}

export interface ISprintShortcut {
  label: string;
  type?: 'judge' | 'single' | 'multiple';
  tag?: 'likely' | 'real' | 'hot';
  dir?: string;
}

export interface ISprintDay {
  day: number;
  date: string;
  phase: string;
  title: string;
  tasks: string[];
  quota: IQuota[];
  /** 一键跳转到刷题页并带上筛选（可多个） */
  shortcuts?: ISprintShortcut[];
}

export interface ISprintPhase {
  phase: string;
  range: string;
  goal: string;
  color: string;
}

export const SPRINT_PHASES: ISprintPhase[] = [
  { phase: '保底分', range: 'Day 1–3', goal: '高概率题 442 道过完一轮（IA/IP 基础难度 311 道优先）＋ 判断题 132 道全覆盖', color: 'amber' },
  { phase: '主攻方向', range: 'Day 4–8', goal: '每人主攻方向正确率 ≥85%，高概率题每日保温', color: 'cyan' },
  { phase: '真题演练', range: 'Day 9–10', goal: '真题同源 95 道过完，错因归类', color: 'rose' },
  { phase: '全真模考', range: 'Day 11–12', goal: '模考稳定 ≥85 分', color: 'emerald' },
];

/** 团队分工：三人各守 1~2 个方向，覆盖全库 */
export interface ITeamRole {
  role: string;
  directions: string[];
  why: string;
  dailyQuota: string;
}

export const SPRINT_TEAM_ROLES: ITeamRole[] = [
  {
    role: '甲 · 数通主力',
    directions: ['datacom'],
    why: '数通占比最高（约 39%，377 题），是总分的基本盘，必须有人专职拿下',
    dailyQuota: '主攻 60 题/天 + 高概率题保温 20 题/天',
  },
  {
    role: '乙 · 安全 + WLAN',
    directions: ['security', 'wlan'],
    why: '两个方向合计约 41%（安全 208 + WLAN 191），考点相对独立，适合一人双方向',
    dailyQuota: '主攻 30+30 题/天 + 高概率题保温 20 题/天',
  },
  {
    role: '丙 · DCN + 数通补位',
    directions: ['dcn', 'datacom'],
    why: 'DCN 约 20%（188 题）自成一体；空余时间补数通的短板，避免数通成为木桶底',
    dailyQuota: '主攻 DCN 60 题/天 + 数通补位 20 题/天',
  },
];

function shiftDate(base: string, deltaDays: number): string {
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + deltaDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const FOCUS_ROTATION = [
  { name: '数通', dir: '数通：OSI/TCP-IP、子网划分、VLAN/STP、OSPF、ACL/NAT' },
  { name: '安全', dir: '安全：防火墙安全策略、会话表、IPSec/IKE、AAA、攻击防护' },
  { name: 'WLAN', dir: 'WLAN：CAPWAP 上线、AP/AC 角色、SSID/VAP、转发方式、漫游' },
  { name: 'DCN', dir: 'DCN：VXLAN/EVPN、存储基础（RAID/SAN/NAS）、虚拟化' },
  { name: '数通二轮', dir: '数通二轮：只刷错题 + 高频 tag，不再铺新题' },
];

/** 生成 12 天冲刺计划（Day 12 = 校赛当天） */
export function buildSprintPlan(contestDate: string = SCHOOL_CONTEST_DATE): ISprintDay[] {
  const days: ISprintDay[] = [];

  for (let d = 1; d <= 12; d++) {
    const date = shiftDate(contestDate, d - 12);

    if (d <= 3) {
      /* 高概率题（real ∪ hot，刷题侧口径）按方向：数通 145 / 安全 110 / WLAN 102 / DCN 85 = 442
         —— 实测命令：node ict-audit-v2/diag-plan-quota.mjs → likely = 442 (45.9%)
         三天均分 150 / 150 / 142。
         为什么不沿用「一天一个方向片区」的老分法：补齐后多选/判断是**按知识点跨方向**补进来的，
         单日只压一个方向会算出 Day 2 = 212 道、Day 3 = 85 道，与实际分布不符，也不好执行。
         判断题 132 道按方向：数通 56 / 安全 32 / WLAN 27 / DCN 17（合计 132）
         —— 实测命令：node ict-audit-v2/diag-judge-direction.mjs
         三天各 44 道，入口为全局「判断」筛选（不按方向切分），可覆盖全量 132 道 */
      const zone = ['第一轮', '第二轮', '第三轮'][d - 1];
      const likelyQuota = [150, 150, 142][d - 1];
      days.push({
        day: d,
        date,
        phase: '保底分',
        title: `高概率题 ×${likelyQuota}（${zone}）+ 判断题 ×44`,
        tasks: [
          '刷题页点「高概率」标签，按方向分批刷（数通 145 / 安全 110 / WLAN 102 / DCN 85）',
          '多选、判断已按知识点补齐 —— 同一个高频考点的多选/判断也计入，三种题型都刷得到',
          '提示：高概率题里基础难度（HCIA/HCIP）有 311 道，先把这批吃干净',
          '同时把题型切到「判断」，刷 44 道，三天凑满 132 道全覆盖',
          '每道题先自己判断，再展开解析看「为什么」——错题当日重做一遍',
          '收尾：口述今天错的题考的是哪个知识点',
        ],
        quota: [
          { label: '高概率题', value: `${likelyQuota} 道` },
          { label: '判断题', value: '44 道' },
          { label: '正确率目标', value: '≥85%' },
        ],
        shortcuts: [
          { label: '刷判断题', type: 'judge' },
          { label: '刷高概率题', tag: 'likely' },
        ],
      });
    } else if (d <= 8) {
      const r = FOCUS_ROTATION[d - 4];
      days.push({
        day: d,
        date,
        phase: '主攻方向',
        title: `主攻方向攻坚：${r.name} · 60 题`,
        tasks: [
          `按分工刷自己的主攻方向 60 题（${r.dir}）`,
          '高概率题保温 20 道（真题同源 ∪ 高频），防止手感流失',
          '错题本过一遍，连续答对 2 次才允许移出',
          '把当天反复错的点抄进「我的笔记」',
        ],
        quota: [
          { label: '主攻题', value: '60 道' },
          { label: '高概率保温', value: '20 道' },
        ],
        shortcuts: [{ label: '刷高概率题', tag: 'likely' }],
      });
    } else if (d <= 10) {
      days.push({
        day: d,
        date,
        phase: '真题演练',
        title: '真题同源题 ×48 + 错题清盘',
        tasks: [
          '刷题页把标签切到「真题」，刷 48 道（真题共 95 道，两天过完）',
          '错题本整体过一遍，按「概念不熟 / 看错题 / 算错」三类归因',
          '高频 tag 题扫 30 道，只记结论不看长篇',
        ],
        quota: [
          { label: '真题', value: '48 道' },
          { label: '高频', value: '30 道' },
        ],
        shortcuts: [{ label: '刷真题', tag: 'real' }],
      });
    } else {
      const isContestDay = d === 12;
      days.push({
        day: d,
        date,
        phase: '全真模考',
        title: isContestDay ? '校赛当天：只看错题 + 判断题' : '全真模考 ×2（60 题 / 60 分钟）',
        tasks: isContestDay
          ? [
              '考前 2 小时：只翻错题本与判断题，不碰新题',
              '答题节奏：判断题 20~30 秒/题，单选 40 秒，多选 60 秒，留 5 分钟检查',
              '多选题没把握就先标记后置，别在一道题上耗死',
            ]
          : [
              '模考页跑 2 套「省初赛模考」，严格计时，中间不暂停',
              '目标 ≥85 分；低于 85 分把错题解析逐条读完再跑第二套',
              '记录每题耗时，找出拖后腿的题型',
            ],
        quota: isContestDay
          ? [{ label: '状态', value: '提前 30 分钟到' }]
          : [
              { label: '模考', value: '2 套' },
              { label: '目标分', value: '≥85' },
            ],
        ...(isContestDay
          ? { shortcuts: [{ label: '考前刷判断题', type: 'judge' as const }] }
          : {}),
      });
    }
  }

  return days;
}

/** 把计划导出成可发到微信群的纯文本（队长转给队友用） */
export function sprintPlanToText(plan: ISprintDay[]): string {
  const lines: string[] = [
    '【12 天校赛冲刺计划】目标：校一等奖出线',
    '',
    '刷题优先级：高概率题 442 道（真题同源 ∪ 高频）> 判断题 132 道 > 其余新题',
    '（刷题页顶部选「高概率」/「真题」标签即可只刷这一批）',
    '',
    '团队分工（三人各守方向，覆盖全库）：',
    ...SPRINT_TEAM_ROLES.map(
      (r) => `  ${r.role}：${r.directions.map((d) => ({ datacom: '数通', dcn: 'DCN', security: '安全', wlan: 'WLAN' }[d] ?? d)).join(' + ')} — ${r.dailyQuota}`
    ),
    '',
    '每日安排：',
  ];
  plan.forEach((d) => {
    lines.push(`Day ${d.day}（${d.date}）【${d.phase}】${d.title}`);
    d.tasks.forEach((t) => lines.push(`    - ${t}`));
  });
  lines.push('', '网址：打开即可刷，无需注册；各自进度独立，队长用「设置 → 导入队友备份」汇总。');
  return lines.join('\n');
}
