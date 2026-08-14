export const PU_TYPES = ['WIDE', 'NARROW', 'MULTI', 'FIRE', 'LIFE', 'LASER'];

const PU_META = {
    WIDE:   { label: 'W', color: '#00ff88', bg: '#004422', text: '🟢 Grande raquette', duration: 10000 },
    NARROW: { label: 'N', color: '#ff4757', bg: '#440011', text: '🔴 Petite raquette',  duration: 8000  },
    MULTI:  { label: 'M', color: '#4fc3f7', bg: '#003344', text: '🔵 Triple balle',     duration: 0     },
    FIRE:   { label: 'F', color: '#ff6348', bg: '#441100', text: '🔥 Balle de feu',     duration: 8000  },
    LIFE:   { label: '♥', color: '#ffd32a', bg: '#443300', text: '💛 Vie bonus',        duration: 0     },
    LASER:  { label: 'L', color: '#ce93d8', bg: '#330044', text: '🔮 Laser',            duration: 10000 },
};

export function randomPowerUpType() {
    return PU_TYPES[Math.floor(Math.random() * PU_TYPES.length)];
}

export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.w = 36;
        this.h = 20;
        this.vy = 2.2;
        this.alive = true;
        this.meta = PU_META[type];
        this._angle = 0;
    }

    update() {
        this.y += this.vy;
        this._angle += 0.04;
    }

    draw(ctx) {
        const { x, y, w, h, meta } = this;
        const cx = x + w / 2;
        const cy = y + h / 2;

        // Pulsing glow
        const pulse = 1 + 0.15 * Math.sin(this._angle * 3);
        ctx.shadowColor = meta.color;
        ctx.shadowBlur = 10 * pulse;

        // Background pill
        ctx.fillStyle = meta.bg;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, h / 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, h / 2);
        ctx.stroke();

        // Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = meta.color;
        ctx.font = `bold 11px "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(meta.label, cx, cy + 0.5);
    }

    static getMeta(type) { return PU_META[type]; }
}
