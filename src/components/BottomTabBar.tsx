import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Timer,
  CalendarCheck,
  PenTool,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 省赛只考理论，实验速查优先级下调，改为「设置 → 实验速查」入口
const TAB_ITEMS = [
  { path: '/', label: '总览', icon: LayoutDashboard },
  { path: '/exam', label: '模考', icon: Timer },
  { path: '/quiz', label: '刷题', icon: PenTool },
  { path: '/knowledge', label: '知识', icon: BookOpen },
  { path: '/study-plan', label: '计划', icon: CalendarCheck },
  { path: '/statistics', label: '统计', icon: BarChart3 },
];

export default function BottomTabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 border-t border-cyan-500/20 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]
      md:left-0 md:top-0 md:bottom-0 md:translate-x-0 md:w-20 md:max-w-none md:border-t-0 md:border-r md:pb-0 md:flex md:flex-col">
      {/* 顶部发光线（桌面端改为右侧竖线） */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent md:hidden" />
      <div className="hidden md:block absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />

      {/* 桌面端顶部 Logo 区 */}
      <div className="hidden md:flex h-14 items-center justify-center border-b border-cyan-500/10">
        <span className="text-cyan-400 text-glow-cyan text-lg font-bold font-tech">▌</span>
      </div>

      <div className="grid grid-cols-6 h-14 md:flex md:flex-col md:h-auto md:flex-1 md:py-4">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/' ? pathname === '/' : pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 transition-all duration-200',
                'min-h-[44px] active:scale-95',
                'md:flex-row md:justify-start md:gap-3 md:px-0 md:py-3 md:mx-2 md:rounded-lg md:min-h-0',
                isActive
                  ? 'text-cyan-400'
                  : 'text-muted-foreground/60 hover:text-foreground/80'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'size-[22px] transition-all duration-200',
                    isActive &&
                      'drop-shadow-[0_0_6px_rgba(0_229_255_0.8)] -translate-y-0.5 md:translate-y-0'
                  )}
                />
                {isActive && (
                  <span className="absolute -top-1 -right-1 size-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0_229_255_0.9)] animate-pulse" />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium tracking-wide transition-all md:text-xs',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
