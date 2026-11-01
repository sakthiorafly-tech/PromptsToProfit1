import { useEffect } from 'react';
import { Trophy, GraduationCap, Briefcase, ShieldCheck, X } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { play } from '../audio/sfx';

const ICONS = { Trophy, GraduationCap, Briefcase, ShieldCheck };
const SHOW_MS = 4200;

// Game-style "achievement unlocked" cards, shown one at a time from a queue.
export default function AchievementToast() {
  const { achievements, dismissAchievement } = useGame();
  const current = achievements[0];

  useEffect(() => {
    if (!current) return undefined;
    play.achievement();
    const t = setTimeout(dismissAchievement, SHOW_MS);
    return () => clearTimeout(t);
  }, [current, dismissAchievement]);

  if (!current) return null;
  const I = ICONS[current.icon] || Trophy;
  const queued = achievements.length - 1;

  return (
    <div className="pointer-events-none fixed inset-x-3 top-20 z-[70] flex justify-end sm:inset-x-auto sm:right-6" role="status" aria-live="polite">
      <button
        key={current.uid}
        onClick={dismissAchievement}
        className="achievement-in pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border bg-ink-900/95 p-4 text-left shadow-2xl backdrop-blur-xl sm:w-96"
        style={{ borderColor: `${current.color}55`, boxShadow: `0 20px 50px -12px rgba(0,0,0,.7), 0 0 0 1px ${current.color}22, 0 0 40px -10px ${current.color}` }}
        aria-label={`${current.kind}: ${current.title}. Click to dismiss.`}
      >
        <span className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full blur-2xl" style={{ background: `${current.color}33` }} />
        <div className="relative flex items-start gap-3.5">
          <div className="achievement-icon relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl" style={{ background: `${current.color}22`, boxShadow: `0 0 0 1px ${current.color}66` }}>
            <I className="h-7 w-7" style={{ color: current.color }} />
            <span className="absolute inset-y-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: current.color }}>{current.kind}</span>
              {queued > 0 && <span className="text-[10px] font-semibold text-ink-500">+{queued} more</span>}
            </div>
            <div className="mt-0.5 font-semibold leading-snug text-white">{current.title}</div>
            <div className="mt-1 text-xs leading-relaxed text-ink-400">{current.subtitle}</div>
          </div>
          <X className="h-4 w-4 shrink-0 text-ink-500" aria-hidden />
        </div>
        <span className="achievement-timer absolute bottom-0 left-0 h-0.5" style={{ background: current.color, animationDuration: `${SHOW_MS}ms` }} />
      </button>
    </div>
  );
}
