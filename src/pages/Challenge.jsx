import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Clock, Zap, ListChecks, Send, CheckCircle2, XCircle, RotateCcw, Lightbulb, Trophy, IdCard, Terminal, Info,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getMission, getCategory } from '../data/missions';
import { PASS_THRESHOLD } from '../engine/gamification';
import { CategoryTag, DifficultyPill } from '../components/ui';
import RewardModal from '../components/RewardModal';
import SkillCoach from '../components/SkillCoach';
import BossBattle, { HIT_MS } from '../components/BossBattle';
import { getBoss } from '../data/bosses';
import { correctAnswers } from '../data/solutions';
import { play } from '../audio/sfx';

const initialAnswers = (mission) =>
  Object.fromEntries(mission.tasks.map((t) => [t.id, t.type === 'code' ? t.starter : t.type === 'mcq' ? null : '']));

function CodeEditor({ value, onChange, disabled, language }) {
  const lines = value.split('\n').length;
  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const { selectionStart: s, selectionEnd: end } = e.target;
    const next = `${value.slice(0, s)}  ${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; });
  };
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0F1C]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-bad-500/60" /><span className="h-2.5 w-2.5 rounded-full bg-xp-500/60" /><span className="h-2.5 w-2.5 rounded-full bg-ok-500/60" /></div>
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500">{language}</span>
      </div>
      <div className="flex">
        <div aria-hidden className="select-none border-r border-white/[0.04] px-3 py-3 text-right font-mono text-[13px] leading-6 text-ink-600">
          {Array.from({ length: Math.max(lines, 6) }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          spellCheck={false}
          rows={Math.max(lines, 6)}
          className="w-full resize-none bg-transparent px-3 py-3 font-mono text-[13px] leading-6 text-ink-100 outline-none disabled:opacity-80"
          aria-label="Code editor"
        />
      </div>
    </div>
  );
}

function TaskCard({ task, index, answer, setAnswer, result, locked }) {
  const border = result ? (result.passed ? 'border-ok-500/40' : 'border-bad-500/40') : 'border-white/[0.06]';
  return (
    <div className={`card border p-5 transition ${border}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-semibold ${result ? (result.passed ? 'bg-ok-500/15 text-ok-400' : 'bg-bad-500/15 text-bad-400') : 'bg-white/5 text-ink-300'}`}>
          {result ? (result.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />) : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="label">{task.type === 'mcq' ? 'Multiple choice' : task.type === 'input' ? 'Short answer' : 'Coding task'}</div>
          <p className="mt-1 text-[15px] leading-relaxed text-ink-100">{task.prompt}</p>
        </div>
      </div>

      <div className="mt-4">
        {task.type === 'mcq' && (
          <div className="grid gap-2">
            {task.options.map((opt, i) => {
              const selected = answer === i;
              const isCorrect = result && i === task.answer;
              const isWrongPick = result && selected && !result.passed;
              return (
                <button
                  key={i}
                  disabled={locked}
                  onClick={() => { play.select(); setAnswer(i); }}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    isCorrect ? 'border-ok-500/50 bg-ok-500/10 text-ink-100'
                      : isWrongPick ? 'border-bad-500/50 bg-bad-500/10 text-ink-100'
                        : selected ? 'border-brand-400/60 bg-brand-500/10 text-white'
                          : 'border-white/[0.07] bg-white/[0.02] text-ink-300 hover:border-white/15 hover:bg-white/[0.05]'
                  } disabled:cursor-default`}
                >
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${selected ? 'border-brand-400 bg-brand-500 text-white' : 'border-white/20 text-ink-500'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        )}
        {task.type === 'input' && (
          <input className="input font-mono" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={task.placeholder} disabled={locked} />
        )}
        {task.type === 'code' && <CodeEditor value={answer} onChange={setAnswer} disabled={locked} language={task.language} />}
      </div>

      {result && (
        <div className="mt-4 space-y-3 animate-fade-up">
          {task.type === 'code' && (
            <div className="rounded-xl border border-white/[0.06] bg-ink-950/60 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink-300"><Terminal className="h-3.5 w-3.5" /> Test results · {result.checks.filter((c) => c.passed).length}/{result.checks.length} passed</div>
              <ul className="space-y-1.5">
                {result.checks.map((c) => (
                  <li key={c.label} className="flex items-start gap-2 font-mono text-xs">
                    {c.passed ? <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-ok-400" /> : <XCircle className="mt-px h-3.5 w-3.5 shrink-0 text-bad-400" />}
                    <span className={c.passed ? 'text-ink-300' : 'text-bad-400'}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2.5 rounded-xl bg-brand-500/[0.07] p-3 text-sm leading-relaxed text-ink-300">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
            <span><span className="font-semibold text-ink-100">Explanation: </span>{task.explanation}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Keyed by mission id so answers/results reset when switching missions.
export default function Challenge() {
  const { missionId } = useParams();
  return <ChallengeView key={missionId} missionId={missionId} />;
}

function ChallengeView({ missionId }) {
  const mission = getMission(missionId);
  const navigate = useNavigate();
  const { state, submitMission, notify, pushAchievements } = useGame();
  const [answers, setAnswers] = useState(() => (mission ? initialAnswers(mission) : {}));
  const [outcome, setOutcome] = useState(null); // { evaluation, reward }
  const [showReward, setShowReward] = useState(false);

  // Presenter shortcut: Shift + A fills the correct answers (ignored while typing in a field).
  useEffect(() => {
    if (!mission || outcome) return undefined;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 'a' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      setAnswers(correctAnswers(mission));
      notify('Demo autofill: correct answers filled in', 'info');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mission, outcome, notify]);

  const resultsById = useMemo(() => Object.fromEntries((outcome?.evaluation.results || []).map((r) => [r.taskId, r])), [outcome]);

  if (!mission) {
    return (
      <div className="card p-10 text-center">
        <p className="text-ink-300">Mission not found.</p>
        <Link to="/arena" className="btn-primary mt-4">Back to Arena</Link>
      </div>
    );
  }

  const cat = getCategory(mission.category);
  const alreadyDone = Boolean(state.completed[mission.id]) && !outcome;
  const isAnswered = (t) => {
    if (t.type === 'mcq') return answers[t.id] !== null;
    const v = String(answers[t.id] ?? '').trim();
    return v !== '' && (t.type !== 'code' || v !== String(t.starter ?? '').trim());
  };
  const answered = mission.tasks.filter(isAnswered).length;
  const canSubmit = answered === mission.tasks.length && !outcome;

  const submit = () => {
    const res = submitMission(mission, answers);
    setOutcome(res);
    // Achievement pop-ups follow the reward modal, or show right away if there is none.
    // On a boss mission, the reward modal waits for the health bar to finish draining.
    const hits = res.evaluation.results.reduce((n, r) => n + r.checks.filter((c) => c.passed).length, 0);
    const bossDelay = getBoss(mission.id) ? 350 + hits * HIT_MS + 1100 : 0;
    if (res.reward.xpEarned > 0) {
      if (bossDelay) setTimeout(() => setShowReward(true), bossDelay);
      else setShowReward(true);
    }
    else {
      pushAchievements(res.achievements);
      const later = (fn) => (bossDelay ? setTimeout(fn, bossDelay - 1000) : fn());
      if (res.evaluation.passed) {
        later(play.practice);
        notify('Passed! Practice mode, so no additional XP awarded', 'info');
      } else {
        later(play.fail);
        notify(`Score ${res.evaluation.score}%. You need ${PASS_THRESHOLD}% to pass`, 'warn');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const retry = () => { setAnswers(initialAnswers(mission)); setOutcome(null); };
  const ev = outcome?.evaluation;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/arena')} className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-100">
        <ArrowLeft className="h-4 w-4" /> Mission Arena
      </button>

      {/* Header */}
      <header className="card relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: cat.color }} />
        <div className="flex flex-wrap items-center gap-2">
          <CategoryTag id={mission.category} />
          <DifficultyPill level={mission.difficulty} />
          {alreadyDone && <span className="chip border-ok-500/30 bg-ok-500/10 text-ok-400"><CheckCircle2 className="h-3.5 w-3.5" /> Completed: practice mode, no XP</span>}
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">{mission.title}</h1>
        <p className="mt-2 max-w-3xl text-ink-400">{mission.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-300">
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-ink-500" /> {mission.minutes} min</span>
          <span className="flex items-center gap-1.5 font-semibold text-xp-400"><Zap className="h-4 w-4 fill-xp-500" /> {mission.xp} XP <span className="font-normal text-ink-500">(+{Math.round(mission.xp * 0.1)} for a perfect score)</span></span>
          <span className="flex items-center gap-1.5"><ListChecks className="h-4 w-4 text-ink-500" /> {mission.tasks.length} tasks · pass at {PASS_THRESHOLD}%</span>
        </div>
      </header>

      <BossBattle mission={mission} evaluation={outcome?.evaluation} />

      {/* Result banner */}
      {ev && (
        <section className={`card flex animate-pop-in flex-col gap-4 border p-5 sm:flex-row sm:items-center ${ev.passed ? 'border-ok-500/40' : 'border-bad-500/40'}`}>
          <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${ev.passed ? 'bg-ok-500/15' : 'bg-bad-500/15'}`}>
            {ev.passed ? <Trophy className="h-7 w-7 text-ok-400" /> : <XCircle className="h-7 w-7 text-bad-400" />}
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-white">
              {ev.passed ? 'Mission passed' : 'Not quite yet'} · {ev.score}%
            </div>
            <p className="text-sm text-ink-400">
              {ev.correct} of {ev.total} tasks correct.{' '}
              {outcome.reward.xpEarned > 0 && <span className="font-semibold text-xp-400">+{outcome.reward.xpEarned} XP awarded.</span>}
              {ev.passed && outcome.reward.alreadyCompleted && 'You already earned XP for this mission, so this run was practice.'}
              {!ev.passed && `See the Skill Coach below for exactly what to fix. You need ${PASS_THRESHOLD}%.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!ev.passed && <button className="btn-primary" onClick={retry}><RotateCcw className="h-4 w-4" /> Try again</button>}
            {ev.passed && (
              <>
                <button className="btn-ghost" onClick={() => navigate('/leaderboard')}><Trophy className="h-4 w-4" /> Leaderboard</button>
                <button className="btn-ghost" onClick={() => navigate('/passport')}><IdCard className="h-4 w-4" /> Passport</button>
                <button className="btn-primary" onClick={() => navigate(outcome.coach.next && !outcome.coach.next.retry ? `/arena/${outcome.coach.next.mission.id}` : '/arena')}>Next mission</button>
              </>
            )}
          </div>
        </section>
      )}

      {outcome && <SkillCoach report={outcome.coach} onRetry={() => { retry(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Brief */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="label">Scenario</div>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">{mission.scenario}</p>
          </div>
          {mission.snippet && (
            <div className="card overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-3 label">Code under review</div>
              <pre className="overflow-x-auto bg-[#0B0F1C] p-4 font-mono text-[12.5px] leading-6 text-ink-200"><code>{mission.snippet}</code></pre>
            </div>
          )}
          {mission.dataset && (
            <div className="card overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-3 label">Dataset · sales_week_42.csv</div>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs">
                  <thead><tr>{mission.dataset.columns.map((c) => <th key={c} className="px-3 py-2 text-left font-semibold text-ink-400">{c}</th>)}</tr></thead>
                  <tbody>
                    {mission.dataset.rows.map((r) => (
                      <tr key={r[0]} className="border-t border-white/[0.04]">
                        {r.map((v, i) => <td key={i} className={`px-3 py-2 ${v === null ? 'text-bad-400' : 'text-ink-200'}`}>{v === null ? 'NaN' : v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="card p-5">
            <div className="label">Instructions</div>
            <ol className="mt-3 space-y-2">
              {mission.instructions.map((s, i) => (
                <li key={s} className="flex gap-2.5 text-sm text-ink-300">
                  <span className="font-mono text-xs text-brand-400">{String(i + 1).padStart(2, '0')}</span> {s}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Tasks */}
        <section className="space-y-4">
          {mission.tasks.map((t, i) => (
            <TaskCard
              key={`${t.id}-${outcome ? 'r' : 'q'}`}
              task={t}
              index={i}
              answer={answers[t.id]}
              setAnswer={(v) => setAnswers((a) => ({ ...a, [t.id]: v }))}
              result={resultsById[t.id]}
              locked={Boolean(outcome)}
            />
          ))}

          {!outcome && (
            <div className="card sticky bottom-20 z-10 flex items-center justify-between gap-4 !bg-ink-900/95 p-4 shadow-2xl backdrop-blur-xl lg:bottom-4">
              <div className="flex items-center gap-2 text-sm text-ink-400">
                <Info className="h-4 w-4" /> {answered}/{mission.tasks.length} answered
              </div>
              <button className="btn-primary" disabled={!canSubmit} onClick={submit}>
                <Send className="h-4 w-4" /> Submit for evaluation
              </button>
            </div>
          )}
        </section>
      </div>

      {showReward && outcome && (
        <RewardModal reward={outcome.reward} mission={mission} onClose={() => { setShowReward(false); pushAchievements(outcome.achievements); }} />
      )}
    </div>
  );
}
