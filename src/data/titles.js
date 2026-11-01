// Player titles: earned by clearing 2 of the 3 missions in a skill. Shown on
// the dashboard, leaderboard, Skill Passport and recruiter profiles.
export const TITLES = [
  { id: 'bug-hunter', name: 'Bug Hunter', category: 'java', icon: 'Coffee', color: '#F97316', earn: 'Clear 2 Java missions' },
  { id: 'data-detective', name: 'Data Detective', category: 'python', icon: 'FileCode2', color: '#38BDF8', earn: 'Clear 2 Python missions' },
  { id: 'query-wizard', name: 'Query Wizard', category: 'sql', icon: 'Database', color: '#2DD4BF', earn: 'Clear 2 SQL missions' },
  { id: 'component-crafter', name: 'Component Crafter', category: 'react', icon: 'Atom', color: '#22D3EE', earn: 'Clear 2 React missions' },
  { id: 'algorithm-ace', name: 'Algorithm Ace', category: 'ps', icon: 'Brain', color: '#F472B6', earn: 'Clear 2 Problem Solving missions' },
  { id: 'full-stack-legend', name: 'Full-Stack Legend', category: null, icon: 'Crown', color: '#FBBF24', earn: 'Earn 4 skill titles' },
];
export const TITLE_THRESHOLD = 2;
