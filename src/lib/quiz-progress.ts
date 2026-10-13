/**
 * 刷题进度（会话续刷位置）—— 纯逻辑模块，不依赖 DOM，可在 Node 侧独立单测。
 *
 * ============================ 为什么要单独抽出来 ============================
 * 2026-10-13 题库扩容（964 → 1351）后，用户反馈：
 *   「做题数据还在，但之前的做题记忆没了，全部是从头开始刷题」
 *
 * 根因在 QuizPage 的旧恢复条件：
 *     if (prog.ids.length === list.length) { …恢复顺序与位置… }
 * 它要求**存档题量与当前题池题量一字不差**才允许恢复。
 * 题库一增删，`prog.ids.length !== list.length` 立刻成立 → 判定为不可恢复
 * → 走 else 分支用 `index: 0` 覆盖存档 → 位置被永久丢弃。
 *
 * 而「做题数据」（answeredIds / perQuestion / wrongIds）存在**另一把 key**里，
 * 按题目 id 记录，不受题池增删影响 —— 这正是「数据还在、记忆没了」的成因。
 *
 * ============================ 新口径 ============================
 * 以题目 **id** 为准，题池增删都不再让位置作废：
 *
 *   1. `exact`    存档题池与当前池完全一致（含随机模式的自定义顺序）→ 原样恢复。
 *   2. `expanded` 存档题全在当前池中、且前缀顺序未变（纯扩容）→ 旧题保持原顺序在前、
 *                 新增题追加到末尾，`index` 语义不变（前缀仍是同一批同序的题）。
 *   3. `pruned`   池中有题被删除/替换 → 只保留仍在池中的题（保持存档顺序），
 *                 位置按 `perQuestion.lastAt` 推断。
 *   4. `relocated` 存档 `index` 已失效（= 0 但该池已有 ≥ MIN_ANSWERED_FOR_RELOCATE
 *                 道作答记录）→ 按 `lastAt` 重建位置。
 *                 这一条专门用来救「已被旧版覆盖成 0」的存档。
 *   5. `fresh`    无存档 → 全新开始。
 *
 * 用户主动点「从头开始」时写入 `resetByUser: true`，明确不做位置重建 ——
 * 否则重置后一刷新又被推回旧位置。
 *
 * 注意：`relocated` 是**推断**而非精确恢复（存档里的位置早已被覆盖丢失），
 * 依据是「最后一次作答的题」→ 续到它的下一题。顺序刷题时与真实位置一致。
 */

/** 池中已有这么多作答记录、而存档 index 却是 0 → 判定位置已失效（旧版覆盖所致） */
export const MIN_ANSWERED_FOR_RELOCATE = 3;

export interface IProgressEntry {
  ids: string[];
  index: number;
  updatedAt: number;
  /** 用户主动点了「从头开始」——此时 index=0 是预期值，不做位置重建 */
  resetByUser?: boolean;
}

export interface IProgressMap {
  [sessionKey: string]: IProgressEntry;
}

export interface IQuestionLike {
  id: string;
}

export interface IStatLike {
  attempts?: number;
  lastAt?: number;
}

export type RestoreStrategy = 'fresh' | 'exact' | 'expanded' | 'pruned' | 'relocated';

export interface IRestoreResult<T extends IQuestionLike> {
  /** 恢复后的会话题目顺序（长度 === 传入 list 的长度） */
  order: T[];
  /** 建议起始下标 */
  index: number;
  strategy: RestoreStrategy;
  /** 人话说明（用于 toast 与自测断言） */
  note: string;
}

const clampIndex = (i: number, len: number) => Math.max(0, Math.min(i, Math.max(0, len - 1)));

/** 该池中「答过至少一次」的题数 */
export function countAnsweredIn<T extends IQuestionLike>(
  order: T[],
  perQuestion: Record<string, IStatLike> = {}
): number {
  let n = 0;
  for (const q of order) if ((perQuestion[q.id]?.attempts ?? 0) > 0) n += 1;
  return n;
}

/** 该池中「最后一次作答时间最晚」的题的下标；无任何作答记录返回 -1 */
export function locateByLastAt<T extends IQuestionLike>(
  order: T[],
  perQuestion: Record<string, IStatLike> = {}
): number {
  let bestIdx = -1;
  let bestAt = 0;
  order.forEach((q, i) => {
    const at = perQuestion[q.id]?.lastAt ?? 0;
    if (at > bestAt) {
      bestAt = at;
      bestIdx = i;
    }
  });
  return bestIdx;
}

export function restoreSession<T extends IQuestionLike>(
  list: T[],
  prog: IProgressEntry | undefined,
  perQuestion: Record<string, IStatLike> = {}
): IRestoreResult<T> {
  if (!list.length) {
    return { order: [], index: 0, strategy: 'fresh', note: '当前筛选无题目' };
  }
  const fresh: IRestoreResult<T> = {
    order: [...list],
    index: 0,
    strategy: 'fresh',
    note: '新会话，从第 1 题开始',
  };
  if (!prog || !Array.isArray(prog.ids) || prog.ids.length === 0) return fresh;

  // 按存档顺序取出「仍在本池中」的题（去重，防存档里混入重复 id）
  const byId = new Map(list.map((q) => [q.id, q] as const));
  const kept: T[] = [];
  const seen = new Set<string>();
  for (const id of prog.ids) {
    const q = byId.get(id);
    if (q && !seen.has(id)) {
      seen.add(id);
      kept.push(q);
    }
  }
  // 本池新出现、存档里没有的题 → 追加到末尾（纯扩容时即新增的那批）
  const added = list.filter((q) => !seen.has(q.id));
  const order = [...kept, ...added];

  const allSavedAlive = kept.length === prog.ids.length;
  const noAdded = added.length === 0;
  const sameSize = kept.length === list.length;
  /** 存档的题目顺序是否与当前池的前缀逐位一致（决定 index 语义能否沿用） */
  const prefixStable = kept.every((q, i) => list[i]?.id === q.id);

  let strategy: RestoreStrategy;
  let index: number;

  if (allSavedAlive && noAdded && sameSize) {
    // 题池一字不差（含随机模式：此时按存档顺序还原，保证顺序稳定）
    strategy = 'exact';
    index = clampIndex(prog.index ?? 0, order.length);
  } else if (allSavedAlive && !noAdded && prefixStable) {
    // 纯扩容：旧题前缀未动，位置语义可沿用
    strategy = 'expanded';
    index = clampIndex(prog.index ?? 0, order.length);
  } else {
    // 有题被删/被替换：只能靠作答时间推断
    strategy = 'pruned';
    const lastIdx = locateByLastAt(order, perQuestion);
    index = lastIdx >= 0 ? clampIndex(lastIdx + 1, order.length) : 0;
  }

  // 位置失效重建：index=0 但池里已答过不少题，且不是用户主动重置
  if (strategy !== 'pruned' && index === 0 && !prog.resetByUser) {
    const answered = countAnsweredIn(order, perQuestion);
    if (answered >= MIN_ANSWERED_FOR_RELOCATE) {
      const lastIdx = locateByLastAt(order, perQuestion);
      if (lastIdx >= 0) {
        strategy = 'relocated';
        index = clampIndex(lastIdx + 1, order.length);
      }
    }
  }

  const note =
    strategy === 'relocated'
      ? `已按作答记录续刷到第 ${index + 1}/${order.length} 题`
      : strategy === 'expanded'
        ? `题库已扩充至 ${order.length} 题，已保留原进度：第 ${index + 1} 题`
        : strategy === 'pruned'
          ? `题库有变动，已按作答记录定位到第 ${index + 1}/${order.length} 题`
          : `已恢复上次进度：第 ${index + 1}/${order.length} 题`;

  return { order, index, strategy, note };
}

/**
 * 是否应保留「用户已主动重置」标记。
 * 重置后 index 一旦被推到 0 以上，标记自然失效；仍是 0 则继续保留，
 * 避免「点从头开始 → 刷新 → 又被推回旧位置」。
 */
export function shouldKeepResetFlag(prev: IProgressEntry | undefined, nextIndex: number): boolean {
  return prev?.resetByUser === true && nextIndex === 0;
}
