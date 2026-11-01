import { useMemo, useState } from 'react';
import {
  Building2, Search, SlidersHorizontal, Star, Download, CheckCircle2, Megaphone, ShieldCheck, Users, Target, X,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { ROLES } from '../data/concepts';
import { COLLEGES } from '../data/cohort';
import { MISSIONS, getMission } from '../data/missions';
import { talentPool, downloadCsv } from '../engine/talent';
import { Avatar, CategoryTag, Icon, ProgressBar, ProgressRing, SimulatedNote } from '../components/ui';
import StudentProfileModal from '../components/StudentProfileModal';

const EMPLOYER = { name: 'NeoBank', note: 'fictional employer for this demo' };
const SPONSORED = 'java-bank';

export default function Recruiter() {
  const { state, notify } = useGame();
  const pool = useMemo(() => talentPool(state).filter((p) => p.openToWork), [state]);
  const [roleId, setRoleId] = useState('backend');
  const [minScore, setMinScore] = useState(40);
  const [colleges, setColleges] = useState([]);
  const [missionId, setMissionId] = useState('');
  const [query, setQuery] = useState('');
  const [shortlist, setShortlist] = useState([]);
  const [open, setOpen] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(10);

  const role = ROLES.find((r) => r.id === roleId);
  const weightedCats = Object.entries(role.weights).sort((a, b) => b[1] - a[1]).map(([c]) => c);

  const results = useMemo(() => pool
    .map((p) => ({ ...p, match: p.roles.find((r) => r.id === roleId).score }))
    .filter((p) => p.match >= minScore)
    .filter((p) => !colleges.length || colleges.includes(p.college))
    .filter((p) => !missionId || p.passed.has(missionId))
    .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => b.match - a.match || b.missions - a.missions), [pool, roleId, minScore, colleges, missionId, query]);

  const toggleCollege = (c) => setColleges((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const isListed = (id) => shortlist.includes(id);
  const toggleShortlist = (p) => {
    setShortlist((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]));
    if (!isListed(p.id)) notify(`${p.name} added to your shortlist`, 'success');
  };

  const listed = pool.filter((p) => shortlist.includes(p.id));
  const exportShortlist = () => {
    downloadCsv('skillarena-shortlist.csv', [
      ['Candidate', 'College', 'Branch', `${role.name} match %`, 'Missions proven', 'Proven missions', 'Data'],
      ...listed.map((p) => [p.name, p.college, p.branch, p.roles.find((r) => r.id === roleId).score, p.missions, MISSIONS.filter((m) => p.passed.has(m.id)).map((m) => m.title).join('; '), p.isMe ? 'Live demo' : 'Simulated']),
    ]);
    notify('Shortlist exported as CSV', 'success');
  };

  const runSponsored = () => {
    setRoleId('backend');
    setMissionId(SPONSORED);
    setMinScore(0);
    setColleges([]);
    notify(`Showing candidates who passed “${getMission(SPONSORED).title}”`, 'info');
  };

  const filters = (
    <div className="space-y-5">
      <div>
        <div className="label">Hiring for</div>
        <div className="mt-2 grid gap-1.5">
          {ROLES.map((r) => (
            <button key={r.id} onClick={() => setRoleId(r.id)} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${roleId === r.id ? 'border-brand-400/50 bg-brand-500/10 text-white' : 'border-white/[0.07] text-ink-300 hover:bg-white/[0.04]'}`}>
              {r.name}
              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between"><span className="label">Minimum match</span><span className="text-sm font-semibold text-white">{minScore}%</span></div>
        <input type="range" min={0} max={90} step={5} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="mt-2 w-full accent-[#7C6CFF]" aria-label="Minimum match" />
      </div>
      <div>
        <div className="label">Must have passed</div>
        <select className="input mt-2 py-2" value={missionId} onChange={(e) => setMissionId(e.target.value)} aria-label="Must have passed mission">
          <option value="">Any mission</option>
          {MISSIONS.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>
      <div>
        <div className="label">Colleges</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {COLLEGES.map((c) => (
            <button key={c} onClick={() => toggleCollege(c)} className={`rounded-full border px-2.5 py-1 text-xs transition ${colleges.includes(c) ? 'border-brand-400/50 bg-brand-500/15 text-white' : 'border-white/10 text-ink-400 hover:text-ink-100'}`}>{c}</button>
          ))}
        </div>
      </div>
      <p className="flex items-start gap-1.5 rounded-xl bg-ok-500/[0.06] p-3 text-[11px] leading-relaxed text-ink-400">
        <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-ok-400" /> Only students who opted in to recruiter discovery appear here ({pool.length} of {talentPool(state).length}).
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="card relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-xp-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-xp-500/15 ring-1 ring-xp-500/30"><Building2 className="h-6 w-6 text-xp-400" /></span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-xp-400">Recruiter view · {EMPLOYER.name} <span className="normal-case tracking-normal text-ink-500">({EMPLOYER.note})</span></div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Talent Discovery</h1>
              <p className="text-sm text-ink-400">Find candidates by what they've proven on real-world missions, not CV keywords.</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button className="btn-ghost lg:hidden" onClick={() => setShowFilters((v) => !v)}><SlidersHorizontal className="h-4 w-4" /> Filters</button>
            <button className="btn-ghost" onClick={exportShortlist} disabled={!listed.length}><Download className="h-4 w-4" /> Shortlist ({listed.length})</button>
          </div>
        </div>
      </section>

      {/* Sponsored challenge */}
      <section className="card flex flex-col gap-4 border border-xp-500/25 p-5 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-xp-500/15"><Megaphone className="h-5 w-5 text-xp-400" /></span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white">Sponsored challenge: “{getMission(SPONSORED).title}”</div>
          <p className="mt-0.5 text-sm text-ink-400">Employers sponsor a branded mission (illustrative ₹10,000 per campaign). Everyone who passes it lands in a ranked, opt-in shortlist.</p>
        </div>
        <button className={`shrink-0 ${missionId === SPONSORED ? 'btn-ghost' : 'btn-xp'}`} onClick={missionId === SPONSORED ? () => setMissionId('') : runSponsored}>
          {missionId === SPONSORED ? <><X className="h-4 w-4" /> Clear</> : <><Target className="h-4 w-4" /> See who passed</>}
        </button>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`card h-fit p-5 lg:sticky lg:top-24 ${showFilters ? '' : 'hidden lg:block'}`}>{filters}</aside>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-400"><span className="font-semibold text-white">{results.length}</span> candidates for <span className="font-semibold text-ink-100">{role.name}</span>{missionId && <> who passed <span className="text-ink-100">“{getMission(missionId).title}”</span></>}</p>
            <div className="relative sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <input className="input py-2 pl-9" placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search candidates" />
            </div>
          </div>

          {results.slice(0, limit).map((p, i) => (
            <article key={p.id} className={`card card-hover grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 xl:grid-cols-[15rem_minmax(0,1fr)_auto] ${p.isMe ? 'border-brand-500/30' : ''}`}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 text-center font-mono text-xs text-ink-500">{i + 1}</span>
                <Avatar name={p.name} color={p.color} size={40} />
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">{p.name}{p.isMe && <span className="ml-2 text-[10px] font-semibold text-brand-300">LIVE</span>}</div>
                  <div className="truncate text-xs text-ink-400">{p.college} · {p.branch}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-500"><CheckCircle2 className="h-3 w-3 text-ok-400" /> {p.missions} missions proven</div>
                </div>
              </div>

              <div className="order-2 col-span-2 grid grid-cols-3 gap-3 xl:order-none xl:col-span-1">
                {weightedCats.slice(0, 3).map((c) => {
                  const s = p.skillList.find((x) => x.id === c);
                  return (
                    <div key={c}>
                      <div className="flex items-center gap-1 text-[11px] text-ink-400"><Icon name={s.icon} className="h-3 w-3" style={{ color: s.color }} /> <span className="truncate">{s.name}</span></div>
                      <div className="mt-1 text-sm font-semibold text-ink-100">{s.progress}%</div>
                      <ProgressBar value={s.progress} color={s.color} height={4} className="mt-1" />
                    </div>
                  );
                })}
              </div>

              <div className="order-1 flex items-center justify-end gap-3 xl:order-none">
                <ProgressRing value={p.match} size={52} stroke={5} color={role.color}>
                  <span className="text-xs font-bold text-white">{p.match}%</span>
                </ProgressRing>
                <div className="flex flex-col gap-1.5">
                  <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setOpen(p)}>Passport</button>
                  <button className={`btn px-3 py-1.5 text-xs ${isListed(p.id) ? 'bg-xp-500/15 text-xp-400' : 'border border-white/10 text-ink-300 hover:bg-white/5'}`} onClick={() => toggleShortlist(p)} aria-pressed={isListed(p.id)}>
                    <Star className={`h-3.5 w-3.5 ${isListed(p.id) ? 'fill-xp-500' : ''}`} /> {isListed(p.id) ? 'Listed' : 'Shortlist'}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {results.length > limit && (
            <button className="btn-ghost w-full" onClick={() => setLimit((l) => l + 10)}>Show more ({results.length - limit} remaining)</button>
          )}
          {results.length === 0 && (
            <div className="card p-10 text-center">
              <Users className="mx-auto h-8 w-8 text-ink-600" />
              <p className="mt-3 text-sm text-ink-400">No candidates match. Try lowering the minimum match or clearing filters.</p>
            </div>
          )}
          <SimulatedNote>Candidates are simulated demo data except the live demo student. {EMPLOYER.name} is a fictional employer.</SimulatedNote>
        </section>
      </div>

      <StudentProfileModal
        profile={open}
        onClose={() => setOpen(null)}
        footer={open && (
          <button className="btn-primary px-3 py-2 text-xs" onClick={() => toggleShortlist(open)}>
            <Star className={`h-3.5 w-3.5 ${isListed(open.id) ? 'fill-white' : ''}`} /> {isListed(open.id) ? 'Remove from shortlist' : 'Add to shortlist'}
          </button>
        )}
      />
    </div>
  );
}
