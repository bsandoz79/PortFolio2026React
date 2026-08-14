export class Ball {
    constructor(x, y, speed = 5) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.speed = speed;
        this.vx = 0;
        this.vy = 0;
        this.attached = true;
        this.fire = false;
        this.trail = [];
    }

    launch() {
        if (!this.attached) return;
        this.attached = false;
        // Random angle between -110° and -70° (upward)
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2.5);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update(paddleX, paddleW) {
        if (this.attached) {
            this.x = paddleX + paddleW / 2;
            return;
        }
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
    }

    bounceX() { this.vx = -this.vx; }
    bounceY() { this.vy = -this.vy; }

    ensureSpeed() {
        const s = Math.hypot(this.vx, this.vy);
        if (s === 0) return;
        const ratio = this.speed / s;
        this.vx *= ratio;
        this.vy *= ratio;
    }

    setSpeed(speed) {
        this.speed = speed;
        this.ensureSpeed();
    }

    hitPaddle(paddleX, paddleW) {
        const rel = (this.x - (paddleX + paddleW / 2)) / (paddleW / 2);
        const angle = rel * (Math.PI / 3);
        const s = Math.hypot(this.vx, this.vy);
        this.vx = Math.sin(angle) * s;
        this.vy = -Math.abs(Math.cos(angle) * s);
    }

    draw(ctx) {
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            const t = i / this.trail.length;
            const pos = this.trail[i];
            const r = this.radius * t * 0.6;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
            ctx.fillStyle = this.fire
                ? `rgba(255,120,0,${t * 0.35})`
                : `rgba(0,229,255,${t * 0.3})`;
            ctx.fill();
        }

        // Glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = this.fire
            ? 'rgba(255,100,0,0.18)'
            : 'rgba(0,229,255,0.18)';
        ctx.fill();

        // Ball
        const grad = ctx.createRadialGradient(
            this.x - 2, this.y - 2, 1,
            this.x, this.y, this.radius
        );
        if (this.fire) {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.4, '#ff8c00');
            grad.addColorStop(1, '#cc2200');
        } else {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.4, '#00e5ff');
            grad.addColorStop(1, '#0062cc');
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }
}
