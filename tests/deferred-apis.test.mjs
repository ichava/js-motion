// v0.1.0 deferred items (design scope §2.1):
//   M6  (V-B1) data-motion-* numbers are validated, bad values take the default and warn
//   M3  (V-B2) pauseAll/resumeAll/stopAll, a host pause control, runtime reduced-motion
//   M4  (V-B3) unwire/destroy, and auto({ observe: true }) for nodes added later
// Fakes, not jsdom, as in phase1.test.mjs: the engine only touches what is faked here.
// Run: node --test tests/*.test.mjs

import assert from 'node:assert/strict';
import test from 'node:test';

/* A prefers-reduced-motion query whose answer and change listeners the tests control. */
const mql = {
  matches: false,
  listeners: [],
  addEventListener(type, fn) { if (type === 'change') this.listeners.push(fn); },
  removeEventListener(type, fn) { this.listeners = this.listeners.filter((f) => f !== fn); },
  fire() { this.listeners.slice().forEach((f) => f({ matches: this.matches })); },
};
let docEls = [];
globalThis.window = { matchMedia: () => mql };
globalThis.document = {
  readyState: 'complete',
  documentElement: { hasAttribute: () => false },
  querySelector: () => null,
  querySelectorAll: () => docEls,
};

/* MutationObserver fake: the test delivers records by hand. */
const observers = [];
globalThis.MutationObserver = class {
  constructor(cb) { this.cb = cb; this.connected = false; observers.push(this); }
  observe(target, init) { this.target = target; this.init = init; this.connected = true; }
  disconnect() { this.connected = false; }
  deliver(records) { if (this.connected) this.cb(records); }
};

const { default: IchavaMotion } = await import('../src/ichava-motion.ts');

function fakeAnimation(timing) {
  const listeners = {};
  const a = {
    timing,
    playState: 'running',
    addEventListener: (type, fn) => (listeners[type] ||= []).push(fn),
    cancel() { a.playState = 'idle'; (listeners.cancel || []).forEach((f) => f()); },
    pause() { a.playState = 'paused'; },
    play() { a.playState = 'running'; },
    finish() { a.playState = 'finished'; (listeners.finish || []).forEach((f) => f()); },
  };
  return a;
}

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** An element carrying `attrs`, with real listener bookkeeping and a recording animate(). */
function fakeEl(attrs = {}, children = []) {
  const listeners = {};
  const made = [];
  const el = {
    nodeType: 1,
    isConnected: true,
    style: {},
    dataset: {},
    made,
    getAttribute: (k) => (k in attrs ? attrs[k] : null),
    setAttribute: (k, v) => { attrs[k] = String(v); },
    hasAttribute: (k) => k in attrs,
    querySelectorAll: () => children,
    addEventListener: (t, fn) => (listeners[t] ||= []).push(fn),
    removeEventListener: (t, fn) => { listeners[t] = (listeners[t] || []).filter((f) => f !== fn); },
    dispatch: (t) => (listeners[t] || []).slice().forEach((f) => f({ type: t })),
    animate: (kf, timing) => { const a = fakeAnimation(timing); made.push(a); return a; },
    attrs,
  };
  for (const [k, v] of Object.entries(attrs)) if (k.startsWith('data-')) el.dataset[camel(k.slice(5))] = v;
  return el;
}
const rootOf = (...els) => ({ querySelectorAll: () => els });

function captureWarn(fn) {
  const warn = console.warn; const warns = [];
  console.warn = (s) => warns.push(String(s));
  try { fn(); } finally { console.warn = warn; }
  return warns;
}

/* ─── M6 ────────────────────────────────────────────────────────────────────── */

test('M6: a valid data-motion-duration is read', () => {
  const m = IchavaMotion.create();
  const el = fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-duration': '500' });
  m.auto(rootOf(el));
  assert.equal(el.made[0].timing.duration, 500);
});

for (const bad of ['abc', '-5']) {
  test(`M6: data-motion-duration="${bad}" plays with the default duration and warns once`, () => {
    const m = IchavaMotion.create();
    const el = fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-duration': bad });
    const warns = captureWarn(() => m.auto(rootOf(el)));
    assert.equal(el.made[0].timing.duration, 1400, "spin's base duration at 1x");
    assert.equal(warns.length, 1);
    assert.match(warns[0], /data-motion-duration/);
  });
}

test('M6: every numeric attribute is checked, not only duration', () => {
  const m = IchavaMotion.create();
  const el = fakeEl({
    'data-ichava-motion': 'spin',
    'data-motion-speed': 'fast',
    'data-motion-delay': 'soon',
    'data-motion-iterations': '-1',
  });
  const warns = captureWarn(() => m.auto(rootOf(el)));
  const t = el.made[0].timing;
  assert.equal(t.duration, 1400, 'speed fell back to 1x');
  assert.equal(t.delay, 0, 'delay fell back to 0');
  assert.equal(t.iterations, Infinity, "spin's own iteration count");
  assert.equal(warns.length, 3);
  for (const a of ['data-motion-speed', 'data-motion-delay', 'data-motion-iterations']) {
    assert.ok(warns.some((w) => w.includes(a)), `no warning named ${a}`);
  }
});

test('M6: values WAAPI accepts are not narrowed (a negative delay starts part-way)', () => {
  const m = IchavaMotion.create();
  const el = fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-delay': '-200', 'data-motion-speed': '0' });
  const warns = captureWarn(() => m.auto(rootOf(el)));
  assert.equal(el.made[0].timing.delay, -200);
  assert.equal(el.made[0].timing.duration, 14000, 'speed 0 is clamped to 0.1x, as before');
  assert.equal(warns.length, 0);
});

test('M6: iterations="infinite" and plain numbers still parse as before', () => {
  const m = IchavaMotion.create();
  const a = fakeEl({ 'data-ichava-motion': 'pop', 'data-motion-iterations': 'infinite' });
  const b = fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-iterations': '3', 'data-motion-speed': '2' });
  const warns = captureWarn(() => m.auto(rootOf(a, b)));
  assert.equal(a.made[0].timing.iterations, Infinity);
  assert.equal(b.made[0].timing.iterations, 3);
  assert.equal(b.made[0].timing.duration, 700);
  assert.equal(warns.length, 0);
});

/* ─── M3 ────────────────────────────────────────────────────────────────────── */

test('M3: pauseAll() pauses every running animation and resumeAll() resumes them', () => {
  const m = IchavaMotion.create();
  const els = [fakeEl(), fakeEl(), fakeEl()];
  const anims = els.map((el) => m.play(el, 'spin'));
  assert.equal(m.pauseAll(), m, 'chains');
  for (const a of anims) assert.equal(a.playState, 'paused');
  assert.equal(m.resumeAll(), m, 'chains');
  for (const a of anims) assert.equal(a.playState, 'running');
});

test('M3: stopAll() cancels everything, and resumeAll() cannot revive it', () => {
  const m = IchavaMotion.create();
  const anims = [fakeEl(), fakeEl()].map((el) => m.play(el, 'spin'));
  assert.equal(m.stopAll(), m, 'chains');
  for (const a of anims) assert.equal(a.playState, 'idle');
  m.resumeAll();
  for (const a of anims) assert.equal(a.playState, 'idle');
});

test('M3: a finished or cancelled animation is no longer tracked', () => {
  const m = IchavaMotion.create();
  const done = m.play(fakeEl(), 'pop');
  const gone = m.play(fakeEl(), 'spin');
  done.finish();
  gone.cancel();
  m.pauseAll();
  assert.equal(done.playState, 'finished');
  assert.equal(gone.playState, 'idle');
});

test('M3: a group handle is paused through its fan-out', () => {
  const m = IchavaMotion.create();
  const kids = [fakeEl(), fakeEl()];
  const root = fakeEl({}, []);
  root.querySelectorAll = (sel) => (sel === '[data-layer]' ? kids : []);
  m.play(root, 'parallax');
  m.pauseAll();
  for (const k of kids) assert.equal(k.made[0].playState, 'paused');
});

test('M3: turning on reduced motion at runtime stops every animation', () => {
  const m = IchavaMotion.create();
  const anims = [fakeEl(), fakeEl(), fakeEl()].map((el) => m.play(el, 'spin'));
  assert.ok(mql.listeners.length >= 1, 'a change listener is installed');
  mql.matches = true;
  try {
    mql.fire();
    for (const a of anims) assert.equal(a.playState, 'idle');
  } finally { mql.matches = false; }
  m.destroy();
});

test('M3: a pause control the host renders toggles pauseAll/resumeAll and aria-pressed', () => {
  const m = IchavaMotion.create();
  const btn = fakeEl();
  const el = fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-trigger': 'loop' });
  m.auto(rootOf(el), { pauseControl: btn });
  const a = el.made[0];
  assert.equal(btn.attrs['aria-pressed'], 'false');
  btn.dispatch('click');
  assert.equal(a.playState, 'paused');
  assert.equal(btn.attrs['aria-pressed'], 'true');
  btn.dispatch('click');
  assert.equal(a.playState, 'running');
  assert.equal(btn.attrs['aria-pressed'], 'false');
  m.destroy();
  btn.dispatch('click');
  assert.equal(btn.attrs['aria-pressed'], 'false', 'destroy() detaches the control');
});

test('M3: autoInit() accepts the same pauseControl option', () => {
  const m = IchavaMotion.create();
  const btn = fakeEl();
  docEls = [fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-trigger': 'loop' })];
  try {
    assert.equal(m.autoInit({ pauseControl: btn }), m);
    btn.dispatch('click');
    assert.equal(docEls[0].made[0].playState, 'paused');
  } finally { m.destroy(); docEls = []; }
});

/* ─── M4 ────────────────────────────────────────────────────────────────────── */

test('M4: after unwire(), a mouseenter starts nothing', () => {
  const m = IchavaMotion.create();
  const el = fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-trigger': 'hover' });
  const root = rootOf(el);
  m.auto(root);
  el.dispatch('mouseenter');
  assert.equal(el.made.length, 1, 'positive control: wired, it plays');
  el.dispatch('mouseleave');
  m.unwire(root);
  el.dispatch('mouseenter');
  assert.equal(el.made.length, 1);
});

test('M4: an unwired element can be wired again', () => {
  const m = IchavaMotion.create();
  const el = fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-trigger': 'hover' });
  m.auto(rootOf(el));
  m.unwire(rootOf(el));
  m.auto(rootOf(el));
  el.dispatch('mouseenter');
  assert.equal(el.made.length, 1);
});

test('M4: auto({ observe: true }) wires added nodes, and destroy() unwires them', () => {
  const m = IchavaMotion.create();
  const before = observers.length;
  m.auto({ observe: true });
  const mo = observers[before];
  assert.ok(mo && mo.connected, 'an observer was installed on the document');
  assert.equal(mo.target, document);
  assert.deepEqual(mo.init, { childList: true, subtree: true });

  const child = fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-trigger': 'hover' });
  const added = fakeEl({}, [child]);
  mo.deliver([{ addedNodes: [added], removedNodes: [] }]);
  child.dispatch('mouseenter');
  assert.equal(child.made.length, 1, 'the added node was wired');
  child.dispatch('mouseleave');

  docEls = [child];
  try { m.destroy(); } finally { docEls = []; }
  child.dispatch('mouseenter');
  assert.equal(child.made.length, 1, 'after destroy() it is not');
  assert.equal(mo.connected, false, 'destroy() disconnects the observer');
});

test('M4: a node removed from the observed root is unwired', () => {
  const m = IchavaMotion.create();
  const root = rootOf();
  const before = observers.length;
  m.auto(root, { observe: true });
  const mo = observers[before];
  const el = fakeEl({ 'data-ichava-motion': 'spin', 'data-motion-trigger': 'hover' });
  mo.deliver([{ addedNodes: [el], removedNodes: [] }]);
  el.isConnected = false;
  mo.deliver([{ addedNodes: [], removedNodes: [el] }]);
  el.dispatch('mouseenter');
  assert.equal(el.made.length, 0);
  m.destroy();
});

test('M4: destroy() stops what is playing and removes the reduced-motion listener', () => {
  const m = IchavaMotion.create();
  const a = m.play(fakeEl(), 'spin');
  const n = mql.listeners.length;
  m.destroy();
  assert.equal(a.playState, 'idle');
  assert.equal(mql.listeners.length, n - 1);
});

test('M4: auto(root) keeps its old shape, returning nothing', () => {
  const m = IchavaMotion.create();
  assert.equal(m.auto(rootOf()), undefined);
});
