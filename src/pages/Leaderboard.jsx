import { useState } from 'react';
import { Crown, Zap, Target } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Avatar, SimulatedNote, TitleChip } from '../components/ui';
import { peerTitles } from '../engine/talent';

const TABS = [
  { id: 'weekly', label: 'This week' },
  { id: 'all', label: 'All-time' },
];

const PODIUM_STYLE = {
  1: { h: 'h-28', color: '#FBBF24', order: 'order-2' },
  2: { h: 'h-20', color: '#B4BDD8', order: 'order-1' },
  3: { h: 'h-16', color: '#FB923C', order: 'order-3' },
};

export default function Leaderboard() {
  const { leaderboard, titles } = useGame();
  const [mode, setMode] = useState('all');
  const rows = leaderboard(mode);
  const me = rows.find((r) => r.isMe);
  const unit = mode === 'weekly' ? 'XP this week' : 'XP';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Leaderboard</h1>
          <p className="mt-1 text-sm text-ink-400">Top 10 players across colleges, ranked by verified mission XP (effort and activity). Job readiness rankings for placements live in the College view.</p>
        </div>
        <div className="inline-flex shrink-0 self-start rounded-xl border border-white/10 bg-white/[0.03] p-1" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={mode === t.id}
              onClick={() => setMode(t.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-semibold transition ${mode === t.id ? 'bg-brand-500 text-white shadow-glow' : 'text-ink-400 hover:text-ink-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <section className="card px-4 pb-0 pt-8 sm:px-8">
        <div className="mx-auto grid max-w-xl grid-cols-3 items-end gap-3 sm:gap-6">
          {rows.slice(0, 3).map((s) => {
            const p = PODIUM_STYLE[s.rank];
            return (
              <div key={`${mode}-${s.id}`} className={`flex animate-fade-up flex-col items-center ${p.order}`}>
                {s.rank === 1 && <Crown className="mb-1 h-6 w-6 fill-xp-500 text-xp-400" />}
                <div className="rounded-full p-0.5" style={{ background: p.color }}>
                  <Avatar name={s.name} color={s.color} size={s.rank === 1 ? 64 : 52} />
                </div>
                <div className={`mt-2 max-w-full truncate text-center text-sm font-semibold ${s.isMe ? 'text-brand-300' : 'text-white'}`}>{s.isMe ? 'You' : s.name.split(' ')[0]}</div>
                <div className="text-xs font-semibold text-xp-400">{s.score.toLocaleString('en-IN')} XP</div>
                <div className={`mt-3 grid w-full ${p.h} place-items-start justify-center rounded-t-xl pt-2 text-2xl font-extrabold`} style={{ background: `${p.color}1a`, color: p.color }}>
                  {s.rank}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Table */}
      <section className="card overflow-hidden">
        <div className="hidden grid-cols-[56px_1fr_120px_110px_110px] gap-3 border-b border-white/[0.06] px-5 py-3 label sm:grid">
          <span>Rank</span><span>Student</span><span>Level</span><span className="text-right">Missions</span><span className="text-right">{mode === 'weekly' ? 'Weekly XP' : 'XP'}</span>
        </div>
        <ol>
          {rows.map((s, i) => (
            <li
              key={`${mode}-${s.id}`}
              className={`grid animate-fade-up grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0 sm:grid-cols-[56px_1fr_120px_110px_110px] sm:px-5 ${
                s.isMe ? 'bg-brand-500/10 shadow-[inset_3px_0_0_0_#7C6CFF]' : 'hover:bg-white/[0.02]'
              }`}
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <span className={`font-mono text-sm font-semibold ${s.rank <= 3 ? 'text-xp-400' : 'text-ink-400'}`}>#{s.rank}</span>
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={s.name} color={s.color} size={36} ring={s.isMe} />
                <div className="min-w-0">
                  <div className={`truncate text-sm font-semibold ${s.isMe ? 'text-white' : 'text-ink-100'}`}>
                    {s.name} {s.isMe && <span className="ml-1 rounded-md bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">YOU</span>}
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 text-xs text-ink-500">
                    <span className="truncate">{s.college}</span>
                    {(() => { const t = (s.isMe ? titles : peerTitles(s.id))[0]; return t ? <span className="hidden sm:inline-flex"><TitleChip title={t} size="xs" /></span> : null; })()}
                  </div>
                </div>
              </div>
              <span className="hidden text-sm font-medium sm:block" style={{ color: s.level.color }}>{s.level.name}</span>
              <span className="hidden items-center justify-end gap-1 text-sm text-ink-300 sm:flex"><Target className="h-3.5 w-3.5 text-ink-500" />{s.missions}</span>
              <span className="flex items-center justify-end gap-1 text-sm font-bold text-xp-400"><Zap className="h-3.5 w-3.5 fill-xp-500" />{s.score.toLocaleString('en-IN')}</span>
            </li>
          ))}
        </ol>
      </section>

      {me && (
        <p className="text-sm text-ink-400">
          You are <span className="font-semibold text-white">#{me.rank}</span> {mode === 'weekly' ? 'this week' : 'all-time'} with{' '}
          <span className="font-semibold text-xp-400">{me.score.toLocaleString('en-IN')} {unit}</span>.
        </p>
      )}
      <SimulatedNote />
    </div>
  );
}
