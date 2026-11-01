// 15 missions across 5 categories. Every task has a predefined answer, so
// evaluation is fully deterministic and needs no external API.
//
// Task types:
//   mcq   – { options: [...], answer: index }
//   input – { accept: [...] }  (compared after normalization: lowercase, whitespace removed)
//   code  – { starter, checks: [{ label, pattern, mustNot? }] }  regex checks act as "tests"

export const CATEGORIES = [
  { id: 'java', name: 'Java', color: '#F97316', icon: 'Coffee' },
  { id: 'python', name: 'Python', color: '#38BDF8', icon: 'FileCode2' },
  { id: 'sql', name: 'SQL', color: '#2DD4BF', icon: 'Database' },
  { id: 'react', name: 'React JS', color: '#22D3EE', icon: 'Atom' },
  { id: 'ps', name: 'Problem Solving', color: '#F472B6', icon: 'Brain' },
];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const MISSIONS = [
  // ───────────────────────────── JAVA ─────────────────────────────
  {
    id: 'java-bank',
    category: 'java',
    featured: true,
    title: 'Debug a Banking Transaction System',
    description: 'Customers report negative balances and phantom self-transfers. Find and fix the bugs before the audit.',
    difficulty: 'Hard',
    minutes: 25,
    xp: 250,
    scenario:
      'You joined the payments team at NeoBank. The `TransferService` moves money between accounts. Support tickets say balances go negative, self-transfers are not blocked and two simultaneous transfers sometimes deadlock the service.',
    snippet: `public class TransferService {
  public void transfer(Account from, Account to, BigDecimal amount) {
    if (from.getId() == to.getId()) {          // ids are String
      throw new IllegalArgumentException("Self transfer");
    }
    synchronized (from) {
      synchronized (to) {
        from.withdraw(amount);
        to.deposit(amount);
      }
    }
  }
}`,
    instructions: [
      'Read the TransferService snippet carefully.',
      'Answer the two concept questions.',
      'Fix the withdraw method in the code editor.',
      'Score 70% or more to complete the mission.',
    ],
    tasks: [
      {
        id: 't1', type: 'mcq',
        prompt: 'Account ids are Strings. Why does `from.getId() == to.getId()` fail to block some self-transfers?',
        options: [
          '== compares object references, not string content. Use .equals()',
          'Strings cannot be compared in an if-statement',
          '== is slower than .equals(), causing a timeout',
          'The ids are converted to integers automatically',
        ],
        answer: 0,
        explanation: 'For objects, == checks if both references point to the same object. Two equal ids loaded separately are different objects, so use from.getId().equals(to.getId()).',
      },
      {
        id: 't2', type: 'code',
        prompt: 'Fix `withdraw` so that it throws `InsufficientFundsException` when the amount exceeds the balance. Balance is a BigDecimal.',
        language: 'java',
        starter: `public void withdraw(BigDecimal amount) {
    // BUG: balance can go negative
    balance = balance.subtract(amount);
}`,
        checks: [
          { label: 'Compares BigDecimal values with compareTo()', pattern: /(amount\s*\.\s*compareTo\s*\(\s*balance\s*\)\s*>\s*0)|(balance\s*\.\s*compareTo\s*\(\s*amount\s*\)\s*<\s*0)/ },
          { label: 'Throws InsufficientFundsException', pattern: /throw\s+new\s+InsufficientFundsException\s*\(/ },
          { label: 'Still deducts the amount on success', pattern: /balance\s*=\s*balance\s*\.\s*subtract\s*\(\s*amount\s*\)/ },
          { label: 'Does not use == / < operators on BigDecimal', pattern: /(amount|balance)\s*(>|<|>=|<=)\s*(amount|balance)\b/, mustNot: true },
        ],
        explanation: 'BigDecimal is an object, so use compareTo(). A safe version is: if (amount.compareTo(balance) > 0) throw new InsufficientFundsException(...); balance = balance.subtract(amount);',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'Thread A transfers X→Y while thread B transfers Y→X. The service freezes. What is the most robust fix?',
        options: [
          'Add Thread.sleep() before each lock',
          'Always acquire the two locks in a consistent global order, e.g. by account id',
          'Remove synchronization entirely',
          'Make the amount variable volatile',
        ],
        answer: 1,
        explanation: 'This is a classic lock-ordering deadlock. If every thread locks the lower id first, a circular wait cannot happen.',
      },
    ],
  },
  {
    id: 'java-collections',
    category: 'java',
    title: 'Inventory Lookup with HashMap',
    description: 'A warehouse app scans 50k SKUs with a list loop. Move it to the right collection.',
    difficulty: 'Easy',
    minutes: 10,
    xp: 100,
    scenario: 'The warehouse dashboard looks up stock by SKU using a for-loop over an ArrayList. Pickers wait seconds per scan. You will move it to a HashMap<String, Integer>.',
    instructions: ['Answer all three questions.', 'Score 70% or more to complete the mission.'],
    tasks: [
      {
        id: 't1', type: 'mcq',
        prompt: 'What is the average time complexity of HashMap.get(key)?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
        answer: 2,
        explanation: 'Hashing gives constant average-time lookups, versus O(n) for scanning a list.',
      },
      {
        id: 't2', type: 'mcq',
        prompt: 'You use a custom `Sku` class as a HashMap key. You override equals(). What else must you override?',
        options: ['toString()', 'hashCode()', 'compareTo()', 'clone()'],
        answer: 1,
        explanation: 'Equal objects must have equal hash codes, otherwise lookups land in the wrong bucket and silently fail.',
      },
      {
        id: 't3', type: 'input',
        prompt: 'Which HashMap method returns true if a SKU key exists? (method name only)',
        placeholder: 'e.g. methodName',
        accept: ['containsKey', 'containsKey()', 'map.containsKey', 'map.containsKey()'],
        explanation: 'map.containsKey(sku) checks for a key without fetching the value.',
      },
    ],
  },
  {
    id: 'java-oop',
    category: 'java',
    title: 'Extend a Payment Gateway with Polymorphism',
    description: 'Add UPI support to a checkout without touching existing card and wallet code.',
    difficulty: 'Medium',
    minutes: 15,
    xp: 150,
    scenario: 'The checkout calls `PaymentMethod.pay(amount)` for cards and wallets. Product wants UPI next sprint, and the architect insists existing classes stay untouched.',
    snippet: `public interface PaymentMethod {
  boolean pay(double amount);
}`,
    instructions: ['Implement the class in the editor.', 'Answer the design questions.', 'Score 70% or more to complete the mission.'],
    tasks: [
      {
        id: 't1', type: 'code',
        prompt: 'Write a `UpiPayment` class that implements `PaymentMethod` and returns true from `pay`.',
        language: 'java',
        starter: `// implement UpiPayment here
`,
        checks: [
          { label: 'Declares class UpiPayment implementing PaymentMethod', pattern: /class\s+UpiPayment\s+implements\s+PaymentMethod/ },
          { label: 'Defines public boolean pay(double ...)', pattern: /public\s+boolean\s+pay\s*\(\s*double\s+\w+\s*\)/ },
          { label: 'Returns a boolean result', pattern: /return\s+(true|false|\w+)\s*;/ },
        ],
        explanation: 'class UpiPayment implements PaymentMethod { @Override public boolean pay(double amount) { return true; } }. The checkout needs no change because it depends on the interface.',
      },
      {
        id: 't2', type: 'mcq',
        prompt: 'Adding UPI without modifying existing classes demonstrates which SOLID principle?',
        options: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Dependency Inversion'],
        answer: 1,
        explanation: 'Open for extension, closed for modification. New behaviour arrives as a new class.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'Why should the @Override annotation be added on pay()?',
        options: [
          'It makes the method run faster',
          'The compiler verifies the method really overrides the interface method',
          'It is required for interfaces to compile',
          'It makes the method static',
        ],
        answer: 1,
        explanation: '@Override catches typos and signature mismatches at compile time.',
      },
    ],
  },

  // ───────────────────────────── SQL ─────────────────────────────
  {
    id: 'sql-optimize',
    category: 'sql',
    featured: true,
    title: 'Optimize a Slow Database Query',
    description: 'The order-history page takes 9 seconds on a 5M-row table. Make it fast.',
    difficulty: 'Hard',
    minutes: 20,
    xp: 250,
    scenario: 'An e-commerce `orders` table has 5 million rows and a single-column index on `created_at`. The customer "Order History" page runs the query below and times out at peak traffic.',
    snippet: `SELECT *
FROM orders
WHERE YEAR(created_at) = 2024
  AND customer_id = 42
ORDER BY created_at DESC;`,
    instructions: ['Diagnose why the query is slow.', 'Rewrite the WHERE clause so it can use an index.', 'Choose the best index.'],
    tasks: [
      {
        id: 't1', type: 'mcq',
        prompt: 'Why can the database not use the created_at index for this query?',
        options: [
          'ORDER BY always disables indexes',
          'Wrapping the column in YEAR() makes the predicate non-sargable, so each row must be computed',
          'SELECT * prevents any index usage',
          'Indexes only work on primary keys',
        ],
        answer: 1,
        explanation: 'Applying a function to an indexed column hides it from the optimizer. Compare the raw column against a range instead.',
      },
      {
        id: 't2', type: 'code',
        prompt: 'Rewrite the WHERE clause to filter 2024 with a date range on the raw column (keep the customer filter).',
        language: 'sql',
        starter: `SELECT id, total, status, created_at
FROM orders
WHERE
ORDER BY created_at DESC;`,
        checks: [
          { label: "Lower bound: created_at >= '2024-01-01'", pattern: /created_at\s*>=\s*'2024-01-01( 00:00:00)?'/i },
          { label: "Upper bound: created_at < '2025-01-01'", pattern: /created_at\s*<\s*'2025-01-01( 00:00:00)?'/i },
          { label: 'Keeps customer_id = 42', pattern: /customer_id\s*=\s*42\b/i },
          { label: 'No function wrapped around created_at', pattern: /(year|date|extract)\s*\(\s*created_at/i, mustNot: true },
        ],
        explanation: "WHERE customer_id = 42 AND created_at >= '2024-01-01' AND created_at < '2025-01-01'. A half-open range is index-friendly and handles timestamps correctly.",
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'Which single index best serves the rewritten query?',
        options: ['(created_at)', '(customer_id, created_at)', '(created_at, customer_id, status, total)', '(status)'],
        answer: 1,
        explanation: 'Put the equality column first and the range/sort column second. The engine seeks to customer 42 and reads 2024 rows already in order.',
      },
    ],
  },
  {
    id: 'sql-joins',
    category: 'sql',
    title: 'Build a Customer Orders Report',
    description: 'Marketing needs every customer and their order count, including those who never ordered.',
    difficulty: 'Easy',
    minutes: 10,
    xp: 100,
    scenario: 'Tables: customers(id, name) and orders(id, customer_id, total). Marketing wants a re-engagement list that must include customers with zero orders.',
    instructions: ['Answer all three questions.', 'Score 70% or more to complete the mission.'],
    tasks: [
      {
        id: 't1', type: 'mcq',
        prompt: 'Which join keeps customers who have no orders?',
        options: ['INNER JOIN', 'customers LEFT JOIN orders', 'customers RIGHT JOIN orders', 'CROSS JOIN'],
        answer: 1,
        explanation: 'LEFT JOIN keeps every row from the left table and fills unmatched columns with NULL.',
      },
      {
        id: 't2', type: 'input',
        prompt: 'Which clause filters groups after GROUP BY, e.g. customers with more than 5 orders? (one keyword)',
        placeholder: 'KEYWORD',
        accept: ['having'],
        explanation: 'WHERE filters rows before grouping and HAVING filters aggregated groups.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'With the LEFT JOIN, which expression returns 0 for customers without orders?',
        options: ['COUNT(*)', 'COUNT(o.id)', 'SUM(1)', 'COUNT(c.id)'],
        answer: 1,
        explanation: 'COUNT(column) skips NULLs. COUNT(*) counts the NULL-filled row as 1.',
      },
    ],
  },
  {
    id: 'sql-window',
    category: 'sql',
    title: 'Rank Top Sellers per Region',
    description: 'Leadership wants the top 3 sales reps in every region for the quarterly review.',
    difficulty: 'Medium',
    minutes: 15,
    xp: 175,
    scenario: 'Table sales_reps(id, name, region, sales). Ties should share a rank. Return the top 3 per region.',
    instructions: ['Use a window function.', 'Answer the conceptual questions.'],
    tasks: [
      {
        id: 't1', type: 'code',
        prompt: 'Write the window expression that ranks reps by sales (highest first) within each region, aliased as rnk.',
        language: 'sql',
        starter: `SELECT name, region, sales,
       -- your expression here
FROM sales_reps;`,
        checks: [
          { label: 'Uses RANK() or DENSE_RANK()', pattern: /(dense_)?rank\s*\(\s*\)\s*over/i },
          { label: 'Partitions by region', pattern: /partition\s+by\s+region/i },
          { label: 'Orders by sales DESC', pattern: /order\s+by\s+sales\s+desc/i },
          { label: 'Aliased as rnk', pattern: /\)\s*(as\s+)?rnk\b/i },
        ],
        explanation: 'RANK() OVER (PARTITION BY region ORDER BY sales DESC) AS rnk',
      },
      {
        id: 't2', type: 'mcq',
        prompt: 'Two reps tie for 1st. Which function gives them both rank 1 and the next rep rank 2?',
        options: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'NTILE(3)'],
        answer: 2,
        explanation: 'DENSE_RANK leaves no gaps (1,1,2). RANK would give 1,1,3 and ROW_NUMBER breaks ties arbitrarily.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'Why can you not write WHERE rnk <= 3 in the same SELECT?',
        options: [
          'Window functions are evaluated after WHERE, so wrap the query in a CTE or subquery',
          'rnk is a reserved keyword',
          'WHERE does not support <=',
          'You must use LIMIT 3 instead',
        ],
        answer: 0,
        explanation: 'Logical order: FROM → WHERE → GROUP BY → HAVING → window → SELECT. Filter the window result in an outer query.',
      },
    ],
  },

  // ───────────────────────────── PYTHON ─────────────────────────────
  {
    id: 'py-sales',
    category: 'python',
    featured: true,
    title: 'Analyze a Sales Dataset',
    description: 'A D2C brand needs regional revenue insights before Monday’s board meeting.',
    difficulty: 'Medium',
    minutes: 20,
    xp: 200,
    scenario: 'You are given a weekly sales extract (below). Revenue = units × price. One row has a missing price from a POS outage.',
    dataset: {
      columns: ['order_id', 'region', 'product', 'units', 'price'],
      rows: [
        [1001, 'North', 'Earbuds', 3, 1200],
        [1002, 'South', 'Smartwatch', 1, 4500],
        [1003, 'North', 'Power Bank', 5, 900],
        [1004, 'West', 'Earbuds', 2, 1200],
        [1005, 'North', 'Smartwatch', 1, 4500],
        [1006, 'South', 'Power Bank', 4, null],
      ],
    },
    instructions: ['Inspect the dataset.', 'Compute and code the answers.', 'Score 70% or more to complete the mission.'],
    tasks: [
      {
        id: 't1', type: 'input',
        prompt: 'What is the total revenue for the North region? (number only)',
        placeholder: 'e.g. 12345',
        accept: ['12600', '12,600', '₹12600', '₹12,600', 'rs12600'],
        explanation: 'North: 3×1200 + 5×900 + 1×4500 = 3600 + 4500 + 4500 = 12,600.',
      },
      {
        id: 't2', type: 'code',
        prompt: 'Assume df has a revenue column. Write one pandas line that returns total revenue per region.',
        language: 'python',
        starter: `import pandas as pd
df["revenue"] = df["units"] * df["price"]
region_revenue = `,
        checks: [
          { label: 'Groups by region', pattern: /groupby\s*\(\s*\[?\s*['"]region['"]\s*\]?\s*\)/ },
          { label: 'Selects the revenue column', pattern: /\[\s*['"]revenue['"]\s*\]|\.revenue\b|agg\s*\(/ },
          { label: 'Aggregates with sum()', pattern: /\.sum\s*\(\s*\)|['"]sum['"]/ },
        ],
        explanation: 'region_revenue = df.groupby("region")["revenue"].sum()',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'Order 1006 has a missing price. For a revenue report, what is the most defensible first step?',
        options: [
          'Fill it with 0 so totals are lower',
          'Fill it with the mean of all prices across products',
          'Exclude it with df.dropna(subset=["price"]) and flag it in the report',
          'Delete the whole South region',
        ],
        answer: 2,
        explanation: 'Do not invent revenue. Exclude unknown values transparently and report the data gap so the board sees it.',
      },
    ],
  },
  {
    id: 'py-logs',
    category: 'python',
    title: 'Parse Server Logs',
    description: 'Count HTTP error codes from raw Nginx-style logs during an incident.',
    difficulty: 'Easy',
    minutes: 10,
    xp: 100,
    scenario: 'During an incident you receive lines like `ERROR 500 /api/checkout`. You need a quick count of status codes.',
    instructions: ['Answer all three questions.'],
    tasks: [
      {
        id: 't1', type: 'input',
        prompt: 'What does "ERROR 500 /api/checkout".split()[1] return?',
        placeholder: 'value',
        accept: ['500', "'500'", '"500"'],
        explanation: 'split() with no arguments splits on whitespace: ["ERROR", "500", "/api/checkout"]. Index 1 is "500".',
      },
      {
        id: 't2', type: 'mcq',
        prompt: 'Which standard-library tool counts occurrences of each status code most concisely?',
        options: ['itertools.chain', 'collections.Counter', 'functools.reduce', 'heapq'],
        answer: 1,
        explanation: 'Counter(codes).most_common(3) gives the top codes in one line.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'The log file is 8 GB. How should you read it?',
        options: ['f.read() into one string', 'Iterate line by line: for line in f', 'json.load(f)', 'Copy it into a list first'],
        answer: 1,
        explanation: 'File objects are lazy iterators, so streaming line by line keeps memory flat.',
      },
    ],
  },
  {
    id: 'py-api',
    category: 'python',
    title: 'Clean a Messy JSON API Response',
    description: 'A partner API returns inconsistent user records. Make the pipeline resilient.',
    difficulty: 'Hard',
    minutes: 20,
    xp: 225,
    scenario: 'The /users endpoint sometimes omits fields and occasionally returns malformed JSON. Your nightly job crashes.',
    instructions: ['Write the filter.', 'Answer the resilience questions.'],
    tasks: [
      {
        id: 't1', type: 'code',
        prompt: 'Using a list comprehension, build `names`: names of users whose "active" flag is truthy. Use .get() so missing keys do not crash.',
        language: 'python',
        starter: `users = response.json()
names = `,
        checks: [
          { label: 'Uses a list comprehension', pattern: /\[\s*.+\s+for\s+\w+\s+in\s+users\b.*\]/ },
          { label: 'Filters with an if clause', pattern: /\bif\b/ },
          { label: 'Uses .get("active")', pattern: /\.get\s*\(\s*['"]active['"]/ },
          { label: 'Selects the name field', pattern: /\.get\s*\(\s*['"]name['"]|\[\s*['"]name['"]\s*\]/ },
        ],
        explanation: 'names = [u.get("name") for u in users if u.get("active")]',
      },
      {
        id: 't2', type: 'mcq',
        prompt: 'What does user.get("email", "n/a") return when "email" is missing?',
        options: ['Raises KeyError', 'None', '"n/a"', 'An empty string'],
        answer: 2,
        explanation: 'The second argument of dict.get is the default value.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'Which exception should you catch when the body is malformed JSON?',
        options: ['ValueError / json.JSONDecodeError', 'IndexError', 'ZeroDivisionError', 'ImportError'],
        answer: 0,
        explanation: 'json.JSONDecodeError subclasses ValueError. Catch it, log the payload and retry or skip.',
      },
    ],
  },

  // ───────────────────────────── REACT ─────────────────────────────
  {
    id: 'react-render',
    category: 'react',
    featured: true,
    title: 'Fix a Component Rendering Issue',
    description: 'The to-do list adds items in state, but the UI never updates. Ship the fix.',
    difficulty: 'Medium',
    minutes: 15,
    xp: 200,
    scenario: 'QA filed: "Clicking Add does nothing until I type in another field." The component also shows wrong checkboxes after deleting items.',
    snippet: `function TodoList() {
  const [items, setItems] = useState([]);

  function addItem(text) {
    items.push({ id: crypto.randomUUID(), text });
    setItems(items);
  }

  return items.map((item, index) => (
    <TodoRow key={index} item={item} />
  ));
}`,
    instructions: ['Diagnose the bug.', 'Fix addItem in the editor.', 'Choose the right key strategy.'],
    tasks: [
      {
        id: 't1', type: 'mcq',
        prompt: 'Why does the list not re-render after addItem?',
        options: [
          'useState only works with primitive values',
          'The array is mutated in place, so React sees the same reference and skips the update',
          'crypto.randomUUID() is asynchronous',
          'Components re-render only on props changes',
        ],
        answer: 1,
        explanation: 'React bails out when the new state is Object.is-equal to the previous state. Mutating keeps the same reference.',
      },
      {
        id: 't2', type: 'code',
        prompt: 'Rewrite addItem so that it creates a new array (no mutation).',
        language: 'jsx',
        starter: `function addItem(text) {
  items.push({ id: crypto.randomUUID(), text });
  setItems(items);
}`,
        checks: [
          { label: 'Creates a new array with spread', pattern: /setItems\s*\(\s*(\(?\s*\w+\s*\)?\s*=>\s*)?\[\s*\.\.\.\s*\w+/ },
          { label: 'Adds the new item with id and text', pattern: /\{\s*id\s*:\s*crypto\.randomUUID\(\)\s*,\s*text\s*\}/ },
          { label: 'Does not call items.push()', pattern: /items\s*\.\s*push\s*\(/, mustNot: true },
        ],
        explanation: 'setItems(prev => [...prev, { id: crypto.randomUUID(), text }]). The functional form also avoids stale state.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'Checkboxes show the wrong state after deleting a row. What key should TodoRow use?',
        options: ['key={index}', 'key={Math.random()}', 'key={item.id}', 'No key is needed'],
        answer: 2,
        explanation: 'Keys must be stable and unique. Index keys shift after a deletion, so React reuses the wrong DOM and state.',
      },
    ],
  },
  {
    id: 'react-state',
    category: 'react',
    title: 'Lift State Up: Shopping Cart Counter',
    description: 'The header cart badge and product cards disagree on item count. Unify state.',
    difficulty: 'Easy',
    minutes: 10,
    xp: 100,
    scenario: 'Header and ProductCard each keep their own `count` state, so they drift apart.',
    instructions: ['Answer all three questions.'],
    tasks: [
      {
        id: 't1', type: 'mcq',
        prompt: 'Where should the cart count state live?',
        options: ['Inside Header', 'Inside each ProductCard', 'In their closest common parent, passed down as props', 'In a global variable'],
        answer: 2,
        explanation: 'Lift shared state to the nearest common ancestor so it has a single source of truth.',
      },
      {
        id: 't2', type: 'input',
        prompt: 'Which hook would you use to avoid prop-drilling cart state through many levels? (hook name)',
        placeholder: 'useSomething',
        accept: ['usecontext', 'usecontext()', 'react.usecontext'],
        explanation: 'createContext + useContext shares state without threading props through every level.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'Which update is safest when clicking "Add" twice quickly?',
        options: ['setCount(count + 1)', 'setCount(c => c + 1)', 'count++', 'setCount(count++)'],
        answer: 1,
        explanation: 'The functional updater always receives the latest state, even when updates are batched.',
      },
    ],
  },
  {
    id: 'react-effect',
    category: 'react',
    title: 'Stop the Memory Leak in a Live Ticker',
    description: 'A stock ticker keeps polling after users leave the page. Clean it up.',
    difficulty: 'Hard',
    minutes: 20,
    xp: 225,
    scenario: 'A `LiveTicker` component starts a setInterval to refresh prices. Navigating away logs "Can\'t perform a React state update on an unmounted component" and CPU climbs.',
    instructions: ['Write the effect.', 'Answer the questions.'],
    tasks: [
      {
        id: 't1', type: 'code',
        prompt: 'Write a useEffect that calls refresh() every 5000 ms and clears the interval on unmount.',
        language: 'jsx',
        starter: `useEffect(() => {
  // start polling here
}, []);`,
        checks: [
          { label: 'Starts setInterval and stores the id', pattern: /(const|let)\s+\w+\s*=\s*setInterval\s*\(/ },
          { label: 'Polls every 5000 ms', pattern: /setInterval\s*\([\s\S]*5000\s*\)/ },
          { label: 'Returns a cleanup function', pattern: /return\s*\(\s*\)\s*=>|return\s+function/ },
          { label: 'Cleanup calls clearInterval', pattern: /clearInterval\s*\(\s*\w+\s*\)/ },
        ],
        explanation: 'useEffect(() => { const id = setInterval(refresh, 5000); return () => clearInterval(id); }, []);',
      },
      {
        id: 't2', type: 'mcq',
        prompt: 'When does React run the cleanup function returned by an effect?',
        options: ['Only on page reload', 'Before re-running the effect and when the component unmounts', 'After every click', 'Never automatically'],
        answer: 1,
        explanation: 'Cleanup runs before the next effect run (when dependencies change) and on unmount.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'The ticker symbol comes from props. What dependency array should the effect use?',
        options: ['[]', '[symbol]', 'No array at all', '[refresh, Math.random()]'],
        answer: 1,
        explanation: 'Include every reactive value the effect reads, so changing the symbol restarts polling for the new one.',
      },
    ],
  },

  // ───────────────────────────── PROBLEM SOLVING ─────────────────────────────
  {
    id: 'ps-bigo',
    category: 'ps',
    title: 'Big-O Speed Round',
    description: 'Estimate complexity for real snippets before a design review.',
    difficulty: 'Easy',
    minutes: 8,
    xp: 75,
    scenario: 'Your tech lead asks for quick complexity estimates of three utility functions.',
    instructions: ['Answer all three questions.'],
    tasks: [
      {
        id: 't1', type: 'mcq',
        prompt: 'Two nested loops each running n times. What is the complexity?',
        options: ['O(n)', 'O(2n)', 'O(n²)', 'O(log n)'],
        answer: 2,
        explanation: 'n iterations × n iterations = n².',
      },
      {
        id: 't2', type: 'mcq',
        prompt: 'A loop where i doubles each iteration (i = 1, 2, 4 … < n). What is the complexity?',
        options: ['O(n)', 'O(log n)', 'O(√n)', 'O(1)'],
        answer: 1,
        explanation: 'Doubling reaches n in log₂ n steps.',
      },
      {
        id: 't3', type: 'input',
        prompt: 'Sorting with merge sort has time complexity O(?). Fill in the blank.',
        placeholder: 'e.g. n^2',
        accept: ['nlogn', 'n*logn', 'nlog(n)', 'n*log(n)', 'o(nlogn)'],
        explanation: 'Merge sort splits log n times and merges n elements at each level, so O(n log n).',
      },
    ],
  },
  {
    id: 'ps-twosum',
    category: 'ps',
    title: 'Payment Pair Finder',
    description: 'Find two refunds that add up to a disputed amount in a single pass.',
    difficulty: 'Medium',
    minutes: 15,
    xp: 150,
    scenario: 'Finance needs to find which two refunds sum to a disputed amount. Lists can contain 1M entries, so O(n²) is too slow.',
    instructions: ['Reason through the algorithm.', 'Answer all three questions.'],
    tasks: [
      {
        id: 't1', type: 'mcq',
        prompt: 'What data structure lets you solve this in one pass?',
        options: ['A stack', 'A hash map from value → index', 'A binary tree', 'A queue'],
        answer: 1,
        explanation: 'For each x, check whether target − x was seen before. Hash lookups are O(1).',
      },
      {
        id: 't2', type: 'input',
        prompt: 'For refunds [2, 7, 11, 15] and target 9, what are the indices? (format: i,j)',
        placeholder: 'i,j',
        accept: ['0,1', '[0,1]', '(0,1)'],
        explanation: '2 + 7 = 9, at indices 0 and 1.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'What are the time and space complexity of the hash-map approach?',
        options: ['O(n²) time, O(1) space', 'O(n) time, O(n) space', 'O(log n) time, O(n) space', 'O(n log n) time, O(1) space'],
        answer: 1,
        explanation: 'One pass over n items, storing up to n entries.',
      },
    ],
  },
  {
    id: 'ps-binsearch',
    category: 'ps',
    title: 'Find the First Failing Build',
    description: '1,024 CI builds, and one commit broke production. Find it in the fewest checks.',
    difficulty: 'Hard',
    minutes: 15,
    xp: 200,
    scenario: 'Builds are ordered. Once a build fails, every later build fails too. Each check takes 4 minutes, so minimize checks.',
    instructions: ['Apply binary search thinking.', 'Answer all three questions.'],
    tasks: [
      {
        id: 't1', type: 'input',
        prompt: 'What is the maximum number of checks needed for 1,024 builds? (number)',
        placeholder: 'number',
        accept: ['10'],
        explanation: 'log₂(1024) = 10. Each check halves the search space.',
      },
      {
        id: 't2', type: 'mcq',
        prompt: 'Which midpoint formula avoids integer overflow in Java/C++?',
        options: ['(lo + hi) / 2', 'lo + (hi - lo) / 2', 'hi / 2', '(lo * hi) / 2'],
        answer: 1,
        explanation: 'lo + (hi − lo)/2 never exceeds hi, while lo + hi can overflow for large indices.',
      },
      {
        id: 't3', type: 'mcq',
        prompt: 'If build mid fails, what should the next range be (to find the FIRST failure)?',
        options: ['lo = mid + 1', 'hi = mid', 'hi = mid - 1', 'Stop, mid is the answer'],
        answer: 1,
        explanation: 'mid might be the first failure, so keep it with hi = mid and continue until lo == hi.',
      },
    ],
  },
];

export const getMission = (id) => MISSIONS.find((m) => m.id === id);
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
