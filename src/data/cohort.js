// SIMULATED talent pool for the College and Recruiter demo views.
// These are not real people. Each profile is generated deterministically
// (seeded PRNG) as raw mission completions + attempts, then scored by the
// same engine as the demo student, so every number on screen is consistent.
import { MISSIONS, CATEGORIES } from './missions';
import { PEERS } from './students';

export const DEMO_COLLEGE = {
  name: 'IIT Gandhinagar',
  cohort: 'B.Tech CSE & EE · Batch of 2027',
  officer: 'Training & Placement Cell',
};

export const COLLEGES = ['IIT Gandhinagar', 'NIT Surat', 'DA-IICT', 'Nirma University', 'PDEU', 'LDCE Ahmedabad'];

const FIRST = ['Aanya', 'Vihaan', 'Diya', 'Kabir', 'Anika', 'Reyansh', 'Myra', 'Arnav', 'Saanvi', 'Dhruv', 'Ira', 'Atharv', 'Tara', 'Yash', 'Nisha', 'Parth', 'Riya', 'Harsh', 'Pooja', 'Karan', 'Neha', 'Siddharth', 'Ananya', 'Varun', 'Kriti', 'Manav', 'Shruti', 'Dev', 'Isha', 'Om', 'Tanvi', 'Rahul', 'Bhavya', 'Jay', 'Krisha', 'Nikhil', 'Avni', 'Hetvi', 'Mihir', 'Prisha'];
const LAST = ['Shah', 'Mehta', 'Desai', 'Patel', 'Trivedi', 'Pandya', 'Bhatt', 'Kapoor', 'Menon', 'Pillai', 'Das', 'Banerjee', 'Kulkarni', 'Deshmukh', 'Saxena', 'Agarwal', 'Chauhan', 'Rathod', 'Parmar', 'Solanki', 'Jain', 'Mishra', 'Thakkar', 'Dave', 'Vyas', 'Bose', 'Naidu', 'Sethi'];
const COLORS = ['#F472B6', '#38BDF8', '#4ADE80', '#FBBF24', '#2DD4BF', '#FB923C', '#A78BFA', '#F87171', '#22D3EE', '#9A8CFF'];
const BRANCHES = ['CSE', 'CSE', 'CSE', 'EE', 'IT'];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIFF = { Easy: 1, Medium: 0.75, Hard: 0.5 };
const DAY = 86400000;
const BASE = new Date('2026-10-31T12:00:00Z').getTime(); // fixed so the pool never shifts between demos

// Simulate one student's raw history from an ability profile.
function simulate(rand, ability, focus, activity) {
  const completed = {};
  const attempts = [];
  const lastActiveDays = Math.floor((1 - activity) * 24 * rand());
  for (const m of MISSIONS) {
    const p = ability * (focus[m.category] ?? 0.5) * DIFF[m.difficulty];
    const tried = rand() < Math.min(0.95, activity * 0.6 + (focus[m.category] ?? 0.5) * 0.5);
    if (!tried) continue;
    const at = new Date(BASE - (lastActiveDays + Math.floor(rand() * 40)) * DAY).toISOString();
    if (rand() < p * 1.35) {
      // 3 tasks per mission and a 70% bar, so a pass is always 3/3.
      completed[m.id] = { score: 100, xp: m.xp + Math.round(m.xp * 0.1), completedAt: at };
      attempts.push({ missionId: m.id, score: 100, passed: true, missed: [], at });
    } else {
      const missed = m.tasks.filter(() => rand() < 0.6).map((t) => t.id);
      if (!missed.length) missed.push(m.tasks[Math.floor(rand() * m.tasks.length)].id);
      const score = Math.round(((m.tasks.length - missed.length) / m.tasks.length) * 100);
      attempts.push({ missionId: m.id, score, passed: false, missed, at });
    }
  }
  attempts.sort((a, b) => new Date(b.at) - new Date(a.at));
  return { completed, attempts, lastActiveDays };
}

function focusProfile(rand) {
  const main = CATEGORIES[Math.floor(rand() * CATEGORIES.length)].id;
  const second = CATEGORIES[Math.floor(rand() * CATEGORIES.length)].id;
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, c.id === main ? 1 : c.id === second ? 0.85 : 0.3 + rand() * 0.4]));
}

function build() {
  const rand = mulberry32(2027);
  const used = new Set(PEERS.map((p) => p.name));
  const pool = [];

  // Leaderboard peers get histories that match their leaderboard mission counts.
  PEERS.forEach((p) => {
    const focus = focusProfile(rand);
    // Jitter is drawn once per mission BEFORE sorting, so the comparator is
    // consistent and every JS engine produces the same order.
    const weight = Object.fromEntries(MISSIONS.map((m) => [m.id, focus[m.category] * DIFF[m.difficulty] + rand() * 0.3]));
    const ranked = [...MISSIONS].sort((a, b) => weight[b.id] - weight[a.id] || a.id.localeCompare(b.id));
    const completed = {};
    const attempts = [];
    const lastActiveDays = Math.floor(rand() * 4);
    ranked.forEach((m, i) => {
      const at = new Date(BASE - (lastActiveDays + Math.floor(rand() * 40)) * DAY).toISOString();
      if (i < p.missions) {
        completed[m.id] = { score: 100, xp: m.xp + Math.round(m.xp * 0.1), completedAt: at };
        attempts.push({ missionId: m.id, score: 100, passed: true, missed: [], at });
      } else if (i < p.missions + 2) {
        const missed = [m.tasks[Math.floor(rand() * m.tasks.length)].id];
        attempts.push({ missionId: m.id, score: 67, passed: false, missed, at });
      }
    });
    attempts.sort((a, b) => new Date(b.at) - new Date(a.at));
    pool.push({ ...p, branch: 'CSE', openToWork: true, completed, attempts, lastActiveDays });
  });

  const perCollege = { 'IIT Gandhinagar': 44, 'NIT Surat': 18, 'DA-IICT': 16, 'Nirma University': 14, PDEU: 12, 'LDCE Ahmedabad': 12 };
  let n = 0;
  for (const [college, count] of Object.entries(perCollege)) {
    for (let i = 0; i < count; i++) {
      let name;
      do name = `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`; while (used.has(name));
      used.add(name);
      const ability = 0.15 + rand() * 0.8;
      const activity = 0.25 + rand() * 0.75;
      pool.push({
        id: `c${++n}`,
        name,
        college,
        branch: BRANCHES[Math.floor(rand() * BRANCHES.length)],
        color: COLORS[Math.floor(rand() * COLORS.length)],
        openToWork: rand() < 0.82,
        ...simulate(rand, ability, focusProfile(rand), activity),
      });
    }
  }
  return pool;
}

export const TALENT_POOL = build();
