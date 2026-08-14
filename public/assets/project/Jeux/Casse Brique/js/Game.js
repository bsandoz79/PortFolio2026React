import { Ball }            from './entities/Ball.js';
import { Paddle }          from './entities/Paddle.js';
import { Brick }           from './entities/Brick.js';
import { PowerUp, randomPowerUpType } from './entities/PowerUp.js';
import { LaserShot }       from './entities/Laser.js';
import { Particle, spawnParticles } from './entities/Particle.js';
import { AudioManager }    from './Audio.js';
import { LEVELS }          from './Levels.js';

const W = 800;
const H = 560;
const BRICK_COLS = 10;
const BRICK_ROWS = 8;
const BRICK_W = 74;
const BRICK_H = 22;
const BRICK_GAP_X = 4;
const BRICK_GAP_Y = 4;
const BRICK_START_X = (W - (BRICK_COLS * BRICK_W + (BRICK_COLS - 1) * BRICK_GAP_X)) / 2;
const BRICK_START_Y = 55;
const PU_DROP_CHANCE = 0.22;

const STATE = { READY:'READY', PLAYING:'PLAYING', PAUSED:'PAUSED', LEVEL_COMPLETE:'LEVEL_COMPLETE', GAME_OVER:'GAME_OVER', WIN:'WIN' };

export class Game {
    constructor(canvas, hudScore, hudLevel, hudLives, hudPowerup, onMenu, onSaveScore) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        canvas.width  = W;
        canvas.height = H;

        this.hudScore   = hudScore;
        this.hudLevel   = hudLevel;
        this.hudLives   = hudLives;
        this.hudPowerup = hudPowerup;
        this.onMenu     = onMenu;
        this.onSaveScore = onSaveScore;

        this.audio = new AudioManager();
        this.audio.init();

        this._keys    = {};
        this._rafId   = null;
        this._lastTime = 0;

        this._laserTimer  = 0;
        this._fireCooldown = 0;

        this._bindInput();
    }

    // ─────────────────────────────── PUBLIC ────────────────────────────────

    start(levelIndex = 0) {
        this.levelIndex = levelIndex;
        this.score      = 0;
        this.lives      = 3;
        this._loadLevel();
    }

    destroy() {
        cancelAnimationFrame(this._rafId);
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup',   this._onKeyUp);
    }

    // ──────────────────────────────── SETUP ────────────────────────────────

    _loadLevel() {
        const lvl = LEVELS[this.levelIndex];
        this.levelData  = lvl;
        this.balls      = [];
        this.bricks     = [];
        this.powerups   = [];
        this.lasers     = [];
        this.particles  = [];
        this.activePUs  = {};   // type → expiry timestamp
        this.state      = STATE.READY;

        this.paddle = new Paddle(W, H);
        const ball  = new Ball(this.paddle.x + this.paddle.width / 2, this.paddle.y - 10, lvl.ballSpeed);
        this.balls.push(ball);

        this._buildBricks(lvl);
        this._updateHUD();
        this._startLoop();
    }

    _buildBricks(lvl) {
        const colors = lvl.brickColors;
        for (let row = 0; row < BRICK_ROWS; row++) {
            for (let col = 0; col < BRICK_COLS; col++) {
                const type = lvl.grid[row]?.[col] ?? 0;
                if (!type) continue;
                const bx = BRICK_START_X + col * (BRICK_W + BRICK_GAP_X);
                const by = BRICK_START_Y  + row * (BRICK_H + BRICK_GAP_Y);
                const color = colors[row % colors.length];
                this.bricks.push(new Brick(bx, by, BRICK_W, BRICK_H, type, color));
            }
        }
    }

    _startLoop() {
        cancelAnimationFrame(this._rafId);
        this._lastTime = performance.now();
        const tick = (ts) => {
            this._rafId = requestAnimationFrame(tick);
            const dt = Math.min(ts - this._lastTime, 50);
            this._lastTime = ts;
            this._update(dt);
            this._draw();
        };
        this._rafId = requestAnimationFrame(tick);
    }

    // ──────────────────────────────── INPUT ────────────────────────────────

    _bindInput() {
        this._onKeyDown = (e) => {
            this._keys[e.code] = true;
            this.audio.resume();

            if (e.code === 'Space') {
                e.preventDefault();
                if (this.state === STATE.READY) {
                    this.balls.forEach(b => b.launch());
                    this.state = STATE.PLAYING;
                } else if (this.state === STATE.PLAYING) {
                    this.state = STATE.PAUSED;
                } else if (this.state === STATE.PAUSED) {
                    this.state = STATE.PLAYING;
                }
            }
            if (e.code === 'Escape') {
                this.destroy();
                this.onMenu();
            }
            if (e.code === 'KeyM') {
                const on = this.audio.toggle();
                this.hudPowerup.textContent = on ? '' : '🔇 Son désactivé';
            }
        };
        this._onKeyUp = (e) => { this._keys[e.code] = false; };
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup',   this._onKeyUp);
    }

    _handleInput() {
        if (this.state !== STATE.PLAYING && this.state !== STATE.READY) return;
        if (this._keys['ArrowLeft']  || this._keys['KeyA']) this.paddle.moveLeft();
        if (this._keys['ArrowRight'] || this._keys['KeyD']) this.paddle.moveRight();

        // Laser fire
        if (this.paddle.laser && this._keys['Space'] && this.state === STATE.PLAYING) {
            if (this._fireCooldown <= 0) {
                this._shootLaser();
                this._fireCooldown = 18;
            }
        }
        if (this._fireCooldown > 0) this._fireCooldown--;
    }

    _shootLaser() {
        const cx = this.paddle.x + this.paddle.width / 2;
        this.lasers.push(new LaserShot(cx - 20, this.paddle.y));
        this.lasers.push(new LaserShot(cx + 20, this.paddle.y));
        this.audio.laser();
    }

    // ──────────────────────────────── UPDATE ───────────────────────────────

    _update(dt) {
        if (this.state === STATE.PAUSED) return;
        if (this.state !== STATE.PLAYING && this.state !== STATE.READY) return;

        this._handleInput();
        this._tickPowerUps();

        // Update balls
        for (const ball of this.balls) {
            ball.update(this.paddle.x, this.paddle.width);
            if (ball.attached) continue;
            this._wallBounce(ball);
            this._paddleCollide(ball);
            this._brickCollide(ball);
        }

        // Remove balls that fell off screen
        this.balls = this.balls.filter(b => b.attached || b.y < H + 20);
        if (this.balls.length === 0 && this.state === STATE.PLAYING) {
            this._loseLife();
        }

        // Power-ups
        for (const pu of this.powerups) {
            pu.update();
            if (pu.alive && this._rectOverlap(pu, this.paddle)) {
                this._applyPowerUp(pu.type);
                pu.alive = false;
                this.audio.powerup();
            }
        }
        this.powerups = this.powerups.filter(p => p.alive && p.y < H + 30);

        // Lasers
        for (const l of this.lasers) {
            l.update();
            if (!l.alive) continue;
            for (const brick of this.bricks) {
                if (!brick.alive) continue;
                if (this._rectOverlapXYWH(l.x - l.w/2, l.y, l.w, l.h, brick.x, brick.y, brick.w, brick.h)) {
                    const destroyed = brick.hit(false);
                    l.alive = false;
                    if (destroyed) this._onBrickDestroyed(brick);
                    else this.audio.brick(brick.hp);
                    break;
                }
            }
        }
        this.lasers = this.lasers.filter(l => l.alive);

        // Particles
        for (const p of this.particles) p.update();
        this.particles = this.particles.filter(p => p.alive);

        // Bricks
        for (const b of this.bricks) b.update();

        // Win condition
        if (this.state === STATE.PLAYING) {
            const remaining = this.bricks.filter(b => b.alive && !b.indestructible);
            if (remaining.length === 0) this._levelComplete();
        }
    }

    _wallBounce(ball) {
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.bounceX();
            this.audio.wall();
        }
        if (ball.x + ball.radius > W) {
            ball.x = W - ball.radius;
            ball.bounceX();
            this.audio.wall();
        }
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.bounceY();
            this.audio.wall();
        }
    }

    _paddleCollide(ball) {
        const p = this.paddle;
        if (ball.vy <= 0) return;
        if (ball.x + ball.radius < p.x || ball.x - ball.radius > p.x + p.width) return;
        if (ball.y + ball.radius < p.y || ball.y - ball.radius > p.y + p.height) return;

        ball.y = p.y - ball.radius;
        ball.hitPaddle(p.x, p.width);
        ball.ensureSpeed();
        this.audio.paddle();
        spawnParticles(this.particles, ball.x, p.y, '#00e5ff', 4);
    }

    _brickCollide(ball) {
        for (const brick of this.bricks) {
            if (!brick.alive) continue;

            // Circle-AABB collision
            const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
            const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
            const dx = ball.x - closestX;
            const dy = ball.y - closestY;
            const distSq = dx * dx + dy * dy;

            if (distSq >= ball.radius * ball.radius) continue;

            // Determine reflection side
            const overlapX = ball.radius - Math.abs(ball.x - closestX) + 0.001;
            const overlapY = ball.radius - Math.abs(ball.y - closestY) + 0.001;

            if (!ball.fire || brick.indestructible) {
                if (overlapX < overlapY) {
                    ball.bounceX();
                    ball.x += dx > 0 ? overlapX : -overlapX;
                } else {
                    ball.bounceY();
                    ball.y += dy > 0 ? overlapY : -overlapY;
                }
            }

            const destroyed = brick.hit(ball.fire);
            if (destroyed) {
                this._onBrickDestroyed(brick);
            } else {
                this.audio.brick(brick.hp);
                spawnParticles(this.particles, brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color, 3);
            }

            if (!ball.fire) break; // fire ball can traverse
        }
    }

    _onBrickDestroyed(brick) {
        const cx = brick.x + brick.w / 2;
        const cy = brick.y + brick.h / 2;
        const pts = brick.type === 5 ? 50 : (brick.maxHp === Infinity ? 0 : brick.maxHp * 10);
        this.score += pts;
        this._updateHUD();
        this.audio.brick(0);
        spawnParticles(this.particles, cx, cy, brick.color, brick.explosive ? 20 : 10);

        if (brick.explosive) {
            this.audio.explosion();
            this._explodeBrick(brick);
        }

        // Power-up drop
        if (!brick.explosive && Math.random() < PU_DROP_CHANCE) {
            this.powerups.push(new PowerUp(cx - 18, cy, randomPowerUpType()));
        }
    }

    _explodeBrick(source) {
        for (const brick of this.bricks) {
            if (!brick.alive || brick === source) continue;
            const dx = Math.abs((brick.x + brick.w / 2) - (source.x + source.w / 2));
            const dy = Math.abs((brick.y + brick.h / 2) - (source.y + source.h / 2));
            if (dx <= BRICK_W + BRICK_GAP_X + 2 && dy <= BRICK_H + BRICK_GAP_Y + 2) {
                const destroyed = brick.hit(false);
                if (destroyed) this._onBrickDestroyed(brick);
            }
        }
    }

    // ──────────────────────────────── POWERUPS ─────────────────────────────

    _applyPowerUp(type) {
        const now = performance.now();
        switch (type) {
            case 'WIDE':
                this.paddle.setWidth(Math.min(180, this.paddle.baseWidth * 1.6));
                this.activePUs['WIDE'] = now + 10000;
                break;
            case 'NARROW':
                this.paddle.setWidth(Math.max(50, this.paddle.baseWidth * 0.55));
                this.activePUs['NARROW'] = now + 8000;
                break;
            case 'MULTI':
                this._spawnMultiBalls();
                break;
            case 'FIRE':
                this.balls.forEach(b => b.fire = true);
                this.activePUs['FIRE'] = now + 8000;
                break;
            case 'LIFE':
                this.lives = Math.min(5, this.lives + 1);
                this._updateHUD();
                break;
            case 'LASER':
                this.paddle.laser = true;
                this.activePUs['LASER'] = now + 10000;
                break;
        }
        this._showActivePU(type);
    }

    _spawnMultiBalls() {
        const ref = this.balls.find(b => !b.attached) || this.balls[0];
        if (!ref) return;
        for (let i = 0; i < 2; i++) {
            const b = new Ball(ref.x, ref.y, ref.speed);
            b.attached = false;
            b.fire = ref.fire;
            const angle = Math.atan2(ref.vy, ref.vx) + (i === 0 ? 0.4 : -0.4);
            b.vx = Math.cos(angle) * ref.speed;
            b.vy = Math.sin(angle) * ref.speed;
            this.balls.push(b);
        }
    }

    _tickPowerUps() {
        const now = performance.now();
        for (const [type, expiry] of Object.entries(this.activePUs)) {
            if (now >= expiry) {
                this._expirePowerUp(type);
                delete this.activePUs[type];
            }
        }
        this._showActivePU();
    }

    _expirePowerUp(type) {
        switch (type) {
            case 'WIDE':
            case 'NARROW':
                this.paddle.setWidth(this.paddle.baseWidth);
                break;
            case 'FIRE':
                this.balls.forEach(b => b.fire = false);
                break;
            case 'LASER':
                this.paddle.laser = false;
                break;
        }
    }

    _showActivePU() {
        const now = performance.now();
        const parts = Object.entries(this.activePUs).map(([t, e]) => {
            const secs = Math.ceil((e - now) / 1000);
            return `${t} ${secs}s`;
        });
        this.hudPowerup.textContent = parts.join('  ');
    }

    // ──────────────────────────────── STATE ────────────────────────────────

    _loseLife() {
        this.lives--;
        this.audio.die();
        // Reset power-ups
        Object.keys(this.activePUs).forEach(t => this._expirePowerUp(t));
        this.activePUs = {};
        this.paddle.reset();
        this.lasers = [];
        this._updateHUD();

        if (this.lives <= 0) {
            this.state = STATE.GAME_OVER;
            this.audio.gameOver();
            this.onSaveScore(this.score, this.levelIndex + 1);
            return;
        }

        // Respawn ball
        this.balls = [];
        const b = new Ball(this.paddle.x + this.paddle.width / 2, this.paddle.y - 10, this.levelData.ballSpeed);
        this.balls.push(b);
        this.state = STATE.READY;
    }

    _levelComplete() {
        this.state = STATE.LEVEL_COMPLETE;
        this.audio.levelComplete();
        this.score += 500;
        this._updateHUD();

        if (this.levelIndex + 1 >= LEVELS.length) {
            setTimeout(() => {
                this.state = STATE.WIN;
                this.onSaveScore(this.score, this.levelIndex + 1);
            }, 2000);
        } else {
            setTimeout(() => {
                this.levelIndex++;
                this._loadLevel();
            }, 2500);
        }
    }

    // ──────────────────────────────── HUD ──────────────────────────────────

    _updateHUD() {
        this.hudScore.textContent = this.score.toLocaleString('fr-FR');
        this.hudLevel.textContent = this.levelIndex + 1;
        this.hudLives.innerHTML = '❤️'.repeat(this.lives) + '🖤'.repeat(Math.max(0, 3 - this.lives));
    }

    // ──────────────────────────────── DRAW ─────────────────────────────────

    _draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, W, H);

        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#0d0d1a');
        bgGrad.addColorStop(1, '#12122a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Grid lines (subtle)
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Entities
        this.bricks.forEach(b => b.draw(ctx));
        this.powerups.forEach(p => p.draw(ctx));
        this.lasers.forEach(l => l.draw(ctx));
        this.particles.forEach(p => p.draw(ctx));
        this.paddle.draw(ctx);
        this.balls.forEach(b => b.draw(ctx));

        // Overlays
        switch (this.state) {
            case STATE.READY:           this._drawReady(ctx);         break;
            case STATE.PAUSED:          this._drawPaused(ctx);        break;
            case STATE.LEVEL_COMPLETE:  this._drawLevelComplete(ctx); break;
            case STATE.GAME_OVER:       this._drawGameOver(ctx);      break;
            case STATE.WIN:             this._drawWin(ctx);           break;
        }
    }

    _drawOverlay(ctx, alpha = 0.65) {
        ctx.fillStyle = `rgba(10,10,26,${alpha})`;
        ctx.fillRect(0, 0, W, H);
    }

    _drawCenteredText(ctx, text, y, size, color, glow = false) {
        ctx.font = `${size}px "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 20; }
        ctx.fillStyle = color;
        ctx.fillText(text, W / 2, y);
        ctx.shadowBlur = 0;
    }

    _drawReady(ctx) {
        this._drawOverlay(ctx, 0.35);
        const lvl = LEVELS[this.levelIndex];
        this._drawCenteredText(ctx, `NIVEAU ${this.levelIndex + 1}`, H / 2 - 40, 36, '#00e5ff', true);
        this._drawCenteredText(ctx, lvl.name.toUpperCase(), H / 2, 20, '#aaa');
        this._drawPulseText(ctx, 'ESPACE pour lancer', H / 2 + 50, 15, '#ffffff');
    }

    _drawPaused(ctx) {
        this._drawOverlay(ctx, 0.7);
        this._drawCenteredText(ctx, 'PAUSE', H / 2 - 20, 52, '#00e5ff', true);
        this._drawCenteredText(ctx, 'ESPACE pour reprendre  |  ESC pour quitter', H / 2 + 40, 14, '#888');
    }

    _drawLevelComplete(ctx) {
        this._drawOverlay(ctx, 0.6);
        this._drawCenteredText(ctx, '✓ NIVEAU TERMINÉ', H / 2 - 30, 42, '#00ff88', true);
        this._drawCenteredText(ctx, `+500 points`, H / 2 + 20, 20, '#ffd32a');
        const next = this.levelIndex + 1 < LEVELS.length ? `Prochain : ${LEVELS[this.levelIndex + 1].name}` : 'Dernier niveau !';
        this._drawCenteredText(ctx, next, H / 2 + 55, 15, '#aaa');
    }

    _drawGameOver(ctx) {
        this._drawOverlay(ctx, 0.75);
        this._drawCenteredText(ctx, 'GAME OVER', H / 2 - 40, 52, '#ff4757', true);
        this._drawCenteredText(ctx, `Score : ${this.score.toLocaleString('fr-FR')}`, H / 2 + 10, 24, '#fff');
        this._drawCenteredText(ctx, 'ESC → Menu', H / 2 + 60, 15, '#888');
    }

    _drawWin(ctx) {
        this._drawOverlay(ctx, 0.75);
        this._drawCenteredText(ctx, '🏆 VICTOIRE !', H / 2 - 60, 48, '#ffd32a', true);
        this._drawCenteredText(ctx, 'Tous les niveaux terminés', H / 2 - 10, 22, '#00ff88');
        this._drawCenteredText(ctx, `Score final : ${this.score.toLocaleString('fr-FR')}`, H / 2 + 30, 24, '#fff');
        this._drawCenteredText(ctx, 'ESC → Menu', H / 2 + 80, 15, '#888');
    }

    _drawPulseText(ctx, text, y, size, color) {
        const alpha = 0.5 + 0.5 * Math.sin(performance.now() / 400);
        ctx.globalAlpha = alpha;
        this._drawCenteredText(ctx, text, y, size, color);
        ctx.globalAlpha = 1;
    }

    // ──────────────────────────────── HELPERS ──────────────────────────────

    _rectOverlap(a, b) {
        return a.x < b.x + b.width && a.x + a.w > b.x &&
               a.y < b.y + b.height && a.y + a.h > b.y;
    }

    _rectOverlapXYWH(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }
}
