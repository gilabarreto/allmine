const assert = require('assert');
const { makeBoard, reveal, toggleFlag } = require('./mines.js');

// Seeded rand so failures reproduce.
let s = 42; const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;

for (let t = 0; t < 200; t++) {
  const b = makeBoard(9, 9, 10);
  reveal(b, 40, rand);
  assert.strictEqual(b.cells.filter(c => c.mine).length, 10);
  assert.ok(!b.cells[40].mine && b.cells[40].n === 0, 'first click is safe and opens area');
  assert.strictEqual(b.state, b.cells.every(c => c.mine || c.open) ? 'won' : 'playing');
  // Playing every safe cell must win.
  b.cells.forEach((c, i) => { if (!c.mine) reveal(b, i); });
  assert.strictEqual(b.state, 'won');
}

const b = makeBoard(9, 9, 10);
reveal(b, 0, rand);
const mine = b.cells.findIndex(c => c.mine);
toggleFlag(b, mine); reveal(b, mine);
assert.strictEqual(b.state, 'playing', 'flagged cell does not explode');
toggleFlag(b, mine); reveal(b, mine);
assert.strictEqual(b.state, 'lost');
// Land cells: never mined, never opened, don't count as neighbors, don't block the win.
const land = i => i % 9 === 8;
const m = makeBoard(9, 9, 10, land);
reveal(m, 40, rand);
assert.ok(m.cells.every(c => !c.off || (!c.mine && !c.open)));
m.cells.forEach((c, i) => { if (!c.mine && !c.off) reveal(m, i); });
assert.strictEqual(m.state, 'won');
// Flags are capped at the mine count.
const f = makeBoard(9, 9, 2);
for (let i = 0; i < 5; i++) toggleFlag(f, i);
assert.strictEqual(f.cells.filter(c => c.flag).length, 2);
toggleFlag(f, 0); toggleFlag(f, 3);
assert.ok(!f.cells[0].flag && f.cells[3].flag, 'unflagging frees a flag');
// A flagged first click must not plant mines or consume the safe opening.
const firstFlag = makeBoard(9, 9, 10);
toggleFlag(firstFlag, 0);
reveal(firstFlag, 0, rand);
assert.strictEqual(firstFlag.state, 'ready');
assert.ok(firstFlag.cells.every(c => !c.mine));
reveal(firstFlag, 40, rand);
assert.ok(firstFlag.cells[40].open && firstFlag.cells[40].n === 0);

// Using every flag must still allow safe unflagged cells to be revealed.
const allFlags = makeBoard(9, 9, 10);
reveal(allFlags, 40, rand);
allFlags.cells.forEach((c, i) => { if (c.mine) toggleFlag(allFlags, i); });
assert.strictEqual(allFlags.cells.filter(c => c.flag).length, allFlags.mines);
allFlags.cells.forEach((c, i) => { if (!c.mine) reveal(allFlags, i); });
assert.strictEqual(allFlags.state, 'won');
console.log('ok');
