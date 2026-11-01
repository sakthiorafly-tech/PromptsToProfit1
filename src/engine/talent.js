// Talent analytics for the College and Recruiter views. Every profile, simulated
// or live, is scored by the same functions as the student's own dashboard.
import { getSkillProgress, getStreak } from './gamification';
import { getSkillGaps, roleReadiness, readinessBand } from './coach';
import { TALENT_POOL } from '../data/cohort';
import { DEMO_STUDENT } from '../data/students';
import { CONCEPTS } from '../data/concepts';
import { getTitles } from './titles';

const DAY = 86400000;

export function profileFrom(base, state, lastActiveDays) {
  const skillList = getSkillProgress(state);
  const skills = Object.fromEntries(skillList.map((s) => [s.id, s.progress]));
  const roles = roleReadiness(skills);
  const best = roles[0];
  return {
    ...base,
    skills,
    skillList,
    roles,
    best,
    readiness: best.score,
    band: readinessBand(best.score),
    missions: Object.keys(state.completed).length,
    passed: new Set(Object.keys(state.completed)),
    titles: getTitles(Object.keys(state.completed)),
    gaps: getSkillGaps(state),
    lastActiveDays,
  };
}

let cachedPool = null;
const simulatedProfiles = () => {
  if (!cachedPool) cachedPool = TALENT_POOL.map((s) => profileFrom(s, s, s.lastActiveDays));
  return cachedPool;
};

export function liveStudentProfile(state) {
  const days = state.lastActiveDate ? Math.max(0, Math.round((Date.now() - new Date(`${state.lastActiveDate}T12:00:00`).getTime()) / DAY)) : 99;
  return { ...profileFrom({ ...DEMO_STUDENT, branch: 'CSE', openToWork: true, isMe: true }, state, days), streak: getStreak(state) };
}

// Full pool including the live demo student, ranked by readiness.
export function talentPool(state) {
  return [liveStudentProfile(state), ...simulatedProfiles()];
}

export function cohortFor(state, college) {
  return talentPool(state).filter((p) => p.college === college);
}

export function cohortAnalytics(cohort) {
  const n = cohort.length;
  const avg = (f) => Math.round(cohort.reduce((s, p) => s + f(p), 0) / n);
  const bands = { ready: 0, developing: 0, support: 0 };
  cohort.forEach((p) => { bands[p.band.id] += 1; });
  const active = cohort.filter((p) => p.lastActiveDays <= 7).length;

  // Concept gaps across the cohort: share of students with each open gap.
  const counts = new Map();
  cohort.forEach((p) => {
    new Set(p.gaps.map((g) => `${g.missionId}:${g.taskId}`)).forEach((k) => counts.set(k, (counts.get(k) || 0) + 1));
  });
  const conceptGaps = [...counts.entries()]
    .map(([k, c]) => {
      const [missionId, taskId] = k.split(':');
      return { key: k, missionId, taskId, name: CONCEPTS[missionId][taskId].name, count: c, pct: Math.round((c / n) * 100) };
    })
    .sort((a, b) => b.count - a.count);

  const skillAvg = cohort[0].skillList.map((s) => ({ ...s, avg: avg((p) => p.skills[s.id]) }));
  return {
    n,
    active,
    activePct: Math.round((active / n) * 100),
    avgReadiness: avg((p) => p.readiness),
    avgMissions: (cohort.reduce((s, p) => s + p.missions, 0) / n).toFixed(1),
    bands,
    readyPct: Math.round((bands.ready / n) * 100),
    conceptGaps,
    skillAvg,
  };
}

export function toCsv(rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return rows.map((r) => r.map(esc).join(',')).join('\n');
}

export function downloadCsv(filename, rows) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Titles for leaderboard peers, looked up from their simulated histories.
export function peerTitles(id) {
  const p = simulatedProfiles().find((x) => x.id === id);
  return p ? p.titles : [];
}
