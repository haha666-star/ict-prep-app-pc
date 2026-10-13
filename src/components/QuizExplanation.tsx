import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ListChecks, AlertTriangle, BookOpen, Scale, Target, Sparkles } from 'lucide-react';
import type { IQuizQuestion } from '@/data/quizzes';
import { MOCK_KNOWLEDGE } from '@/data/knowledge';
import { mnemonicOf } from '@/data/mnemonics';
import { cn } from '@/lib/utils';
import {
  splitExplanation,
  segmentByTerms,
  judgeVerdict,
  isNegativeStem,
  type ISegment,
} from '@/lib/explain';

/** 知识点名称索引（只建一次） */
const KNOWLEDGE_NAME: Map<string, string> = new Map(
  MOCK_KNOWLEDGE.map((k) => [k.id, k.name])
);

/** 术语高亮渲染：把命中术语的片段着色加粗 */
function Highlighted({ text }: { text: string }) {
  const segs: ISegment[] = useMemo(() => segmentByTerms(text), [text]);
  return (
    <>
      {segs.map((s, i) =>
        s.hit ? (
          <span
            key={i}
            className="font-semibold text-cyan-300 bg-cyan-500/10 rounded px-0.5"
          >
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </>
  );
}

export interface IQuizExplanationProps {
  question: IQuizQuestion;
  /** 紧凑模式：字号更小、用于错题列表/模考报告 */
  compact?: boolean;
  className?: string;
}

/**
 * 结构化解析面板
 *
 * 呈现层次：
 *   ①（判断题）辨析框：本题判断为「正确/错误」+ 否定式题干提醒
 *   ② 结论 / 考点：解析首句是完整判断句 → 标题「结论」；
 *      若解析直接以「…：」引出编号列表（首句不是判断句）→ 标题「考点」，避免把引子当结论
 *   ③ 要点：**保留原文编号**（1. 2. 3. 不再叠一个圆点）；多组编号列表各自带引子；
 *      无编号的句子/收尾句仍用圆点列出
 *   ④ 记忆要点 / 易错点（题目数据提供时）
 *   ⑤ 巧妙记忆：按知识点挂载的口诀（`src/data/mnemonics.ts`）
 *   ⑥ 关联知识点
 *
 * 修订（2026-10-13，用户反馈）：
 *   旧版把「结论」硬判为第一个句号前的内容。可题库里 26.6% 的解析是
 *   「Wi-Fi 6 关键技术：1.OFDMA…：…。2.…」这种**没有句号的引子 + 内联编号**写法，
 *   于是引子和第 1 条要点被一起塞进「结论」框，要点列表从「2.」开始 —— 用户看到的就是这个。
 *   现在把「引子（话题）」与「结论」拆开，编号交给有序列表渲染。
 */
export default function QuizExplanation({
  question,
  compact = false,
  className,
}: IQuizExplanationProps) {
  const { conclusion, topic, lists, points } = useMemo(
    () => splitExplanation(question.explanation),
    [question.explanation]
  );
  const verdict = useMemo(() => judgeVerdict(question), [question]);
  const negative = useMemo(
    () => (question.type === 'judge' ? isNegativeStem(question.question) : false),
    [question]
  );
  const knowledgeName = KNOWLEDGE_NAME.get(question.knowledgeId);
  // 巧妙记忆：题目自带优先，其次按知识点挂载（题库 tip 字段全空，故以知识点为准）
  const mnemonic =
    (question as { mnemonic?: string }).mnemonic || mnemonicOf(question.knowledgeId);

  // 顶部那一句：有真结论就用结论，否则退而显示话题（标题相应改成「考点」）
  const headline = conclusion || topic;
  const headlineLabel = conclusion ? '结论' : '考点';

  const textSm = compact ? 'text-[11px]' : 'text-sm';
  const textXs = compact ? 'text-[10px]' : 'text-xs';
  const hasPoints = lists.length > 0 || points.length > 0;

  return (
    <div className={cn('space-y-2.5', className)}>
      {/* ① 判断题辨析 */}
      {verdict && (
        <div
          className={cn(
            'rounded-lg border p-2.5',
            verdict.isTrue
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-rose-500/30 bg-rose-500/5'
          )}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <Scale className={cn('size-3.5 shrink-0', verdict.isTrue ? 'text-emerald-400' : 'text-rose-400')} />
            <span className={cn('font-semibold', textXs, verdict.isTrue ? 'text-emerald-300' : 'text-rose-300')}>
              本题判断为「{verdict.verdict}」
            </span>
            {negative && (
              <Badge
                variant="outline"
                className="text-[10px] border-amber-500/40 text-amber-300"
              >
                否定式题干 · 易想当然
              </Badge>
            )}
          </div>
          {negative && (
            <p className={cn('text-amber-300/80 mt-1.5 leading-relaxed', textXs)}>
              题干问的是「<b>不正确/不属于</b>」的那一项，先在心里把否定词圈出来再作答。
            </p>
          )}
        </div>
      )}

      {/* ② 结论 / 考点 */}
      {headline && (
        <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-2.5">
          <div className="flex items-start gap-1.5">
            <Target className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className={cn('font-semibold text-cyan-300 mb-0.5', textXs)}>{headlineLabel}</div>
              <p className={cn('text-foreground/90 leading-relaxed', textSm)}>
                <Highlighted text={headline} />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ③ 要点：编号列表（保留原文编号）+ 无编号补充 */}
      {hasPoints && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <ListChecks className={cn('size-3.5 text-amber-400')} />
            <span className={cn('font-semibold text-amber-400', textXs)}>要点</span>
          </div>
          {lists.map((list, li) => (
            <div key={li} className="space-y-1">
              {/* 列表引子：与上面「结论/考点」重复时不重复显示 */}
              {list.lead && list.lead !== headline && (
                <p className={cn('text-foreground/70 font-medium', textXs)}>
                  <Highlighted text={list.lead} />
                </p>
              )}
              <ol className="space-y-1">
                {list.items.map((it) => (
                  <li key={`${li}-${it.n}`} className="flex items-start gap-1.5">
                    <span
                      className={cn(
                        'shrink-0 font-mono-data text-amber-400/90 tabular-nums',
                        compact ? 'text-[10px] mt-[3px]' : 'text-xs mt-[2px]'
                      )}
                    >
                      {it.n}.
                    </span>
                    <span className={cn('text-foreground/75 leading-relaxed', textSm)}>
                      <Highlighted text={it.text} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          {points.length > 0 && (
            <ul className="space-y-1">
              {points.map((p, i) => (
                <li key={`p${i}`} className="flex items-start gap-1.5">
                  <span className="mt-1.5 size-1 rounded-full bg-amber-400/70 shrink-0" />
                  <span className={cn('text-foreground/75 leading-relaxed', textSm)}>
                    <Highlighted text={p} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ④ 记忆要点 / 易错点 */}
      {(question.tip || question.pitfall) && (
        <div className="space-y-1.5">
          {question.tip && (
            <div className="flex items-start gap-1.5">
              <Lightbulb className="size-3.5 text-violet-400 shrink-0 mt-0.5" />
              <span className={cn('leading-relaxed', textSm)}>
                <span className="text-violet-300 font-semibold">记忆要点：</span>
                <span className="text-foreground/80">
                  <Highlighted text={question.tip} />
                </span>
              </span>
            </div>
          )}
          {question.pitfall && (
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="size-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span className={cn('leading-relaxed', textSm)}>
                <span className="text-rose-300 font-semibold">易错点：</span>
                <span className="text-foreground/80">
                  <Highlighted text={question.pitfall} />
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ⑤ 巧妙记忆（按知识点挂载的口诀；题库 tip 字段全空，这里是唯一的记忆辅助位） */}
      {mnemonic && (
        <div className="rounded-lg border border-violet-500/25 bg-violet-500/5 p-2.5">
          <div className="flex items-start gap-1.5">
            <Sparkles className="size-3.5 text-violet-300 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className={cn('font-semibold text-violet-300 mb-0.5', textXs)}>巧妙记忆</div>
              <p className={cn('text-foreground/85 leading-relaxed', textSm)}>
                <Highlighted text={mnemonic} />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ⑥ 关联知识点 */}
      {knowledgeName && (
        <div className={cn('flex items-center gap-1.5 text-muted-foreground/70', textXs)}>
          <BookOpen className="size-3 shrink-0" />
          <span>关联知识点：</span>
          <span className="text-cyan-400/80">{knowledgeName}</span>
        </div>
      )}
    </div>
  );
}
