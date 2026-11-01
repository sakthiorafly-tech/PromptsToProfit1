import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Swords, Trophy, IdCard, Sparkles, Zap, Flame, GraduationCap, Building2, CheckCircle2, Play, Presentation, Clock,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Logo, Avatar, ProgressBar, DifficultyPill, CategoryTag } from '../components/ui';
import { MISSIONS } from '../data/missions';
import ArenaBackground from '../components/ArenaBackground';

const FEATURES = [
  { icon: Swords, title: 'Real-world missions', text: 'Debug a banking system, speed up a slow query or fix a broken React component. Practical work, not trivia.', color: '#7C6CFF' },
  { icon: Sparkles, title: 'Skill Coach', text: 'Instant feedback on every answer, the exact skill gaps to close and the best next mission for your target role.', color: '#9A8CFF' },
  { icon: Trophy, title: 'XP, badges & leaderboards', text: 'Verified missions earn XP, levels and achievements. Weekly rankings give peers a friendly reason to compete.', color: '#FBBF24' },
  { icon: IdCard, title: 'Skill Passport', text: 'A shareable profile of demonstrated challenge performance that recruiters can actually read.', color: '#2DD4BF' },
];

const STEPS = [
  { n: '01', title: 'Play', text: 'Pick a mission in Java, Python, SQL, React or Problem Solving.' },
  { n: '02', title: 'Prove', text: 'Submit and the Skill Coach evaluates instantly: what you nailed, what to fix, what to do next.' },
  { n: '03', title: 'Get Hired', text: 'Your Skill Passport and role readiness are visible to colleges and opted-in recruiters.' },
];

export default function Landing() {
  const { login, state, student, xp, level, streak } = useGame();
  const navigate = useNavigate();
  const enter = () => { login(); navigate('/dashboard'); };
  const featured = MISSIONS.find((m) => m.id === 'java-bank');

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <ArenaBackground />
      <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/business" className="btn hidden px-3 text-ink-300 hover:text-white sm:inline-flex">
            <Presentation className="h-4 w-4" /> Business model
          </Link>
          <button onClick={enter} className="btn-ghost">{state.loggedIn ? 'Open dashboard' : 'Demo login'}</button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pt-16">
        <div className="animate-fade-up">
          <span className="chip border-brand-500/30 bg-brand-500/10 text-brand-300">
            <Sparkles className="h-3.5 w-3.5" /> Built for the IIT Gandhinagar Hackathon
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Play. Prove.<br />
            <span className="text-brand-400">Get Hired.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            SkillArena turns real engineering problems into missions. Students earn XP and a record of what they can actually do.
            Colleges see practical readiness, and employers discover talent through challenges instead of CV keywords.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={enter} className="btn-primary px-6 py-3 text-base">
              <Play className="h-4 w-4 fill-white" /> Enter the Arena (Demo)
            </button>
            <Link to="/business" className="btn-ghost px-6 py-3 text-base">
              See the business model <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-400">
            {['No sign-up needed', '15 real-world missions', 'Runs fully offline'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-ok-400" /> {t}</span>
            ))}
          </div>
        </div>

        {/* Product preview (live from state) */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="card relative overflow-hidden p-5">
            <div className="flex items-center gap-3">
              <Avatar name={student.name} color={student.color} size={44} />
              <div className="flex-1">
                <div className="font-semibold text-white">{student.name}</div>
                <div className="text-xs text-ink-400">{student.college} · Demo profile</div>
              </div>
              <div className="chip border-streak-500/25 bg-streak-500/10 text-streak-400"><Flame className="h-3.5 w-3.5 fill-streak-500" /> {streak}</div>
            </div>
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-ink-950/60 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="label">Level</div>
                  <div className="mt-1 text-xl font-bold" style={{ color: level.color }}>{level.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{xp.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-xp-400">total XP</div>
                </div>
              </div>
              <ProgressBar value={level.progress} color={level.color} className="mt-3" />
            </div>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-ink-950/60 p-4">
              <div className="flex items-center justify-between">
                <CategoryTag id={featured.category} />
                <DifficultyPill level={featured.difficulty} />
              </div>
              <div className="mt-3 font-semibold text-white">{featured.title}</div>
              <div className="mt-1 text-sm text-ink-400">{featured.description}</div>
              <div className="mt-3 flex items-center gap-4 text-xs text-ink-400">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featured.minutes} min</span>
                <span className="flex items-center gap-1 font-semibold text-xp-400"><Zap className="h-3.5 w-3.5 fill-xp-500" /> +{featured.xp} XP</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 hidden animate-float items-center gap-3 rounded-2xl border border-white/10 bg-ink-850 px-4 py-3 shadow-2xl sm:flex">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-xp-500/15"><Trophy className="h-5 w-5 text-xp-400" /></div>
            <div>
              <div className="text-xs text-ink-400">Badge unlocked</div>
              <div className="text-sm font-semibold text-white">SQL Explorer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="label text-brand-300">Why SkillArena</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Practical skills, made visible.</h2>
          <p className="mt-3 text-ink-400">Grades show what a student studied. SkillArena shows what they can do.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: I, title, text, color }) => (
            <div key={title} className="card card-hover p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}1f` }}>
                <I className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works + audiences */}
      <section className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="card p-6 lg:col-span-2">
          <div className="label">How it works</div>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="font-mono text-sm text-brand-400">{s.n}</div>
                <div className="mt-1 text-lg font-semibold text-white">{s.title}</div>
                <p className="mt-1.5 text-sm text-ink-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <button onClick={() => { login(); navigate('/college'); }} className="card card-hover flex gap-3 p-5 text-left">
            <GraduationCap className="h-5 w-5 shrink-0 text-[#2DD4BF]" />
            <div className="flex-1"><div className="font-semibold text-white">For colleges</div><p className="mt-1 text-sm text-ink-400">Batch-level placement readiness, top skill gaps and who needs support, before placement season.</p></div>
            <ArrowRight className="h-4 w-4 shrink-0 self-center text-ink-500" />
          </button>
          <button onClick={() => { login(); navigate('/recruiter'); }} className="card card-hover flex gap-3 p-5 text-left">
            <Building2 className="h-5 w-5 shrink-0 text-xp-400" />
            <div className="flex-1"><div className="font-semibold text-white">For employers</div><p className="mt-1 text-sm text-ink-400">Search candidates by proven mission performance and sponsor branded challenges.</p></div>
            <ArrowRight className="h-4 w-4 shrink-0 self-center text-ink-500" />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="card flex flex-col items-center gap-5 overflow-hidden p-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Ready to enter the Arena?</h2>
          <p className="max-w-lg text-ink-400">Log in as our demo student and complete a mission end to end: evaluation, XP, badges, leaderboard and passport.</p>
          <button onClick={enter} className="btn-primary px-6 py-3 text-base">Start the demo <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-8 text-center text-xs text-ink-500">
        SkillArena hackathon prototype · All student profiles and statistics are simulated demo data.
      </footer>
    </div>
  );
}
