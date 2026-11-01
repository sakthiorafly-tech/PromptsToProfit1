// Boss battles: every Hard mission is a boss. Its health equals the number of
// test checks in the mission, so the fight is the same deterministic scoring,
// just shown as a battle.
export const BOSSES = {
  'java-bank': { name: 'The Phantom Transfer', taunt: 'Negative balances, self-transfers and a deadlock. Can you stop it?', color: '#F97316' },
  'sql-optimize': { name: 'The 9-Second Query', taunt: 'Five million rows and no index in sight.', color: '#2DD4BF' },
  'py-api': { name: 'The JSON Hydra', taunt: 'Missing keys, bad flags and malformed bodies. Cut off every head.', color: '#38BDF8' },
  'react-effect': { name: 'The Leaky Ticker', taunt: 'It polls forever and never cleans up.', color: '#22D3EE' },
  'ps-binsearch': { name: 'The Broken Build', taunt: 'One commit in 1,024 broke everything. Find it fast.', color: '#F472B6' },
};

export const getBoss = (missionId) => BOSSES[missionId] || null;

// One hit point per check: MCQ and short answers are 1 check, code tasks have several.
export const bossMaxHp = (mission) => mission.tasks.reduce((n, t) => n + (t.type === 'code' ? t.checks.length : 1), 0);
