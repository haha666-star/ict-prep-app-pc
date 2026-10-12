import {
  MOCK_QUIZZES,
  type IQuizQuestion,
  type QuizDifficulty,
  type QuizType,
} from '@/data/quizzes';

export type ExamPresetId = 'province-prelim' | 'province-final' | 'sprint' | 'national-final';

export interface IExamPreset {
  id: ExamPresetId;
  name: string;
  sub: string;
  questionCount: number;
  minutes: number;
  difficultyMix: QuizDifficulty[];
  /** 方向配比 */
  weights: Record<string, number>;
  /** 题型配比（判断/单选/多选），官方省赛三题型均考。以当届官方通知为准，可在此调整 */
  typeWeights: Record<QuizType, number>;
  tip: string;
}

/**
 * 事实订正（2026-10-12 多源核实）：
 * 华为 ICT 大赛实践赛·网络赛道省赛理论卷题型为「判断 + 单选 + 多选」三题型（不是只考单选+多选）。
 * 省初赛 60 题/60 分钟，省复赛 150 题/120 分钟（部分省份/届次口径不同，如第九届云南 90 题、
 * 第十一届辽宁网络赛道 200 题/90 分钟）。因此题型配比在此做成**可配置**，模考不再排除判断题。
 */
export const DEFAULT_TYPE_WEIGHTS: Record<QuizType, number> = {
  single: 0.5,
  multiple: 0.3,
  judge: 0.2, // 官方卷判断题通常占 20%~35%
};

export const EXAM_PRESETS: IExamPreset[] = [
  {
    id: 'province-prelim',
    name: '省初赛模考',
    sub: '60 题 / 60 分钟',
    questionCount: 60,
    minutes: 60,
    difficultyMix: ['IA', 'IP'],
    weights: { datacom: 0.4, dcn: 0.2, security: 0.2, wlan: 0.2 },
    typeWeights: { single: 0.5, multiple: 0.3, judge: 0.2 },
    tip: '对应省初赛规格：平均 60 秒/题，以 HCIA 为主、少量 HCIP，判断/单选/多选三题型均考。',
  },
  {
    id: 'province-final',
    name: '省复赛模考',
    sub: '150 题 / 120 分钟',
    questionCount: 150,
    minutes: 120,
    difficultyMix: ['IP', 'IE'],
    weights: { datacom: 0.4, dcn: 0.2, security: 0.2, wlan: 0.2 },
    typeWeights: { single: 0.5, multiple: 0.3, judge: 0.2 },
    tip: '对应省复赛规格：平均 48 秒/题，HCIP 为主含 HCIE 高阶题。节奏是最大失分点。',
  },
  {
    id: 'sprint',
    name: '冲刺小测',
    sub: '20 题 / 20 分钟',
    questionCount: 20,
    minutes: 20,
    difficultyMix: ['IA', 'IP', 'IE'],
    weights: { datacom: 0.4, dcn: 0.2, security: 0.2, wlan: 0.2 },
    typeWeights: { single: 0.5, multiple: 0.3, judge: 0.2 },
    tip: '碎片时间自测，全难度混合抽题，三题型全覆盖。',
  },
  {
    id: 'national-final',
    name: '国家总决赛模考',
    sub: '90 题 / 90 分钟',
    questionCount: 90,
    minutes: 90,
    difficultyMix: ['IP', 'IE'],
    weights: { datacom: 0.5, security: 0.25, wlan: 0.25, dcn: 0 },
    typeWeights: { single: 0.5, multiple: 0.3, judge: 0.2 },
    tip: '国赛以实验为主，本模考仅作理论储备。数通半壁江山，DCN 不考。',
  },
];

/** Fisher-Yates 洗牌（无偏），替代 sort(() => Math.random() - 0.5) */
export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 题干去重：题库中存在少量完全重复的题干（ID 不同），考试中只保留一道 */
export function dedupeQuestions(list: IQuizQuestion[]): IQuizQuestion[] {
  const seen = new Set<string>();
  const out: IQuizQuestion[] = [];
  for (const q of list) {
    const key = q.question.trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

/**
 * 考试用题库：全题型（判断 + 单选 + 多选）去重后的完整池。
 * 注意：这里**不再排除判断题** —— 官方省赛三题型均考，排除判断题会造成系统性失分。
 */
export function getExamPool(): IQuizQuestion[] {
  return dedupeQuestions(MOCK_QUIZZES);
}

export function getDifficulty(q: IQuizQuestion): QuizDifficulty {
  return q.difficulty ?? 'IA';
}

/**
 * 题源优先级：real（真题同源）> hot（高频预测）> 普通题。
 * 用于「高概率优先」抽题：在**严格保题型/方向配额**的前提下，格子内优先取真题、再高频、最后普通题。
 */
export function tagRank(q: IQuizQuestion): number {
  if (q.tag === 'real') return 2;
  if (q.tag === 'hot') return 1;
  return 0;
}

export interface IBuildExamOptions {
  /** 高概率优先：同一格子内优先抽真题/高频题（默认 true） */
  preferLikely?: boolean;
}

/**
 * 按预设组卷：二维配额（题型 × 方向）抽样。
 * 顺序：① 按 (题型,方向) 格子配额 → ② 按题型补足 → ③ 全池补足 → ④ 放宽难度补足。
 *
 * 高概率优先（preferLikely，默认开）：
 *   每个格子的候选按 tag 分三档（real / hot / plain），档内洗牌、档间按优先级取，
 *   因此题型与方向配比**完全不受影响**，只是「同等条件下优先考真题高频」。
 *   实测效果（每预设各 200 套抽样，命令 node ict-audit-v2/probe-exam.mjs）：
 *     省初赛 60 题  开 83.3% / 关 19.8%
 *     省复赛 150 题 开 64.7% / 关 21.6%
 *     冲刺小测 20 题 开 95.0% / 关 21.3%
 *     国家总决赛 90 题 开 72.2% / 关 22.7%
 *   注：关闭时低于全库基线 27.2%，因为组卷池是「难度符合该预设」的子集，
 *       而高概率题在该子集内本身占比更低（IA+IP 池仅 23.1%）。
 */
export function buildExamPaper(
  preset: IExamPreset,
  options: IBuildExamOptions = {}
): IQuizQuestion[] {
  const preferLikely = options.preferLikely !== false;
  const N = preset.questionCount;
  const pool = getExamPool().filter((q) => preset.difficultyMix.includes(getDifficulty(q)));
  const picked: IQuizQuestion[] = [];
  const used = new Set<string>();

  const dirs = Object.keys(preset.weights);
  const types: QuizType[] = ['single', 'multiple', 'judge'];

  const take = (cands: IQuizQuestion[], need: number) => {
    let n = 0;
    for (const q of cands) {
      if (n >= need || picked.length >= N) break;
      if (used.has(q.id)) continue;
      used.add(q.id);
      picked.push(q);
      n++;
    }
  };

  // 候选（未使用）：高概率优先时按 tag 分档排序
  const cands = (t?: QuizType, d?: string) => {
    const arr = pool.filter(
      (q) => (!t || q.type === t) && (!d || q.direction === d) && !used.has(q.id)
    );
    if (!preferLikely) return shuffle(arr);
    const tiers: IQuizQuestion[][] = [[], [], []];
    arr.forEach((q) => tiers[tagRank(q)].push(q));
    return [...shuffle(tiers[2]), ...shuffle(tiers[1]), ...shuffle(tiers[0])];
  };

  // ① 二维格子配额 = N × 方向权重 × 题型权重
  types.forEach((t) => {
    const tw = preset.typeWeights[t] ?? 0;
    if (tw <= 0) return;
    dirs.forEach((d) => {
      const dw = preset.weights[d] ?? 0;
      if (dw <= 0) return;
      const need = Math.round(N * dw * tw);
      take(cands(t, d), need);
    });
  });

  // ② 按题型补足（方向配额落空时，同题型内跨方向补）
  types.forEach((t) => {
    const target = Math.round(N * (preset.typeWeights[t] ?? 0));
    const have = picked.filter((q) => q.type === t).length;
    if (have < target) take(cands(t), target - have);
  });

  // ③ 全池补足（难度匹配池内，不限题型/方向）
  if (picked.length < N) take(cands(), N - picked.length);

  // ④ 仍不足：放宽难度限制（例如某难度判断题材不足），用完整池补
  if (picked.length < N) {
    const rest = getExamPool().filter((q) => !used.has(q.id));
    take(preferLikely ? candsFromPool(rest) : shuffle(rest), N - picked.length);
  }

  return shuffle(picked).slice(0, N);
}

/** 对给定题目集合做「高概率优先」排序（档内洗牌） */
function candsFromPool(arr: IQuizQuestion[]): IQuizQuestion[] {
  const tiers: IQuizQuestion[][] = [[], [], []];
  arr.forEach((q) => tiers[tagRank(q)].push(q));
  return [...shuffle(tiers[2]), ...shuffle(tiers[1]), ...shuffle(tiers[0])];
}

/** 统计一张卷子里高概率题（真题+高频）的构成 */
export function countLikely(paper: IQuizQuestion[]) {
  const real = paper.filter((q) => q.tag === 'real').length;
  const hot = paper.filter((q) => q.tag === 'hot').length;
  return { real, hot, likely: real + hot, total: paper.length };
}

/** 判分：多选要求完全一致 */
export function isAnswerCorrect(q: IQuizQuestion, selected: string[]): boolean {
  const answer = q.answer;
  if (Array.isArray(answer)) {
    if (selected.length !== answer.length) return false;
    return answer.every((a) => selected.includes(a));
  }
  return selected.length === 1 && selected[0] === answer;
}

export function formatSec(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export const DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  IA: 'HCIA',
  IP: 'HCIP',
  IE: 'HCIE',
};

export const DIFFICULTY_COLORS: Record<QuizDifficulty, string> = {
  IA: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  IP: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  IE: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export const TYPE_LABELS: Record<QuizType, string> = {
  single: '单选',
  multiple: '多选',
  judge: '判断',
};

/** 估算一张卷子的题型构成（用于模考选择页展示「真实题型配比」） */
export function describeTypeMix(preset: IExamPreset): string {
  return (['single', 'multiple', 'judge'] as QuizType[])
    .filter((t) => (preset.typeWeights[t] ?? 0) > 0)
    .map((t) => `${TYPE_LABELS[t]} ${Math.round(preset.questionCount * preset.typeWeights[t])} 题`)
    .join(' · ');
}
