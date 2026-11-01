// Achievement pop-ups: compares the state before and after a submission and
// lists the moments worth celebrating, in display order. Pure and derived.
import { getSkillGaps, roleReadiness, skillVector, readinessBand } from './coach';
import { cohortFor } from './talent';
import { DEMO_STUDENT } from '../data/students';
import { titlesForState } from './titles';

const BAND_ORDER = { support: 0, developing: 1, ready: 2 };

function batchRank(state) {
  const batch = cohortFor(state, DEMO_STUDENT.college).sort((a, b) => b.readiness - a.readiness);
  return { rank: batch.findIndex((p) => p.isMe) + 1, size: batch.length };
}

export function buildAchievements(before, after, reward) {
  const list = [];

  if (reward?.prevRank && reward?.newRank && reward.newRank < reward.prevRank) {
    list.push({
      id: 'rank', kind: 'Rank up', icon: 'Trophy', color: '#9A8CFF',
      title: `Leaderboard #${reward.prevRank} → #${reward.newRank}`,
      subtitle: `You passed ${reward.prevRank - reward.newRank === 1 ? 'a player' : `${reward.prevRank - reward.newRank} players`} on the XP leaderboard.`,
    });
  }

  const had = new Set(titlesForState(before).map((t) => t.id));
  for (const t of titlesForState(after).filter((x) => !had.has(x.id))) {
    list.push({ id: `title-${t.id}`, kind: 'Title unlocked', icon: 'Crown', color: t.color, title: `You are now a ${t.name}`, subtitle: 'Shown on your Skill Passport and to recruiters.' });
  }

  const b0 = batchRank(before);
  const b1 = batchRank(after);
  if (b1.rank < b0.rank) {
    list.push({
      id: 'batch', kind: 'Batch rank up', icon: 'GraduationCap', color: '#2DD4BF',
      title: `#${b0.rank} → #${b1.rank} of ${b1.size} in your batch`,
      subtitle: 'Your placement cell sees this in the College view.',
    });
  }

  const r0 = Object.fromEntries(roleReadiness(skillVector(before)).map((r) => [r.id, r.score]));
  const milestones = roleReadiness(skillVector(after))
    .map((r) => ({ ...r, from: readinessBand(r0[r.id]), to: readinessBand(r.score) }))
    .filter((r) => BAND_ORDER[r.to.id] > BAND_ORDER[r.from.id])
    .sort((a, b) => b.score - a.score);
  for (const m of milestones.slice(0, 2)) {
    list.push({
      id: `career-${m.id}`, kind: 'Career milestone', icon: 'Briefcase', color: m.to.color,
      title: `${m.name}: ${m.to.label}`,
      subtitle: `Readiness ${r0[m.id]}% → ${m.score}%. Was ${m.from.label.toLowerCase()}.`,
    });
  }

  const openAfter = new Set(getSkillGaps(after).map((g) => `${g.missionId}:${g.taskId}`));
  const closed = getSkillGaps(before).filter((g) => !openAfter.has(`${g.missionId}:${g.taskId}`));
  if (closed.length) {
    list.push({
      id: 'gap', kind: closed.length === 1 ? 'Skill gap closed' : `${closed.length} skill gaps closed`, icon: 'ShieldCheck', color: '#4ADE80',
      title: closed.slice(0, 2).map((g) => g.name).join(' · '),
      subtitle: 'Fixed on a retry. Your Skill Passport is updated.',
    });
  }

  return list;
}

