import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowUpRight, Sparkles, Flame, TrendingUp } from 'lucide-react';
import { BADGES } from '../data/badges';
import { Icon, ProgressBar } from './ui';
import { play } from '../audio/sfx';

const CONFETTI_COLORS = ['#7C6CFF', '#FBBF24', '#4ADE80', '#38BDF8', '#F472B6', '#FB923C'];

function useCountUp(target, duration = 1100) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export default function RewardModal({ reward, mission, onClose }) {
  const navigate = useNavigate();
  const xp = useCountUp(reward.xpEarned);
  const badges = BADGES.filter((b) => reward.newBadges.includes(b.id));
  const lu = reward.levelUp;

  const confetti = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 2.2 + Math.random() * 1.8,
      dx: (Math.random() - 0.5) * 240,
      rot: (Math.random() - 0.5) * 1080,
      size: 6 + Math.random() * 6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      round: Math.random() > 0.6,
    })),
    [],
  );

  // Sound, timed to the modal's animations (XP count-up, level card at 500ms, badges from 700ms).
  useEffect(() => {
    play.success();
    play.xpTicks(12, 1.0);
    if (reward.levelUp) play.levelUp(1.45);
    reward.newBadges.forEach((_, i) => play.badge(2.0 + i * 0.35));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const rankUp = reward.prevRank && reward.newRank && reward.newRank < reward.prevRank;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Mission reward">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        {confetti.map((c, i) => (
          <span
            key={i}
            className="absolute top-[-20px] animate-confetti"
            style={{
              left: `${c.left}%`, width: c.size, height: c.round ? c.size : c.size * 0.45, background: c.color,
              borderRadius: c.round ? '999px' : '2px', animationDelay: `${c.delay}s`,
              '--dur': `${c.dur}s`, '--dx': `${c.dx}px`, '--rot': `${c.rot}deg`,
            }}
          />
        ))}
      </div>

      <div className="flex min-h-full items-center justify-center p-4 py-8">
      <div className="relative w-full max-w-md animate-pop-in overflow-hidden rounded-3xl border border-white/10 bg-ink-900 p-6 text-center shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-xp-500/25 blur-3xl" />

        <div className="relative">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-xp-500/15 ring-1 ring-xp-500/40">
            <Zap className="h-10 w-10 fill-xp-500 text-xp-400" />
          </div>
          <div className="mt-5 label text-ok-400">Mission complete</div>
          <h2 className="mt-1 text-xl font-bold text-white">{mission.title}</h2>

          <div className="mt-5 text-5xl font-extrabold tracking-tight text-xp-400 tabular-nums">+{xp} XP</div>
          {reward.perfect && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300">
              <Sparkles className="h-3.5 w-3.5" /> Perfect score bonus included
            </div>
          )}

          <div className="mt-5 flex justify-center gap-2 text-xs">
            <span className="chip border-streak-500/25 bg-streak-500/10 text-streak-400"><Flame className="h-3.5 w-3.5 fill-streak-500" /> {reward.streak}-day streak</span>
            {rankUp ? (
              <span className="chip border-ok-500/25 bg-ok-500/10 text-ok-400"><TrendingUp className="h-3.5 w-3.5" /> Rank #{reward.prevRank} → #{reward.newRank}</span>
            ) : (
              <span className="chip">Rank #{reward.newRank}</span>
            )}
          </div>

          {/* Level up */}
          {lu && (
            <div className="mt-6 animate-fade-up rounded-2xl border p-4 [animation-delay:500ms]" style={{ borderColor: `${lu.to.color}55`, background: `${lu.to.color}12` }}>
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: lu.to.color }}>
                <ArrowUpRight className="h-4 w-4" /> Level up
              </div>
              <div className="mt-2 flex items-center justify-center gap-3 text-lg font-bold">
                <span className="text-ink-500 line-through decoration-1">{lu.from.name}</span>
                <span className="text-ink-500">→</span>
                <span style={{ color: lu.to.color }}>{lu.to.name}</span>
              </div>
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mt-6">
              <div className="label">{badges.length === 1 ? 'Badge unlocked' : `${badges.length} badges unlocked`}</div>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                {badges.map((b, i) => (
                  <div key={b.id} className="w-28 animate-pop-in" style={{ animationDelay: `${700 + i * 180}ms` }}>
                    <div className="relative mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-2xl" style={{ background: `${b.color}22`, boxShadow: `0 0 0 1px ${b.color}66, 0 10px 30px -8px ${b.color}` }}>
                      <Icon name={b.icon} className="h-7 w-7" style={{ color: b.color }} />
                      <span className="absolute inset-y-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    </div>
                    <div className="mt-2 text-xs font-semibold text-ink-100">{b.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="mt-6 text-left">
            <div className="flex justify-between text-xs text-ink-400">
              <span>{reward.level.name} · {reward.totalXp.toLocaleString('en-IN')} XP</span>
              <span>{reward.level.next ? `${reward.level.xpToNext} XP to ${reward.level.next.name}` : 'Max level'}</span>
            </div>
            <ProgressBar value={reward.level.progress} color={reward.level.color} className="mt-1.5" />
          </div>

          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            <button className="btn-ghost" onClick={() => { onClose(); navigate('/leaderboard'); }}>See leaderboard</button>
            <button className="btn-primary" autoFocus onClick={onClose}>Continue</button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
