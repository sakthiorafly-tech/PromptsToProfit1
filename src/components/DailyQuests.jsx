import { CheckCircle2, ScrollText } from 'lucide-react';
import { Icon, ProgressBar } from './ui';

// Today's quests: a light daily habit loop. Derived from today's activity.
export default function DailyQuests({ quests }) {
  const done = quests.filter((q) => q.done).length;
  const all = done === quests.length;
  return (
    <section className={`card p-5 ${all ? 'border border-ok-500/30' : ''}`} aria-label="Today's quests">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-white"><ScrollText className="h-4 w-4 text-xp-400" /> Today’s quests</h2>
          <p className="mt-0.5 text-sm text-ink-400">{all ? 'All cleared. See you tomorrow!' : 'Resets at midnight'}</p>
        </div>
        <span className={`chip ${all ? 'border-ok-500/30 bg-ok-500/10 text-ok-400' : ''}`}>{done}/{quests.length}</span>
      </div>
      <ul className="space-y-2.5">
        {quests.map((q) => (
          <li key={q.id} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${q.done ? 'bg-ok-500/[0.06]' : 'bg-white/[0.02]'}`}>
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${q.color}1a` }}>
              <Icon name={q.icon} className="h-3.5 w-3.5" style={{ color: q.color }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-medium ${q.done ? 'text-ink-300 line-through decoration-ink-500' : 'text-ink-100'}`}>{q.label}</div>
              <div className="text-xs text-ink-500">{q.detail}</div>
              {q.progress !== undefined && !q.done && <ProgressBar value={q.progress} color={q.color} height={4} className="mt-1.5" />}
            </div>
            {q.done ? <CheckCircle2 className="quest-done mt-1 h-5 w-5 shrink-0 text-ok-400" /> : <span className="mt-1 h-5 w-5 shrink-0 rounded-full border-2 border-white/15" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
