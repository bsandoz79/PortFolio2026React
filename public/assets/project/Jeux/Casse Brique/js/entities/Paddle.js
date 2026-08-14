export class Paddle {
    constructor(canvasW, canvasH) {
        this.baseWidth = 110;
        this.width = 110;
        this.height = 14;
        this.x = (canvasW - this.width) / 2;
        this.y = canvasH - 40;
        this.speed = 7;
        this.canvasW = canvasW;
        this.laser = false;
        this._targetX = this.x;
    }

    setWidth(w) {
        const cx = this.x + this.width / 2;
        this.width = w;
        this.x = cx - w / 2;
        this.clamp();
    }

    reset() {
        this.setWidth(this.baseWidth);
        this.laser = false;
    }

    clamp() {
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.canvasW) this.x = this.canvasW - this.width;
    }

    moveLeft()  { this.x -= this.speed; this.clamp(); }
    moveRight() { this.x += this.speed; this.clamp(); }

    draw(ctx) {
        const { x, y, width, height } = this;
        const rx = 6;

        // Glow
        ctx.shadowColor = this.laser ? '#ce93d8' : '#00e5ff';
        ctx.shadowBlur = 14;

        // Gradient body
        const grad = ctx.createLinearGradient(x, y, x, y + height);
        if (this.laser) {
            grad.addColorStop(0, '#e1bee7');
            grad.addColorStop(1, '#7b1fa2');
        } else {
            grad.addColorStop(0, '#b2ebf2');
            grad.addColorStop(1, '#006064');
        }

        ctx.beginPath();
        ctx.roundRect(x, y, width, height, rx);
        ctx.fillStyle = grad;
        ctx.fill();

        // Highlight stripe
        ctx.beginPath();
        ctx.roundRect(x + 4, y + 2, width - 8, 4, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}
