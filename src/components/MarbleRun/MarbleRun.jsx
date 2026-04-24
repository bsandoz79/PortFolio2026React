import { useEffect, useRef, useCallback } from 'react';
import { marbleLogos } from '../../data/portfolio';
import styles from './MarbleRun.module.css';

// ── Constants ─────────────────────────────────────────────────────────────
const R          = 28;       // ball radius
const GRAVITY    = 0.42;
const MAX_VY     = 15;
const RESTITUTION = 0.12;   // bounce factor — low so ball rolls, not bounces back up
const SPAWN_MS   = 5000;

// ── Closest point on segment ──────────────────────────────────────────────
function closestOnSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-9) return { x: x1, y: y1 };
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return { x: x1 + t * dx, y: y1 + t * dy };
}

// ── Circle vs segment collision ───────────────────────────────────────────
//  Returns true and mutates ball if a collision happened.
function resolveVsSegment(ball, plat) {
  const cp = closestOnSeg(ball.x, ball.y, plat.x1, plat.y1, plat.x2, plat.y2);
  const dx = ball.x - cp.x;
  const dy = ball.y - cp.y;
  const dist2 = dx * dx + dy * dy;

  // Miss
  if (dist2 >= R * R || dist2 < 1e-9) return false;

  const dist = Math.sqrt(dist2);
  const nx   = dx / dist;   // outward normal (surface → ball)
  const ny   = dy / dist;

  // Only accept collisions where the ball comes from ABOVE the rail.
  // In canvas coords Y grows downward, so "ball above surface" means ny < 0.
  // Allow a small positive margin so the ball doesn't clip through the rail end.
  if (ny > 0.25) return false;

  // Only resolve when ball is moving INTO the surface.
  const vn = ball.vx * nx + ball.vy * ny;
  if (vn > 0) return false;

  // Push ball completely out of the surface
  const pen = R - dist;
  ball.x += nx * pen;
  ball.y += ny * pen;

  // Reflect velocity component along normal (with energy loss)
  ball.vx -= (1 + RESTITUTION) * vn * nx;
  ball.vy -= (1 + RESTITUTION) * vn * ny;

  // Light friction along the tangent so the ball slides / rolls nicely
  const tx  = -ny, ty = nx;          // tangent unit vector
  const vt  = ball.vx * tx + ball.vy * ty;
  ball.vx  -= 0.18 * vt * tx;
  ball.vy  -= 0.18 * vt * ty;

  // Nudge in the downhill direction so the ball rolls off the rail end
  ball.vx += plat.dir * 1.1;

  return true;
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
  ];
}

// ── 3D metallic ball renderer ─────────────────────────────────────────────
function drawBall(ctx, x, y, logoData) {
  ctx.save();

  // Cast shadow on the wall
  const shadow = ctx.createRadialGradient(x, y + R * 1.1, 0, x, y + R * 1.1, R * 0.9);
  shadow.addColorStop(0, 'rgba(0,0,0,0.28)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow;
  ctx.ellipse(x, y + R * 1.05, R * 0.85, R * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base chrome sphere
  const base = ctx.createRadialGradient(x - R * 0.34, y - R * 0.34, R * 0.04, x, y, R);
  base.addColorStop(0,    '#f7f7ff');
  base.addColorStop(0.18, '#e0e0f0');
  base.addColorStop(0.45, '#c8c8de');
  base.addColorStop(0.72, '#9898b8');
  base.addColorStop(0.88, '#6868a0');
  base.addColorStop(1,    '#383860');
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = base;
  ctx.fill();

  // Logo texture
  if (logoData?.img?.complete && logoData.img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, R * 0.66, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.88;
    const s = R * 1.32;
    ctx.drawImage(logoData.img, x - s / 2, y - s / 2, s, s);
    ctx.restore();
  }

  // Rim darkening
  const rim = ctx.createRadialGradient(x, y, R * 0.6, x, y, R);
  rim.addColorStop(0, 'rgba(0,0,40,0)');
  rim.addColorStop(1, 'rgba(0,0,40,0.55)');
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = rim;
  ctx.fill();

  // Primary specular highlight
  const spec = ctx.createRadialGradient(x - R * 0.36, y - R * 0.40, 0, x - R * 0.36, y - R * 0.40, R * 0.52);
  spec.addColorStop(0, 'rgba(255,255,255,0.96)');
  spec.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
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
  const { x1, y1, x2, y2 } = plat;
  const len   = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const cx    = (x1 + x2) / 2;
  const cy    = (y1 + y2) / 2;
  const RH    = 11; // rail height

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

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

  // Top sheen
  roundRect(ctx, -len / 2 + 4, -RH / 2 + 1.5, len - 8, 2.5, 1.5);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
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

  ctx.restore();
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
  const stateRef  = useRef({ balls: [], logos: [], logoIdx: 0, raf: null, timer: null });

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s   = stateRef.current;

    if (!s.logos.length) s.logos = preloadImages();

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;

    const platforms = buildPlatforms(W, H);

    // Spawn: x near left half so first platform (left→right) catches the ball
    const spawn = () => {
      const logo = s.logos[s.logoIdx++ % s.logos.length];
      s.balls.push({
        x: W * 0.15 + Math.random() * W * 0.35,
        y: -R - 4,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 2,
        logoData: logo,
      });
    };

    spawn();
    clearInterval(s.timer);
    s.timer = setInterval(spawn, SPAWN_MS);

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw rails first (below balls)
      platforms.forEach((p) => drawPlatform(ctx, p));

      s.balls = s.balls.filter((b) => {
        // Physics step
        b.vy = Math.min(b.vy + GRAVITY, MAX_VY);
        b.x += b.vx;
        b.y += b.vy;

        // Wall clamp
        if (b.x - R < 0)    { b.x = R;     b.vx =  Math.abs(b.vx) * 0.55; }
        if (b.x + R > W)    { b.x = W - R; b.vx = -Math.abs(b.vx) * 0.55; }

        // Collision with every platform
        for (const p of platforms) {
          resolveVsSegment(b, p);
        }

        // Remove as soon as the top edge of the ball crosses the canvas bottom
        if (b.y - R > H) return false;

        drawBall(ctx, b.x, b.y, b.logoData);
        return true;
      });

      s.raf = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const t = setTimeout(init, 80);

    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      init();
    });
    if (canvasRef.current) ro.observe(canvasRef.current);

    // ── Page Visibility — pause after 30 s d'inactivité ──────────────────
    const PAUSE_DELAY = 30_000; // 30 secondes
    let pauseTimeout = null;
    let paused = false;

    const handleVisibility = () => {
      const s = stateRef.current;

      if (document.hidden) {
        // L'onglet vient d'être masqué — on attend 30 s avant de couper
        pauseTimeout = setTimeout(() => {
          paused = true;
          clearInterval(s.timer);          // stop le spawn
          cancelAnimationFrame(s.raf);     // gèle le rendu (économise le CPU)
          s.balls = [];                    // vide les billes accumulées
        }, PAUSE_DELAY);

      } else {
        // L'onglet redevient visible
        clearTimeout(pauseTimeout);

        if (paused) {
          // Relance proprement : une bille immédiate + reprise du cycle
          paused = false;
          init();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(t);
      clearTimeout(pauseTimeout);
      ro.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(stateRef.current.raf);
      clearInterval(stateRef.current.timer);
    };
  }, [init]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
