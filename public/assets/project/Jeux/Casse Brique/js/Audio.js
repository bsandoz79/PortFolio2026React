export class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    _tone(freq, type, duration, vol = 0.25) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    _sweep(f1, f2, type, duration, vol = 0.2) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(f1, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(f2, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    paddle()  { this._tone(260, 'sine', 0.12, 0.3); }
    wall()    { this._tone(180, 'square', 0.07, 0.2); }

    brick(hp) {
        if (hp <= 0) {
            this._tone(600, 'square', 0.08, 0.3);
        } else {
            this._tone(400, 'square', 0.06, 0.2);
        }
    }

    powerup() {
        if (!this.enabled || !this.ctx) return;
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this._tone(f, 'sine', 0.15, 0.35), i * 70);
        });
    }

    die() {
        if (!this.enabled || !this.ctx) return;
        [400, 300, 220, 160].forEach((f, i) => {
            setTimeout(() => this._tone(f, 'sawtooth', 0.25, 0.3), i * 80);
        });
    }

    levelComplete() {
        if (!this.enabled || !this.ctx) return;
        [523, 659, 784, 1047, 1319].forEach((f, i) => {
            setTimeout(() => this._tone(f, 'sine', 0.3, 0.4), i * 120);
        });
    }

    gameOver() {
        if (!this.enabled || !this.ctx) return;
        this._sweep(400, 80, 'sawtooth', 1.5, 0.4);
    }

    laser() { this._sweep(1400, 300, 'sine', 0.25, 0.3); }

    explosion() {
        if (!this.enabled || !this.ctx) return;
        this._sweep(600, 100, 'sawtooth', 0.4, 0.5);
        this._tone(300, 'square', 0.3, 0.3);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}
