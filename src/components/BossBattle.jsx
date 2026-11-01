import { useEffect, useRef, useState } from 'react';
import { Swords, Crown } from 'lucide-react';
import BossAvatar from './BossAvatar';
import HeroAvatar from './HeroAvatar';
import { getBoss, bossMaxHp } from '../data/bosses';
import { DEMO_STUDENT } from '../data/students';
import { play } from '../audio/sfx';

// Duel timing (ms). Each passed test check = one code bolt from the hero.
const START = 450;
const HIT_MS = 380;
const FLY = 260;

/** Time (ms after submit) when the last hit lands: the final blow on a defeat. */
export const duelLastHitAt = (hits) => (hits > 0 ? START + (hits - 1) * HIT_MS + FLY : START);

const initials = DEMO_STUDENT.name.split(' ').map((p) => p[0]).join('').slice(0, 2);

// Hard missions are boss fights: the hero fires a bolt per passed check, and a
// full clear ends in a dash, a slash, a shatter and a K.O.
export default function BossBattle({ mission, evaluation }) {
  const boss = getBoss(mission.id);
  const max = bossMaxHp(mission);
  const hits = evaluation ? evaluation.results.reduce((n, r) => n + r.checks.filter((c) => c.passed).length, 0) : 0;
  const [hp, setHp] = useState(max);
  const [hitKey, setHitKey] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | fight | dash | ko | survived
  const stageRef = useRef(null);
  const heroRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms));
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setHp(max);
    setHitKey(0);
    if (heroRef.current) heroRef.current.style.transform = '';
    if (!boss || !evaluation) { setPhase('idle'); return undefined; }
    setPhase('fight');
    const defeat = hits >= max;

    for (let i = 1; i <= hits; i += 1) {
      const land = duelLastHitAt(i);
      if (defeat && i === hits) {
        // Final blow: dash in, slash, shatter, K.O.
        at(land - 240, () => {
          setPhase('dash');
          play.whoosh();
          const stage = stageRef.current;
          if (heroRef.current && stage) heroRef.current.style.transform = `translateX(${Math.max(80, stage.offsetWidth * 0.5)}px)`;
        });
        at(land, () => {
          setHp(0);
          play.slash();
          play.shatter(0.05);
          shatter(stageRef.current, boss.color);
          setPhase('ko');
        });
        at(land + 170, () => play.ko());
        at(land + 520, () => { if (heroRef.current) heroRef.current.style.transform = ''; });
      } else {
        at(land - FLY, () => { play.zap(); fireBolt(stageRef.current); });
        at(land, () => { setHp(max - i); setHitKey((k) => k + 1); play.hit(); });
      }
    }
    if (!defeat) at(duelLastHitAt(hits) + 320, () => { setPhase('survived'); play.taunt(); });
    return () => timers.current.forEach(clearTimeout);
  }, [evaluation, hits, max, boss]);

  if (!boss) return null;
  const ko = phase === 'ko';
  const survived = phase === 'survived';

  return (
    <section className={`card relative overflow-hidden border p-4 sm:p-5 ${ko ? 'duel-shake' : ''}`} style={{ borderColor: `${boss.color}55` }} aria-label={`Boss battle: ${boss.name}`}>
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl" style={{ background: `${boss.color}22` }} />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: boss.color, background: `${boss.color}1a` }}>Boss battle</span>
          <span className="font-bold text-white">{boss.name}</span>
        </div>
        {phase === 'idle' && <span className="flex items-center gap-1.5 text-xs text-ink-400"><Swords className="h-4 w-4" /> 1 passed check = 1 hit</span>}
      </div>
      <p className="relative mt-1 text-sm text-ink-400">
        {ko ? 'Boss defeated! Every test check passed.' : survived ? `The boss survived with ${hp} HP. Fix the failing checks and strike again.` : boss.taunt}
      </p>

      {/* Stage */}
      <div ref={stageRef} className="duel-stage relative mt-3 h-40 overflow-hidden rounded-xl sm:h-48" style={{ background: `linear-gradient(180deg, transparent 55%, ${boss.color}14), radial-gradient(ellipse at 50% 120%, ${boss.color}26, transparent 60%)` }}>
        <div className="absolute inset-x-6 bottom-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${boss.color}66, transparent)` }} />

        {/* Hero */}
        <div ref={heroRef} className="duel-hero absolute bottom-3 left-[4%] origin-bottom-left scale-[0.72] sm:left-[6%] sm:scale-100">
          <div className={survived ? 'hero-knock' : 'hero-idle'}>
            <HeroAvatar initials={initials} size={112} />
          </div>
        </div>

        {/* Boss */}
        <div className="absolute bottom-3 right-[5%] h-[104px] w-[104px] origin-bottom-right scale-[0.8] sm:right-[8%] sm:scale-100">
          {!ko && (
            <div key={hitKey} className={hitKey ? 'boss-hit' : ''}>
              <div className={survived ? 'boss-taunt' : ''}>
                <BossAvatar id={mission.id} color={boss.color} state="idle" size={104} />
              </div>
            </div>
          )}
          {hitKey > 0 && !ko && <span key={`dmg-${hitKey}`} className="boss-damage">-1</span>}
          {ko && (
            <span className="boss-crown-pop absolute bottom-6 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-xp-500 shadow-xl ring-4 ring-ink-900">
              <Crown className="h-6 w-6 text-ink-950" />
            </span>
          )}
        </div>

        {phase === 'ko' && <div className="duel-flash pointer-events-none absolute inset-0" />}
        {phase === 'ko' && (
          <svg className="duel-slash pointer-events-none absolute bottom-2 right-[6%] h-40 w-40" viewBox="0 0 200 200" aria-hidden>
            <path d="M20 170 Q100 20 185 30" stroke="#F4F2FB" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M20 170 Q100 20 185 30" stroke="#B3A9FF" strokeWidth="26" strokeLinecap="round" fill="none" opacity=".35" />
          </svg>
        )}
        {ko && <div className="duel-ko pointer-events-none absolute left-1/2 top-[38%]" role="status">K.O.!</div>}
      </div>

      {/* Health */}
      <div className="relative mt-3 flex items-center gap-3">
        <div className="flex flex-1 gap-1" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={hp} aria-label="Boss health">
          {Array.from({ length: max }, (_, i) => (
            <span key={i} className="h-3 flex-1 rounded-sm transition-all duration-200" style={{ background: i < hp ? boss.color : 'rgba(255,255,255,0.06)', boxShadow: i < hp ? `0 0 10px -2px ${boss.color}` : 'none' }} />
          ))}
        </div>
        <span className="w-16 text-right font-mono text-xs font-semibold text-ink-200">HP {hp}/{max}</span>
      </div>
    </section>
  );
}

// A glowing </> bolt from the hero's blade to the boss (Web Animations API).
function fireBolt(stage) {
  if (!stage) return;
  const w = stage.offsetWidth;
  const b = document.createElement('span');
  b.className = 'duel-bolt';
  b.textContent = '</>';
  b.style.left = `${Math.round(w * 0.06 + 95)}px`;
  stage.appendChild(b);
  const dist = Math.max(60, w * 0.86 - 70 - w * 0.06 - 110);
  b.animate(
    [{ transform: 'translateX(0) scale(.6)', opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: `translateX(${dist}px) scale(1.2)`, opacity: 1 }],
    { duration: FLY, easing: 'cubic-bezier(.3,.1,.6,1)', fill: 'forwards' },
  );
  setTimeout(() => b.remove(), FLY + 30);
}

// The boss bursts into pixel fragments in its own colours.
function shatter(stage, color) {
  if (!stage) return;
  const w = stage.offsetWidth;
  const colors = [color, '#FBBF24', '#F4F2FB', '#0B1020'];
  for (let i = 0; i < 28; i += 1) {
    const p = document.createElement('span');
    p.className = 'duel-pixel';
    p.style.background = colors[i % colors.length];
    p.style.left = `${w * 0.78 + (Math.random() - 0.5) * 70}px`;
    p.style.bottom = `${30 + Math.random() * 80}px`;
    stage.appendChild(p);
    const dx = (Math.random() - 0.35) * w * 0.5;
    const dy = -(40 + Math.random() * 140);
    p.animate(
      [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) rotate(${(Math.random() - 0.5) * 720}deg)`, opacity: 0 }],
      { duration: 800 + Math.random() * 500, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' },
    );
    setTimeout(() => p.remove(), 1400);
  }
}
