// Skill Coach: a deterministic, rule-based evaluator that turns task results
// into feedback, skill gaps, role readiness and a next-mission recommendation.
// No external AI API. The interface is designed so a model-backed coach could
// replace buildCoachReport() later without touching the UI.
import { MISSIONS, CATEGORIES, getMission } from '../data/missions';
import { getConcept, ROLES } from '../data/concepts';
import { getSkillProgress, getLevel, getTotalXp } from './gamification';

const DIFF_RANK = { Easy: 0, Medium: 1, Hard: 2 };

// ── Skill vectors & role readiness ─────────────────────────────────
export const skillVector = (state) => Object.fromEntries(getSkillProgress(state).map((s) => [s.id, s.progress]));

export function roleReadiness(skills) {
  return ROLES.map((r) => ({
    ...r,
    score: Math.round(Object.entries(r.weights).reduce((sum, [cat, w]) => sum + (skills[cat] || 0) * w, 0)),
  })).sort((a, b) => b.score - a.score);
}

export function readinessBand(score) {
  if (score >= 70) return { id: 'ready', label: 'Job-ready', color: '#4ADE80' };
  if (score >= 40) return { id: 'developing', label: 'Developing', color: '#FBBF24' };
  return { id: 'support', label: 'Needs support', color: '#F87171' };
}

// ── Skill gaps ─────────────────────────────────────────────────────
// A gap is a concept missed in the latest attempt of a mission. Passing the
// concept on a later attempt closes it.
export function getSkillGaps(state) {
  const latest = new Map();
  for (const a of state.attempts) if (!latest.has(a.missionId)) latest.set(a.missionId, a); // attempts are newest-first
  const gaps = [];
  for (const [missionId, a] of latest) {
    const mission = getMission(missionId);
    if (!mission || !a.missed?.length) continue;
    for (const taskId of a.missed) gaps.push({ missionId, taskId, category: mission.category, mission, ...getConcept(missionId, taskId) });
  }
  return gaps;
}

// ── Recommendation ─────────────────────────────────────────────────
export function recommendNext(state, { exclude = [] } = {}) {
  const skills = getSkillProgress(state);
  const byCat = Object.fromEntries(skills.map((s) => [s.id, s]));
  const gaps = getSkillGaps(state);
  const gapCats = new Set(gaps.map((g) => g.category));
  const levelIdx = getLevel(getTotalXp(state)).index; // 0 Beginner … 4 Master
  const topRole = roleReadiness(skillVector(state))[0];

  const candidates = MISSIONS.filter((m) => !state.completed[m.id] && !exclude.includes(m.id));
  if (!candidates.length) return null;

  const scored = candidates.map((m) => {
    const cat = byCat[m.category];
    const doneInCat = cat.completed;
    // Difficulty fit: step up one level from what has been completed in this category.
    const maxDone = Math.max(-1, ...MISSIONS.filter((x) => x.category === m.category && state.completed[x.id]).map((x) => DIFF_RANK[x.difficulty]));
    const target = Math.min(2, Math.max(maxDone + 1, levelIdx >= 2 ? 1 : 0));
    const fit = 30 - Math.abs(DIFF_RANK[m.difficulty] - target) * 15;
    const weakness = (100 - cat.progress) * 0.35;
    const ownGap = gaps.find((g) => g.missionId === m.id);
    const gapBonus = ownGap ? 40 : gapCats.has(m.category) ? 10 : 0;
    const roleBonus = (topRole.weights[m.category] || 0) * 30;
    const score = fit + weakness + gapBonus + roleBonus + (m.featured ? 4 : 0);

    let reason;
    const catGap = gaps.find((g) => g.category === m.category);
    if (ownGap) reason = `Unfinished business: you missed ${ownGap.name} here last time. Retry with the coach's tips to close the gap.`;
    else if (catGap) reason = `Builds your ${cat.name} fundamentals while you work on your ${catGap.name} gap.`;
    else if (doneInCat === 0) reason = `You haven't proven any ${cat.name} skills yet. It carries ${Math.round((topRole.weights[m.category] || 0.1) * 100)}% weight for ${topRole.name} roles.`;
    else if (DIFF_RANK[m.difficulty] > maxDone) reason = `A step up to ${m.difficulty} after your ${cat.name} wins, and it builds on what you've already proven.`;
    else reason = `Broadens your ${cat.name} coverage, currently ${cat.progress}%.`;
    return { mission: m, score, reason };
  });
  return scored.sort((a, b) => b.score - a.score)[0];
}

// ── Per-submission report ──────────────────────────────────────────
export function buildCoachReport(mission, evaluation, before, after) {
  const items = mission.tasks.map((t) => {
    const r = evaluation.results.find((x) => x.taskId === t.id);
    const concept = getConcept(mission.id, t.id);
    return {
      taskId: t.id,
      passed: r.passed,
      concept: concept.name,
      tip: concept.tip,
      failedChecks: t.type === 'code' ? r.checks.filter((c) => !c.passed).map((c) => c.label) : [],
    };
  });
  const strengths = items.filter((i) => i.passed);
  const gaps = items.filter((i) => !i.passed);
  const cat = CATEGORIES.find((c) => c.id === mission.category);

  const rolesBefore = Object.fromEntries(roleReadiness(skillVector(before)).map((r) => [r.id, r.score]));
  const roles = roleReadiness(skillVector(after)).map((r) => ({ ...r, before: rolesBefore[r.id], delta: r.score - rolesBefore[r.id] }));
  const mostImproved = [...roles].sort((a, b) => b.delta - a.delta)[0];

  let headline;
  let summary;
  if (evaluation.score === 100) {
    headline = 'Flawless run';
    summary = `You demonstrated every concept in this ${cat.name} scenario. Recruiters see this as hands-on proof, not just a course certificate.`;
  } else if (evaluation.passed) {
    headline = 'Solid pass, with one thing to sharpen';
    summary = `You cleared the bar. Fix ${gaps.map((g) => g.concept).join(' and ')} to make this skill fully interview-proof.`;
  } else {
    headline = 'Close. Here is exactly what to fix';
    summary = `You got ${strengths.length} of ${items.length} right. Your gaps are specific and fixable: ${gaps.map((g) => g.concept).join(', ')}.`;
  }

  const next = evaluation.passed
    ? recommendNext(after, { exclude: [mission.id] })
    : { mission, retry: true, reason: `Review the ${gaps.length === 1 ? 'tip' : 'tips'} above, then retry. You need ${70}% and you're at ${evaluation.score}%.` };

  return { headline, summary, items, strengths, gaps, roles, mostImproved, next, score: evaluation.score };
}
