/**
 * Decorative paper airplanes for a background <canvas>.
 *
 * Nothing about a flight is scripted. Each plane enters from a random point on
 * a random edge (top, right, bottom or left), wanders through a few random
 * waypoints, and leaves through a different random edge. Its turn rate is the
 * steering toward the next waypoint plus smoothed random noise, and every so
 * often a random "curl" of random tightness, direction and length, which is
 * where loops and spirals come from. Speed, size, agility and timing are also
 * random per plane.
 *
 * The flown path is sampled once up front, so the dashed trail is simply the
 * last stretch of that polyline: rounded dashes pinned to path length, fading
 * toward the tail.
 *
 * The canvas never takes input (CSS sets pointer-events: none). Nothing runs
 * under prefers-reduced-motion, while the canvas is off screen, or while the
 * tab is hidden (requestAnimationFrame stops on its own).
 */

const STEP = 2;                 // px between sampled path points
const TRAIL = 640;              // px of dashed trail kept behind a plane
const DASH = 10;                // px per dash (before its round caps)
const GAP = 12;                 // px from one dash start to the next, minus DASH
const TRAIL_WIDTH = 3;
const TRAIL_ALPHA = 0.6;        // at the plane; fades to 0 at the tail
const MARGIN = 40;              // planes enter/leave this far outside the canvas
const MAX_STEPS = 6000;         // hard cap on the wandering part of a path
const SPAWN_MS = [1800, 4200];  // gap between planes
const SPEED = [140, 210];       // px/s

/* Flat, top-down plane pointing along +x; symmetric, so it never needs flipping. */
const PLANE = [[12, 0], [-10, -9], [-5, 0], [-10, 9]];
const PLANE_TAIL = 8;           // trail starts this far behind the plane's centre

const EDGES = ["top", "right", "bottom", "left"];

const rand = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** A random point just outside the given edge of a w × h box. */
function edgePoint(edge, w, h, margin) {
  switch (edge) {
    case "top":    return { x: rand(0, w), y: -margin };
    case "bottom": return { x: rand(0, w), y: h + margin };
    case "left":   return { x: -margin, y: rand(0, h) };
    default:       return { x: w + margin, y: rand(0, h) };
  }
}

/** Sample one random flight across a w × h box. */
function planFlight(w, h) {
  const entry = pick(EDGES);
  const start = edgePoint(entry, w, h, MARGIN);
  const exit = edgePoint(pick(EDGES.filter((e) => e !== entry)), w, h, MARGIN * 2);
  const waypoints = Array.from({ length: randInt(0, 2) }, () => ({ x: rand(w * 0.08, w * 0.92), y: rand(h * 0.1, h * 0.9) }));
  waypoints.push(exit);

  // Per-plane temperament: how hard it steers, how jittery it is, how often it curls.
  const maxTurn = rand(0.03, 0.06);
  const gain = rand(0.03, 0.08);
  const jitter = rand(0.002, 0.006);
  const curlChance = rand(0.0015, 0.005);
  const reach = Math.max(70, (STEP / maxTurn) * 1.3);  // close enough to a waypoint

  let { x, y } = start;
  let heading = Math.atan2(waypoints[0].y - y, waypoints[0].x - x) + rand(-0.6, 0.6);
  let wobble = 0;     // smoothed random turn (mean-reverting random walk)
  let curl = null;    // { left: radians still to turn, rate }
  let target = 0;
  let budget = 600;   // steps allowed per waypoint before moving on

  const points = [{ x, y, a: heading }];
  const outside = () => x < -MARGIN * 1.5 || x > w + MARGIN * 1.5 || y < -MARGIN * 1.5 || y > h + MARGIN * 1.5;
  const step = (turn) => {
    heading += turn;
    x += Math.cos(heading) * STEP;
    y += Math.sin(heading) * STEP;
    points.push({ x, y, a: heading });
  };

  for (let i = 0; i < MAX_STEPS; i++) {
    const last = target === waypoints.length - 1;
    const goal = waypoints[target];
    if (!last && (Math.hypot(goal.x - x, goal.y - y) < reach || --budget <= 0)) {
      target++;
      budget = 600;
    }

    const inside = x > 0 && x < w && y > 0 && y < h;
    if (!curl && inside && Math.random() < curlChance) {
      const rate = rand(0.025, 0.075) * (Math.random() < 0.5 ? -1 : 1);
      curl = { left: rand(Math.PI * 0.5, Math.PI * 3), rate };
    }

    wobble += -wobble * 0.03 + rand(-1, 1) * jitter;

    let turn;
    if (curl) {
      turn = curl.rate + wobble * 0.5;
      curl.left -= Math.abs(curl.rate);
      if (curl.left <= 0) curl = null;
    } else {
      const err = wrapAngle(Math.atan2(waypoints[target].y - y, waypoints[target].x - x) - heading);
      turn = clamp(err * gain, -maxTurn, maxTurn) + wobble;
    }
    step(turn);

    if (target === waypoints.length - 1 && outside()) return points;
  }

  // Out of steps while still on screen: glide straight off so nothing vanishes mid-air.
  for (let i = 0; i < 4000 && !outside(); i++) step(0);
  return points;
}

export class PaperPlanes {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas, { maxPlanes = 3 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.maxPlanes = maxPlanes;
    this.planes = [];
    this.running = false;
    this.visible = true;
    this.nextSpawn = 0;
    this.last = 0;
    this.frame = this.frame.bind(this);

    const css = getComputedStyle(canvas);
    this.planeColor = css.getPropertyValue("--plane-color").trim() || "#e8e8e8";
    this.foldColor = css.getPropertyValue("--plane-fold").trim() || "#0d0d0d";
    this.trailColor = css.getPropertyValue("--trail-color").trim() || "#e8e8e8";

    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
    new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.start();
    }).observe(canvas);
  }

  resize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = width;
    this.h = height;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Paths were planned for the old size; let them finish rather than jump.
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.frame);
  }

  spawn(now) {
    this.planes.push({ points: planFlight(this.w, this.h), dist: 0, speed: rand(...SPEED), scale: rand(0.9, 1.1) });
    this.nextSpawn = now + rand(...SPAWN_MS);
  }

  frame(now) {
    if (!this.visible) { this.running = false; return; }
    // rAF's timestamp can predate performance.now() taken in start(); clamp both
    // ends (and long gaps after a tab switch) so planes never jump or reverse.
    const dt = Math.max(0, Math.min(0.05, (now - this.last) / 1000));
    this.last = now;

    if (now >= this.nextSpawn && this.planes.length < this.maxPlanes && this.w > 0) this.spawn(now);

    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    for (const plane of this.planes) {
      plane.dist += plane.speed * dt;
      this.drawTrail(plane);
      this.drawPlane(plane);
    }
    // A plane is done once its trail has fully left the last point.
    this.planes = this.planes.filter((p) => p.dist - TRAIL < (p.points.length - 1) * STEP);

    requestAnimationFrame(this.frame);
  }

  /** Point at arc length `len` along the sampled path (linear between samples). */
  static pointAt(points, len) {
    const f = len / STEP;
    const i = Math.min(points.length - 2, Math.max(0, Math.floor(f)));
    const t = Math.min(1, Math.max(0, f - i));
    return { x: points[i].x + (points[i + 1].x - points[i].x) * t, y: points[i].y + (points[i + 1].y - points[i].y) * t };
  }

  /**
   * Each dash is its own short stroke with round caps, placed at fixed arc
   * lengths (k × period), so dashes stay put as the plane moves and fade
   * individually instead of in visible bands.
   */
  drawTrail({ points, dist }) {
    const { ctx } = this;
    const end = (points.length - 1) * STEP;
    const head = Math.min(end, dist - PLANE_TAIL);
    const tail = Math.max(0, dist - TRAIL);
    if (head - tail < 1) return;

    ctx.save();
    ctx.strokeStyle = this.trailColor;
    ctx.lineWidth = TRAIL_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const period = DASH + GAP;
    for (let k = Math.floor(tail / period); k * period < head; k++) {
      const s0 = Math.max(tail, k * period);
      const s1 = Math.min(head, k * period + DASH);
      if (s1 - s0 < 0.5) continue;

      const age = (dist - (s0 + s1) / 2) / TRAIL;     // 0 at the plane, 1 at the tail
      ctx.globalAlpha = Math.max(0, 1 - age) * TRAIL_ALPHA;

      const from = PaperPlanes.pointAt(points, s0);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      for (let i = Math.ceil(s0 / STEP); i * STEP < s1; i++) ctx.lineTo(points[i].x, points[i].y);
      const to = PaperPlanes.pointAt(points, s1);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** A flat white dart with rounded corners and a dark centre fold. */
  drawPlane({ points, dist, scale }) {
    const index = Math.floor(dist / STEP);
    if (index < 0 || index >= points.length) return;
    const p = points[index];
    const { ctx } = this;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.scale(scale, scale);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Fill plus a same-colour round-joined stroke rounds every corner.
    ctx.beginPath();
    PLANE.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = this.planeColor;
    ctx.strokeStyle = this.planeColor;
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-4, 0);
    ctx.strokeStyle = this.foldColor;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }
}

/** Start planes on `canvas` unless the visitor prefers reduced motion. */
export function startPaperPlanes(canvas, options) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || !canvas.getContext) {
    canvas.hidden = true;
    return null;
  }
  const planes = new PaperPlanes(canvas, options);
  planes.start();
  return planes;
}
