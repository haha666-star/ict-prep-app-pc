/**
 * 题库标签筛选（纯模块，可被 node 直接打包自测）
 *
 * 标签语义：
 *   real   —— 往年真题同源（95 道）
 *   hot    —— 高频考点（167 道）
 *   likely —— 高概率 = real ∪ hot（262 道，占全库 27.2%）
 *
 * ⚠️ 重要约束：高概率题**严重偏单选**（单选 233 / 多选 11 / 判断 18）。
 *    因此 `likely` 只能用于「刷题页的题库侧筛选」；组卷侧必须走
 *    「题型配额优先 + 格子内高概率优先」的分层策略（见 src/lib/exam.ts
 *    buildExamPaper 的 preferLikely），否则多选/判断会被挤空。
 *    实测命令：node ict-audit-v2/tagstats.mjs
 */

export type TagFilter = 'all' | 'likely' | 'real' | 'hot';

export interface ITagCounts {
  real: number;
  hot: number;
  likely: number;
}

/** 单题是否命中标签筛选 */
export function matchTag(tag: string | undefined, filter: TagFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'likely') return tag === 'real' || tag === 'hot';
  return tag === filter;
}

/** 统计题库标签分布（likely 用并集去重，不是 real+hot 的重复计数） */
export function countTags(list: ReadonlyArray<{ tag?: string }>): ITagCounts {
  let real = 0;
  let hot = 0;
  let likely = 0;
  for (const q of list) {
    if (q.tag === 'real') {
      real++;
      likely++;
    } else if (q.tag === 'hot') {
      hot++;
      likely++;
    }
  }
  return { real, hot, likely };
}

export const TAG_FILTER_LABELS: Record<Exclude<TagFilter, 'all'>, string> = {
  likely: '高概率',
  real: '真题',
  hot: '高频',
};

/** 供 UI 使用的标签筛选档位（顺序即展示顺序） */
export const TAG_FILTERS: TagFilter[] = ['all', 'likely', 'real', 'hot'];
