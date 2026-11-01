import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, GraduationCap, Building2, User, Crown, School, Megaphone, Layers, Check, Minus, Info,
  Users, Rocket, Repeat, Globe2, Cpu, Play,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Logo } from '../components/ui';

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const STREAMS = [
  { icon: Crown, title: 'Student Premium', price: '₹149', per: '/ month', color: '#7C6CFF', points: ['Unlimited premium missions', 'Detailed solution walkthroughs', 'Shareable public Skill Passport link', 'Interview-prep mission tracks'] },
  { icon: School, title: 'College SaaS', price: '₹30,000', per: '/ year', color: '#2DD4BF', points: ['Cohort skill-readiness dashboard', 'Department-wise analytics', 'Placement-cell exports', 'Custom internal contests'] },
  { icon: Megaphone, title: 'Employer Challenges', price: '₹10,000', per: '/ campaign', color: '#FBBF24', points: ['Branded real-world challenge', 'Ranked, opt-in candidate shortlist', 'Skill-based discovery beyond CVs', 'Campus employer branding'] },
];

const COMPARE = [
  ['Real-world scenario missions', true, false, false],
  ['Gamified progression (XP, streaks, badges)', true, 'partial', false],
  ['Shareable skill evidence for recruiters', true, false, 'partial'],
  ['Personalised feedback, skill gaps & next-step coaching', true, 'partial', false],
  ['College-level readiness analytics', true, false, false],
  ['Employer-sponsored discovery', true, false, true],
];

function Slider({ label, value, setValue, min, max, step, format = (v) => v }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm"><span className="text-ink-300">{label}</span><span className="font-semibold text-white">{format(value)}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setValue(Number(e.target.value))} className="mt-2 w-full accent-[#7C6CFF]" />
    </label>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="label text-brand-300">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

const Mark = ({ v }) =>
  v === true ? <Check className="mx-auto h-5 w-5 text-ok-400" /> : v === 'partial' ? <span className="text-xs text-xp-400">Partial</span> : <Minus className="mx-auto h-4 w-4 text-ink-600" />;

export default function Business() {
  const { state, login } = useGame();
  const navigate = useNavigate();
  const [students, setStudents] = useState(500);
  const [colleges, setColleges] = useState(5);
  const [campaigns, setCampaigns] = useState(6);

  const studentRev = students * 149 * 12;
  const collegeRev = colleges * 30000;
  const employerRev = campaigns * 10000;
  const total = studentRev + collegeRev + employerRev;
  const parts = [
    { label: 'Student Premium', v: studentRev, color: '#7C6CFF' },
    { label: 'College SaaS', v: collegeRev, color: '#2DD4BF' },
    { label: 'Employer Challenges', v: employerRev, color: '#FBBF24' },
  ];

  const tryDemo = () => { login(); navigate('/dashboard'); };

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-ink-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={state.loggedIn ? '/dashboard' : '/'} className="flex items-center gap-3">
            <ArrowLeft className="h-4 w-4 text-ink-400" /><Logo />
          </Link>
          <button className="btn-primary" onClick={tryDemo}><Play className="h-4 w-4 fill-white" /> <span className="hidden sm:inline">Try the</span> demo</button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pb-6 pt-14 sm:px-6 lg:px-8">
          <div className="chip border-brand-500/30 bg-brand-500/10 text-brand-300">Business overview</div>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Turning practical skill into a <span className="text-brand-400">hiring signal</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-400">
            A three-sided platform: students build evidence, colleges measure readiness and employers discover talent.
          </p>
          <div className="mt-6 flex max-w-3xl gap-3 rounded-xl border border-xp-500/20 bg-xp-500/[0.06] p-4 text-sm text-ink-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-xp-400" />
            <p>All pricing on this page is an <b className="text-ink-100">illustrative, proposed assumption</b> that has not been validated commercially. SkillArena is a hackathon prototype with no users, partnerships, revenue or traction claimed.</p>
          </div>
        </div>
      </section>

      <Section eyebrow="01 · Problem" title="Degrees signal what was studied, not what can be done.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: 'Students', d: 'Theory-heavy learning leaves few ways to practise and prove applied skills on realistic problems. Motivation drops without visible progress.' },
            { t: 'Colleges', d: 'Placement cells lack an objective, continuous view of practical readiness across cohorts until it is too late to intervene.' },
            { t: 'Employers', d: 'Screening by CV keywords and GPA is noisy. Technical assessments come late in the funnel and are expensive to run.' },
          ].map((p) => (
            <div key={p.t} className="card p-5">
              <div className="font-semibold text-white">{p.t}</div>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="02 · Customers & value" title="Three customers, one shared source of truth.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: User, c: '#7C6CFF', t: 'Students', who: 'Engineering & CS undergraduates, especially in Tier-2/3 colleges', v: 'Engaging practice on real scenarios, instant feedback and a Skill Passport to show recruiters.' },
            { icon: GraduationCap, c: '#2DD4BF', t: 'Colleges', who: 'Placement cells, CS/IT departments, training & placement officers', v: 'Cohort-level skill readiness analytics and early identification of students who need support.', to: '/college' },
            { icon: Building2, c: '#FBBF24', t: 'Employers', who: 'Startups, mid-size tech firms and campus-hiring teams', v: 'Discover candidates by demonstrated performance on challenges they sponsor.', to: '/recruiter' },
          ].map(({ icon: I, c, t, who, v, to }) => (
            <div key={t} className="card p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${c}1f` }}><I className="h-5 w-5" style={{ color: c }} /></div>
              <div className="mt-4 font-semibold text-white">{t}</div>
              <div className="mt-1 text-xs text-ink-500">{who}</div>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">{v}</p>
              {to && (
                <button onClick={() => { login(); navigate(to); }} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: c }}>
                  <Play className="h-3.5 w-3.5" /> See the {t === 'Colleges' ? 'college' : 'recruiter'} view live
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="03 · Revenue model" title="Three complementary revenue streams.">
        <div className="grid gap-4 md:grid-cols-3">
          {STREAMS.map(({ icon: I, title, price, per, color, points }) => (
            <div key={title} className="card relative overflow-hidden p-6">
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
              <I className="h-6 w-6" style={{ color }} />
              <div className="mt-4 font-semibold text-white">{title}</div>
              <div className="mt-2 flex items-baseline gap-1"><span className="text-3xl font-bold text-white">{price}</span><span className="text-sm text-ink-400">{per}</span></div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-xp-400">Illustrative</div>
              <ul className="mt-5 space-y-2">
                {points.map((p) => <li key={p} className="flex gap-2 text-sm text-ink-300"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} /> {p}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Calculator */}
        <div className="card mt-6 grid gap-8 p-6 lg:grid-cols-2">
          <div>
            <div className="font-semibold text-white">Illustrative annual revenue calculator</div>
            <p className="mt-1 text-sm text-ink-400">Adjust the hypothetical inputs to explore the model. These are scenario inputs, not forecasts or targets.</p>
            <div className="mt-6 space-y-5">
              <Slider label="Premium students (monthly subscribers)" value={students} setValue={setStudents} min={0} max={10000} step={100} format={(v) => v.toLocaleString('en-IN')} />
              <Slider label="College SaaS subscriptions" value={colleges} setValue={setColleges} min={0} max={100} step={1} />
              <Slider label="Employer campaigns per year" value={campaigns} setValue={setCampaigns} min={0} max={200} step={1} />
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-white/[0.06] bg-ink-950/50 p-6">
            <div className="label">Hypothetical annual revenue</div>
            <div className="mt-2 text-4xl font-extrabold tracking-tight text-white tabular-nums">{inr(total)}</div>
            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/[0.05]">
              {parts.map((p) => <div key={p.label} style={{ width: total ? `${(p.v / total) * 100}%` : 0, background: p.color }} className="transition-[width] duration-500" />)}
            </div>
            <div className="mt-4 space-y-2">
              {parts.map((p) => (
                <div key={p.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-300"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} /> {p.label}</span>
                  <span className="font-semibold text-ink-100 tabular-nums">{inr(p.v)}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 flex gap-1.5 text-[11px] text-ink-500"><Info className="h-3.5 w-3.5 shrink-0" /> Gross figures before costs, taxes, churn or discounts. For discussion only.</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="04 · Go-to-market" title="Customer acquisition strategy.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, t: 'Campus ambassadors', d: 'Student champions run inter-college arena contests and coding-club events.' },
            { icon: School, t: 'College pilots', d: 'Free semester-long pilots for placement cells, converting to SaaS on demonstrated value.' },
            { icon: Megaphone, t: 'Employer-sponsored contests', d: 'Sponsored challenges bring employer brands in front of motivated students.' },
            { icon: Repeat, t: 'Product-led virality', d: 'Shareable Skill Passports and leaderboards create organic peer-to-peer growth.' },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="card p-5"><I className="h-5 w-5 text-brand-300" /><div className="mt-3 font-semibold text-white">{t}</div><p className="mt-1.5 text-sm text-ink-400">{d}</p></div>
          ))}
        </div>
      </Section>

      <Section eyebrow="05 · Scalability" title="Built to scale content, not headcount.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Cpu, t: 'Automated evaluation', d: 'Deterministic, test-based scoring keeps marginal cost per attempt near zero.' },
            { icon: Layers, t: 'Mission templates', d: 'Reusable formats (debug, optimize, analyze) let new skills and employer challenges launch fast.' },
            { icon: Globe2, t: 'Multi-tenant SaaS', d: 'One platform serves many colleges and employers, with regional-language content as a later expansion.' },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="card p-5"><I className="h-5 w-5 text-ok-400" /><div className="mt-3 font-semibold text-white">{t}</div><p className="mt-1.5 text-sm text-ink-400">{d}</p></div>
          ))}
        </div>
      </Section>

      <Section eyebrow="06 · Differentiation" title="Where SkillArena fits.">
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-4 text-left label">Capability</th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-brand-300">SkillArena</th>
                <th className="px-5 py-4 text-center label">Coding-practice sites</th>
                <th className="px-5 py-4 text-center label">Job portals</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([cap, a, b, c]) => (
                <tr key={cap} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-5 py-3.5 text-ink-200">{cap}</td>
                  <td className="bg-brand-500/[0.06] px-5 py-3.5 text-center"><Mark v={a} /></td>
                  <td className="px-5 py-3.5 text-center"><Mark v={b} /></td>
                  <td className="px-5 py-3.5 text-center"><Mark v={c} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-500">Comparison against generic product categories as a qualitative positioning view, not a claim about any specific competitor.</p>
      </Section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <Rocket className="h-8 w-8 text-brand-400" />
          <h2 className="text-2xl font-bold text-white">See the product in action</h2>
          <p className="max-w-md text-ink-400">Walk through the full student journey: mission, evaluation, XP, badges, leaderboard and Skill Passport.</p>
          <button className="btn-primary px-6 py-3" onClick={tryDemo}><Play className="h-4 w-4 fill-white" /> Launch the demo</button>
        </div>
      </section>
    </div>
  );
}
