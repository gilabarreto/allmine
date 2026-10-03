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
console.log('ok');
