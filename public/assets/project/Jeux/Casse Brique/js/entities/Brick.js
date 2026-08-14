const TYPE_META = {
    1: { maxHp: 1, label: 'normal' },
    2: { maxHp: 2, label: 'resistant' },
    3: { maxHp: 3, label: 'solid' },
    4: { maxHp: Infinity, label: 'indestructible' },
    5: { maxHp: 1, label: 'explosive' },
};

export class Brick {
    constructor(x, y, w, h, type, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type;
        this.color = color;
        const meta = TYPE_META[type] || TYPE_META[1];
        this.maxHp = meta.maxHp;
        this.hp = this.maxHp === Infinity ? Infinity : this.maxHp;
        this.alive = true;
        this.hitTimer = 0;   // flash on hit
        this.shakeX = 0;
        this.shakeY = 0;
    }

    get indestructible() { return this.type === 4; }
    get explosive()      { return this.type === 5; }

    hit(fireBall = false) {
        if (this.indestructible) return false;
        if (fireBall && this.type !== 4) {
            this.hp = 0;
        } else {
            this.hp--;
        }
        this.hitTimer = 8;
        this.shakeX = (Math.random() - 0.5) * 4;
        this.shakeY = (Math.random() - 0.5) * 4;
        if (this.hp <= 0) {
            this.alive = false;
            return true; // destroyed
        }
        return false;
    }

    update() {
        if (this.hitTimer > 0) {
            this.hitTimer--;
            if (this.hitTimer === 0) { this.shakeX = 0; this.shakeY = 0; }
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        const { x, y, w, h, shakeX, shakeY } = this;
        const bx = x + shakeX;
        const by = y + shakeY;

        const flash = this.hitTimer > 0;

        if (this.indestructible) {
            // Metallic
            const grad = ctx.createLinearGradient(bx, by, bx, by + h);
            grad.addColorStop(0, '#b0bec5');
            grad.addColorStop(0.5, '#546e7a');
            grad.addColorStop(1, '#263238');
            ctx.fillStyle = flash ? '#ffffff' : grad;
            ctx.beginPath();
            ctx.roundRect(bx, by, w, h, 3);
            ctx.fill();
            // Bolt pattern
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(bx + 4, by + 3, 6, 4);
            ctx.fillRect(bx + w - 10, by + 3, 6, 4);
        } else {
            // Normal brick
            const ratio = this.maxHp === Infinity ? 1 : this.hp / this.maxHp;
            const color = this._getColor(ratio);
            ctx.fillStyle = flash ? '#ffffff' : color;
            ctx.beginPath();
            ctx.roundRect(bx, by, w, h, 3);
            ctx.fill();

            // Highlight on top
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.beginPath();
            ctx.roundRect(bx + 3, by + 2, w - 6, Math.floor(h * 0.35), 2);
            ctx.fill();

            // HP cracks overlay for damaged bricks
            if (this.maxHp >= 2 && this.hp < this.maxHp) {
                ctx.fillStyle = `rgba(0,0,0,${0.15 * (this.maxHp - this.hp)})`;
                ctx.beginPath();
                ctx.roundRect(bx, by, w, h, 3);
                ctx.fill();
                // Crack lines
                ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(bx + w * 0.3, by);
                ctx.lineTo(bx + w * 0.5, by + h);
                ctx.stroke();
                if (this.hp < this.maxHp - 1) {
                    ctx.beginPath();
                    ctx.moveTo(bx + w * 0.7, by);
                    ctx.lineTo(bx + w * 0.45, by + h);
                    ctx.stroke();
                }
            }

            // Explosive glow
            if (this.explosive) {
                ctx.strokeStyle = '#ff6348';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = '#ff6348';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.roundRect(bx + 1, by + 1, w - 2, h - 2, 3);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }

        // Border
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, by, w, h, 3);
        ctx.stroke();
    }

    _getColor(ratio) {
        // Darken color based on remaining HP
        const r = parseInt(this.color.slice(1, 3), 16);
        const g = parseInt(this.color.slice(3, 5), 16);
        const b = parseInt(this.color.slice(5, 7), 16);
        const f = 0.5 + ratio * 0.5;
        const rr = Math.round(r * f);
        const gg = Math.round(g * f);
        const bb = Math.round(b * f);
        return `rgb(${rr},${gg},${bb})`;
    }
}
