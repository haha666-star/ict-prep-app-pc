/**
 * 题级合并核心算法（零依赖纯模块）
 *
 * 抽出来的目的：
 *   1) 与 React / localStorage 解耦，可被独立脚本直接 import 做单元自测；
 *   2) 语义与离线工具 ict-merge-kit/merge-backup.mjs 保持一致，便于交叉核验。
 *
 * 合并规则（透明可核）：
 *   answeredIds  —— 取并集（题目维度去重，不按端相加）
 *   wrongIds     —— 由合并后的 perQuestion 重建（答错过 且 未达毕业 streak 才留在错题本）
 *   attempts     —— 相加
 *   wrongCount   —— 相加
 *   correctStreak—— 连续性指标，不可相加；取「lastAt 最近」那一端的状态
 *   lastAt       —— 取 max
 *   correctCount —— 保守口径：一次都没答错过的题数（宁可低报）
 *   totalCount   —— 去重后的已答题数
 *   byDirection  —— 按题库 ID → 方向 精确重算（无映射则跳过）
 *   dailyRecords —— 按天取 max（保证「同一份备份重复合并」幂等，不灌水）
 */

export interface IQuestionStatLike {
  attempts: number;
  wrongCount: number;
  correctStreak: number;
  lastAt: number;
  lastCorrect: boolean;
}

export interface IQuizRecordsLike {
  answeredIds: string[];
  wrongIds: string[];
  correctCount: number;
  totalCount: number;
  byDirection: Record<string, { correct: number; total: number }>;
  dailyRecords: Record<string, { count: number; correct: number }>;
  perQuestion: Record<string, IQuestionStatLike>;
}

/** 错题本毕业阈值：连续答对 N 次视为掌握并移出错题本 */
export const SRS_GRADUATE_STREAK = 2;

export function mergeQuizRecords(
  list: (IQuizRecordsLike | undefined | null)[],
  dirOf?: (id: string) => string | undefined
): IQuizRecordsLike {
  const answered = new Set<string>();
  const perQuestion: Record<string, IQuestionStatLike> = {};
  const daily: Record<string, { count: number; correct: number }> = {};
  const wrongFromSource = new Set<string>();

  list.forEach((r) => {
    if (!r) return;
    (r.answeredIds ?? []).forEach((id) => answered.add(id));
    (r.wrongIds ?? []).forEach((id) => wrongFromSource.add(id));

    Object.entries(r.dailyRecords ?? {}).forEach(([d, v]) => {
      const cur = daily[d] ?? { count: 0, correct: 0 };
      daily[d] = {
        count: Math.max(cur.count, v?.count ?? 0),
        correct: Math.max(cur.correct, v?.correct ?? 0),
      };
    });

    Object.entries(r.perQuestion ?? {}).forEach(([id, s]) => {
      if (!s) return;
      const cur = perQuestion[id];
      if (!cur) {
        perQuestion[id] = { ...s };
        return;
      }
      const newer = (s.lastAt ?? 0) >= (cur.lastAt ?? 0) ? s : cur;
      perQuestion[id] = {
        attempts: (cur.attempts ?? 0) + (s.attempts ?? 0),
        wrongCount: (cur.wrongCount ?? 0) + (s.wrongCount ?? 0),
        correctStreak: newer.correctStreak ?? 0,
        lastAt: Math.max(cur.lastAt ?? 0, s.lastAt ?? 0),
        lastCorrect: newer.lastCorrect ?? false,
      };
    });
  });

  Object.keys(perQuestion).forEach((id) => answered.add(id));

  // 重建错题本（SRS 语义）
  const wrongIds = new Set<string>();
  Object.entries(perQuestion).forEach(([id, s]) => {
    if ((s.wrongCount ?? 0) > 0 && (s.correctStreak ?? 0) < SRS_GRADUATE_STREAK) {
      wrongIds.add(id);
    }
  });
  wrongFromSource.forEach((id) => {
    if (!perQuestion[id]) wrongIds.add(id); // 缺明细的题兜底保留
  });

  // 首刷正确题数：保守口径
  const correctCount = Object.values(perQuestion).filter(
    (s) => (s.wrongCount ?? 0) === 0 && (s.attempts ?? 0) > 0
  ).length;

  // 方向正确率：按题库 ID 精确重算
  const byDirection: Record<string, { correct: number; total: number }> = {};
  answered.forEach((id) => {
    const dir = dirOf?.(id);
    if (!dir) return;
    byDirection[dir] ??= { correct: 0, total: 0 };
    byDirection[dir].total += 1;
    const s = perQuestion[id];
    if (!s || (s.wrongCount ?? 0) === 0) byDirection[dir].correct += 1;
  });

  return {
    answeredIds: [...answered],
    wrongIds: [...wrongIds],
    correctCount,
    totalCount: answered.size,
    byDirection,
    dailyRecords: daily,
    perQuestion,
  };
}

// ---------------- 备份指纹去重 ----------------
//
// 为什么需要：attempts / wrongCount 是「累计计数器」，按设计是相加的，
// 因此**同一份备份合并两次会把这两个字段翻倍**（正确率、已答题数等头条指标不受影响，
// 因为它们走的是并集/重算口径）。为避免用户周期性合并时误重复累加，
// 这里给每份备份算一个指纹，合并过的直接跳过。

export interface IBackupLike {
  owner?: string;
  exportedAt?: string;
  data?: { quiz_records?: Partial<IQuizRecordsLike> | null };
}

/** 备份指纹：用于判断「这份备份之前是否已合并过」 */
export function backupFingerprint(b: IBackupLike | null | undefined): string {
  const rec = b?.data?.quiz_records;
  return [
    b?.owner ?? '',
    b?.exportedAt ?? '',
    rec?.totalCount ?? 0,
    rec?.correctCount ?? 0,
  ].join('|');
}
