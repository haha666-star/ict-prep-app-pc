/**
 * 题库标签筛选（纯模块，可被 node 直接打包自测）
 *
 * ⚠️ 本文件有两套**故意不一样**的口径，改动前先读完这一段：
 *   【刷题侧】matchTag / countTags（本文件）—— 「按标签刷题」的题库筛选
 *   【组卷侧】src/lib/exam.ts 的 tagRank —— 模考组卷的「格子内高概率优先」
 *
 * 为什么刷题侧要「按知识点补齐」？
 *   2026-10-13 实测：标签是**逐题手标**的，而且几乎只落在单选上：
 *     real 106 = 单选 89 / 多选 17 / 判断 0
 *     hot  543 = 单选 157 / 多选 178 / 判断 208
 *   ⇒ 「高频 × 多选」在旧库只剩 1 道、「真题 × 判断」为 0，
 *     用户打开筛选就是一句「这个设置有问题」。
 *   但**考点的高频性是知识点级属性**，多选/判断考的是同一个考点 —— 所以刷题侧补齐：
 *     知识点被判为高频 → 该知识点下的**多选/判断**同样算高频。
 *   两条边界（刻意收紧，避免标签失去区分度）：
 *     ① 只补 **多选 / 判断**，**不补单选**（单选本身已充分标注）；
 *        若连单选一起补，「高频 ∪ 真题」会从 875 膨胀到 1333（98.7% 全库），标签就没意义了
 *        （实测：node ict-audit-v2/diag-v8-derived2.mjs）。
 *     ② **不扩「真题」**（real 保持严格手标的 106 道）：
 *        「真题同源」是来源属性，不能靠知识点推导 —— 那样等于伪造出处。
 *        判断题没有真题同源是事实（公开真题回忆里就没有判断题原题），UI 里直说，不给假标签。
 *   补齐后实测（命令：node ict-audit-v2/diag-snapshot-v8.mjs）：
 *     real 106 / hot 769 / likely 875（占全库 64.8%）
 *     单选 246 / 多选 307 / 判断 322；4 方向 × 3 题型 = 12 个格子**全部 ≥35 题**，无空格子。
 *
 * 组卷侧为什么不补齐？
 *   押题要的是**稀缺性**：严格手标的 649 道（其中 real 只有 106 道）才是「最像真题的窄集」，
 *   扩到 875 会把 real/hot 与普通题的边界一并抹掉。
 *   实测（node ict-audit-v2/probe-exam.mjs）：不补齐时 preferLikely 开启 = 整卷 100% real/hot、
 *   0% 普通题；关闭 ≈ 48%（= 全库基线）—— 仍有 2 倍以上区分度，不是装饰。
 *   押「窄集」、练「宽集」，本来就是两件事 —— 所以两套口径并存，且都写进断言。
 */

export type TagFilter = 'all' | 'likely' | 'real' | 'hot';

/** 标签判定所需的最小题目信息 */
export interface ITagInfo {
  tag?: string;
  /** 'single' | 'multiple' | 'judge' */
  type: string;
  knowledgeId?: string;
}

export interface ITagContext {
  /** 被判为「高频」的知识点集合（由原始逐题标注推导） */
  hotKnowledgeIds: ReadonlySet<string>;
  /** 被判为「真题同源」的知识点集合（仅用于 UI 文案展示） */
  realKnowledgeIds: ReadonlySet<string>;
  /** 全库知识点总数（UI 文案用） */
  knowledgeCount: number;
}

export const EMPTY_TAG_CONTEXT: ITagContext = {
  hotKnowledgeIds: new Set(),
  realKnowledgeIds: new Set(),
  knowledgeCount: 0,
};

/** 从题库推导标签上下文；UI 里用 useMemo(() => buildTagContext(MOCK_QUIZZES), []) 调一次 */
export function buildTagContext(list: ReadonlyArray<ITagInfo>): ITagContext {
  const hot = new Set<string>();
  const real = new Set<string>();
  const all = new Set<string>();
  for (const q of list) {
    if (!q.knowledgeId) continue;
    all.add(q.knowledgeId);
    if (q.tag === 'hot') hot.add(q.knowledgeId);
    if (q.tag === 'real') real.add(q.knowledgeId);
  }
  return { hotKnowledgeIds: hot, realKnowledgeIds: real, knowledgeCount: all.size };
}

export type EffectiveTag = 'real' | 'hot' | undefined;

/** 单题在**刷题侧**的有效标签（含按知识点补齐的多选/判断） */
export function effectiveTag(q: ITagInfo, ctx: ITagContext = EMPTY_TAG_CONTEXT): EffectiveTag {
  if (q.tag === 'real') return 'real';
  if (q.tag === 'hot') return 'hot';
  const fillable = q.type === 'multiple' || q.type === 'judge';
  if (fillable && q.knowledgeId && ctx.hotKnowledgeIds.has(q.knowledgeId)) return 'hot';
  return undefined;
}

/** 单题是否命中标签筛选（刷题侧口径） */
export function matchTag(
  q: ITagInfo,
  filter: TagFilter,
  ctx: ITagContext = EMPTY_TAG_CONTEXT
): boolean {
  if (filter === 'all') return true;
  const eff = effectiveTag(q, ctx);
  if (filter === 'likely') return eff === 'real' || eff === 'hot';
  return eff === filter;
}

export interface ITagCounts {
  real: number;
  hot: number;
  /** real ∪ hot（去重，不是两者相加） */
  likely: number;
}

/** 统计题库标签分布（刷题侧口径，likely 用并集去重） */
export function countTags(
  list: ReadonlyArray<ITagInfo>,
  ctx: ITagContext = EMPTY_TAG_CONTEXT
): ITagCounts {
  let real = 0;
  let hot = 0;
  let likely = 0;
  for (const q of list) {
    const eff = effectiveTag(q, ctx);
    if (eff === 'real') {
      real++;
      likely++;
    } else if (eff === 'hot') {
      hot++;
      likely++;
    }
  }
  return { real, hot, likely };
}

/** 按题型统计某个标签档位下的题量（用于「口径说明」文案，直接解释用户看到的数字） */
export function countTagsByType(
  list: ReadonlyArray<ITagInfo>,
  filter: TagFilter,
  ctx: ITagContext = EMPTY_TAG_CONTEXT
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of list) {
    if (!matchTag(q, filter, ctx)) continue;
    out[q.type] = (out[q.type] ?? 0) + 1;
  }
  return out;
}

export const TAG_FILTER_LABELS: Record<Exclude<TagFilter, 'all'>, string> = {
  likely: '高概率',
  real: '真题',
  hot: '高频',
};

/** 供 UI 使用的标签筛选档位（顺序即展示顺序） */
export const TAG_FILTERS: TagFilter[] = ['all', 'likely', 'real', 'hot'];
