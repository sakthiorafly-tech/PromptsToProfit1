import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Zap, CheckCircle2, Play, RotateCcw, Star, SearchX } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { MISSIONS, CATEGORIES, DIFFICULTIES } from '../data/missions';
import { CategoryTag, DifficultyPill, Icon } from '../components/ui';

const STATUS = ['All', 'Available', 'Completed'];

function FilterPill({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? 'border-transparent bg-white text-ink-950' : 'border-white/10 bg-white/[0.03] text-ink-300 hover:bg-white/[0.07]'
      }`}
      style={active && color ? { background: color, color: '#0A0E1A' } : undefined}
    >
      {children}
    </button>
  );
}

export default function Arena() {
  const { state } = useGame();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [diff, setDiff] = useState('All');
  const [status, setStatus] = useState('All');

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return MISSIONS.filter((m) => {
      const done = Boolean(state.completed[m.id]);
      if (cat !== 'all' && m.category !== cat) return false;
      if (diff !== 'All' && m.difficulty !== diff) return false;
      if (status === 'Available' && done) return false;
      if (status === 'Completed' && !done) return false;
      if (term && !`${m.title} ${m.description} ${m.category}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [q, cat, diff, status, state.completed]);

  const clear = () => { setQ(''); setCat('all'); setDiff('All'); setStatus('All'); };
  const doneCount = Object.keys(state.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Mission Arena</h1>
          <p className="mt-1 text-sm text-ink-400">Real-world challenges. Pass with 70% or more to earn XP. A perfect score adds a 10% bonus.</p>
        </div>
        <div className="chip self-start sm:self-auto"><CheckCircle2 className="h-3.5 w-3.5 text-ok-400" /> {doneCount} of {MISSIONS.length} completed</div>
      </div>

      {/* Filters */}
      <div className="card space-y-3 p-3 sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search missions, e.g. query, debug, pandas…" className="input pl-10" aria-label="Search missions" />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <FilterPill active={cat === 'all'} onClick={() => setCat('all')}>All skills</FilterPill>
          {CATEGORIES.map((c) => (
            <FilterPill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} color={c.color}>
              <Icon name={c.icon} className="h-3.5 w-3.5" /> {c.name}
            </FilterPill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="label">Difficulty</span>
            {['All', ...DIFFICULTIES].map((d) => <FilterPill key={d} active={diff === d} onClick={() => setDiff(d)}>{d}</FilterPill>)}
          </div>
          <div className="flex items-center gap-2">
            <span className="label">Status</span>
            {STATUS.map((s) => <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>{s}</FilterPill>)}
          </div>
        </div>
      </div>

      {/* Grid */}
      {list.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <SearchX className="h-8 w-8 text-ink-500" />
          <div className="font-semibold text-white">No missions match these filters</div>
          <button className="btn-ghost" onClick={clear}>Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m, i) => {
            const done = state.completed[m.id];
            return (
              <article
                key={m.id}
                className="card card-hover flex animate-fade-up flex-col p-5"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className="flex items-center justify-between">
                  <CategoryTag id={m.category} />
                  <div className="flex items-center gap-1.5">
                    {m.featured && <span className="chip border-brand-500/30 bg-brand-500/10 py-0.5 text-brand-300"><Star className="h-3 w-3 fill-brand-300" /> Featured</span>}
                    <DifficultyPill level={m.difficulty} />
                  </div>
                </div>
                <h3 className="mt-4 font-semibold leading-snug text-white">{m.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-400">{m.description}</p>

                <div className="mt-4 flex items-center gap-4 text-xs text-ink-400">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.minutes} min</span>
                  <span className="flex items-center gap-1 font-semibold text-xp-400"><Zap className="h-3.5 w-3.5 fill-xp-500" /> {m.xp} XP</span>
                  <span>{m.tasks.length} tasks</span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  {done ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-ok-400"><CheckCircle2 className="h-4 w-4" /> Completed · {done.score}%</span>
                  ) : (
                    <span className="text-xs font-medium text-ink-500">Not started</span>
                  )}
                  <button onClick={() => navigate(`/arena/${m.id}`)} className={done ? 'btn-ghost px-3 py-2 text-xs' : 'btn-primary px-3 py-2 text-xs'}>
                    {done ? <><RotateCcw className="h-3.5 w-3.5" /> Practice</> : <><Play className="h-3.5 w-3.5 fill-white" /> Start Mission</>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
