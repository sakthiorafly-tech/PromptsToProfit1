// Tiny synthesized sound effects (Web Audio API). No audio files, works
// offline. The AudioContext is created lazily on the first sound, which always
// follows a user click, so browsers allow it.
const KEY = 'skillarena:sound';
let ctx = null;
let master = null;
let enabled = (() => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } })();
const listeners = new Set();

export const isSoundOn = () => enabled;
export function setSoundOn(on) {
  enabled = on;
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn(on));
  if (on) play.tick();
}
export function onSoundChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function audio() {
  if (!enabled || typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// One enveloped oscillator note. `at` is seconds from now.
function note(freq, { at = 0, dur = 0.18, type = 'triangle', gain = 0.5, glideTo, attack = 0.008 } = {}) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Filtered white-noise burst (whooshes, slashes, shatters, booms).
let noiseBuf = null;
function noise({ at = 0, dur = 0.2, gain = 0.3, type = 'bandpass', freq = 1200, freqTo, q = 1 } = {}) {
  const c = audio();
  if (!c) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

// A bell = fundamental + soft overtone.
const bell = (f, at, dur = 0.7, gain = 0.32) => { note(f, { at, dur, type: 'sine', gain }); note(f * 2.01, { at, dur: dur * 0.6, type: 'sine', gain: gain * 0.25 }); };

export const play = {
  // UI clicks: a short "pop" (body + bright transient), audible on laptop speakers.
  tick: () => { note(1100, { dur: 0.06, type: 'triangle', gain: 0.6, glideTo: 520, attack: 0.002 }); note(2600, { dur: 0.018, type: 'sine', gain: 0.12, attack: 0.001 }); },
  select: () => { note(660, { dur: 0.09, type: 'triangle', gain: 0.62, glideTo: 990, attack: 0.003 }); note(1980, { at: 0.02, dur: 0.05, type: 'sine', gain: 0.12 }); },
  success: () => {
    [523.25, 659.25, 783.99].forEach((f, i) => note(f, { at: i * 0.085, dur: 0.16, gain: 0.34 }));
    note(1046.5, { at: 0.255, dur: 0.5, gain: 0.38 });
    bell(2093, 0.3, 0.6, 0.12);
  },
  xpTicks: (count = 12, span = 1.0) => {
    for (let i = 0; i < count; i += 1) note(900 + i * 70, { at: 0.35 + (i * span) / count, dur: 0.03, type: 'square', gain: 0.035 });
  },
  levelUp: (at = 0) => {
    note(330, { at, dur: 0.45, type: 'sawtooth', gain: 0.07, glideTo: 1320, attack: 0.05 });
    [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => bell(f, at + 0.32 + i * 0.07, 0.5, 0.2));
  },
  badge: (at = 0) => { bell(1318.5, at, 0.6, 0.26); bell(1975.5, at + 0.09, 0.8, 0.22); },
  achievement: () => { note(987.77, { dur: 0.12, gain: 0.3 }); bell(1318.5, 0.1, 0.9, 0.3); },
  fail: () => { note(311, { dur: 0.16, gain: 0.26 }); note(233, { at: 0.15, dur: 0.32, gain: 0.26, glideTo: 220 }); },
  hit: (at = 0) => { note(180, { at, dur: 0.12, type: 'square', gain: 0.18, glideTo: 90, attack: 0.002 }); note(1400, { at, dur: 0.03, type: 'sine', gain: 0.1 }); },
  bossDefeat: (at = 0) => {
    note(110, { at, dur: 0.5, type: 'sawtooth', gain: 0.12, glideTo: 55 });
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => note(f, { at: at + 0.25 + i * 0.07, dur: 0.22, gain: 0.3 }));
    bell(2093, at + 0.6, 0.8, 0.18);
  },
  // Boss duel
  zap: (at = 0) => {
    note(1500, { at, dur: 0.16, type: 'square', gain: 0.08, glideTo: 380, attack: 0.002 });
    note(2600, { at, dur: 0.1, type: 'sine', gain: 0.1, glideTo: 900 });
  },
  whoosh: (at = 0) => noise({ at, dur: 0.28, gain: 0.45, type: 'bandpass', freq: 350, freqTo: 2600, q: 0.8 }),
  slash: (at = 0) => {
    noise({ at, dur: 0.14, gain: 0.55, type: 'highpass', freq: 2500, freqTo: 6000 });
    note(1100, { at, dur: 0.16, type: 'triangle', gain: 0.2, glideTo: 220 });
  },
  shatter: (at = 0) => {
    noise({ at, dur: 0.45, gain: 0.5, type: 'bandpass', freq: 3200, freqTo: 900, q: 0.7 });
    [2637, 3520, 3136, 4186, 2793].forEach((f, i) => note(f, { at: at + 0.02 + i * 0.045, dur: 0.18, type: 'sine', gain: 0.07 }));
  },
  ko: (at = 0) => {
    note(140, { at, dur: 0.7, type: 'sine', gain: 0.75, glideTo: 38, attack: 0.004 });
    noise({ at, dur: 0.5, gain: 0.45, type: 'lowpass', freq: 600, freqTo: 120 });
    // short brassy victory sting
    [[523.25, 0.32], [659.25, 0.42], [783.99, 0.52], [1046.5, 0.64]].forEach(([f, d]) => {
      note(f, { at: at + d, dur: f > 1000 ? 0.7 : 0.16, type: 'sawtooth', gain: 0.07 });
      note(f, { at: at + d, dur: f > 1000 ? 0.7 : 0.16, type: 'triangle', gain: 0.18 });
    });
  },
  taunt: (at = 0) => { note(392, { at, dur: 0.12, gain: 0.18, glideTo: 523 }); note(311, { at: at + 0.13, dur: 0.22, gain: 0.18, glideTo: 262 }); },
  practice: () => { note(1046.5, { dur: 0.12, gain: 0.25 }); note(1567.98, { at: 0.1, dur: 0.3, gain: 0.25 }); },
};
