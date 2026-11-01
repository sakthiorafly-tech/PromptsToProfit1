import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Share2, ShieldAlert, MapPin, GraduationCap, Zap, Target, Award, Gauge, CheckCircle2, Copy, X, Printer, Check, Briefcase, Eye } from 'lucide-react';
import { cohortFor } from '../engine/talent';
import { readinessBand } from '../engine/coach';
import { useGame } from '../context/GameContext';
import { BADGES } from '../data/badges';
import { MISSIONS, getMission } from '../data/missions';
import { Avatar, BadgeTile, CategoryTag, DifficultyPill, Icon, ProgressBar, SectionTitle, Logo, TitleChip } from '../components/ui';

function ShareDialog({ url, text, onClose }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${text}\n${url}`); } catch { /* clipboard blocked: still show state */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-md animate-pop-in rounded-2xl border border-white/10 bg-ink-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Share your Skill Passport</h3>
            <p className="mt-1 text-sm text-ink-400">Simulated share link (demo). In production this would be a public, read-only profile.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-white/5 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-950/60 p-2 pl-3">
          <span className="flex-1 truncate font-mono text-xs text-ink-300">{url}</span>
          <button className="btn-primary px-3 py-1.5 text-xs" onClick={copy}>{copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}</button>
        </div>
        <p className="mt-4 rounded-xl bg-white/[0.03] p-3 text-xs leading-relaxed text-ink-400">{text}</p>
      </div>
    </div>
  );
}

export default function Passport() {
  const { student, xp, level, skills, state, history, completedCount, rank, notify, readiness, gaps, titles } = useGame();
  const batch = cohortFor(state, student.college).sort((a, b) => b.readiness - a.readiness);
  const batchRank = batch.findIndex((p) => p.isMe) + 1;
  const topRole = readiness[0];
  const band = readinessBand(topRole.score);
  const [shareOpen, setShareOpen] = useState(false);

  const passportId = `SA-${new Date().getFullYear()}-${student.name.split(' ').map((p) => p[0]).join('')}-0427`;
  const shareUrl = `https://skillarena.app/passport/${passportId.toLowerCase()}`;
  const avgScore = history.length ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0;
  const top = [...skills].sort((a, b) => b.progress - a.progress)[0];
  const shareText = `${student.name} · ${level.name} on SkillArena · ${xp} XP · ${completedCount} missions completed · strongest skill: ${top.name}.`;
  const radar = skills.map((s) => ({ skill: s.name.replace(' JS', '').replace('Problem Solving', 'Problem Solv.'), value: s.progress }));
  const attemptsFor = (id) => state.attempts.filter((a) => a.missionId === id).length;

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My SkillArena Skill Passport', text: shareText, url: shareUrl });
        notify('Passport shared', 'success');
        return;
      } catch (e) {
        if (e?.name === 'AbortError') return;
      }
    }
    setShareOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Skill Passport</h1>
          <p className="mt-1 text-sm text-ink-400">Your digital record of demonstrated challenge performance.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</button>
          <button className="btn-primary" onClick={share}><Share2 className="h-4 w-4" /> Share Skill Passport</button>
        </div>
      </div>

      {/* Identity card */}
      <section className="card relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-brand-600/40 via-brand-500/15 to-transparent" />
        <div className="relative p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <Logo />
            <div className="text-right">
              <div className="label">Passport ID</div>
              <div className="font-mono text-sm text-ink-200">{passportId}</div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">
            <Avatar name={student.name} color={student.color} size={88} ring />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{student.name}</h2>
              <p className="text-sm text-ink-400">{student.handle}</p>
              {titles.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{titles.map((t) => <TitleChip key={t.id} title={t} />)}</div>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-300">
                <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-ink-500" /> {student.program}, {student.year}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-ink-500" /> {student.college}</span>
              </div>
              <p className="mt-3 max-w-xl text-sm text-ink-400">{student.bio}</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Zap, label: 'Overall XP', value: xp.toLocaleString('en-IN'), color: '#FBBF24' },
              { icon: Gauge, label: 'Level', value: level.name, color: level.color },
              { icon: Target, label: 'Missions', value: `${completedCount} / ${MISSIONS.length}`, color: '#4ADE80' },
              { icon: Award, label: 'Avg. score', value: `${avgScore}%`, color: '#9A8CFF' },
            ].map(({ icon: I, label, value, color }) => (
              <div key={label} className="rounded-xl border border-white/[0.06] bg-ink-950/50 p-4">
                <div className="flex items-center gap-2 label"><I className="h-3.5 w-3.5" style={{ color }} /> {label}</div>
                <div className="mt-2 text-xl font-bold" style={{ color: label === 'Level' ? color : '#fff' }}>{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-ink-500">XP leaderboard rank #{rank} all-time · readiness rank #{batchRank} of {batch.length} in the {student.college} batch (simulated demo cohort)</div>
        </div>
      </section>

      {/* Role readiness: the same numbers colleges and recruiters see */}
      <section className="card p-5">
        <SectionTitle
          title="Job-role readiness"
          subtitle="Computed from demonstrated mission performance"
          action={<span className="chip shrink-0" style={{ color: band.color, borderColor: `${band.color}40`, background: `${band.color}14` }}><Briefcase className="h-3.5 w-3.5" /> {topRole.name} · {band.label}</span>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {readiness.map((r) => {
            const b = readinessBand(r.score);
            return (
              <div key={r.id} className="rounded-xl border border-white/[0.06] bg-ink-950/50 p-4">
                <div className="text-sm font-medium text-ink-100">{r.name}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{r.score}%</span>
                  <span className="text-xs font-medium" style={{ color: b.color }}>{b.label}</span>
                </div>
                <ProgressBar value={r.score} color={r.color} height={6} className="mt-2" />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-col gap-2 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Visible to your college placement cell and to recruiters you opt in to.</span>
          {gaps.length > 0 && <span>Open gaps: {gaps.slice(0, 3).map((g) => g.name).join(', ')}</span>}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Skills */}
        <section className="card p-5 lg:col-span-3">
          <SectionTitle title="Skill-wise performance" subtitle="Category XP earned and average mission score" />
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="62%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#8A95B8', fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#9A8CFF" fill="#7C6CFF" fillOpacity={0.35} strokeWidth={2} isAnimationActive />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3.5">
              {skills.map((s) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-100"><Icon name={s.icon} className="h-3.5 w-3.5" style={{ color: s.color }} /> {s.name}</span>
                    <span className="text-xs text-ink-400">{s.completed}/{s.total} · {s.avgScore ? `${s.avgScore}% avg` : 'no attempts yet'}</span>
                  </div>
                  <ProgressBar value={s.progress} color={s.color} height={6} className="mt-1.5" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="card p-5 lg:col-span-2">
          <SectionTitle title="Earned badges" subtitle={`${Object.keys(state.badges).length} of ${BADGES.length}`} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BADGES.map((b) => <BadgeTile key={b.id} badge={b} earnedAt={state.badges[b.id]} />)}
          </div>
        </section>
      </div>

      {/* History */}
      <section className="card overflow-hidden">
        <div className="p-5 pb-0"><SectionTitle title="Challenge history" subtitle="Missions completed with evaluated scores" /></div>
        {history.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-400">No missions completed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-y border-white/[0.06] text-left">
                  {['Mission', 'Skill', 'Difficulty', 'Score', 'Attempts', 'XP', 'Completed'].map((h) => <th key={h} className="px-5 py-3 label">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.mission.id} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-5 py-3 font-medium text-ink-100"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-ok-400" /> {h.mission.title}</span></td>
                    <td className="px-5 py-3"><CategoryTag id={h.mission.category} /></td>
                    <td className="px-5 py-3"><DifficultyPill level={getMission(h.mission.id).difficulty} /></td>
                    <td className="px-5 py-3 font-semibold text-white">{h.score}%</td>
                    <td className="px-5 py-3 text-ink-400">{attemptsFor(h.mission.id) || 1}</td>
                    <td className="px-5 py-3 font-semibold text-xp-400">+{h.xp}</td>
                    <td className="px-5 py-3 text-ink-400">{new Date(h.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <section className="flex gap-3 rounded-2xl border border-xp-500/20 bg-xp-500/[0.06] p-4 text-sm text-ink-300">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-xp-400" />
        <p>
          <span className="font-semibold text-ink-100">About this passport: </span>
          This passport records performance on SkillArena challenges, evaluated automatically against predefined answers.
          It is <span className="font-semibold text-ink-100">not an accredited professional certification</span> and does not replace degrees,
          formal assessments or interviews. The profile and statistics shown here are simulated demo data.
        </p>
      </section>

      {shareOpen && <ShareDialog url={shareUrl} text={shareText} onClose={() => setShareOpen(false)} />}
    </div>
  );
}
