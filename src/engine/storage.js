import { dayKey, daysAgo } from './gamification';

export const STORAGE_KEY = 'skillarena:v1';

const at = (n, hour) => {
  const d = daysAgo(n);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};

// Seed state: 4 missions done (375 XP, Beginner), 6-day streak last active yesterday.
// Passing one more mission triggers level-up + "5 Missions" + "7-Day Streak" at once.
export function createSeedState() {
  return {
    version: 1,
    loggedIn: false,
    completed: {
      'ps-bigo': { score: 100, xp: 75, completedAt: at(5, 19) },
      'py-logs': { score: 100, xp: 100, completedAt: at(3, 21) },
      'sql-joins': { score: 100, xp: 100, completedAt: at(2, 18) },
      'react-state': { score: 100, xp: 100, completedAt: at(1, 20) },
    },
    attempts: [
      { missionId: 'react-state', score: 100, passed: true, at: at(1, 20) },
      { missionId: 'sql-joins', score: 100, passed: true, at: at(2, 18) },
      { missionId: 'sql-joins', score: 33, passed: false, missed: ['t2', 't3'], at: at(2, 17) },
      { missionId: 'py-logs', score: 100, passed: true, at: at(3, 21) },
      { missionId: 'ps-bigo', score: 100, passed: true, at: at(5, 19) },
    ],
    streak: 6,
    lastActiveDate: dayKey(daysAgo(1)),
    badges: { 'first-mission': at(5, 19) },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1 && parsed.completed) return parsed;
    }
  } catch {
    /* storage unavailable or corrupted: fall back to seed */
  }
  return createSeedState();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private-mode errors */
  }
}
