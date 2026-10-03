// Game logic, no DOM: index.html renders it, test.js checks it.
// off(i) true = cell is land, not part of the game.
function makeBoard(w, h, mines, off = () => false) {
  const cells = Array.from({ length: w * h }, (_, i) => ({ mine: false, open: false, flag: false, n: 0, off: off(i) }));
  return { w, h, mines, cells, state: 'ready' };
}

function neighbors(b, i) {
  const x = i % b.w, y = Math.floor(i / b.w), out = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < b.w && ny < b.h && !b.cells[ny * b.w + nx].off) out.push(ny * b.w + nx);
    }
  return out;
}

// Mines are placed on the first click, never on or next to it.
function plant(b, safe, rand) {
  const banned = new Set([safe, ...neighbors(b, safe)]);
  const pool = b.cells.map((_, i) => i).filter(i => !banned.has(i) && !b.cells[i].off);
  for (let k = 0; k < b.mines; k++) {
    const j = k + Math.floor(rand() * (pool.length - k));
    [pool[k], pool[j]] = [pool[j], pool[k]];
    b.cells[pool[k]].mine = true;
  }
  b.cells.forEach((c, i) => { c.n = neighbors(b, i).filter(j => b.cells[j].mine).length; });
}

function reveal(b, i, rand = Math.random) {
  if (b.state === 'won' || b.state === 'lost') return;
  if (b.state === 'ready') { plant(b, i, rand); b.state = 'playing'; }
  const c = b.cells[i];
  if (c.open || c.flag || c.off) return;
  if (c.mine) { c.open = true; b.state = 'lost'; return; }
  const stack = [i];
  while (stack.length) {
    const j = stack.pop(), d = b.cells[j];
    if (d.open || d.flag) continue;
    d.open = true;
    if (d.n === 0) stack.push(...neighbors(b, j));
  }
  if (b.cells.every(c => c.mine || c.open || c.off)) b.state = 'won';
}

// No more flags than mines.
function toggleFlag(b, i) {
  const c = b.cells[i];
  if (b.state === 'won' || b.state === 'lost' || c.open || c.off) return;
  if (!c.flag && b.cells.filter(d => d.flag).length >= b.mines) return;
  c.flag = !c.flag;
}

if (typeof module !== 'undefined') module.exports = { makeBoard, neighbors, reveal, toggleFlag };
