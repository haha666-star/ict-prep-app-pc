import { useState, useEffect, useCallback } from 'react';
import { scopedStorage, STORAGE_PREFIX, getActiveUserId } from '@/lib/storage';
import type { KnowledgeStatus } from '@/lib/utils';
import { mergeQuizRecords as mergeQuizRecordsCore, backupFingerprint } from '@/lib/merge';

// 存储 key 前缀
const KEY_KNOWLEDGE_STATUS = 'knowledge_status';
const KEY_STUDY_PLAN = 'study_plan';
const KEY_QUIZ_RECORDS = 'quiz_records';
const KEY_STUDY_TIME = 'study_time';
const KEY_EXAM_DATE = 'exam_date';
const KEY_EXAM_SESSIONS = 'exam_sessions';
const KEY_FAVORITES = 'favorites';

// 错题本移出阈值：连续答对 N 次才认为真正掌握
export const SRS_GRADUATE_STREAK = 2;

// ========== 跨组件存储刷新总线 ==========
/**
 * 为什么需要它（2026-10-13 端到端 round-trip 实测发现的问题 N4）：
 *   本文件里每个 use* hook 都只在**挂载时**读一次 localStorage，全文件没有任何同步机制。
 *   于是「合并导入」把数据写回 localStorage 后，同一页面上已经挂载的组件不会重读，
 *   「已做题目 / 错题本」仍显示合并前的旧值 —— 但「合并结果卡片」显示的是新值，两处自相矛盾。
 *   而「覆盖导入」因为走 window.location.reload() 才掩盖了这个问题，两条导入路径行为不一致。
 * 方案：写入方调用 notifyStorageChange()，读取方把 useStorageVersion() 的返回值放进 useEffect 依赖。
 */
const STORAGE_CHANGE_EVENT = 'ict:storage-change';

/** 数据写入方调用：通知所有已挂载的读取方重新从存储读取 */
export function notifyStorageChange(): void {
  try {
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  } catch {
    // 非浏览器环境（SSR / 测试）忽略即可
  }
}

/** 读取方订阅：返回值每变一次，就把该值放进 useEffect 依赖以触发重读 */
export function useStorageVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((n) => n + 1);
    window.addEventListener(STORAGE_CHANGE_EVENT, bump);
    return () => window.removeEventListener(STORAGE_CHANGE_EVENT, bump);
  }, []);
  return version;
}

// ========== 知识点掌握状态 ==========
export type KnowledgeStatusMap = Record<string, KnowledgeStatus>;

export function useKnowledgeStatus() {
  const [statusMap, setStatusMap] = useState<KnowledgeStatusMap>({});

  const storageVersion = useStorageVersion();

  useEffect(() => {
    const raw = scopedStorage.getItem(KEY_KNOWLEDGE_STATUS);
    if (raw) {
      try {
        setStatusMap(JSON.parse(raw));
      } catch {
        setStatusMap({});
      }
    }
  }, [storageVersion]);

  const setStatus = useCallback((id: string, status: KnowledgeStatus) => {
    setStatusMap((prev) => {
      const next = { ...prev, [id]: status };
      scopedStorage.setItem(KEY_KNOWLEDGE_STATUS, JSON.stringify(next));
      return next;
    });
  }, []);

  const getStatus = useCallback(
    (id: string): KnowledgeStatus => statusMap[id] ?? 'not_started',
    [statusMap]
  );

  return { statusMap, setStatus, getStatus };
}

// ========== 学习计划 ==========
export interface IStudyPlanTask {
  id: string;
  knowledgeId: string;
  knowledgeName: string;
  date: string;
  duration: number;
  completed: boolean;
}

export interface IStudyPlan {
  startDate: string;
  examDate: string;
  dailyMinutes: number;
  tasks: IStudyPlanTask[];
  createdAt: string;
}

export function useStudyPlan() {
  const [plan, setPlan] = useState<IStudyPlan | null>(null);

  const storageVersion = useStorageVersion();

  useEffect(() => {
    const raw = scopedStorage.getItem(KEY_STUDY_PLAN);
    if (raw) {
      try {
        setPlan(JSON.parse(raw));
      } catch {
        setPlan(null);
      }
    }
  }, [storageVersion]);

  const savePlan = useCallback((newPlan: IStudyPlan) => {
    setPlan(newPlan);
    scopedStorage.setItem(KEY_STUDY_PLAN, JSON.stringify(newPlan));
  }, []);

  const toggleTask = useCallback(
    (taskId: string) => {
      if (!plan) return;
      const newTasks = plan.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const newPlan = { ...plan, tasks: newTasks };
      savePlan(newPlan);
    },
    [plan, savePlan]
  );

  return { plan, savePlan, toggleTask };
}

// ========== 刷题记录 ==========
export interface IQuestionStat {
  attempts: number;       // 累计作答次数
  wrongCount: number;     // 累计答错次数
  correctStreak: number;  // 当前连续答对次数（错题本毕业用）
  lastAt: number;         // 最近一次作答时间戳
  lastCorrect: boolean;
}

export interface IQuizRecords {
  answeredIds: string[];
  wrongIds: string[];
  correctCount: number;   // 首刷正确题数
  totalCount: number;     // 已作答过的不同题目数
  byDirection: Record<string, { correct: number; total: number }>;
  dailyRecords: Record<string, { count: number; correct: number }>;
  /** 每题累计统计（支持间隔重复与错误次数分析） */
  perQuestion: Record<string, IQuestionStat>;
}

const DEFAULT_QUIZ_RECORDS: IQuizRecords = {
  answeredIds: [],
  wrongIds: [],
  correctCount: 0,
  totalCount: 0,
  byDirection: {},
  dailyRecords: {},
  perQuestion: {},
};

export function useQuizRecords() {
  const [records, setRecords] = useState<IQuizRecords>(DEFAULT_QUIZ_RECORDS);

  const storageVersion = useStorageVersion();

  useEffect(() => {
    const raw = scopedStorage.getItem(KEY_QUIZ_RECORDS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as IQuizRecords;
        setRecords({ ...DEFAULT_QUIZ_RECORDS, ...parsed });
      } catch {
        setRecords(DEFAULT_QUIZ_RECORDS);
      }
    }
  }, [storageVersion]);

  const saveRecords = useCallback((next: IQuizRecords) => {
    setRecords(next);
    scopedStorage.setItem(KEY_QUIZ_RECORDS, JSON.stringify(next));
  }, []);

  const recordAnswer = useCallback(
    (questionId: string, direction: string, correct: boolean, dateStr: string) => {
      setRecords((prev) => {
        const firstTime = !prev.answeredIds.includes(questionId);
        const stat = prev.perQuestion[questionId] ?? {
          attempts: 0,
          wrongCount: 0,
          correctStreak: 0,
          lastAt: 0,
          lastCorrect: false,
        };

        const nextStat: IQuestionStat = {
          attempts: stat.attempts + 1,
          wrongCount: stat.wrongCount + (correct ? 0 : 1),
          correctStreak: correct ? stat.correctStreak + 1 : 0,
          lastAt: Date.now(),
          lastCorrect: correct,
        };

        // 错题本 SRS：答错入池；连续答对 SRS_GRADUATE_STREAK 次才移出
        const inWrong = prev.wrongIds.includes(questionId);
        let wrongIds = prev.wrongIds;
        if (!correct) {
          wrongIds = inWrong ? prev.wrongIds : [...prev.wrongIds, questionId];
        } else if (inWrong && nextStat.correctStreak >= SRS_GRADUATE_STREAK) {
          wrongIds = prev.wrongIds.filter((id) => id !== questionId);
        }

        const next: IQuizRecords = {
          ...prev,
          // 统计口径统一为「首次作答」，避免重复刷题灌水
          answeredIds: firstTime ? [...prev.answeredIds, questionId] : prev.answeredIds,
          correctCount: firstTime
            ? prev.correctCount + (correct ? 1 : 0)
            : prev.correctCount,
          totalCount: firstTime ? prev.totalCount + 1 : prev.totalCount,
          wrongIds,
          byDirection: firstTime
            ? {
                ...prev.byDirection,
                [direction]: {
                  correct:
                    (prev.byDirection[direction]?.correct ?? 0) + (correct ? 1 : 0),
                  total: (prev.byDirection[direction]?.total ?? 0) + 1,
                },
              }
            : prev.byDirection,
          dailyRecords: firstTime
            ? {
                ...prev.dailyRecords,
                [dateStr]: {
                  count: (prev.dailyRecords[dateStr]?.count ?? 0) + 1,
                  correct:
                    (prev.dailyRecords[dateStr]?.correct ?? 0) + (correct ? 1 : 0),
                },
              }
            : prev.dailyRecords,
          perQuestion: { ...prev.perQuestion, [questionId]: nextStat },
        };
        scopedStorage.setItem(KEY_QUIZ_RECORDS, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  /** 批量记录（模考交卷时用，避免逐题 setState 造成卡顿） */
  const recordMany = useCallback(
    (
      entries: { questionId: string; direction: string; correct: boolean; dateStr: string }[]
    ) => {
      if (!entries.length) return;
      const dateStr = entries[0].dateStr;
      setRecords((prev) => {
        let next: IQuizRecords = { ...prev };
        entries.forEach(({ questionId, direction, correct }) => {
          const firstTime = !next.answeredIds.includes(questionId);
          const stat = next.perQuestion[questionId] ?? {
            attempts: 0,
            wrongCount: 0,
            correctStreak: 0,
            lastAt: 0,
            lastCorrect: false,
          };
          const nextStat: IQuestionStat = {
            attempts: stat.attempts + 1,
            wrongCount: stat.wrongCount + (correct ? 0 : 1),
            correctStreak: correct ? stat.correctStreak + 1 : 0,
            lastAt: Date.now(),
            lastCorrect: correct,
          };

          const inWrong = next.wrongIds.includes(questionId);
          let wrongIds = next.wrongIds;
          if (!correct) {
            wrongIds = inWrong ? next.wrongIds : [...next.wrongIds, questionId];
          } else if (inWrong && nextStat.correctStreak >= SRS_GRADUATE_STREAK) {
            wrongIds = next.wrongIds.filter((id) => id !== questionId);
          }

          next = {
            ...next,
            answeredIds: firstTime ? [...next.answeredIds, questionId] : next.answeredIds,
            correctCount: firstTime
              ? next.correctCount + (correct ? 1 : 0)
              : next.correctCount,
            totalCount: firstTime ? next.totalCount + 1 : next.totalCount,
            wrongIds,
            byDirection: firstTime
              ? {
                  ...next.byDirection,
                  [direction]: {
                    correct:
                      (next.byDirection[direction]?.correct ?? 0) + (correct ? 1 : 0),
                    total: (next.byDirection[direction]?.total ?? 0) + 1,
                  },
                }
              : next.byDirection,
            dailyRecords: firstTime
              ? {
                  ...next.dailyRecords,
                  [dateStr]: {
                    count: (next.dailyRecords[dateStr]?.count ?? 0) + 1,
                    correct:
                      (next.dailyRecords[dateStr]?.correct ?? 0) + (correct ? 1 : 0),
                  },
                }
              : next.dailyRecords,
            perQuestion: { ...next.perQuestion, [questionId]: nextStat },
          };
        });
        scopedStorage.setItem(KEY_QUIZ_RECORDS, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  return { records, recordAnswer, recordMany, saveRecords };
}

// ========== 模考记录 ==========
export interface IExamAnswerItem {
  id: string;
  direction: string;
  type: 'single' | 'multiple' | 'judge';
  correct: boolean;
  seconds: number;   // 该题停留耗时
}

export interface IExamSession {
  id: string;
  presetName: string;
  startedAt: number;
  totalQuestions: number;
  durationSec: number;
  usedSec: number;
  correctCount: number;
  score: number;              // 百分制
  teamScore: number;          // 折算单人 1000 分制（3 人合计 3000）
  byDirection: Record<string, { correct: number; total: number }>;
  items: IExamAnswerItem[];
  autoSubmitted: boolean;
}

export function useExamSessions() {
  const [sessions, setSessions] = useState<IExamSession[]>([]);

  const storageVersion = useStorageVersion();

  useEffect(() => {
    const raw = scopedStorage.getItem(KEY_EXAM_SESSIONS);
    if (raw) {
      try {
        setSessions(JSON.parse(raw));
      } catch {
        setSessions([]);
      }
    }
  }, [storageVersion]);

  const addSession = useCallback((s: IExamSession) => {
    setSessions((prev) => {
      const next = [s, ...prev].slice(0, 100);
      scopedStorage.setItem(KEY_EXAM_SESSIONS, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearSessions = useCallback(() => {
    setSessions([]);
    scopedStorage.removeItem(KEY_EXAM_SESSIONS);
  }, []);

  return { sessions, addSession, clearSessions };
}

// ========== 收藏/标记 ==========
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const storageVersion = useStorageVersion();

  useEffect(() => {
    const raw = scopedStorage.getItem(KEY_FAVORITES);
    if (raw) {
      try {
        setFavorites(JSON.parse(raw));
      } catch {
        setFavorites([]);
      }
    }
  }, [storageVersion]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      scopedStorage.setItem(KEY_FAVORITES, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}

// ========== 题目笔记 ==========
export interface IQuestionNote {
  text: string;
  updatedAt: number;
}

export type QuizNotesMap = Record<string, IQuestionNote>;

const KEY_QUIZ_NOTES = 'quiz_notes';

export function useQuizNotes() {
  const [notes, setNotes] = useState<QuizNotesMap>({});

  const storageVersion = useStorageVersion();

  useEffect(() => {
    const raw = scopedStorage.getItem(KEY_QUIZ_NOTES);
    if (raw) {
      try {
        setNotes(JSON.parse(raw));
      } catch {
        setNotes({});
      }
    }
  }, [storageVersion]);

  const getNote = useCallback(
    (id: string): IQuestionNote | undefined => notes[id],
    [notes]
  );

  const saveNote = useCallback((id: string, text: string) => {
    setNotes((prev) => {
      const next: QuizNotesMap = { ...prev };
      if (text.trim()) {
        next[id] = { text, updatedAt: Date.now() };
      } else {
        delete next[id];
      }
      scopedStorage.setItem(KEY_QUIZ_NOTES, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearNote = useCallback(
    (id: string) => saveNote(id, ''),
    [saveNote]
  );

  return { notes, getNote, saveNote, clearNote };
}

// ========== 学习时长 ==========
export function useStudyTime() {
  const [studyTime, setStudyTime] = useState<Record<string, number>>({});

  const storageVersion = useStorageVersion();

  useEffect(() => {
    const raw = scopedStorage.getItem(KEY_STUDY_TIME);
    if (raw) {
      try {
        setStudyTime(JSON.parse(raw));
      } catch {
        setStudyTime({});
      }
    }
  }, [storageVersion]);

  const addStudyTime = useCallback((dateStr: string, minutes: number) => {
    setStudyTime((prev) => {
      const next = { ...prev, [dateStr]: (prev[dateStr] ?? 0) + minutes };
      scopedStorage.setItem(KEY_STUDY_TIME, JSON.stringify(next));
      return next;
    });
  }, []);

  return { studyTime, addStudyTime };
}

// ========== 比赛日期 ==========
export function useExamDate(defaultDate = '') {
  const [examDate, setExamDateState] = useState<string>(defaultDate);

  const storageVersion = useStorageVersion();

  useEffect(() => {
    const raw = scopedStorage.getItem(KEY_EXAM_DATE);
    if (raw) {
      setExamDateState(raw);
    } else if (defaultDate) {
      setExamDateState(defaultDate);
    }
  }, [defaultDate, storageVersion]);

  const setExamDate = useCallback((date: string) => {
    setExamDateState(date);
    scopedStorage.setItem(KEY_EXAM_DATE, date);
  }, []);

  return { examDate, setExamDate };
}

// ========== 刷题进度记忆 ==========
export interface IQuizProgressEntry {
  ids: string[];
  index: number;
  updatedAt: number;
}

export type QuizProgressMap = Record<string, IQuizProgressEntry>;

const KEY_QUIZ_PROGRESS = 'quiz_progress';

export function useQuizProgress() {
  const getProgress = useCallback((key: string): IQuizProgressEntry | undefined => {
    try {
      const raw = scopedStorage.getItem(KEY_QUIZ_PROGRESS);
      if (!raw) return undefined;
      const map = JSON.parse(raw) as QuizProgressMap;
      return map[key];
    } catch {
      return undefined;
    }
  }, []);

  const saveProgress = useCallback((key: string, entry: IQuizProgressEntry) => {
    try {
      const raw = scopedStorage.getItem(KEY_QUIZ_PROGRESS);
      const map: QuizProgressMap = raw ? (JSON.parse(raw) as QuizProgressMap) : {};
      map[key] = entry;
      scopedStorage.setItem(KEY_QUIZ_PROGRESS, JSON.stringify(map));
    } catch {
      // 忽略损坏的进度缓存
    }
  }, []);

  const clearProgress = useCallback((key: string) => {
    try {
      const raw = scopedStorage.getItem(KEY_QUIZ_PROGRESS);
      if (!raw) return;
      const map = JSON.parse(raw) as QuizProgressMap;
      delete map[key];
      scopedStorage.setItem(KEY_QUIZ_PROGRESS, JSON.stringify(map));
    } catch {
      // 忽略
    }
  }, []);

  return { getProgress, saveProgress, clearProgress };
}

// ========== 多用户档案 ==========
export interface IUserProfile {
  id: string;
  name: string;
  createdAt: number;
}

const KEY_USER_PROFILES = 'user_profiles';
const KEY_ACTIVE_USER = 'active_user';

function readProfiles(): IUserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + KEY_USER_PROFILES);
    let list: IUserProfile[] = [];
    if (raw) {
      const parsed = JSON.parse(raw) as IUserProfile[];
      if (Array.isArray(parsed)) list = parsed;
    }
    // 保证 default 档案永远存在：其承载了旧数据迁移后的默认数据
    if (!list.some((p) => p.id === 'default')) {
      list = [{ id: 'default', name: '默认用户', createdAt: 0 }, ...list];
      writeProfiles(list);
    }
    return list;
  } catch {
    return [{ id: 'default', name: '默认用户', createdAt: 0 }];
  }
}

function writeProfiles(list: IUserProfile[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + KEY_USER_PROFILES, JSON.stringify(list));
  } catch {
    // 忽略
  }
}

export function useUserProfiles() {
  const [profiles, setProfiles] = useState<IUserProfile[]>(() => readProfiles());
  const [activeId, setActiveId] = useState<string>(() => getActiveUserId());

  const switchTo = useCallback((id: string) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + KEY_ACTIVE_USER, id);
    } catch {
      // 忽略
    }
    window.location.reload();
  }, []);

  const createProfile = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const p: IUserProfile = {
      id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: trimmed,
      createdAt: Date.now(),
    };
    setProfiles((prev) => {
      const next = [...prev, p];
      writeProfiles(next);
      return next;
    });
    try {
      localStorage.setItem(STORAGE_PREFIX + KEY_ACTIVE_USER, p.id);
    } catch {
      // 忽略
    }
    window.location.reload();
  }, []);

  const renameProfile = useCallback((id: string, name: string) => {
    setProfiles((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, name: name.trim() || p.name } : p
      );
      writeProfiles(next);
      return next;
    });
  }, []);

  const deleteProfile = useCallback(
    (id: string) => {
      // 删除该用户命名空间下的全部数据（刷题进度/笔记/错题/记录/计划等）
      const prefix = STORAGE_PREFIX + 'u_' + id + '_';
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) toRemove.push(k);
      }
      toRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // 忽略
        }
      });
      setProfiles((prev) => {
        const next = prev.filter((p) => p.id !== id);
        writeProfiles(next);
        return next;
      });
      if (id === activeId) {
        try {
          localStorage.setItem(STORAGE_PREFIX + KEY_ACTIVE_USER, 'default');
        } catch {
          // 忽略
        }
        window.location.reload();
      }
    },
    [activeId]
  );

  const activeProfile = profiles.find((p) => p.id === activeId) ?? null;

  return {
    profiles,
    activeId,
    activeProfile,
    switchTo,
    createProfile,
    renameProfile,
    deleteProfile,
  };
}

// ========== 备份导出 / 导入 ==========
export const BACKUP_KEYS: Record<string, string> = {
  knowledge_status: KEY_KNOWLEDGE_STATUS,
  study_plan: KEY_STUDY_PLAN,
  quiz_records: KEY_QUIZ_RECORDS,
  study_time: KEY_STUDY_TIME,
  exam_date: KEY_EXAM_DATE,
  exam_sessions: KEY_EXAM_SESSIONS,
  favorites: KEY_FAVORITES,
  quiz_notes: KEY_QUIZ_NOTES,
  quiz_progress: KEY_QUIZ_PROGRESS,
  team_members: 'team_members',
  sprint_progress: 'sprint_progress',
};

export interface IBackup {
  app: 'ict-network-prep-assistant';
  version: 2;
  exportedAt: string;
  owner?: string;
  data: Record<string, unknown>;
}

export function exportBackup(owner?: string): IBackup {
  const data: Record<string, unknown> = {};
  Object.entries(BACKUP_KEYS).forEach(([name, key]) => {
    const raw = scopedStorage.getItem(key);
    if (raw) {
      try {
        data[name] = JSON.parse(raw);
      } catch {
        data[name] = raw;
      }
    }
  });
  return {
    app: 'ict-network-prep-assistant',
    version: 2,
    exportedAt: new Date().toISOString(),
    owner,
    data,
  };
}

export function importBackup(backup: IBackup, mode: 'merge' | 'replace' = 'replace') {
  if (!backup || backup.app !== 'ict-network-prep-assistant' || !backup.data) {
    throw new Error('备份文件格式不正确');
  }
  if (mode === 'replace') {
    Object.values(BACKUP_KEYS).forEach((key) => scopedStorage.removeItem(key));
  }
  Object.entries(backup.data).forEach(([name, value]) => {
    const key = BACKUP_KEYS[name];
    if (key) scopedStorage.setItem(key, JSON.stringify(value));
  });
  // 与「合并导入」保持一致的广播（当前 UI 在此之后会 reload，广播是为「不刷新导入」预留的接线）
  notifyStorageChange();
}

/** 从备份中解析出各方向正确率（团队对比用） */
export function directionAccuracyFromBackup(backup: IBackup) {
  const rec = backup?.data?.quiz_records as IQuizRecords | undefined;
  const byDirection = rec?.byDirection ?? {};
  const result: Record<string, number> = {};
  Object.entries(byDirection).forEach(([dir, v]) => {
    result[dir] = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
  });
  return {
    byDirection: result,
    totalCount: rec?.totalCount ?? 0,
    correctCount: rec?.correctCount ?? 0,
    wrongCount: rec?.wrongIds?.length ?? 0,
  };
}

// ========== 题级合并（真合并） ==========
//
// 与 importBackup(..., 'replace') 的区别：
//   replace = 先清空本机全部 key 再写入（会吃掉本机在导出之后新刷的进度）
//   merge   = 逐题去重合并：answeredIds 取并集、perQuestion 逐题累加、streak 取最近一端
//
// 幂等性：同一份备份重复合并结果不变 —— dailyRecords / study_time 采用「按天取 max」而非相加。

/** 知识点掌握状态强弱（合并时取更强的一方） */
const STATUS_STRENGTH: Record<KnowledgeStatus, number> = {
  not_started: 0,
  learning: 1,
  mastered: 2,
};

function readJsonKey<T>(key: string, fallback: T): T {
  const raw = scopedStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 读取本机当前刷题记录（非 hook，供合并流程调用） */
export function readQuizRecords(): IQuizRecords {
  return { ...DEFAULT_QUIZ_RECORDS, ...readJsonKey<Partial<IQuizRecords>>(KEY_QUIZ_RECORDS, {}) };
}

export interface IMergeSummary {
  sources: number;
  /** 因「之前已合并过」而被跳过的备份署名 */
  skipped: string[];
  answered: number;
  wrong: number;
  correct: number;
  accuracy: number;
  byDirection: Record<string, { correct: number; total: number; rate: number }>;
  notes: number;
  favorites: number;
  sessions: number;
}

/** 已合并过的备份指纹（避免同一份备份重复合并导致 attempts/wrongCount 累加） */
const KEY_MERGED_FINGERPRINTS = 'merged_backup_fingerprints';

/**
 * 题级合并多份刷题记录。
 * 实现抽到 @/lib/merge（零依赖纯函数），便于独立运行单元自测与跨实现交叉核验。
 */
export function mergeQuizRecords(
  list: IQuizRecords[],
  dirOf?: (id: string) => string | undefined
): IQuizRecords {
  return mergeQuizRecordsCore(list, dirOf) as IQuizRecords;
}

/**
 * 合并导入：把「本机当前数据」与「若干份队友/其他设备备份」做真合并后写回本机。
 * 与 importBackup(...,'replace') 不同，本机原有进度不会被清空。
 *
 * 题库（题目→方向映射）采用**动态导入**，只有真正执行合并时才拉取，不拖慢设置页。
 */
export async function mergeImportBackups(backups: IBackup[]): Promise<IMergeSummary> {
  const valid = (backups ?? []).filter(
    (b) => b && b.app === 'ict-network-prep-assistant' && b.data
  );
  if (!valid.length) throw new Error('没有可合并的有效备份文件');

  // 指纹去重：跳过之前已合并过的备份，避免 attempts / wrongCount 被重复累加
  const knownFingerprints = new Set(readJsonKey<string[]>(KEY_MERGED_FINGERPRINTS, []));
  const skipped: string[] = [];
  const fresh = valid.filter((b) => {
    const fp = backupFingerprint(b);
    if (knownFingerprints.has(fp)) {
      skipped.push(b.owner || '未署名备份');
      return false;
    }
    knownFingerprints.add(fp);
    return true;
  });
  if (!fresh.length) {
    throw new Error(
      `这些备份之前已合并过（${skipped.join('、')}），已跳过，不会重复累加`
    );
  }

  const { MOCK_QUIZZES } = await import('@/data/quizzes');
  const dirMap = new Map(MOCK_QUIZZES.map((q) => [q.id, q.direction] as const));
  const dirOf = (id: string) => dirMap.get(id);

  // ---------- 1) 刷题记录：本机 + 全部待合并文件 一起题级合并 ----------
  const recordsList: IQuizRecords[] = [
    readQuizRecords(),
    ...fresh.map((b) => b.data.quiz_records as IQuizRecords).filter(Boolean),
  ];
  const mergedRecords = mergeQuizRecords(recordsList, dirOf);
  scopedStorage.setItem(KEY_QUIZ_RECORDS, JSON.stringify(mergedRecords));

  // ---------- 2) 笔记：按 updatedAt 取较新 ----------
  const noteMaps: QuizNotesMap[] = [
    readJsonKey<QuizNotesMap>(KEY_QUIZ_NOTES, {}),
    ...fresh.map((b) => (b.data.quiz_notes as QuizNotesMap) ?? {}),
  ];
  const notes: QuizNotesMap = {};
  noteMaps.forEach((map) =>
    Object.entries(map ?? {}).forEach(([id, n]) => {
      if (!n) return;
      const cur = notes[id];
      if (!cur || (n.updatedAt ?? 0) > (cur.updatedAt ?? 0)) notes[id] = n;
    })
  );
  scopedStorage.setItem(KEY_QUIZ_NOTES, JSON.stringify(notes));

  // ---------- 3) 收藏：并集 ----------
  const favSet = new Set<string>();
  [readJsonKey<string[]>(KEY_FAVORITES, []), ...fresh.map((b) => (b.data.favorites as string[]) ?? [])]
    .forEach((arr) => (arr ?? []).forEach((id) => favSet.add(id)));
  scopedStorage.setItem(KEY_FAVORITES, JSON.stringify([...favSet]));

  // ---------- 4) 知识点状态：取更强 ----------
  const statusMaps: KnowledgeStatusMap[] = [
    readJsonKey<KnowledgeStatusMap>(KEY_KNOWLEDGE_STATUS, {}),
    ...fresh.map((b) => (b.data.knowledge_status as KnowledgeStatusMap) ?? {}),
  ];
  const status: KnowledgeStatusMap = {};
  statusMaps.forEach((map) =>
    Object.entries(map ?? {}).forEach(([id, s]) => {
      const cur = status[id];
      if (!cur || STATUS_STRENGTH[s] > STATUS_STRENGTH[cur]) status[id] = s;
    })
  );
  scopedStorage.setItem(KEY_KNOWLEDGE_STATUS, JSON.stringify(status));

  // ---------- 5) 学习时长：按天取 max（幂等，避免反复合并灌水） ----------
  const timeMaps: Record<string, number>[] = [
    readJsonKey<Record<string, number>>(KEY_STUDY_TIME, {}),
    ...fresh.map((b) => (b.data.study_time as Record<string, number>) ?? {}),
  ];
  const studyTime: Record<string, number> = {};
  timeMaps.forEach((map) =>
    Object.entries(map ?? {}).forEach(([d, m]) => {
      studyTime[d] = Math.max(studyTime[d] ?? 0, m ?? 0);
    })
  );
  scopedStorage.setItem(KEY_STUDY_TIME, JSON.stringify(studyTime));

  // ---------- 6) 模考记录：按 id 去重合并，保留最近 100 次 ----------
  const sessionMap = new Map<string, IExamSession>();
  [readJsonKey<IExamSession[]>(KEY_EXAM_SESSIONS, []), ...fresh.map((b) => (b.data.exam_sessions as IExamSession[]) ?? [])]
    .forEach((arr) => (arr ?? []).forEach((s) => {
      if (s?.id) sessionMap.set(s.id, s);
    }));
  const sessions = [...sessionMap.values()].sort((a, b) => b.startedAt - a.startedAt).slice(0, 100);
  scopedStorage.setItem(KEY_EXAM_SESSIONS, JSON.stringify(sessions));

  // ---------- 7) 进度记忆：每个 key 取 updatedAt 最新 ----------
  const progMaps: QuizProgressMap[] = [
    readJsonKey<QuizProgressMap>(KEY_QUIZ_PROGRESS, {}),
    ...fresh.map((b) => (b.data.quiz_progress as QuizProgressMap) ?? {}),
  ];
  const progress: QuizProgressMap = {};
  progMaps.forEach((map) =>
    Object.entries(map ?? {}).forEach(([k, e]) => {
      if (!e) return;
      const cur = progress[k];
      if (!cur || (e.updatedAt ?? 0) > (cur.updatedAt ?? 0)) progress[k] = e;
    })
  );
  scopedStorage.setItem(KEY_QUIZ_PROGRESS, JSON.stringify(progress));

  // ---------- 8) 学习计划：保留 createdAt 最新的一份 ----------
  const plans = [readJsonKey<IStudyPlan | null>(KEY_STUDY_PLAN, null), ...fresh.map((b) => (b.data.study_plan as IStudyPlan) ?? null)]
    .filter((p): p is IStudyPlan => Boolean(p));
  if (plans.length) {
    plans.sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));
    scopedStorage.setItem(KEY_STUDY_PLAN, JSON.stringify(plans[0]));
  }

  // ---------- 9) 比赛日期：本机没有才用备份里的 ----------
  if (!scopedStorage.getItem(KEY_EXAM_DATE)) {
    const d = fresh.map((b) => b.data.exam_date as string).find((x) => Boolean(x));
    if (d) scopedStorage.setItem(KEY_EXAM_DATE, d);
  }

  // ---------- 汇总 ----------
  scopedStorage.setItem(KEY_MERGED_FINGERPRINTS, JSON.stringify([...knownFingerprints]));

  const answered = mergedRecords.totalCount;
  const byDirection: IMergeSummary['byDirection'] = {};
  Object.entries(mergedRecords.byDirection).forEach(([d, v]) => {
    byDirection[d] = {
      correct: v.correct,
      total: v.total,
      rate: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    };
  });

  // 数据已写回存储 → 广播一次，让本页已挂载的统计组件立即重读（否则要手动刷新页面才更新）
  notifyStorageChange();

  return {
    sources: fresh.length + 1,
    skipped,
    answered,
    wrong: mergedRecords.wrongIds.length,
    correct: mergedRecords.correctCount,
    accuracy: answered > 0 ? Math.round((mergedRecords.correctCount / answered) * 100) : 0,
    byDirection,
    notes: Object.keys(notes).length,
    favorites: favSet.size,
    sessions: sessions.length,
  };
}

// ========== 团队成员（本机「团队分析台」，持久化） ==========
const KEY_TEAM_MEMBERS = 'team_members';

export interface ITeamMember {
  id: string;
  name: string;
  /** 由导入队友备份得到的正确率数据（只读展示，不参与本机数据合并） */
  acc?: Record<string, number>;
  total?: number;
  correct?: number;
  accuracy?: number;
  updatedAt: number;
}

export function useTeamMembers() {
  const [members, setMembers] = useState<ITeamMember[]>([]);

  const storageVersion = useStorageVersion();

  useEffect(() => {
    setMembers(readJsonKey<ITeamMember[]>(KEY_TEAM_MEMBERS, []).slice(0, 3));
  }, [storageVersion]);

  const persist = useCallback((next: ITeamMember[]) => {
    const trimmed = next.slice(0, 3);
    setMembers(trimmed);
    scopedStorage.setItem(KEY_TEAM_MEMBERS, JSON.stringify(trimmed));
  }, []);

  /** 新增或覆盖一位成员（按 id 或姓名去重） */
  const upsert = useCallback((m: ITeamMember) => {
    setMembers((prev) => {
      const next = [
        ...prev.filter((x) => x.id !== m.id && x.name !== m.name),
        m,
      ].sort((a, b) => a.updatedAt - b.updatedAt);
      const trimmed = next.slice(0, 3);
      scopedStorage.setItem(KEY_TEAM_MEMBERS, JSON.stringify(trimmed));
      return trimmed;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setMembers((prev) => {
      const next = prev.filter((x) => x.id !== id);
      scopedStorage.setItem(KEY_TEAM_MEMBERS, JSON.stringify(next));
      return next;
    });
  }, []);

  return { members, persist, upsert, remove };
}

/** 由一份队友备份构造团队成员条目 */
export function teamMemberFromBackup(backup: IBackup, fileName?: string): ITeamMember {
  const info = directionAccuracyFromBackup(backup);
  const name = backup.owner || (fileName ? fileName.replace(/\.json$/i, '') : '未署名队友');
  return {
    id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name,
    acc: info.byDirection,
    total: info.totalCount,
    correct: info.correctCount,
    accuracy: info.totalCount > 0 ? Math.round((info.correctCount / info.totalCount) * 100) : 0,
    updatedAt: Date.now(),
  };
}

// ========== 12 天冲刺计划进度 ==========
const KEY_SPRINT_PROGRESS = 'sprint_progress';

/** 冲刺计划打勾记录：key = `${day}-${taskIndex}` */
export type SprintProgressMap = Record<string, boolean>;

export function useSprintProgress() {
  const [done, setDone] = useState<SprintProgressMap>({});

  useEffect(() => {
    setDone(readJsonKey<SprintProgressMap>(KEY_SPRINT_PROGRESS, {}));
  }, []);

  const toggle = useCallback((key: string) => {
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      scopedStorage.setItem(KEY_SPRINT_PROGRESS, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setDone({});
    scopedStorage.removeItem(KEY_SPRINT_PROGRESS);
  }, []);

  return { done, toggle, clear };
}
