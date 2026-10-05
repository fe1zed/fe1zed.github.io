/**
 * Device outlines for the showcase's background field once projects are
 * listed, laid out around the real cards: in the side margins, in empty
 * card slots, beside the hero. (With no projects, a hand-placed tile in
 * showcase.html fills the first screen instead.)
 *
 * Placement is best-candidate: each outline tries a few dozen random spots
 * and takes the roomiest, so the field comes out evenly spread rather than
 * clumped. An outline that doesn't fit at full size tries smaller ones, so
 * a laptop's narrow margins still get outlines, just smaller ones. Nothing
 * is placed within GAP of a card, the hero text or another outline, with
 * room on top for the float animation (see bg-drift in showcase.css).
 *
 * Outlines next to each other are always different devices. Two outlines
 * count as next to each other when they're closer than NEIGHBOUR, or
 * closer than APART with no other outline between them (none inside the
 * circle the gap between them spans), so a narrow margin doesn't stack two
 * of a kind with nothing in between. An outline placed later can only come
 * between two others, never take one's place beside another, so checking
 * each outline as it's placed holds for the whole field. Each spot takes
 * the device least seen around it, then the least used overall, so the mix
 * stays even close up and across the page.
 *
 * Each card also gets a soft patch of page colour behind it (above the
 * outlines), so outlines fade out as they near a card.
 *
 * The layout is seeded, so the same sizes always give the same field.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/* The drawings in showcase.html's <defs> (#bg-<kind>): viewBox, height per
   unit of width, and the width range in --bg-unit steps, matching the
   hand-placed tile. */
const KINDS = {
  pad:    { viewBox: "-2 0 684 456",  aspect: 456 / 684, width: [130, 185] },
  kb:     { viewBox: "-2 -2 292 112", aspect: 112 / 292, width: [130, 165] },
  mouse:  { viewBox: "-2 -2 72 116",  aspect: 116 / 72,  width: [56, 68] },
  switch: { viewBox: "-2 -2 244 106", aspect: 106 / 244, width: [150, 185] },
  phone:  { viewBox: "-2 -4 204 104", aspect: 104 / 204, width: [125, 150] },
};

const GAP = 14;                   // px kept between outlines, and around cards and text
const DRIFT = 8;                  // px the float can carry an outline up or down
const SCALES = [1, 0.8, 0.65, 0.5];
const MIN_WIDTH = 34;             // px; smaller than this isn't worth drawing
const CANDIDATES = 32;            // spots tried per outline
const MAX_MISSES = 16;            // stop once this many outlines in a row find no spot
const AREA_PER_OUTLINE = 22000;   // px² of free space per outline at 1px per unit
const BLEED = 0.2;                // share of an outline allowed past the field's edge
const ROOMY = 36;                 // px; more clearance than this scores no higher
const NEIGHBOUR = 72;             // px at 1px per unit; closer than this is always next to
const APART = 280;                // px at 1px per unit; further than this is never next to
const CELL = 240;                 // px; neighbour-lookup grid

/** Small seeded PRNG (mulberry32). */
function random(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Boxes are oriented: centre, half extents, and the cos/sin of the turn. */
const box = (x, y, hw, hh, deg = 0) => {
  const a = (deg * Math.PI) / 180;
  return { x, y, hw, hh, c: Math.cos(a), s: Math.sin(a) };
};
const rectBox = (r, pad) => box(r.x + r.width / 2, r.y + r.height / 2, r.width / 2 + pad, r.height / 2 + pad);
const extents = (b) => [
  b.hw * Math.abs(b.c) + b.hh * Math.abs(b.s),
  b.hw * Math.abs(b.s) + b.hh * Math.abs(b.c),
];

/** Gap between two boxes along the axis that separates them best; negative when they overlap. */
function separation(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  let best = -Infinity;
  for (const [nx, ny] of [[a.c, a.s], [-a.s, a.c], [b.c, b.s], [-b.s, b.c]]) {
    const d = Math.abs(dx * nx + dy * ny);
    const ra = a.hw * Math.abs(a.c * nx + a.s * ny) + a.hh * Math.abs(-a.s * nx + a.c * ny);
    const rb = b.hw * Math.abs(b.c * nx + b.s * ny) + b.hh * Math.abs(-b.s * nx + b.c * ny);
    best = Math.max(best, d - ra - rb);
  }
  return best;
}

/**
 * Lay outlines out in `layer` (positioned to cover the field) around
 * `cards`, keeping clear of `keepClear` too. Rects are { x, y, width,
 * height } in the layer's coordinates. Replaces whatever the layer held.
 */
export function scatterDevices(layer, { cards, keepClear = [], seed = 1 }) {
  const rand = random(seed);
  const between = ([lo, hi]) => lo + rand() * (hi - lo);
  const W = layer.clientWidth, H = layer.clientHeight;

  // --bg-unit is a clamp() on the viewport width; let CSS resolve it.
  const probe = document.createElement("div");
  probe.style.width = "calc(100 * var(--bg-unit))";
  layer.replaceChildren(probe);
  const unit = probe.offsetWidth / 100;
  probe.remove();

  const blocked = [...cards, ...keepClear].map((r) => rectBox(r, GAP));
  const free = W * H - [...cards, ...keepClear].reduce((sum, r) => sum + r.width * r.height, 0);
  const limit = Math.max(0, Math.round(free / (AREA_PER_OUTLINE * unit * unit)));

  const placed = [];
  const kinds = Object.keys(KINDS);
  const used = Object.fromEntries(kinds.map((kind) => [kind, 0]));
  const neighbour = NEIGHBOUR * unit, apart = APART * unit;
  const buckets = new Map();
  const bucketKeys = (b, reach) => {
    const [ex, ey] = extents(b), keys = [];
    for (let i = Math.floor((b.x - ex - reach) / CELL); i <= Math.floor((b.x + ex + reach) / CELL); i++)
      for (let j = Math.floor((b.y - ey - reach) / CELL); j <= Math.floor((b.y + ey + reach) / CELL); j++) keys.push(`${i},${j}`);
    return keys;
  };
  const near = (b, reach) => [...new Set(bucketKeys(b, reach).flatMap((k) => buckets.get(k) ?? []))];
  // Half the diagonal of the largest outline, float included.
  const largest = Math.max(...kinds.map((kind) => {
    const w = KINDS[kind].width[1] * unit;
    return Math.hypot(w / 2 + 2, (w * KINDS[kind].aspect) / 2 + DRIFT);
  }));

  // Room around a candidate and its gaps to the outlines in `pool`, or null
  // if it doesn't fit there or sits within NEIGHBOUR of its own kind.
  const fit = (b, kind, pool) => {
    const [ex, ey] = extents(b);
    const outX = (Math.max(0, ex - b.x) + Math.max(0, b.x + ex - W)) / (2 * ex);
    const outY = (Math.max(0, ey - b.y) + Math.max(0, b.y + ey - H)) / (2 * ey);
    if (outX > BLEED || outY > BLEED) return null;
    let room = ROOMY;
    for (const other of blocked) {
      const d = separation(b, other);
      if (d < 0) return null;
      room = Math.min(room, d);
    }
    const gaps = [];
    for (const other of pool) {
      const d = separation(b, other.box);
      if (d < GAP || (other.kind === kind && d < neighbour)) return null;
      room = Math.min(room, d - GAP);
      gaps.push([other, d]);
    }
    return { room, gaps };
  };

  // True if each outline of `kind` within APART has another outline between
  // it and the candidate. Judged on the drawings themselves (`body`, without
  // the float's room), with a margin so the call holds as they float.
  const mixedIn = (body, kind, gaps) => gaps.every(([kin, g]) => {
    if (kin.kind !== kind || g >= apart) return true;
    const d = separation(body, kin.body);
    return gaps.some(([other, e]) => other !== kin && e < d
      && separation(body, other.body) ** 2 + separation(kin.body, other.body) ** 2 < 0.6 * d * d);
  });

  for (let i = 0, misses = 0; placed.length < limit && misses < MAX_MISSES; i++) {
    // Least used first; ties rotate so no device always leads.
    const order = kinds.map((_, j) => kinds[(i + j) % kinds.length]).sort((a, b) => used[a] - used[b]);
    const widths = Object.fromEntries(order.map((kind) => [kind, between(KINDS[kind].width)]));
    let best = null;
    for (let k = 0; k < CANDIDATES; k++) {
      const x = rand() * W, y = rand() * H;
      const turn = (5 + rand() * 20) * (rand() < 0.5 ? -1 : 1);
      // A spot on a card (or the hero text) fits nothing.
      if (blocked.some((r) => Math.abs(x - r.x) < r.hw && Math.abs(y - r.y) < r.hh)) continue;
      const pool = near(box(x, y, largest, largest), apart);
      // The spot takes the device least seen around it (then least used
      // overall) that fits there, at the largest size that fits.
      const around = Object.fromEntries(kinds.map((kind) => [kind, 0]));
      for (const other of pool) if (Math.hypot(other.x - x, other.y - y) < apart + largest) around[other.kind]++;
      const local = [...order].sort((a, b) => around[a] - around[b]);
      spot: for (const kind of local) {
        for (const scale of SCALES) {
          const px = widths[kind] * scale * unit;
          if (px < MIN_WIDTH) break;
          // Half a turn of the 4° float, and its reach up and down.
          const b = box(x, y, px / 2 + 2, (px * KINDS[kind].aspect) / 2 + DRIFT, turn + 2);
          const room = fit(b, kind, pool);
          if (!room) continue;
          // Next to its own kind: try the next device rather than a smaller size.
          const body = box(x, y, px / 2, (px * KINDS[kind].aspect) / 2, turn + 2);
          if (!mixedIn(body, kind, room.gaps)) continue spot;
          const score = room.room + 80 * scale;
          if (!best || score > best.score) best = { score, kind, w: widths[kind] * scale, x, y, turn, box: b, body };
          break spot;
        }
      }
    }
    if (!best) { misses++; continue; }
    misses = 0;
    placed.push(best);
    used[best.kind]++;
    for (const key of bucketKeys(best.box, 0)) (buckets.get(key) ?? buckets.set(key, []).get(key)).push(best);
  }

  const fragment = document.createDocumentFragment();
  for (const p of placed) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "showcase-bg-item");
    svg.setAttribute("viewBox", KINDS[p.kind].viewBox);
    svg.setAttribute("style", `--x: ${p.x.toFixed(1)}px; --y: ${p.y.toFixed(1)}px; --w: ${p.w.toFixed(1)}; `
      + `--r: ${Math.round(p.turn)}deg; --o: ${(0.45 + rand() * 0.45).toFixed(2)}; --t: ${(-rand() * 8).toFixed(1)}s`);
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", `#bg-${p.kind}`);
    svg.append(use);
    fragment.append(svg);
  }
  for (const r of cards) {
    const shield = document.createElement("div");
    shield.className = "showcase-bg-shield";
    Object.assign(shield.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.width}px`, height: `${r.height}px` });
    fragment.append(shield);
  }
  layer.replaceChildren(fragment);
  return placed.length;
}
