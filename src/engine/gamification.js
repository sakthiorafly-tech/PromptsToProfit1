// Centralized, pure gamification logic. Every screen derives its numbers from here.
import { LEVELS } from '../data/levels';
import { BADGES } from '../data/badges';
import { MISSIONS, CATEGORIES } from '../data/missions';
import { PEERS, DEMO_STUDENT } from '../data/students';

export const PASS_THRESHOLD = 70; // percent
export const PERFECT_BONUS = 0.1; // +10% XP for a 100% score

// ── Dates ───────────────────────────────────────────────────────────
export const dayKey = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
export const daysAgo = (n, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
};
const dayDiff = (a, b) => Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400000);

// ── XP & levels ─────────────────────────────────────────────────────
export function calculateXp(mission, scorePct) {
  if (scorePct < PASS_THRESHOLD) return 0;
  const bonus = scorePct === 100 ? Math.round(mission.xp * PERFECT_BONUS) : 0;
  return mission.xp + bonus;
}

export function getTotalXp(state) {
  return Object.values(state.completed).reduce((sum, c) => sum + c.xp, 0);
}

export function getLevel(xp) {
  const index = LEVELS.findIndex((l) => xp >= l.min && xp <= l.max);
  const level = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const progress = next ? Math.round(((xp - level.min) / (next.min - level.min)) * 100) : 100;
  return { ...level, index, next, progress, xpToNext: next ? next.min - xp : 0 };
}

// ── Evaluation (deterministic, no external API) ─────────────────────
const normalize = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, '').trim();

export function evaluateTask(task, answer) {
  if (task.type === 'mcq') {
    const passed = answer === task.answer;
    return { passed, checks: [{ label: passed ? 'Correct option selected' : 'Incorrect option', passed }] };
  }
  if (task.type === 'input') {
    const passed = task.accept.map(normalize).includes(normalize(answer));
    return { passed, checks: [{ label: passed ? 'Answer matches expected value' : 'Answer does not match', passed }] };
  }
  if (task.type === 'code') {
    const code = String(answer ?? '');
    const checks = task.checks.map((c) => {
      const hit = c.pattern.test(code);
      return { label: c.label, passed: c.mustNot ? !hit : hit };
    });
    return { passed: checks.every((c) => c.passed), checks };
  }
  return { passed: false, checks: [] };
}

export function evaluateMission(mission, answers) {
  const results = mission.tasks.map((t) => ({ taskId: t.id, ...evaluateTask(t, answers[t.id]) }));
  const correct = results.filter((r) => r.passed).length;
  const score = Math.round((correct / mission.tasks.length) * 100);
  return { results, correct, total: mission.tasks.length, score, passed: score >= PASS_THRESHOLD };
}

// ── Streak ──────────────────────────────────────────────────────────
// Effective streak: still alive if last activity was today or yesterday.
export function getStreak(state, now = new Date()) {
  if (!state.lastActiveDate) return 0;
  const gap = dayDiff(state.lastActiveDate, dayKey(now));
  return gap <= 1 ? state.streak : 0;
}

function bumpStreak(state, now) {
  const today = dayKey(now);
  if (state.lastActiveDate === today) return { streak: state.streak, lastActiveDate: today };
  const gap = state.lastActiveDate ? dayDiff(state.lastActiveDate, today) : Infinity;
  return { streak: gap === 1 ? state.streak + 1 : 1, lastActiveDate: today };
}

// ── Badges ──────────────────────────────────────────────────────────
const BADGE_RULES = {
  'first-mission': (s) => Object.keys(s.completed).length >= 1,
  'five-missions': (s) => Object.keys(s.completed).length >= 5,
  'ten-missions': (s) => Object.keys(s.completed).length >= 10,
  'java-master': (s) => MISSIONS.filter((m) => m.category === 'java').every((m) => s.completed[m.id]),
  'sql-explorer': (s) => MISSIONS.filter((m) => m.category === 'sql' && s.completed[m.id]).length >= 2,
  'streak-7': (s) => s.streak >= 7,
};

export function checkBadges(state) {
  return BADGES.filter((b) => !state.badges[b.id] && BADGE_RULES[b.id](state)).map((b) => b.id);
}

// ── Mission completion ──────────────────────────────────────────────
// Returns { state, reward }. XP is awarded once per mission and only on a pass.
export function completeMission(state, mission, evaluation, now = new Date()) {
  const missed = evaluation.results.filter((r) => !r.passed).map((r) => r.taskId);
  const attempt = { missionId: mission.id, score: evaluation.score, passed: evaluation.passed, missed, at: now.toISOString() };
  let next = { ...state, attempts: [attempt, ...state.attempts].slice(0, 100) };

  const alreadyCompleted = Boolean(state.completed[mission.id]);
  if (!evaluation.passed || alreadyCompleted) {
    return { state: next, reward: { xpEarned: 0, alreadyCompleted, passed: evaluation.passed, newBadges: [], levelUp: null } };
  }

  const prevLevel = getLevel(getTotalXp(state));
  const xpEarned = calculateXp(mission, evaluation.score);
  next = {
    ...next,
    ...bumpStreak(state, now),
    completed: { ...state.completed, [mission.id]: { score: evaluation.score, xp: xpEarned, completedAt: now.toISOString() } },
  };

  const newBadges = checkBadges(next);
  next = { ...next, badges: { ...next.badges, ...Object.fromEntries(newBadges.map((id) => [id, now.toISOString()])) } };

  const newLevel = getLevel(getTotalXp(next));
  const prevRank = getRank(state, 'all');
  const newRank = getRank(next, 'all');
  return {
    state: next,
    reward: {
      xpEarned,
      perfect: evaluation.score === 100,
      passed: true,
      alreadyCompleted: false,
      newBadges,
      levelUp: newLevel.index > prevLevel.index ? { from: prevLevel, to: newLevel } : null,
      totalXp: getTotalXp(next),
      level: newLevel,
      prevRank,
      newRank,
      streak: next.streak,
    },
  };
}

// ── Weekly XP & activity ────────────────────────────────────────────
export function getWeeklyXp(state, now = new Date()) {
  const cutoff = daysAgo(6, now);
  cutoff.setHours(0, 0, 0, 0);
  return Object.values(state.completed)
    .filter((c) => new Date(c.completedAt) >= cutoff)
    .reduce((s, c) => s + c.xp, 0);
}

export function getWeeklyActivity(state, now = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i, now);
    const key = dayKey(d);
    const xp = Object.values(state.completed).filter((c) => dayKey(c.completedAt) === key).reduce((s, c) => s + c.xp, 0);
    const attempts = state.attempts.filter((a) => dayKey(a.at) === key).length;
    return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), date: key, xp, attempts, today: i === 6 };
  });
}

// ── Leaderboard ─────────────────────────────────────────────────────
export function buildLeaderboard(state, mode = 'all') {
  const me = {
    ...DEMO_STUDENT,
    xp: getTotalXp(state),
    weeklyXp: getWeeklyXp(state),
    missions: Object.keys(state.completed).length,
    isMe: true,
  };
  const key = mode === 'weekly' ? 'weeklyXp' : 'xp';
  return [...PEERS, me]
    .sort((a, b) => b[key] - a[key] || (a.isMe ? -1 : b.isMe ? 1 : 0))
    .slice(0, 10)
    .map((s, i) => ({ ...s, rank: i + 1, score: s[key], level: getLevel(s.xp) }));
}

export function getRank(state, mode = 'all') {
  return buildLeaderboard(state, mode).find((s) => s.isMe)?.rank ?? null;
}

// ── Skill progress ──────────────────────────────────────────────────
export function getSkillProgress(state) {
  return CATEGORIES.map((cat) => {
    const missions = MISSIONS.filter((m) => m.category === cat.id);
    const done = missions.filter((m) => state.completed[m.id]);
    const totalXp = missions.reduce((s, m) => s + m.xp, 0);
    const earnedXp = done.reduce((s, m) => s + Math.min(state.completed[m.id].xp, m.xp), 0);
    const avgScore = done.length ? Math.round(done.reduce((s, m) => s + state.completed[m.id].score, 0) / done.length) : 0;
    return {
      ...cat,
      completed: done.length,
      total: missions.length,
      progress: Math.round((earnedXp / totalXp) * 100),
      avgScore,
      xp: done.reduce((s, m) => s + state.completed[m.id].xp, 0),
    };
  });
}

export function getHistory(state) {
  return Object.entries(state.completed)
    .map(([id, c]) => ({ mission: MISSIONS.find((m) => m.id === id), ...c }))
    .filter((h) => h.mission)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}
