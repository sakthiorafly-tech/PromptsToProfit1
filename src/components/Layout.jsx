import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Swords, Trophy, IdCard, Presentation, Flame, Zap, LogOut, RotateCcw, GraduationCap, Building2, User, Volume2, VolumeX } from 'lucide-react';
import { play, isSoundOn, setSoundOn, onSoundChange } from '../audio/sfx';
import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Avatar, Logo, ProgressBar, Toast } from './ui';
import ArenaBackground from './ArenaBackground';
import AchievementToast from './AchievementToast';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/arena', label: 'Mission Arena', short: 'Arena', icon: Swords },
  { to: '/leaderboard', label: 'Leaderboard', short: 'Ranks', icon: Trophy },
  { to: '/passport', label: 'Skill Passport', short: 'Passport', icon: IdCard },
];

const PARTNER_NAV = [
  { to: '/college', label: 'College Dashboard', icon: GraduationCap },
  { to: '/recruiter', label: 'Recruiter Search', icon: Building2 },
];

const VIEWS = [
  { id: 'student', label: 'Student', icon: User, to: '/dashboard', color: '#9A8CFF' },
  { id: 'college', label: 'College', icon: GraduationCap, to: '/college', color: '#2DD4BF' },
  { id: 'recruiter', label: 'Recruiter', icon: Building2, to: '/recruiter', color: '#FBBF24' },
];

// One product, three customers: switch the lens on the same live data.
function ViewSwitcher({ className = '' }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = pathname.startsWith('/college') ? 'college' : pathname.startsWith('/recruiter') ? 'recruiter' : 'student';
  return (
    <div className={`flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1 ${className}`} role="tablist" aria-label="Viewing as">
      <span className="hidden px-2 text-[11px] font-medium text-ink-500 xl:inline">Viewing as</span>
      {VIEWS.map(({ id, label, icon: I, to, color }) => {
        const active = current === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => { if (!active) play.tick(); navigate(to); }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${active ? 'bg-white/[0.08] text-white' : 'text-ink-400 hover:text-ink-100'}`}
          >
            <I className="h-3.5 w-3.5" style={{ color: active ? color : undefined }} /> {label}
          </button>
        );
      })}
    </div>
  );
}

function SoundToggle() {
  const [on, setOn] = useState(isSoundOn());
  useEffect(() => onSoundChange(setOn), []);
  return (
    <button
      className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-white/5 hover:text-ink-100"
      onClick={() => setSoundOn(!on)}
      aria-pressed={on}
      aria-label={on ? 'Mute sound effects' : 'Turn sound effects on'}
      title={on ? 'Sound on' : 'Sound off'}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}

function ResetButton({ className = '', compact = false }) {
  const { resetDemo } = useGame();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  // Go to a fresh dashboard so no page keeps showing results from before the reset.
  const doReset = () => { resetDemo(); setConfirm(false); navigate('/dashboard'); window.scrollTo(0, 0); };
  if (confirm) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button className="btn bg-bad-500/15 px-3 py-1.5 text-xs text-bad-400 hover:bg-bad-500/25" onClick={doReset} autoFocus>
          Confirm reset
        </button>
        <button className="btn px-2 py-1.5 text-xs text-ink-400 hover:text-ink-200" onClick={() => setConfirm(false)}>Cancel</button>
      </div>
    );
  }
  return (
    <button className={`btn px-3 py-1.5 text-xs text-ink-400 hover:bg-white/5 hover:text-ink-100 ${className}`} onClick={() => setConfirm(true)} title="Restore the demo starting state">
      <RotateCcw className="h-3.5 w-3.5" /> <span className={`whitespace-nowrap ${compact ? "sr-only" : ""}`}>Reset demo</span>
    </button>
  );
}

export default function Layout() {
  const { student, xp, level, streak, logout } = useGame();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tone = pathname.startsWith('/college') ? 'college' : pathname.startsWith('/recruiter') ? 'recruiter' : 'student';

  return (
    <div className="min-h-screen bg-ink-950">
      <ArenaBackground tone={tone} />
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-ink-950/95 px-4 py-5 lg:flex">
        <div className="px-2"><Logo /></div>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: I }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => play.tick()}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-500/10 text-white shadow-[inset_0_0_0_1px_rgba(124,108,255,0.25)]' : 'text-ink-400 hover:bg-white/[0.04] hover:text-ink-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <I className={`h-[18px] w-[18px] ${isActive ? 'text-brand-300' : ''}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
          <div className="mb-1 mt-5 px-3 label">Paying customers</div>
          {PARTNER_NAV.map(({ to, label, icon: I }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => play.tick()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-500/10 text-white shadow-[inset_0_0_0_1px_rgba(124,108,255,0.25)]' : 'text-ink-400 hover:bg-white/[0.04] hover:text-ink-100'
                }`
              }
            >
              <I className="h-[18px] w-[18px]" /> {label}
            </NavLink>
          ))}
          <div className="my-3 h-px bg-white/[0.06]" />
          <NavLink to="/business" onClick={() => play.tick()} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-400 transition hover:bg-white/[0.04] hover:text-ink-100">
            <Presentation className="h-[18px] w-[18px]" /> Business Overview
          </NavLink>
        </nav>

        <div className="mt-auto space-y-3">
          <div className="card p-3.5">
            <div className="flex items-center gap-3">
              <Avatar name={student.name} color={student.color} size={38} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{student.name}</div>
                <div className="text-xs" style={{ color: level.color }}>{level.name}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-ink-400">
              <span>{xp.toLocaleString('en-IN')} XP</span>
              <span>{level.next ? `${level.xpToNext} to ${level.next.name}` : 'Max level'}</span>
            </div>
            <ProgressBar value={level.progress} color={level.color} height={6} className="mt-1.5" />
          </div>
          <div className="flex items-center justify-between">
            <ResetButton />
            <button className="btn px-3 py-1.5 text-xs text-ink-400 hover:bg-white/5 hover:text-ink-100" onClick={() => { logout(); navigate('/'); }}>
              <LogOut className="h-3.5 w-3.5" /> Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="relative z-10 lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden"><Logo compact /></div>
            <ViewSwitcher className="hidden md:flex" />
            <div className="flex items-center gap-2">
              <div className="chip border-streak-500/25 bg-streak-500/10 text-streak-400" title="Daily streak">
                <Flame className="h-3.5 w-3.5 fill-streak-500" /> {streak} day{streak === 1 ? '' : 's'}
              </div>
              <div className="chip border-xp-500/25 bg-xp-500/10 text-xp-400" title="Total XP">
                <Zap className="h-3.5 w-3.5 fill-xp-500" /> {xp.toLocaleString('en-IN')} XP
              </div>
              <SoundToggle />
              <div className="lg:hidden"><ResetButton className="!px-2" compact /></div>
              <button className="lg:hidden" onClick={() => navigate('/passport')} aria-label="Open Skill Passport">
                <Avatar name={student.name} color={student.color} size={32} />
              </button>
            </div>
          </div>
        </header>

        <div className="border-b border-white/[0.06] px-4 py-2 md:hidden"><ViewSwitcher /></div>

        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Bottom tabs (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/[0.06] bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {NAV.map(({ to, label, short, icon: I }) => (
          <NavLink key={to} to={to} onClick={() => play.tick()} className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${isActive ? 'text-brand-300' : 'text-ink-500'}`}>
            <I className="h-5 w-5" />
            {short || label}
          </NavLink>
        ))}
      </nav>

      <Toast />
      <AchievementToast />
    </div>
  );
}
