import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  GraduationCap, Users, Activity, Gauge, BadgeCheck, Download, Search, AlertTriangle, ClipboardList, ArrowUpDown, Radio,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { DEMO_COLLEGE } from '../data/cohort';
import { getMission } from '../data/missions';
import { cohortFor, cohortAnalytics, downloadCsv } from '../engine/talent';
import { Avatar, CategoryTag, ProgressBar, SectionTitle, SimulatedNote } from '../components/ui';
import StudentProfileModal from '../components/StudentProfileModal';

function Kpi({ icon: I, label, value, sub, color }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${color}1a` }}><I className="h-4 w-4" style={{ color }} /></span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-400">{sub}</div>}
    </div>
  );
}

const BAND_META = [
  { id: 'ready', label: 'Job-ready', color: '#4ADE80', hint: '70%+ readiness for a role' },
  { id: 'developing', label: 'Developing', color: '#FBBF24', hint: '40–69%' },
  { id: 'support', label: 'Needs support', color: '#F87171', hint: 'Below 40%' },
];

const FILTERS = [
  { id: 'all', label: 'All students' },
  { id: 'attention', label: 'Needs intervention' },
  { id: 'ready', label: 'Job-ready' },
];

const lastSeen = (d) => (d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago`);

export default function College() {
  const { state, notify } = useGame();
  const cohort = useMemo(() => cohortFor(state, DEMO_COLLEGE.name), [state]);
  const a = useMemo(() => cohortAnalytics(cohort), [cohort]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(false);
  const [open, setOpen] = useState(null);
  const [assigned, setAssigned] = useState({});
  const [showAll, setShowAll] = useState(false);

  const ranked = useMemo(() => [...cohort].sort((x, y) => y.readiness - x.readiness), [cohort]);
  const rankOf = (p) => ranked.indexOf(p) + 1;
  const me = cohort.find((p) => p.isMe);

  const needsAttention = (p) => p.band.id === 'support' || p.lastActiveDays > 10;
  const rows = ranked
    .filter((p) => (filter === 'all' ? true : filter === 'ready' ? p.band.id === 'ready' : needsAttention(p)))
    .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));
  const sortedRows = sortAsc ? [...rows].reverse() : rows;
  const shown = showAll ? sortedRows : sortedRows.slice(0, 10);

  const assign = (g) => {
    const students = cohort.filter((p) => p.gaps.some((x) => x.missionId === g.missionId && x.taskId === g.taskId));
    setAssigned((s) => ({ ...s, [g.key]: true }));
    notify(`Assigned “${getMission(g.missionId).title}” to ${students.length} students (demo action)`, 'success');
  };

  const exportReport = () => {
    downloadCsv(`skillarena-placement-report-${DEMO_COLLEGE.name.replace(/\s+/g, '-').toLowerCase()}.csv`, [
      ['Cohort rank', 'Student', 'Branch', 'Best-fit role', 'Readiness %', 'Band', 'Missions proven', 'Java', 'Python', 'SQL', 'React', 'Problem Solving', 'Open gaps', 'Last active (days)', 'Data'],
      ...ranked.map((p, i) => [
        i + 1, p.name, p.branch, p.best.name, p.readiness, p.band.label, p.missions,
        p.skills.java, p.skills.python, p.skills.sql, p.skills.react, p.skills.ps,
        p.gaps.map((g) => g.name).join('; '), p.lastActiveDays, p.isMe ? 'Live demo' : 'Simulated',
      ]),
    ]);
    notify('Placement report exported as CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="card relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2DD4BF]/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2DD4BF]/15 ring-1 ring-[#2DD4BF]/30"><GraduationCap className="h-6 w-6 text-[#2DD4BF]" /></span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">College view · {DEMO_COLLEGE.officer}</div>
              <h1 className="text-2xl font-bold tracking-tight text-white">{DEMO_COLLEGE.name} Placement Readiness</h1>
              <p className="text-sm text-ink-400">{DEMO_COLLEGE.cohort} · {a.n} students on SkillArena</p>
            </div>
          </div>
          <button className="btn-ghost shrink-0" onClick={exportReport}><Download className="h-4 w-4" /> Export placement report</button>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi icon={Users} label="Students" value={a.n} sub={`${a.avgMissions} missions each on average`} color="#9A8CFF" />
        <Kpi icon={Activity} label="Active this week" value={`${a.activePct}%`} sub={`${a.active} of ${a.n} students`} color="#38BDF8" />
        <Kpi icon={Gauge} label="Avg readiness" value={`${a.avgReadiness}%`} sub="Best-fit role, per student" color="#FBBF24" />
        <Kpi icon={BadgeCheck} label="Job-ready" value={`${a.readyPct}%`} sub={`${a.bands.ready} students at 70%+`} color="#4ADE80" />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Readiness distribution + skill averages */}
        <section className="card p-5 lg:col-span-3">
          <SectionTitle title="Readiness distribution" subtitle="Where the batch stands before placement season" />
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/[0.04]">
            {BAND_META.map((b) => (
              <div key={b.id} className="h-full transition-[width] duration-700" style={{ width: `${(a.bands[b.id] / a.n) * 100}%`, background: b.color }} title={`${b.label}: ${a.bands[b.id]}`} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {BAND_META.map((b) => (
              <div key={b.id} className="rounded-xl bg-white/[0.03] p-3">
                <div className="flex items-center gap-1.5 text-xs text-ink-400"><span className="h-2 w-2 rounded-full" style={{ background: b.color }} /> {b.label}</div>
                <div className="mt-1 text-xl font-bold text-white">{a.bands[b.id]}</div>
                <div className="text-[11px] text-ink-500">{b.hint}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 label">Average skill score by area</div>
          <div className="mt-2 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.skillAvg} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="name" interval={0} tickFormatter={(v) => (v === 'Problem Solving' ? 'Prob. Solving' : v.replace(' JS', ''))} tickLine={false} axisLine={false} tick={{ fill: '#8A95B8', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#5B6890', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={({ active, payload }) => (active && payload?.length ? (
                    <div className="rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-xs shadow-xl"><span className="font-semibold text-white">{payload[0].payload.name}</span>: {payload[0].value}% average</div>
                  ) : null)}
                />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive={false}>
                  {a.skillAvg.map((s) => <Cell key={s.id} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Concept gaps */}
        <section className="card p-5 lg:col-span-2">
          <SectionTitle title="Top skill gaps in the batch" subtitle="Concepts students missed on their latest attempt" action={<AlertTriangle className="h-5 w-5 text-xp-400" />} />
          <div className="space-y-4">
            {a.conceptGaps.slice(0, 5).map((g) => {
              const m = getMission(g.missionId);
              return (
                <div key={g.key}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink-100">{g.name}</div>
                      <div className="mt-0.5"><CategoryTag id={m.category} /></div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-xp-400">{g.pct}%</div>
                      <div className="text-[11px] text-ink-500">{g.count} students</div>
                    </div>
                  </div>
                  <ProgressBar value={g.pct * 2} color="#FBBF24" height={5} className="mt-2" />
                  <button
                    className={`mt-2 inline-flex items-start gap-1.5 text-left text-xs font-medium ${assigned[g.key] ? 'text-ok-400' : 'text-brand-300 hover:text-brand-400'}`}
                    onClick={() => assign(g)}
                    disabled={assigned[g.key]}
                  >
                    <ClipboardList className="mt-px h-3.5 w-3.5 shrink-0" /> {assigned[g.key] ? 'Assigned as cohort practice' : `Assign “${m.title}” to these students`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Live student spotlight */}
      {me && (
        <section className="card flex flex-col gap-4 border border-brand-500/25 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Avatar name={me.name} color={me.color} size={44} ring />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-300"><Radio className="h-3.5 w-3.5 animate-pulse" /> Live from the student app</div>
              <div className="font-semibold text-white">{me.name}</div>
              <div className="text-xs text-ink-400">Readiness rank #{rankOf(me)} of {a.n} in the batch · {me.missions} missions proven</div>
            </div>
          </div>
          <div className="flex-1 sm:px-6">
            <div className="flex justify-between text-xs"><span className="text-ink-400">{me.best.name}</span><span className="font-semibold" style={{ color: me.band.color }}>{me.readiness}% · {me.band.label}</span></div>
            <ProgressBar value={me.readiness} color={me.band.color} className="mt-1.5" />
          </div>
          <button className="btn-ghost shrink-0" onClick={() => setOpen(me)}>View profile</button>
        </section>
      )}

      {/* Student table */}
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === f.id ? 'bg-brand-500/15 text-white ring-1 ring-brand-500/30' : 'text-ink-400 hover:bg-white/5 hover:text-ink-100'}`}
              >
                {f.label}
                <span className="ml-1.5 text-ink-500">{f.id === 'all' ? a.n : f.id === 'ready' ? a.bands.ready : cohort.filter(needsAttention).length}</span>
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input className="input py-2 pl-9" placeholder="Search students" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search students" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500">
                <th className="px-4 py-3 font-semibold" title="Rank by readiness">Rank</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Best-fit role</th>
                <th className="px-4 py-3 font-semibold">
                  <button className="inline-flex items-center gap-1 uppercase hover:text-ink-200" onClick={() => setSortAsc((v) => !v)}>Readiness <ArrowUpDown className="h-3 w-3" /></button>
                </th>
                <th className="px-4 py-3 font-semibold">Missions</th>
                <th className="px-4 py-3 font-semibold">Top gap</th>
                <th className="px-4 py-3 font-semibold">Last active</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} onClick={() => setOpen(p)} className={`cursor-pointer border-t border-white/[0.04] transition hover:bg-white/[0.03] ${p.isMe ? 'bg-brand-500/[0.07]' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-ink-500">{rankOf(p)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={p.name} color={p.color} size={28} />
                      <div>
                        <div className={`font-medium ${p.isMe ? 'text-white' : 'text-ink-100'}`}>{p.name}{p.isMe && <span className="ml-2 text-[10px] font-semibold text-brand-300">LIVE</span>}</div>
                        <div className="text-[11px] text-ink-500">{p.branch}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-300">{p.best.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20"><ProgressBar value={p.readiness} color={p.band.color} height={5} /></div>
                      <span className="w-9 text-xs font-semibold text-ink-100">{p.readiness}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-300">{p.missions}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-xs text-ink-400">{p.gaps[0]?.name || '—'}</td>
                  <td className={`px-4 py-3 text-xs ${p.lastActiveDays > 10 ? 'text-bad-400' : 'text-ink-400'}`}>{lastSeen(p.lastActiveDays)}</td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-500">No students match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {sortedRows.length > 10 && (
          <div className="border-t border-white/[0.06] p-3 text-center">
            <button className="text-sm font-medium text-brand-300 hover:text-brand-400" onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Show top 10' : `Show all ${sortedRows.length} students`}
            </button>
          </div>
        )}
      </section>

      <SimulatedNote>Cohort is simulated demo data except the live demo student. Readiness reflects challenge performance and is not an accredited certification.</SimulatedNote>

      <StudentProfileModal profile={open} onClose={() => setOpen(null)} />
    </div>
  );
}
