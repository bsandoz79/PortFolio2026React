import { useEffect, useRef, useCallback } from 'react';
import { marbleLogos } from '../../data/portfolio';
import styles from './MarbleRun.module.css';

// ── Constants ─────────────────────────────────────────────────────────────
// Les vitesses sont exprimées « par frame à 60 fps » ; la simulation avance
// par pas fixes de 1/120 s pour être identique à 60, 120 ou 144 Hz.
const R           = 28;       // ball radius
const GRAVITY     = 0.42;
const MAX_VY      = 15;
const RESTITUTION = 0.12;     // bounce factor — low so ball rolls, not bounces back up
const BALL_BOUNCE = 0.55;     // rebond entre deux billes
const STEP        = 1 / 120;  // pas de simulation (s)
const SPAWN_MS    = 2600;
const MAX_AUTO    = 7;        // billes max générées automatiquement
const MAX_BALLS   = 14;       // billes max (clics compris)
const ACCENT      = '99,102,241';

// ── Closest point on segment ──────────────────────────────────────────────
function closestOnSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-9) return { x: x1, y: y1 };
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return { x: x1 + t * dx, y: y1 + t * dy };
}

// ── Circle vs segment collision ───────────────────────────────────────────
//  Returns the impact speed (0 if no collision) and mutates ball.
function resolveVsSegment(ball, plat, k) {
  const cp = closestOnSeg(ball.x, ball.y, plat.x1, plat.y1, plat.x2, plat.y2);
  const dx = ball.x - cp.x;
  const dy = ball.y - cp.y;
  const dist2 = dx * dx + dy * dy;

  // Miss
  if (dist2 >= R * R || dist2 < 1e-9) return 0;

  const dist = Math.sqrt(dist2);
  const nx   = dx / dist;   // outward normal (surface → ball)
  const ny   = dy / dist;

  // Only accept collisions where the ball comes from ABOVE the rail.
  // In canvas coords Y grows downward, so "ball above surface" means ny < 0.
  if (ny > 0.25) return 0;

  // Push ball completely out of the surface
  const pen = R - dist;
  ball.x += nx * pen;
  ball.y += ny * pen;

  // Only reflect when ball is moving INTO the surface.
  const vn = ball.vx * nx + ball.vy * ny;
  if (vn > 0) return 0;

  // Reflect velocity component along normal (with energy loss)
  ball.vx -= (1 + RESTITUTION) * vn * nx;
  ball.vy -= (1 + RESTITUTION) * vn * ny;

  // Light friction along the tangent so the ball slides / rolls nicely
  const tx  = -ny, ty = nx;          // tangent unit vector
  const vt  = ball.vx * tx + ball.vy * ty;
  ball.vx  -= 0.18 * k * vt * tx;
  ball.vy  -= 0.18 * k * vt * ty;

  // Nudge in the downhill direction so the ball rolls off the rail end
  ball.vx += plat.dir * 1.1 * k;

  // Roulement : la rotation suit la vitesse le long du rail
  ball.spin = (ball.vx * tx + ball.vy * ty) / R;

  return -vn;
}

// ── Ball vs ball collision ────────────────────────────────────────────────
function resolveBalls(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist2 = dx * dx + dy * dy;
  if (dist2 >= 4 * R * R || dist2 < 1e-9) return;
  const dist = Math.sqrt(dist2);
  const nx = dx / dist, ny = dy / dist;

  // Separate both balls equally
  const pen = (2 * R - dist) / 2;
  a.x -= nx * pen; a.y -= ny * pen;
  b.x += nx * pen; b.y += ny * pen;

  // Exchange the normal velocity (equal masses)
  const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (rel <= 0) return;
  const j = rel * (1 + BALL_BOUNCE) / 2;
  a.vx -= j * nx; a.vy -= j * ny;
  b.vx += j * nx; b.vy += j * ny;
}

// ── Platform geometry ─────────────────────────────────────────────────────
// Platforms span ~65 % of the panel width so balls can't miss them easily.
// They alternate left→right / right→left to create a zigzag.
function buildPlatforms(W, H) {
  const ANGLE  = 0.17;              // tilt in radians (~10°)
  const LEN    = W * 0.68;          // horizontal projection
  const cosA   = Math.cos(ANGLE);
  const sinA   = Math.sin(ANGLE);
  const lx     = LEN * cosA;        // horizontal run
  const ly     = LEN * sinA;        // vertical drop
  const PAD    = W * 0.04;          // left/right padding from wall

  return [
    // dir +1 : x1 left (high) → x2 right (low) — descend vers la droite
    { x1: PAD,         y1: H * 0.16, x2: PAD + lx,         y2: H * 0.16 + ly, dir:  1 },
    // dir -1 : x1 right (high) → x2 left (low) — descend vers la gauche
    { x1: W - PAD,     y1: H * 0.33, x2: W - PAD - lx,     y2: H * 0.33 + ly, dir: -1 },
    { x1: PAD,         y1: H * 0.50, x2: PAD + lx,         y2: H * 0.50 + ly, dir:  1 },
    { x1: W - PAD,     y1: H * 0.67, x2: W - PAD - lx,     y2: H * 0.67 + ly, dir: -1 },
    { x1: PAD,         y1: H * 0.84, x2: PAD + lx,         y2: H * 0.84 + ly, dir:  1 },
  ].map((p) => ({ ...p, hit: 0 }));
}

// ── 3D metallic ball renderer ─────────────────────────────────────────────
function drawBall(ctx, ball) {
  const { x, y, logoData } = ball;
  const scale = ball.scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Cast shadow on the wall
  const shadow = ctx.createRadialGradient(0, R * 1.1, 0, 0, R * 1.1, R * 0.9);
  shadow.addColorStop(0, 'rgba(0,0,0,0.28)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(0, R * 1.05, R * 0.85, R * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base chrome sphere
  const base = ctx.createRadialGradient(-R * 0.34, -R * 0.34, R * 0.04, 0, 0, R);
  base.addColorStop(0,    '#f7f7ff');
  base.addColorStop(0.18, '#e0e0f0');
  base.addColorStop(0.45, '#c8c8de');
  base.addColorStop(0.72, '#9898b8');
  base.addColorStop(0.88, '#6868a0');
  base.addColorStop(1,    '#383860');
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = base;
  ctx.fill();

  // Logo texture — tourne avec la bille, l'éclairage reste fixe
  if (logoData?.img?.complete && logoData.img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.66, 0, Math.PI * 2);
    ctx.clip();
    ctx.rotate(ball.angle);
    ctx.globalAlpha = 0.9;
    const s = R * 1.32;
    ctx.drawImage(logoData.img, -s / 2, -s / 2, s, s);
    ctx.restore();
  }

  // Rim darkening
  const rim = ctx.createRadialGradient(0, 0, R * 0.6, 0, 0, R);
  rim.addColorStop(0, 'rgba(0,0,40,0)');
  rim.addColorStop(1, 'rgba(0,0,40,0.55)');
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = rim;
  ctx.fill();

  // Primary specular highlight
  const spec = ctx.createRadialGradient(-R * 0.36, -R * 0.40, 0, -R * 0.36, -R * 0.40, R * 0.52);
  spec.addColorStop(0, 'rgba(255,255,255,0.96)');
  spec.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = spec;
  ctx.fill();

  ctx.restore();
}

// ── Metal rail renderer ───────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawPlatform(ctx, plat) {
  const { x1, y1, x2, y2, hit } = plat;
  const len   = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const cx    = (x1 + x2) / 2;
  const cy    = (y1 + y2) / 2;
  const RH    = 11; // rail height

  ctx.save();
  ctx.translate(cx, cy);
  // Léger fléchissement du rail à l'impact
  ctx.rotate(angle + hit * 0.012 * plat.dir);

  // Halo accent à l'impact
  if (hit > 0.02) {
    ctx.shadowColor = `rgba(${ACCENT},${0.75 * hit})`;
    ctx.shadowBlur  = 18 * hit;
    roundRect(ctx, -len / 2, -RH / 2, len, RH, RH / 2);
    ctx.fillStyle = `rgba(${ACCENT},${0.35 * hit})`;
    ctx.fill();
  }

  // Tube
  const railGrad = ctx.createLinearGradient(0, -RH / 2, 0, RH / 2);
  railGrad.addColorStop(0,    '#f2f2f2');
  railGrad.addColorStop(0.18, '#ffffff');
  railGrad.addColorStop(0.5,  '#d0d0d0');
  railGrad.addColorStop(0.82, '#a8a8a8');
  railGrad.addColorStop(1,    '#888888');

  ctx.shadowColor   = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur    = 8;
  ctx.shadowOffsetY = 4;

  roundRect(ctx, -len / 2, -RH / 2, len, RH, RH / 2);
  ctx.fillStyle = railGrad;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Top sheen (teinté accent à l'impact)
  roundRect(ctx, -len / 2 + 4, -RH / 2 + 1.5, len - 8, 2.5, 1.5);
  ctx.fillStyle = hit > 0.02 ? `rgba(${ACCENT},${0.4 + 0.5 * hit})` : 'rgba(255,255,255,0.65)';
  ctx.fill();

  // Central pivot knob
  const KR    = 13;
  ctx.shadowColor   = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur    = 6;
  ctx.shadowOffsetY = 3;

  const knob = ctx.createRadialGradient(-KR * 0.32, -KR * 0.32, 0.5, 0, 0, KR);
  knob.addColorStop(0,    '#f0f0f0');
  knob.addColorStop(0.35, '#d0d0d0');
  knob.addColorStop(0.75, '#a0a0a0');
  knob.addColorStop(1,    '#606060');

  ctx.beginPath();
  ctx.arc(0, 0, KR, 0, Math.PI * 2);
  ctx.fillStyle = knob;
  ctx.fill();

  ctx.shadowColor = 'transparent';

  const kSpec = ctx.createRadialGradient(-KR * 0.35, -KR * 0.38, 0, -KR * 0.35, -KR * 0.38, KR * 0.55);
  kSpec.addColorStop(0, 'rgba(255,255,255,0.85)');
  kSpec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(0, 0, KR, 0, Math.PI * 2);
  ctx.fillStyle = kSpec;
  ctx.fill();

  // Voyant accent sur le pivot à l'impact
  if (hit > 0.02) {
    ctx.beginPath();
    ctx.arc(0, 0, KR * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ACCENT},${hit})`;
    ctx.fill();
  }

  ctx.restore();
}

// ── Étincelles d'impact ───────────────────────────────────────────────────
function emitSparks(sparks, x, y, strength) {
  const n = Math.min(6, 2 + Math.round(strength));
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
    const v = 1.2 + Math.random() * 1.8 + strength * 0.3;
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, r: 1.5 + Math.random() * 1.8 });
  }
}

function drawSparks(ctx, sparks) {
  for (const p of sparks) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ACCENT},${p.life})`;
    ctx.fill();
  }
}

// ── Pre-load images once ──────────────────────────────────────────────────
const preloadImages = () =>
  marbleLogos.map((logo) => {
    const img = new Image();
    img.src = logo.src;
    return { ...logo, img };
  });

// ── Component ─────────────────────────────────────────────────────────────
export default function MarbleRun() {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    balls: [], sparks: [], logos: [], logoIdx: 0,
    raf: null, timer: null, kick: [], running: false,
    W: 0, H: 0, platforms: [], spawnAt: null,
  });

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s   = stateRef.current;

    if (!s.logos.length) s.logos = preloadImages();

    // Netteté sur écrans haute densité
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    s.W = W; s.H = H;

    s.platforms = buildPlatforms(W, H);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const spawnAt = (x, y, vx = (Math.random() - 0.5) * 1.5, vy = 2) => {
      if (s.balls.length >= MAX_BALLS) return;
      const logo = s.logos[s.logoIdx++ % s.logos.length];
      s.balls.push({
        x: Math.max(R, Math.min(W - R, x)), y, vx, vy,
        angle: Math.random() * Math.PI * 2, spin: vx / R,
        scale: 0.2, logoData: logo,
      });
    };
    s.spawnAt = spawnAt;

    // Spawn: x near left half so first platform (left→right) catches the ball
    const spawn = () => {
      if (s.balls.length >= MAX_AUTO) return;
      spawnAt(W * 0.1 + Math.random() * W * 0.4, -R - 4);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // Draw rails first (below balls)
      s.platforms.forEach((p) => drawPlatform(ctx, p));
      drawSparks(ctx, s.sparks);
      s.balls.forEach((b) => drawBall(ctx, b));
    };

    clearInterval(s.timer);
    s.kick.forEach(clearTimeout);
    cancelAnimationFrame(s.raf);

    if (reduced) {
      // Animation réduite : décor statique
      s.balls = [];
      draw();
      return;
    }

    // Démarrage vivant : trois billes rapprochées, puis cadence régulière
    if (!s.balls.length) s.kick = [0, 900, 1800].map((d) => setTimeout(spawn, d));
    s.timer = setInterval(spawn, SPAWN_MS);

    const step = () => {
      const k = STEP * 60;   // fraction d'une frame 60 fps

      for (const b of s.balls) {
        b.vy = Math.min(b.vy + GRAVITY * k, MAX_VY);
        b.x += b.vx * k;
        b.y += b.vy * k;
        b.angle += b.spin * k;
        b.scale = Math.min(1, b.scale + 0.09 * k);

        // Wall clamp
        if (b.x - R < 0)    { b.x = R;     b.vx =  Math.abs(b.vx) * 0.55; b.spin = -b.spin; }
        if (b.x + R > W)    { b.x = W - R; b.vx = -Math.abs(b.vx) * 0.55; b.spin = -b.spin; }

        // Collision with every platform
        for (const p of s.platforms) {
          const impact = resolveVsSegment(b, p, k);
          if (impact > 2.2) {
            p.hit = Math.min(1, p.hit + impact / 9);
            emitSparks(s.sparks, b.x, b.y + R * 0.9, impact / 3);
          }
        }
      }

      for (let i = 0; i < s.balls.length; i++) {
        for (let j = i + 1; j < s.balls.length; j++) resolveBalls(s.balls[i], s.balls[j]);
      }

      for (const p of s.sparks) {
        p.vy += 0.12 * k;
        p.x += p.vx * k;
        p.y += p.vy * k;
        p.life -= 0.035 * k;
      }
      s.sparks = s.sparks.filter((p) => p.life > 0);
      s.platforms.forEach((p) => { p.hit *= Math.pow(0.93, k); });

      // Remove as soon as the top edge of the ball crosses the canvas bottom
      s.balls = s.balls.filter((b) => b.y - R <= H);
    };

    let last = performance.now();
    let acc  = 0;
    const loop = (now) => {
      acc += Math.min(0.05, (now - last) / 1000);   // évite l'emballement après une pause
      last = now;
      while (acc >= STEP) { step(); acc -= STEP; }
      draw();
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
    s.running = true;
  }, []);

  const stop = useCallback(() => {
    const s = stateRef.current;
    clearInterval(s.timer);
    s.kick.forEach(clearTimeout);
    cancelAnimationFrame(s.raf);
    s.running = false;
  }, []);

  // Clic : lâche une bille à l'endroit cliqué
  const handleClick = (e) => {
    const s = stateRef.current;
    if (!s.running || !s.spawnAt) return;
    const rect = canvasRef.current.getBoundingClientRect();
    s.spawnAt(e.clientX - rect.left, e.clientY - rect.top, (Math.random() - 0.5) * 2, 0);
  };

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const t = setTimeout(init, 80);

    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      init();
    });
    if (canvasRef.current) ro.observe(canvasRef.current);

    // Pause quand le hero sort de l'écran (économise le CPU)
    const io = new IntersectionObserver(([entry]) => {
      const s = stateRef.current;
      if (entry.isIntersecting && !s.running && !document.hidden) init();
      if (!entry.isIntersecting && s.running) stop();
    });
    if (canvasRef.current) io.observe(canvasRef.current);

    // ── Page Visibility — pause après 30 s d'inactivité ──────────────────
    const PAUSE_DELAY = 30_000; // 30 secondes
    let pauseTimeout = null;

    const handleVisibility = () => {
      const s = stateRef.current;

      if (document.hidden) {
        // L'onglet vient d'être masqué — on attend 30 s avant de couper
        pauseTimeout = setTimeout(() => {
          stop();
          s.balls = [];                    // vide les billes accumulées
          s.sparks = [];
        }, PAUSE_DELAY);
      } else {
        // L'onglet redevient visible
        clearTimeout(pauseTimeout);
        if (!s.running) init();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(t);
      clearTimeout(pauseTimeout);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, [init, stop]);

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} onClick={handleClick} />
      <span className={styles.hint} aria-hidden="true">Cliquez pour lâcher une bille</span>
    </>
  );
}
