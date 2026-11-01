// Reference solutions for coding tasks, used by the presenter's demo autofill
// (Shift + A on a mission page). MCQ and short answers come from missions.js.
export const CODE_SOLUTIONS = {
  'java-bank': {
    t2: `public void withdraw(BigDecimal amount) {
    if (amount.compareTo(balance) > 0) {
        throw new InsufficientFundsException("Insufficient funds");
    }
    balance = balance.subtract(amount);
}`,
  },
  'java-oop': {
    t1: `public class UpiPayment implements PaymentMethod {
    @Override
    public boolean pay(double amount) {
        return true;
    }
}`,
  },
  'sql-optimize': {
    t2: `SELECT id, total, status, created_at
FROM orders
WHERE customer_id = 42
  AND created_at >= '2024-01-01'
  AND created_at < '2025-01-01'
ORDER BY created_at DESC;`,
  },
  'sql-window': {
    t1: `SELECT name, region, sales,
       RANK() OVER (PARTITION BY region ORDER BY sales DESC) AS rnk
FROM sales_reps;`,
  },
  'py-sales': {
    t2: `import pandas as pd
df["revenue"] = df["units"] * df["price"]
region_revenue = df.groupby("region")["revenue"].sum()`,
  },
  'py-api': {
    t1: `users = response.json()
names = [u.get("name") for u in users if u.get("active")]`,
  },
  'react-render': {
    t2: `function addItem(text) {
  setItems(prev => [...prev, { id: crypto.randomUUID(), text }]);
}`,
  },
  'react-effect': {
    t1: `useEffect(() => {
  const id = setInterval(() => refresh(), 5000);
  return () => clearInterval(id);
}, []);`,
  },
};

export function correctAnswers(mission) {
  return Object.fromEntries(mission.tasks.map((t) => {
    if (t.type === 'mcq') return [t.id, t.answer];
    if (t.type === 'input') return [t.id, t.accept[0]];
    return [t.id, CODE_SOLUTIONS[mission.id]?.[t.id] ?? t.starter];
  }));
}
