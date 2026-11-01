// Ambient "arena" backdrop: a perspective grid floor, slow glows and rising
// sparks. Low contrast so cards stay readable; tinted per viewing lens.
// Animations are disabled by the global prefers-reduced-motion rule.
const TONES = {
  student: { a: '124,108,255', b: '56,189,248' },   // violet + sky
  college: { a: '45,212,191', b: '124,108,255' },   // teal + violet
  recruiter: { a: '251,191,36', b: '249,115,22' },  // amber + orange
};

const SPARKS = [
  { left: '8%', delay: '0s', dur: '14s', size: 3 },
  { left: '17%', delay: '6s', dur: '18s', size: 2 },
  { left: '29%', delay: '2s', dur: '16s', size: 3 },
  { left: '41%', delay: '9s', dur: '20s', size: 2 },
  { left: '53%', delay: '4s', dur: '15s', size: 3 },
  { left: '64%', delay: '11s', dur: '19s', size: 2 },
  { left: '76%', delay: '1s', dur: '17s', size: 3 },
  { left: '88%', delay: '7s', dur: '21s', size: 2 },
  { left: '95%', delay: '13s', dur: '16s', size: 2 },
];

export default function ArenaBackground({ tone = 'student' }) {
  const t = TONES[tone] || TONES.student;
  return (
    <div aria-hidden="true" className="arena-bg pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ '--a': t.a, '--b': t.b }}>
      <div className="arena-glow arena-glow-1" />
      <div className="arena-glow arena-glow-2" />
      <div className="arena-dots" />
      <div className="arena-floor-wrap"><div className="arena-floor" /></div>
      <div className="arena-horizon" />
      {SPARKS.map((s, i) => (
        <span key={i} className="arena-spark" style={{ left: s.left, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }} />
      ))}
    </div>
  );
}
