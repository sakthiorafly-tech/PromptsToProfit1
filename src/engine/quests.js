// Daily quests: a small habit loop, derived from today's raw facts. They reset
// at midnight and never change XP, so mission rewards stay exactly the same.
import { dayKey } from './gamification';

export const QUEST_XP_TARGET = 200;

export function getDailyQuests(state, now = new Date()) {
  const today = dayKey(now);
  const isToday = (iso) => dayKey(iso) === today;
  const todays = state.attempts.filter((a) => isToday(a.at));
  const xpToday = Object.values(state.completed).filter((c) => isToday(c.completedAt)).reduce((s, c) => s + c.xp, 0);
  const cleared = todays.some((a) => a.passed);
  // A comeback: passing a mission today that you had failed on an earlier attempt.
  const comeback = todays.some((a) => a.passed && state.attempts.some((b) => b.missionId === a.missionId && !b.passed && new Date(b.at) < new Date(a.at)));
  const streakKept = state.lastActiveDate === today;

  return [
    { id: 'streak', label: 'Keep your streak alive', detail: streakKept ? `${state.streak}-day streak secured` : 'Pass any mission today', done: streakKept, icon: 'Flame', color: '#FB923C' },
    { id: 'clear', label: 'Clear a mission', detail: cleared ? 'Mission cleared' : 'Score 70% or more on any mission', done: cleared, icon: 'Swords', color: '#9A8CFF' },
    { id: 'xp', label: `Earn ${QUEST_XP_TARGET} XP`, detail: `${Math.min(xpToday, QUEST_XP_TARGET)} / ${QUEST_XP_TARGET} XP today`, done: xpToday >= QUEST_XP_TARGET, progress: Math.min(100, Math.round((xpToday / QUEST_XP_TARGET) * 100)), icon: 'Zap', color: '#FBBF24' },
    { id: 'comeback', label: 'Make a comeback', detail: comeback ? 'Fixed a mission you missed' : 'Retry a failed mission and pass it', done: comeback, icon: 'RotateCcw', color: '#4ADE80' },
  ];
}
