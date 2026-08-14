export class LaserShot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 3;
        this.h = 16;
        this.vy = -12;
        this.alive = true;
    }

    update() {
        this.y += this.vy;
        if (this.y + this.h < 0) this.alive = false;
    }

    draw(ctx) {
        ctx.shadowColor = '#ce93d8';
        ctx.shadowBlur = 8;
        const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#ce93d8');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(this.x - this.w / 2, this.y, this.w, this.h, 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
