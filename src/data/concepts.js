// Concept tags for every mission task. The Skill Coach uses these to turn a
// raw score into feedback ("you missed BigDecimal comparison") and skill gaps.
// Keyed as CONCEPTS[missionId][taskId] = { name, tip }.

export const CONCEPTS = {
  'java-bank': {
    t1: { name: 'String equality (== vs equals)', tip: 'Use .equals() for object content; == only compares references.' },
    t2: { name: 'BigDecimal & defensive checks', tip: 'Compare BigDecimal with compareTo() and validate before mutating state.' },
    t3: { name: 'Deadlocks & lock ordering', tip: 'Acquire multiple locks in one global order to make circular waits impossible.' },
  },
  'java-collections': {
    t1: { name: 'HashMap time complexity', tip: 'Hash lookups are O(1) on average; list scans are O(n).' },
    t2: { name: 'equals / hashCode contract', tip: 'Whenever you override equals(), override hashCode() too.' },
    t3: { name: 'Map API fluency', tip: 'Know the core Map methods: get, put, containsKey, getOrDefault.' },
  },
  'java-oop': {
    t1: { name: 'Interfaces & implementation', tip: 'Practice implementing an interface with the exact method signature.' },
    t2: { name: 'SOLID: Open/Closed', tip: 'Extend behaviour with new classes instead of editing existing ones.' },
    t3: { name: '@Override safety', tip: '@Override makes the compiler catch signature typos.' },
  },
  'sql-optimize': {
    t1: { name: 'Index usage (sargability)', tip: 'Functions on an indexed column stop the index from being used.' },
    t2: { name: 'Date-range filtering', tip: 'Filter raw columns with >= start AND < end instead of YEAR(col).' },
    t3: { name: 'Composite index design', tip: 'Put equality columns first, then the range column.' },
  },
  'sql-joins': {
    t1: { name: 'JOIN types', tip: 'LEFT JOIN keeps every row from the left table, matched or not.' },
    t2: { name: 'HAVING vs WHERE', tip: 'WHERE filters rows before grouping; HAVING filters groups after.' },
    t3: { name: 'Aggregates with NULLs', tip: 'COUNT(column) skips NULLs, so unmatched LEFT JOIN rows count as 0.' },
  },
  'sql-window': {
    t1: { name: 'Window functions', tip: 'RANK() OVER (PARTITION BY … ORDER BY …) ranks within each group.' },
    t2: { name: 'RANK vs DENSE_RANK', tip: 'DENSE_RANK leaves no gaps after ties; RANK does.' },
    t3: { name: 'SQL execution order', tip: 'WHERE runs before SELECT, so filter window results in an outer query or CTE.' },
  },
  'py-sales': {
    t1: { name: 'Reading tabular data', tip: 'Scan the rows carefully and handle missing values before summing.' },
    t2: { name: 'pandas groupby', tip: 'df.groupby("col")["value"].sum() is the core aggregation pattern.' },
    t3: { name: 'Data-quality judgement', tip: 'Investigate and document missing data before dropping or filling it.' },
  },
  'py-logs': {
    t1: { name: 'String splitting & indexing', tip: 'str.split() splits on whitespace; indices start at 0.' },
    t2: { name: 'collections.Counter', tip: 'Counter(iterable) counts occurrences in one line.' },
    t3: { name: 'Streaming large files', tip: 'Iterate a file line by line instead of loading it all into memory.' },
  },
  'py-api': {
    t1: { name: 'List comprehensions & .get()', tip: 'Combine a filter clause with dict.get() for missing keys.' },
    t2: { name: 'dict.get defaults', tip: 'dict.get(key, default) returns the default instead of raising KeyError.' },
    t3: { name: 'JSON error handling', tip: 'Catch json.JSONDecodeError (a ValueError) for malformed bodies.' },
  },
  'react-render': {
    t1: { name: 'State immutability', tip: 'React re-renders only when state gets a new reference.' },
    t2: { name: 'Immutable array updates', tip: 'Use the spread operator or map/filter to create new arrays.' },
    t3: { name: 'List keys', tip: 'Use a stable unique id as key, never the array index for editable lists.' },
  },
  'react-state': {
    t1: { name: 'Lifting state up', tip: 'Shared state lives in the closest common parent.' },
    t2: { name: 'Context API', tip: 'useContext avoids prop-drilling for app-wide state.' },
    t3: { name: 'Functional state updates', tip: 'setCount(c => c + 1) is safe for rapid consecutive updates.' },
  },
  'react-effect': {
    t1: { name: 'useEffect cleanup', tip: 'Return a cleanup function that clears intervals and subscriptions.' },
    t2: { name: 'Effect lifecycle', tip: 'Cleanup runs before the next effect and on unmount.' },
    t3: { name: 'Dependency arrays', tip: 'List every prop or state value the effect reads.' },
  },
  'ps-bigo': {
    t1: { name: 'Nested-loop complexity', tip: 'Two nested loops over n multiply to O(n²).' },
    t2: { name: 'Logarithmic growth', tip: 'Doubling or halving each step gives O(log n).' },
    t3: { name: 'Sorting complexity', tip: 'Comparison sorts like merge sort run in O(n log n).' },
  },
  'ps-twosum': {
    t1: { name: 'Hash-map lookups', tip: 'Store seen values in a hash map to find complements in one pass.' },
    t2: { name: 'Tracing an algorithm', tip: 'Walk through a small input by hand to verify indices.' },
    t3: { name: 'Time vs space trade-offs', tip: 'One-pass hashing trades O(n) memory for O(n) time.' },
  },
  'ps-binsearch': {
    t1: { name: 'Binary search bounds', tip: 'log₂(n) checks: 1,024 items need at most 10.' },
    t2: { name: 'Overflow-safe midpoint', tip: 'Use lo + (hi - lo) / 2 instead of (lo + hi) / 2.' },
    t3: { name: 'Lower-bound search', tip: 'To find the FIRST match, keep mid in range: hi = mid.' },
  },
};

export const getConcept = (missionId, taskId) => CONCEPTS[missionId]?.[taskId] || { name: 'Core concept', tip: 'Review the explanation and retry.' };

// Job roles a recruiter or placement cell actually hires for, expressed as
// weights over skill categories. Used for role-readiness scores.
export const ROLES = [
  { id: 'backend', name: 'Java Backend Developer', weights: { java: 0.5, sql: 0.3, ps: 0.2 }, color: '#F97316' },
  { id: 'data', name: 'Data Analyst', weights: { python: 0.45, sql: 0.4, ps: 0.15 }, color: '#38BDF8' },
  { id: 'frontend', name: 'Frontend Developer', weights: { react: 0.65, ps: 0.2, python: 0.15 }, color: '#22D3EE' },
  { id: 'fullstack', name: 'Full-Stack Developer', weights: { java: 0.25, react: 0.3, sql: 0.25, ps: 0.2 }, color: '#9A8CFF' },
];
