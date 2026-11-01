import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap, Flame, Target, Trophy, ArrowRight, Clock, CheckCircle2, TrendingUp, Award, Sparkles, Briefcase, AlertTriangle } from 'lucide-react';
import { readinessBand } from '../engine/coach';
import { useGame } from '../context/GameContext';
import { MISSIONS } from '../data/missions';
import { BADGES } from '../data/badges';
import {
  Avatar, ProgressRing, ProgressBar, CategoryTag, DifficultyPill, BadgeTile, SectionTitle, Icon, SimulatedNote,
} from '../components/ui';

function Stat({ icon: I, label, value, sub, color }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${color}1a` }}>
          <I className="h-4 w-4" style={{ color }} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-400">{sub}</div>}
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-white">{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
      <div className="mt-0.5 text-xp-400">{d.xp} XP earned</div>
      <div className="text-ink-400">{d.attempts} attempt{d.attempts === 1 ? '' : 's'}</div>
    </div>
  );
}

export default function Dashboard() {
  const { student, xp, level, streak, rank, weeklyXp, weeklyActivity, skills, state, completedCount, history, leaderboard, recommendation, readiness, gaps } = useGame();
  const navigate = useNavigate();

  const available = MISSIONS.filter((m) => !state.completed[m.id]).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const others = available.filter((m) => m.id !== recommendation?.mission.id);
  const topRole = readiness[0];
  const band = readinessBand(topRole.score);
  const earned = BADGES.filter((b) => state.badges[b.id]).sort((a, b) => new Date(state.badges[b.id]) - new Date(state.badges[a.id]));
  const locked = BADGES.filter((b) => !state.badges[b.id]);
  const board = leaderboard('all');
  const myIdx = board.findIndex((s) => s.isMe);
  const neighbours = board.slice(Math.max(0, myIdx - 2), Math.max(0, myIdx - 2) + 4);

  return (
    <div className="space-y-6">
      {/* Profile hero */}
      <section className="card relative overflow-hidden p-5 sm:p-6 animate-fade-up">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl" style={{ background: `${level.color}22` }} />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Avatar name={student.name} color={student.color} size={64} ring />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{student.name} </h1>
              <p className="text-sm text-ink-400">{student.program} · {student.year}</p>
              <p className="text-sm text-ink-500">{student.college}</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-5 md:justify-end">
            <ProgressRing value={level.progress} size={96} stroke={9} color={level.color}>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-500">Level</div>
                <div className="text-sm font-bold" style={{ color: level.color }}>{level.name}</div>
              </div>
            </ProgressRing>
            <div className="min-w-0 flex-1 md:max-w-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{xp.toLocaleString('en-IN')}</span>
                <span className="text-sm font-medium text-xp-400">XP</span>
              </div>
              <ProgressBar value={level.progress} color={level.color} className="mt-2" />
              <p className="mt-2 text-xs text-ink-400">
                {level.next ? <><span className="font-semibold text-ink-200">{level.xpToNext} XP</span> to reach {level.next.name}</> : 'You have reached the highest level.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={Zap} label="Weekly XP" value={weeklyXp.toLocaleString('en-IN')} sub="Last 7 days" color="#FBBF24" />
        <Stat icon={Flame} label="Daily streak" value={`${streak} days`} sub={streak >= 7 ? 'On fire!' : `${7 - streak} more for the 7-day badge`} color="#FB923C" />
        <Stat icon={Target} label="Missions" value={`${completedCount}/${MISSIONS.length}`} sub={`${available.length} available`} color="#4ADE80" />
        <Stat icon={Trophy} label="Leaderboard" value={`#${rank}`} sub="XP rank, all-time" color="#9A8CFF" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Skill Coach recommendation */}
          <section>
            <SectionTitle
              title="Recommended missions"
              subtitle="Picked by the Skill Coach from your scores, gaps and target role"
              action={<Link to="/arena" className="flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-400">All missions <ArrowRight className="h-4 w-4" /></Link>}
            />
            {recommendation ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <button onClick={() => navigate(`/arena/${recommendation.mission.id}`)} className="card card-hover relative flex flex-col overflow-hidden border border-brand-500/30 p-4 text-left sm:col-span-2">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
                  <span className="chip relative w-fit border-brand-500/30 bg-brand-500/10 text-brand-300"><Sparkles className="h-3.5 w-3.5" /> Skill Coach pick</span>
                  <div className="relative mt-3 flex items-center gap-2"><CategoryTag id={recommendation.mission.category} /><DifficultyPill level={recommendation.mission.difficulty} /></div>
                  <div className="relative mt-2 text-base font-semibold text-white">{recommendation.mission.title}</div>
                  <p className="relative mt-1 text-sm text-ink-400">{recommendation.reason}</p>
                  <div className="relative mt-auto flex items-center justify-between pt-4 text-xs">
                    <span className="flex items-center gap-1 text-ink-400"><Clock className="h-3.5 w-3.5" /> {recommendation.mission.minutes}m</span>
                    <span className="flex items-center gap-1 font-semibold text-xp-400"><Zap className="h-3.5 w-3.5 fill-xp-500" /> {recommendation.mission.xp} XP</span>
                  </div>
                </button>
                <div className="grid gap-3">
                  {others.slice(0, 2).map((m) => (
                    <button key={m.id} onClick={() => navigate(`/arena/${m.id}`)} className="card card-hover flex flex-col p-4 text-left">
                      <div className="flex items-center justify-between"><CategoryTag id={m.category} /><DifficultyPill level={m.difficulty} /></div>
                      <div className="mt-2 line-clamp-2 text-sm font-semibold text-white">{m.title}</div>
                      <div className="mt-auto flex items-center justify-end pt-2 text-xs font-semibold text-xp-400"><Zap className="h-3.5 w-3.5 fill-xp-500" /> {m.xp}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-6 text-center text-sm text-ink-400">All missions completed. You can still replay any mission in practice mode.</div>
            )}
          </section>

          {/* Weekly activity */}
          <section className="card p-5">
            <SectionTitle title="Weekly activity" subtitle="XP earned per day" action={<span className="chip"><TrendingUp className="h-3.5 w-3.5 text-ok-400" /> {weeklyXp} XP this week</span>} />
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#8A95B8', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#5B6890', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip />} />
                  <Bar dataKey="xp" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {weeklyActivity.map((d) => <Cell key={d.date} fill={d.today ? '#FBBF24' : '#7C6CFF'} fillOpacity={d.xp ? 1 : 0.25} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Skills */}
          <section className="card p-5">
            <SectionTitle title="Skill progress" subtitle="Share of category XP earned" />
            <div className="space-y-4">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${s.color}1a` }}>
                    <Icon name={s.icon} className="h-4 w-4" style={{ color: s.color }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ink-100">{s.name}</span>
                      <span className="text-xs text-ink-400">{s.completed}/{s.total} missions · <span className="font-semibold text-ink-200">{s.progress}%</span></span>
                    </div>
                    <ProgressBar value={s.progress} color={s.color} height={6} className="mt-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="card p-5">
            <SectionTitle title="Career readiness" subtitle="From demonstrated mission performance" action={<Briefcase className="h-5 w-5 text-brand-300" />} />
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-[11px] text-ink-500">Best-fit role</div>
                <div className="truncate text-sm font-semibold text-white">{topRole.name}</div>
              </div>
              <span className="chip shrink-0" style={{ color: band.color, borderColor: `${band.color}40`, background: `${band.color}14` }}>{band.label}</span>
            </div>
            <div className="mt-4 space-y-3">
              {readiness.map((r) => (
                <div key={r.id}>
                  <div className="flex justify-between text-xs"><span className="text-ink-300">{r.name}</span><span className="font-semibold text-ink-100">{r.score}%</span></div>
                  <ProgressBar value={r.score} color={r.color} height={5} className="mt-1" />
                </div>
              ))}
            </div>
            {gaps.length > 0 && (
              <div className="mt-4 rounded-xl border border-xp-500/20 bg-xp-500/[0.05] p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-xp-400"><AlertTriangle className="h-3.5 w-3.5" /> Open skill gaps</div>
                <ul className="mt-1.5 space-y-1">{gaps.slice(0, 3).map((g) => <li key={g.missionId + g.taskId} className="text-xs text-ink-300">{g.name}</li>)}</ul>
              </div>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-ink-500">Colleges and recruiters see these scores. Job-ready starts at 70%.</p>
          </section>

          <section className="card p-5">
            <SectionTitle title="Achievements" subtitle={`${earned.length} of ${BADGES.length} unlocked`} action={<Award className="h-5 w-5 text-xp-400" />} />
            <div className="grid grid-cols-3 gap-2">
              {[...earned, ...locked].slice(0, 6).map((b) => <BadgeTile key={b.id} badge={b} earnedAt={state.badges[b.id]} compact />)}
            </div>
          </section>

          <section className="card p-5">
            <SectionTitle
              title="Your position"
              subtitle="All-time leaderboard"
              action={<Link to="/leaderboard" className="text-sm font-medium text-brand-300 hover:text-brand-400">View all</Link>}
            />
            <div className="space-y-1.5">
              {neighbours.map((s) => (
                <div key={s.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${s.isMe ? 'bg-brand-500/10 ring-1 ring-brand-500/30' : ''}`}>
                  <span className="w-6 text-center font-mono text-xs text-ink-400">#{s.rank}</span>
                  <Avatar name={s.name} color={s.color} size={28} />
                  <span className={`flex-1 truncate text-sm ${s.isMe ? 'font-semibold text-white' : 'text-ink-200'}`}>{s.isMe ? 'You' : s.name}</span>
                  <span className="text-xs font-semibold text-xp-400">{s.score.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            {myIdx > 0 && (
              <p className="mt-3 text-xs text-ink-400">
                <span className="font-semibold text-ink-200">{board[myIdx - 1].score - xp + 1} XP</span> to overtake {board[myIdx - 1].name.split(' ')[0]}.
              </p>
            )}
          </section>

          <section className="card p-5">
            <SectionTitle title="Completed missions" subtitle="Most recent first" />
            <div className="space-y-3">
              {history.slice(0, 5).map((h) => (
                <div key={h.mission.id} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-ink-100">{h.mission.title}</div>
                    <div className="text-xs text-ink-500">{new Date(h.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {h.score}%</div>
                  </div>
                  <span className="text-xs font-semibold text-xp-400">+{h.xp}</span>
                </div>
              ))}
            </div>
          </section>
          <SimulatedNote />
        </div>
      </div>
    </div>
  );
}
