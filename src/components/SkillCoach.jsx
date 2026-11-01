import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Briefcase, TrendingUp, Zap, Clock } from 'lucide-react';
import { CategoryTag, DifficultyPill, ProgressBar } from './ui';

// Post-submission feedback from the rule-based Skill Coach (engine/coach.js).
export default function SkillCoach({ report, onRetry }) {
  const navigate = useNavigate();
  const { next } = report;

  return (
    <section className="card relative animate-fade-up overflow-hidden border border-brand-500/25" aria-label="Skill Coach feedback">
      <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 ring-1 ring-brand-500/30">
              <Sparkles className="h-5 w-5 text-brand-300" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-300">Skill Coach</div>
              <div className="text-lg font-bold text-white">{report.headline}</div>
            </div>
          </div>
          <span className="chip text-[11px]">Deterministic evaluator · works offline</span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-300">{report.summary}</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {/* Strengths */}
          <div className="rounded-xl border border-ok-500/20 bg-ok-500/[0.04] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ok-400"><CheckCircle2 className="h-4 w-4" /> Demonstrated</div>
            {report.strengths.length ? (
              <ul className="mt-3 space-y-2">
                {report.strengths.map((s) => <li key={s.taskId} className="text-sm text-ink-200">{s.concept}</li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-ink-400">Nothing locked in yet. Every attempt shows you exactly where to look.</p>}
          </div>

          {/* Gaps */}
          <div className="rounded-xl border border-xp-500/20 bg-xp-500/[0.04] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-xp-400"><AlertTriangle className="h-4 w-4" /> Skill gaps to close</div>
            {report.gaps.length ? (
              <ul className="mt-3 space-y-3">
                {report.gaps.map((g) => (
                  <li key={g.taskId}>
                    <div className="text-sm font-medium text-ink-100">{g.concept}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-ink-400">{g.tip}</div>
                    {g.failedChecks.length > 0 && (
                      <div className="mt-1.5 font-mono text-[11px] text-bad-400">Failing: {g.failedChecks.join(' · ')}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-ink-400">No gaps in this mission. Nice work.</p>}
          </div>

          {/* Role readiness */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-100"><Briefcase className="h-4 w-4 text-brand-300" /> Job-role readiness</div>
            <ul className="mt-3 space-y-3">
              {report.roles.slice(0, 3).map((r) => (
                <li key={r.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-200">{r.name}</span>
                    <span className="font-semibold text-white">
                      {r.score}%{r.delta > 0 && <span className="ml-1.5 text-ok-400">+{r.delta}</span>}
                    </span>
                  </div>
                  <ProgressBar value={r.score} color={r.color} height={6} className="mt-1.5" />
                </li>
              ))}
            </ul>
            {report.mostImproved.delta > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ok-400"><TrendingUp className="h-3.5 w-3.5" /> {report.mostImproved.name} readiness up {report.mostImproved.delta} points</p>
            )}
          </div>
        </div>

        {/* Next step */}
        {next && (
          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-ink-950/50 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="label">{next.retry ? 'Coach recommends: retry' : 'Coach recommends next'}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <CategoryTag id={next.mission.category} />
                <DifficultyPill level={next.mission.difficulty} />
                <span className="font-semibold text-white">{next.mission.title}</span>
              </div>
              <p className="mt-1.5 text-sm text-ink-400">{next.reason}</p>
              {!next.retry && (
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="flex items-center gap-1 text-ink-400"><Clock className="h-3.5 w-3.5" /> {next.mission.minutes} min</span>
                  <span className="flex items-center gap-1 font-semibold text-xp-400"><Zap className="h-3.5 w-3.5 fill-xp-500" /> {next.mission.xp} XP</span>
                </div>
              )}
            </div>
            {next.retry ? (
              <button className="btn-primary shrink-0" onClick={onRetry}><RotateCcw className="h-4 w-4" /> Retry with tips</button>
            ) : (
              <button className="btn-primary shrink-0" onClick={() => navigate(`/arena/${next.mission.id}`)}>Start mission <ArrowRight className="h-4 w-4" /></button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
