import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Flag,
  Radio,
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  BookOpen,
  Timer,
  Filter,
  Info,
  TrendingUp,
  CalendarCheck,
  Copy,
  ChevronDown,
  Users,
  Play,
} from 'lucide-react';
import { MOCK_QUIZZES } from '@/data/quizzes';
import { useQuizRecords, useExamDate, useSprintProgress } from '@/hooks/use-storage';
import {
  CONTEST_PIPELINE,
  EXAM_FACTS,
  SCHOOL_CONTEST_DATE,
  type StageStatus,
} from '@/data/contest';
import {
  buildSprintPlan,
  SPRINT_PHASES,
  SPRINT_TEAM_ROLES,
  sprintPlanToText,
} from '@/data/sprint-plan';
import { cn, formatDate, DIRECTION_LABELS, DIRECTION_COLORS } from '@/lib/utils';

const STATUS_STYLE: Record<StageStatus, { dot: string; text: string; label: string; border: string }> = {
  done: {
    dot: 'bg-emerald-500 text-emerald-400',
    text: 'text-emerald-400',
    label: '已结束',
    border: 'border-emerald-500/25',
  },
  now: {
    dot: 'bg-cyan-500 text-cyan-400',
    text: 'text-cyan-300',
    label: '进行中',
    border: 'border-cyan-500/40',
  },
  future: {
    dot: 'bg-muted-foreground/40 text-muted-foreground',
    text: 'text-muted-foreground',
    label: '待开始',
    border: 'border-border/40',
  },
};

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { records } = useQuizRecords();
  const { examDate, setExamDate } = useExamDate(SCHOOL_CONTEST_DATE);
  const [dateInput, setDateInput] = useState(examDate || SCHOOL_CONTEST_DATE);
  const [dateOpen, setDateOpen] = useState(false);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const { done, toggle, clear } = useSprintProgress();

  const target = examDate || SCHOOL_CONTEST_DATE;

  // 12 天冲刺计划（随校赛日期自动重排）
  const sprintPlan = useMemo(() => buildSprintPlan(target), [target]);
  const todayStr = formatDate(new Date());
  const totalTasks = useMemo(
    () => sprintPlan.reduce((n, d) => n + d.tasks.length, 0),
    [sprintPlan]
  );
  const doneCount = useMemo(
    () => sprintPlan.reduce((n, d) => n + d.tasks.filter((_, i) => done[`${d.day}-${i}`]).length, 0),
    [sprintPlan, done]
  );

  const handleCopyPlan = async () => {
    const text = sprintPlanToText(sprintPlan);
    try {
      await navigator.clipboard.writeText(text);
      toast.success('12 天计划已复制，可粘贴到微信群发给队友');
    } catch {
      toast.error('复制失败，请手动截图分享');
    }
  };

  const countdown = useMemo(() => {
    const diff = Math.max(0, new Date(target).getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      passed: new Date(target).getTime() < Date.now(),
    };
  }, [target]);

  // 题库覆盖缺口（按题型 + 总量）
  const coverage = useMemo(() => {
    const answered = new Set(records.answeredIds);
    const byType = { single: { done: 0, total: 0 }, multiple: { done: 0, total: 0 }, judge: { done: 0, total: 0 } };
    MOCK_QUIZZES.forEach((q) => {
      byType[q.type].total += 1;
      if (answered.has(q.id)) byType[q.type].done += 1;
    });
    const done = records.answeredIds.length;
    const total = MOCK_QUIZZES.length;
    const remain = Math.max(0, total - done);
    const perDay = countdown.days > 0 ? Math.ceil(remain / countdown.days) : remain;
    return { byType, done, total, remain, perDay, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [records.answeredIds, countdown.days]);

  const judgeRate = coverage.byType.judge.total
    ? Math.round((coverage.byType.judge.done / coverage.byType.judge.total) * 100)
    : 0;

  const handleSaveDate = () => {
    if (!dateInput) return;
    setExamDate(dateInput);
    setDateOpen(false);
    toast.success('校赛日期已更新');
  };

  return (
    <div className="space-y-3">
      {/* ---------- 校赛倒计时 ---------- */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="relative overflow-hidden border-cyan-500/25 bg-gradient-to-br from-cyan-500/5 via-card to-transparent">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <CardHeader className="pb-1 pt-3 relative">
            <CardTitle className="text-xs font-medium flex items-center gap-2 text-cyan-300">
              <Radio className="size-3.5 neon-pulse" />
              校赛倒计时
              <span className="ml-auto text-[9px] font-mono-data text-muted-foreground/70">SCHOOL CONTEST</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative pb-3 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-cyan-400 tabular-nums tracking-tight font-mono-data">
                {countdown.days}
              </span>
              <span className="text-sm font-medium text-muted-foreground">天</span>
              <span className="text-xl font-bold text-foreground tabular-nums ml-2 font-mono-data">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground">h</span>
              {countdown.passed && (
                <Badge className="ml-2 bg-rose-500/15 text-rose-300 border-transparent text-[10px]">已过日期</Badge>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono-data">TARGET: {target}</span>
              <Dialog open={dateOpen} onOpenChange={setDateOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                    设置日期
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-cyan-500/20 bg-card/95 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="font-tech">设置校赛日期</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-4">
                    <Label htmlFor="school-date">校赛日期</Label>
                    <Input
                      id="school-date"
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveDate}>保存</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ---------- 目标与得分模型 ---------- */}
      <Card className="border-rose-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="size-4 text-rose-400" />
            目标与得分模型
            <span className="ml-auto text-[10px] font-mono-data text-muted-foreground/70">GOAL</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-2.5">
              <div className="text-[10px] text-rose-300/80">主攻目标</div>
              <div className="text-sm font-bold text-rose-300 mt-0.5">省一等奖</div>
              <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                省复赛参赛队<b className="text-rose-300">前 10%</b>
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/10 p-2.5">
              <div className="text-[10px] text-muted-foreground">加分项</div>
              <div className="text-sm font-bold text-foreground/80 mt-0.5">进国赛</div>
              <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                省复赛<b>第 1 名</b>（更难一个量级）
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/20 p-2.5">
            <div className="text-[11px] text-muted-foreground mb-1.5 leading-relaxed">
              团队总分 = 三人个人分之和（各 1000 分）= 各人正确率 × 1000。
              下表只做<b className="text-foreground/80">相对参照</b>——分数线取决于当年全省队伍水平，本工作台不编造分数线。
            </div>
            <div className="space-y-1">
              {[
                { rate: '70%', total: 2100, tag: '危险，出线无望', cls: 'text-rose-400' },
                { rate: '80%', total: 2400, tag: '及格线附近，省一边缘', cls: 'text-amber-400' },
                { rate: '85%', total: 2550, tag: '有省一竞争力', cls: 'text-amber-300' },
                { rate: '90%', total: 2700, tag: '★ 省一比较稳', cls: 'text-emerald-400' },
                { rate: '95%', total: 2850, tag: '冲全省前列 / 国赛', cls: 'text-cyan-400' },
              ].map((r) => (
                <div key={r.rate} className="flex items-center gap-2 text-[11px]">
                  <span className="w-10 font-mono-data text-muted-foreground">{r.rate}</span>
                  <span className="w-12 font-mono-data font-bold text-foreground/80">{r.total}</span>
                  <span className={cn('flex-1', r.cls)}>{r.tag}</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground/70 mt-2 leading-relaxed">
              建队思路：<b className="text-foreground/70">先无短板</b>（木桶效应，一人崩全队崩）→
              再让每人死守一个强方向拉高总分 → 最后才谈冲第一。
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------- 题库覆盖缺口 ---------- */}
      <Card className="border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="size-4 text-purple-400" />
            题库覆盖缺口
            <span className="ml-auto text-[10px] font-mono-data text-muted-foreground">
              {coverage.done} / {coverage.total} 题 · {coverage.pct}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
              style={{ width: `${coverage.pct}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                { key: 'judge', label: '判断题', color: 'text-amber-400' },
                { key: 'single', label: '单选题', color: 'text-cyan-400' },
                { key: 'multiple', label: '多选题', color: 'text-emerald-400' },
              ] as const
            ).map((t) => {
              const v = coverage.byType[t.key];
              const rate = v.total ? Math.round((v.done / v.total) * 100) : 0;
              return (
                <div key={t.key} className="rounded-lg bg-muted/20 py-2">
                  <div className={cn('text-sm font-bold font-mono-data', t.color)}>
                    {v.done}/{v.total}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {t.label} · {rate}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-2.5 text-[11px] leading-relaxed text-amber-100/90">
            距校赛还有 <b className="text-amber-300">{countdown.days}</b> 天，还有{' '}
            <b className="text-amber-300">{coverage.remain}</b> 题没刷过。
            平均每天刷 <b className="text-amber-300">{coverage.perDay}</b> 题可跑完全库；
            但优先把
            <b className="text-amber-300">判断题正确率刷到 90% 以上</b>
            （当前覆盖 {judgeRate}%）——它是省赛必考、且最容易「想当然」失分的题型。
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 h-8 text-xs"
              onClick={() => navigate('/quiz')}
            >
              <Filter className="size-3.5 mr-1" />
              去刷判断题
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-8 text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              onClick={() => navigate('/exam')}
            >
              <Timer className="size-3.5 mr-1" />
              省初赛模考
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---------- 12 天冲刺计划 ---------- */}
      <Card className="border-amber-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarCheck className="size-4 text-amber-400" />
            12 天冲刺计划
            <span className="ml-auto text-[10px] font-mono-data text-muted-foreground">
              {doneCount}/{totalTasks} 项
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* 四个阶段 */}
          <div className="grid grid-cols-4 gap-1">
            {SPRINT_PHASES.map((p) => (
              <div key={p.phase} className="rounded bg-muted/20 p-1.5 text-center">
                <div className="text-[10px] font-semibold text-cyan-300">{p.phase}</div>
                <div className="text-[9px] text-muted-foreground font-mono-data">{p.range}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              onClick={handleCopyPlan}
            >
              <Copy className="size-3.5 mr-1" />
              复制计划发给队友
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={clear}
            >
              清空打勾
            </Button>
          </div>

          <div className="space-y-1.5">
            {sprintPlan.map((d) => {
              const isToday = d.date === todayStr;
              const expanded = openDay === d.day;
              const dayDone = d.tasks.every((_, i) => done[`${d.day}-${i}`]);
              return (
                <div
                  key={d.day}
                  className={cn(
                    'rounded-lg border',
                    isToday ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/40'
                  )}
                >
                  <button
                    className="w-full flex items-center gap-2 p-2 text-left"
                    onClick={() => setOpenDay(expanded ? null : d.day)}
                  >
                    <span
                      className={cn(
                        'text-[10px] font-mono-data px-1.5 py-0.5 rounded shrink-0',
                        dayDone
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-muted/30 text-muted-foreground'
                      )}
                    >
                      D{d.day}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="text-[11px] font-medium block truncate">{d.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono-data">
                        {d.date} · {d.phase}
                      </span>
                    </span>
                    {isToday && (
                      <Badge className="text-[9px] bg-amber-500/20 text-amber-300 border-transparent shrink-0">
                        今天
                      </Badge>
                    )}
                    <ChevronDown
                      className={cn(
                        'size-3.5 text-muted-foreground shrink-0 transition-transform',
                        expanded && 'rotate-180'
                      )}
                    />
                  </button>

                  {expanded && (
                    <div className="px-2 pb-2 space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {d.quota.map((q) => (
                          <Badge
                            key={q.label}
                            variant="outline"
                            className="text-[10px] border-cyan-500/30 text-cyan-300"
                          >
                            {q.label} {q.value}
                          </Badge>
                        ))}
                      </div>
                      {d.tasks.map((t, i) => {
                        const k = `${d.day}-${i}`;
                        return (
                          <label key={k} className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!done[k]}
                              onChange={() => toggle(k)}
                              className="mt-0.5 size-3.5 accent-cyan-500 shrink-0"
                            />
                            <span
                              className={cn(
                                'text-[11px] leading-relaxed',
                                done[k] ? 'line-through text-muted-foreground' : 'text-foreground/80'
                              )}
                            >
                              {t}
                            </span>
                          </label>
                        );
                      })}
                      {d.shortcuts && d.shortcuts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {d.shortcuts.map((s) => {
                            const qs = new URLSearchParams();
                            if (s.type) qs.set('type', s.type);
                            if (s.tag) qs.set('tag', s.tag);
                            if (s.dir) qs.set('dir', s.dir);
                            const q = qs.toString();
                            return (
                              <Button
                                key={s.label}
                                size="sm"
                                variant="outline"
                                className={cn(
                                  'h-7 text-[10px] border-cyan-500/25 text-cyan-300',
                                  s.tag === 'likely' && 'border-fuchsia-500/30 text-fuchsia-300'
                                )}
                                onClick={() => navigate(q ? `/quiz?${q}` : '/quiz')}
                              >
                                <Play className="size-3 mr-1" />
                                {s.label}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ---------- 赛程流水线 ---------- */}
      <Card className="border-cyan-500/15">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Flag className="size-4 text-cyan-400" />
            晋级流水线
            <span className="ml-auto text-[10px] font-mono-data text-muted-foreground/70">PIPELINE</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {CONTEST_PIPELINE.map((stage, i) => {
            const st = STATUS_STYLE[stage.status];
            const isLast = i === CONTEST_PIPELINE.length - 1;
            return (
              <div key={stage.id} className="relative pl-6 pb-3 last:pb-0">
                {/* 竖线 */}
                {!isLast && (
                  <span className="absolute left-[6px] top-4 bottom-0 w-px bg-border/50" />
                )}
                {/* 节点 */}
                <span
                  className={cn(
                    'absolute left-0 top-1 size-3.5 rounded-full border-2 border-background',
                    st.dot
                  )}
                />
                <div className={cn('rounded-lg border p-2.5', st.border)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm font-semibold', st.text)}>{stage.name}</span>
                    <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
                      {stage.time}
                    </Badge>
                    <Badge
                      className={cn(
                        'text-[10px] border-transparent ml-auto',
                        stage.status === 'now'
                          ? 'bg-cyan-500/15 text-cyan-300'
                          : stage.status === 'done'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-muted/40 text-muted-foreground'
                      )}
                    >
                      {st.label}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    形式：{stage.format}
                  </div>
                  <div className="flex items-start gap-1.5 mt-1">
                    <Target className="size-3 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-foreground/80">{stage.goal}</span>
                  </div>
                  {stage.focus.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {stage.focus.map((f, k) => (
                        <li key={k} className="flex items-start gap-1.5">
                          {stage.status === 'done' ? (
                            <CheckCircle2 className="size-3 text-emerald-400/70 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="size-3 text-muted-foreground/40 shrink-0 mt-0.5" />
                          )}
                          <span className="text-[11px] text-muted-foreground leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ---------- 三人分工 ---------- */}
      <Card className="border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="size-4 text-purple-400" />
            三人分工（各守方向，覆盖全库）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SPRINT_TEAM_ROLES.map((r) => (
            <div key={r.role} className="rounded-lg border border-border/40 p-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-purple-300">{r.role}</span>
                {r.directions.map((d) => (
                  <Badge
                    key={d}
                    className={cn(
                      'text-[10px] border-transparent',
                      DIRECTION_COLORS[d]?.bg,
                      DIRECTION_COLORS[d]?.text
                    )}
                  >
                    {DIRECTION_LABELS[d]}
                  </Badge>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{r.why}</p>
              <p className="text-[10px] text-cyan-300/80 mt-0.5 font-mono-data">{r.dailyQuota}</p>
            </div>
          ))}
          <div className="rounded-lg bg-muted/20 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
            <b className="text-foreground/80">队友加入</b>：把网址发给他们，
            <b className="text-emerald-300">打开就能刷，不用注册</b>
            。各自进度独立互不影响；队长在「设置 → 导入队友备份」汇总全队弱项。
            12 天 × 3 人 = 36 人天，够跑完全库 964 题（约 27 题/人/天）。
          </div>
        </CardContent>
      </Card>

      {/* ---------- 赛制事实 ---------- */}
      <Card className="border-emerald-500/15">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="size-4 text-emerald-400" />
            必须知道的赛制
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {EXAM_FACTS.map((f) => (
            <div key={f.title} className="flex items-start gap-2">
              <ArrowRight className="size-3 text-emerald-400/70 shrink-0 mt-1" />
              <span className="text-[11px] leading-relaxed">
                <b className="text-emerald-300">{f.title}：</b>
                <span className="text-muted-foreground">{f.detail}</span>
              </span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground/60 pt-1 leading-relaxed">
            注：各届/各省口径存在差异，请以本校/本省当届官方通知为最终依据。
          </p>
        </CardContent>
      </Card>

      {/* ---------- 快捷入口 ---------- */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-9 text-xs border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/10" onClick={() => navigate('/knowledge')}>
          <BookOpen className="size-3.5 mr-1" />
          知识体系
        </Button>
        <Button variant="outline" className="h-9 text-xs border-purple-500/25 text-purple-300 hover:bg-purple-500/10" onClick={() => navigate('/statistics')}>
          <TrendingUp className="size-3.5 mr-1" />
          进度统计
        </Button>
      </div>
    </div>
  );
}
