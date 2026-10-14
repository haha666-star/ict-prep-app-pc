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
 * ==================== 位置口径（2026-10-14 二次修订：已答位置校正）====================
 * 旧口径按 `perQuestion.lastAt` 找「最后作答的那道题」，续到它的下一题。
 * 缺陷：它只保证「从最后作答处继续」，**从不保证中间的题都答过**。
 * 若最后作答的题恰在池末，`lastIdx + 1` 会被 clamp 回末位 →
 * 指针锁死在最后一题，前面没刷的题永远跨不过去；该位置还会被回写成存档，
 * 此后每次进都走 exact，把错误位置固化下来。
 *
 * 2026-10-14 第一次修订引入「未答优先」，但只覆盖了 pruned / relocated /
 * 「位置落在池末」三种情形，**漏掉了最常见的一种**：
 *
 *   无存档（换筛选组合 / 存档被清 / 换设备导入数据）时直接 `index = 0`，
 *   而该组前 71 题早已答过 → 使用者一进来就在答第 1 题这种「早就答过的题」，
 *   每答一次 `countAnsweredIn` 都不变，顶部进度**完全不动**，
 *   必须连点 71 次「下一题」才看得到变化。
 *   用户侧表现（2026-10-14 反馈）：「上面的进度条都不会动了」。
 *
 * 新口径（统一规则）：**位置的唯一作用是回答「下一道该答哪题」**。
 * 已答过的题不承担这个作用（那属于「回顾」，可用「上一题」翻回去）。因此：
 *   ① 存档位置可信（在范围内、且那题还没答过）→ 原样使用（尊重「我记得我在哪」）
 *   ② 存档位置上的题已经答过 → 从该位置往后（含回环）找第一道未答题
 *   ③ 位置越界（历史脏数据）→ 从头找第一道未答题
 *   ④ 全部答过 → 保留原位置，不再挪动（此时任何位置都只是「回顾」）
 *   ⑤ 例外：用户主动点过「从头开始」（resetByUser）→ 尊重，回到位置 0
 *
 * 规则 ② 附带一个**好的**副作用：连续刷题时，若退出前停在某题但还没作答，
 * 下次回来正好停在「你还没来得及答的那道题」，比旧行为（把那题再显示一遍）更准。
 *
 * ============================ 策略说明 ============================
 * 以题目 **id** 为准，题池增删都不再让位置作废：
 *
 *   1. `exact`    存档题池与当前池完全一致（含随机模式的自定义顺序）→ 原样恢复。
 *   2. `expanded` 存档题全在当前池中、且前缀顺序未变（纯扩容）→ 旧题保持原顺序在前、
 *                 新增题追加到末尾，`index` 语义不变（前缀仍是同一批同序的题）。
 *   3. `pruned`   池中有题被删除/替换 → 只保留仍在池中的题（保持存档顺序），
 *                 位置按「未答优先」推断。
 *   4. `relocated` 存档 `index` 已失效（= 0 但该池已有 ≥ MIN_ANSWERED_FOR_RELOCATE
 *                 道作答记录）→ 按「未答优先」重建位置。
 *   5. `fresh`    无存档 → 全新开始。
 *
 * 用户主动点「从头开始」时写入 `resetByUser: true`，明确不做位置重建 ——
 * 否则重置后一刷新又被推回旧位置。
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

/** 该题是否「答过至少一次」—— 全模块统一的作答判据 */
const isAnswered = <T extends IQuestionLike>(q: T, perQuestion: Record<string, IStatLike>) =>
  (perQuestion[q.id]?.attempts ?? 0) > 0;

/** 该池中「答过至少一次」的题数 */
export function countAnsweredIn<T extends IQuestionLike>(
  order: T[],
  perQuestion: Record<string, IStatLike> = {}
): number {
  let n = 0;
  for (const q of order) if (isAnswered(q, perQuestion)) n += 1;
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

/**
 * 该池中「第一道还没答过的题」的下标 —— **未答优先**的核心。
 *
 * 查找顺序：先扫 [fromIdx, end)，再回头扫 [0, fromIdx)。
 * 这样连续刷题的用户位置基本不变（下一题本来就没答过），
 * 而跳着刷 / 位置被错误推断到末尾的用户，会自动被带到真正没刷的地方。
 *
 * @returns 下标；若该池已全部答过则返回 -1。
 */
export function locateFirstUnanswered<T extends IQuestionLike>(
  order: T[],
  perQuestion: Record<string, IStatLike> = {},
  fromIdx = 0
): number {
  if (!order.length) return -1;
  const start = Math.max(0, Math.min(fromIdx, order.length - 1));
  for (let i = start; i < order.length; i++) if (!isAnswered(order[i], perQuestion)) return i;
  for (let i = 0; i < start; i++) if (!isAnswered(order[i], perQuestion)) return i;
  return -1;
}

/**
 * 推断「该从哪里继续刷」：优先未答题，全答过才回落到「最后作答题的下一题」。
 */
function inferResumeIndex<T extends IQuestionLike>(
  order: T[],
  perQuestion: Record<string, IStatLike>
): number {
  const lastIdx = locateByLastAt(order, perQuestion);
  const fromIdx = lastIdx >= 0 ? lastIdx + 1 : 0;
  const un = locateFirstUnanswered(order, perQuestion, fromIdx);
  if (un >= 0) return un;
  // 全部答过：回到最后作答题的下一题（clamp 到末位）
  return lastIdx >= 0 ? clampIndex(lastIdx + 1, order.length) : 0;
}

export function restoreSession<T extends IQuestionLike>(
  list: T[],
  prog: IProgressEntry | undefined,
  perQuestion: Record<string, IStatLike> = {}
): IRestoreResult<T> {
  if (!list.length) {
    return { order: [], index: 0, strategy: 'fresh', note: '当前筛选无题目' };
  }

  // ---------- 无存档：全新会话 ----------
  // 关键：**不能无条件从第 1 题开始**。若本组已有作答记录（换筛选组合、
  // 存档被清、换设备导入数据都会落到这里），从第 1 题开始意味着先把答过的题
  // 再答一遍，而顶部「已刷 N」在重复作答时不会变化 → 使用者看到「进度完全不动」。
  if (!prog || !Array.isArray(prog.ids) || prog.ids.length === 0) {
    const answered = countAnsweredIn(list, perQuestion);
    const un = locateFirstUnanswered(list, perQuestion, 0);
    const index = un >= 0 ? un : 0;
    const note =
      answered === 0
        ? '新会话，从第 1 题开始'
        : un < 0
          ? `本组 ${list.length} 题已全部刷过，可从第 1 题回顾`
          : `本组还有 ${list.length - answered} 题没刷过，已从第 ${index + 1} 题继续`;
    return { order: [...list], index, strategy: 'fresh', note };
  }

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
  if (allSavedAlive && noAdded && sameSize) {
    strategy = 'exact';
  } else if (allSavedAlive && !noAdded && prefixStable) {
    strategy = 'expanded';
  } else {
    // 有题被删/被替换：存档顺序已不可信，只能按作答记录推断（本身就是未答优先）
    strategy = 'pruned';
  }

  const answeredCount = countAnsweredIn(order, perQuestion);
  const raw = prog.index ?? 0;
  const inRange = Number.isInteger(raw) && raw >= 0 && raw < order.length;
  let index: number;
  let noteOverride: string | null = null;

  if (strategy === 'pruned') {
    index = inferResumeIndex(order, perQuestion);
  } else if (prog.resetByUser) {
    // 规则 ⑤：用户主动点过「从头开始」，一律尊重，不做任何位置重建
    index = clampIndex(raw, order.length);
  } else if (inRange && !isAnswered(order[raw], perQuestion)) {
    // 规则 ①：存档位置上的题还没答过 → 原样使用
    index = raw;
  } else if (inRange) {
    // 规则 ②：位置上的题已经答过 → 往后（含回环）找第一道未答题
    const un = locateFirstUnanswered(order, perQuestion, raw);
    if (un >= 0) {
      index = un;
      noteOverride = `本组还有 ${order.length - answeredCount} 题没刷过，已从第 ${index + 1} 题继续`;
      if (answeredCount >= MIN_ANSWERED_FOR_RELOCATE) strategy = 'relocated';
    } else {
      index = raw; // 规则 ④：全部答过，保留原位置
    }
  } else {
    // 规则 ③：位置越界（历史脏数据）→ 从头找第一道未答题；全答过则钳制到末位
    const un = locateFirstUnanswered(order, perQuestion, 0);
    index = un >= 0 ? un : clampIndex(raw, order.length);
    if (un >= 0 && answeredCount > 0) {
      noteOverride = `本组还有 ${order.length - answeredCount} 题没刷过，已从第 ${index + 1} 题继续`;
      if (answeredCount >= MIN_ANSWERED_FOR_RELOCATE) strategy = 'relocated';
    }
  }

  const note =
    noteOverride ??
    (strategy === 'relocated'
      ? `已按作答记录续到第 ${index + 1}/${order.length} 题`
      : prog.resetByUser && index === 0
        ? '已按「从头开始」从第 1 题开始'
        : strategy === 'expanded'
          ? `题库已扩充至 ${order.length} 题，已保留原进度：第 ${index + 1} 题`
          : strategy === 'pruned'
            ? `题库有变动，已按作答记录定位到第 ${index + 1}/${order.length} 题`
            : `已恢复上次进度：第 ${index + 1}/${order.length} 题`);

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
