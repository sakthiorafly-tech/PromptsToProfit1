import { useEffect, useRef, useState } from 'react';
import { Skull, Swords, Crown } from 'lucide-react';
import { getBoss, bossMaxHp } from '../data/bosses';
import { play } from '../audio/sfx';

export const HIT_MS = 190;

// Hard missions are boss fights. Each passed test check is one hit; the
// health bar drains hit by hit after submission.
export default function BossBattle({ mission, evaluation }) {
  const boss = getBoss(mission.id);
  const max = bossMaxHp(mission);
  const hits = evaluation ? evaluation.results.reduce((n, r) => n + r.checks.filter((c) => c.passed).length, 0) : 0;
  const [hp, setHp] = useState(max);
  const [shake, setShake] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setHp(max);
    if (!evaluation) return undefined;
    for (let i = 1; i <= hits; i += 1) {
      timers.current.push(setTimeout(() => { setHp(max - i); setShake((s) => s + 1); play.hit(); }, 350 + i * HIT_MS));
    }
    if (hits >= max) timers.current.push(setTimeout(() => play.bossDefeat(), 350 + hits * HIT_MS + 150));
    return () => timers.current.forEach(clearTimeout);
  }, [evaluation, hits, max]);

  if (!boss) return null;
  const done = evaluation && hp === max - hits;
  const defeated = done && hp === 0;
  const survived = done && hp > 0;

  return (
    <section className="card relative overflow-hidden border p-5" style={{ borderColor: `${boss.color}55` }} aria-label={`Boss battle: ${boss.name}`}>
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl" style={{ background: `${boss.color}22` }} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div key={shake} className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${shake && !defeated ? 'boss-shake' : ''} ${defeated ? 'boss-defeated' : ''}`} style={{ background: `${boss.color}1f`, boxShadow: `0 0 0 1px ${boss.color}66, 0 10px 30px -10px ${boss.color}` }}>
          {defeated ? <Crown className="h-8 w-8 text-xp-400" /> : <Skull className="h-8 w-8" style={{ color: boss.color }} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: boss.color, background: `${boss.color}1a` }}>Boss battle</span>
            <span className="font-bold text-white">{boss.name}</span>
          </div>
          <p className="mt-1 text-sm text-ink-400">
            {defeated ? 'Boss defeated! Every test check passed.' : survived ? `The boss survived with ${hp} HP. Fix the failing checks and strike again.` : boss.taunt}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex flex-1 gap-1" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={hp} aria-label="Boss health">
              {Array.from({ length: max }, (_, i) => (
                <span key={i} className="h-3 flex-1 rounded-sm transition-all duration-200" style={{ background: i < hp ? boss.color : 'rgba(255,255,255,0.06)', boxShadow: i < hp ? `0 0 10px -2px ${boss.color}` : 'none', opacity: i < hp ? 1 : 0.6 }} />
              ))}
            </div>
            <span className="w-16 text-right font-mono text-xs font-semibold text-ink-200">HP {hp}/{max}</span>
          </div>
        </div>
        {!evaluation && (
          <div className="flex items-center gap-1.5 text-xs text-ink-400 sm:w-40 sm:justify-end"><Swords className="h-4 w-4" /> 1 check = 1 hit</div>
        )}
      </div>
    </section>
  );
}
