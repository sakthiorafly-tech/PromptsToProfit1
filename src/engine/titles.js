// Titles are derived from completed missions (never stored).
import { MISSIONS } from '../data/missions';
import { TITLES, TITLE_THRESHOLD } from '../data/titles';

export function getTitles(completedIds) {
  const done = completedIds instanceof Set ? completedIds : new Set(completedIds);
  const skill = TITLES.filter((t) => t.category && MISSIONS.filter((m) => m.category === t.category && done.has(m.id)).length >= TITLE_THRESHOLD);
  const legend = skill.length >= 4 ? TITLES.filter((t) => t.id === 'full-stack-legend') : [];
  return [...legend, ...skill];
}

export const titlesForState = (state) => getTitles(Object.keys(state.completed));
