import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle2, AlertTriangle, Clock, ShieldAlert, IdCard, Briefcase } from 'lucide-react';
import { MISSIONS } from '../data/missions';
import { Avatar, CategoryTag, Icon, ProgressBar, TitleChip } from './ui';

const lastSeen = (d) => (d <= 0 ? 'Active today' : d === 1 ? 'Active yesterday' : `Active ${d} days ago`);

// Read-only Skill Passport summary, as a college or recruiter would see it.
export default function StudentProfileModal({ profile, onClose, footer }) {
  useEffect(() => {
    if (!profile) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [profile, onClose]);
  if (!profile) return null;
  const proven = MISSIONS.filter((m) => profile.passed.has(m.id));
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${profile.name} profile`} onClick={onClose}>
      <div className="my-8 w-full max-w-2xl animate-pop-in rounded-2xl border border-white/10 bg-ink-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-5">
          <div className="flex items-center gap-3">
            <Avatar name={profile.name} color={profile.color} size={48} ring={profile.isMe} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                {profile.isMe && <span className="chip border-brand-500/30 bg-brand-500/10 text-[10px] text-brand-300">Live demo student</span>}
              </div>
              {profile.titles?.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{profile.titles.slice(0, 3).map((t) => <TitleChip key={t.id} title={t} size="xs" />)}</div>}
              <p className="text-sm text-ink-400">{profile.college} · {profile.branch}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500"><Clock className="h-3 w-3" /> {lastSeen(profile.lastActiveDays)} · {profile.missions} missions proven</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-white/5 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div>
            <div className="label flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Role readiness</div>
            <div className="mt-3 space-y-3">
              {profile.roles.map((r) => (
                <div key={r.id}>
                  <div className="flex justify-between text-xs"><span className="text-ink-300">{r.name}</span><span className="font-semibold text-white">{r.score}%</span></div>
                  <ProgressBar value={r.score} color={r.color} height={5} className="mt-1" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="label">Skill scores</div>
            <div className="mt-3 space-y-3">
              {profile.skillList.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Icon name={s.icon} className="h-3.5 w-3.5 shrink-0" style={{ color: s.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-xs"><span className="text-ink-300">{s.name}</span><span className="text-ink-200">{s.progress}%</span></div>
                    <ProgressBar value={s.progress} color={s.color} height={5} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="label">Proven on real-world missions</div>
            {proven.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {proven.map((m) => (
                  <span key={m.id} className="chip gap-1.5 text-[11px]"><CheckCircle2 className="h-3 w-3 text-ok-400" /> {m.title}</span>
                ))}
              </div>
            ) : <p className="mt-2 text-sm text-ink-500">No missions passed yet.</p>}
          </div>

          {profile.gaps.length > 0 && (
            <div className="sm:col-span-2">
              <div className="label flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-xp-400" /> Open skill gaps</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.gaps.slice(0, 6).map((g) => (
                  <span key={g.missionId + g.taskId} className="inline-flex items-center gap-1.5 rounded-full border border-xp-500/20 bg-xp-500/[0.06] px-2.5 py-1 text-[11px] text-xp-400">
                    <CategoryTag id={g.category} /> {g.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-500">
            <ShieldAlert className="mt-px h-3.5 w-3.5 shrink-0" />
            {profile.isMe ? 'Live data from this demo session.' : 'Simulated profile.'} A record of challenge performance, not an accredited certification.
          </p>
          <div className="flex shrink-0 gap-2">
            {profile.isMe && <Link to="/passport" className="btn-ghost px-3 py-2 text-xs"><IdCard className="h-3.5 w-3.5" /> Full passport</Link>}
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
