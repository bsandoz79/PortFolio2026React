import { Game } from './Game.js';

// ──────────────────────── SCREEN MANAGER ────────────────────────
const screens = {
    menu:   document.getElementById('screen-menu'),
    game:   document.getElementById('screen-game'),
    scores: document.getElementById('screen-scores'),
    help:   document.getElementById('screen-help'),
};

function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
}

// ──────────────────────── HIGH SCORES ───────────────────────────
const LS_KEY = 'cassebrique_scores';

function getScores() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
}

function saveScore(score, level) {
    const scores = getScores();
    scores.push({ score, level, date: new Date().toLocaleDateString('fr-FR') });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(10); // top 10
    localStorage.setItem(LS_KEY, JSON.stringify(scores));
}

function renderScores() {
    const body = document.getElementById('scores-body');
    const scores = getScores();
    if (scores.length === 0) {
        body.innerHTML = '<tr><td colspan="4" class="empty-scores">Aucun score enregistré</td></tr>';
        return;
    }
    body.innerHTML = scores.map((s, i) =>
        `<tr>
            <td>${i + 1}</td>
            <td>Joueur ${i + 1}</td>
            <td>${s.score.toLocaleString('fr-FR')}</td>
            <td>Niv. ${s.level}</td>
        </tr>`
    ).join('');
}

// ──────────────────────── MENU ANIMATION ────────────────────────
(function menuBg() {
    const canvas = document.getElementById('menu-bg');
    const ctx    = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        r: Math.random() * 1.5 + 0.3,
        s: Math.random() * 0.4 + 0.1,
    }));

    // Mini-bricks for decoration
    const colors = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6'];
    const deco = Array.from({ length: 18 }, () => ({
        x: Math.random() * 2000,
        y: Math.random() * 1200 - 400,
        vx: (Math.random() - 0.5) * 0.4,
        vy: Math.random() * 0.6 + 0.2,
        w: 40 + Math.random() * 40,
        h: 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.12 + Math.random() * 0.15,
    }));

    function draw(ts) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const W = canvas.width, H = canvas.height;

        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#090914');
        grad.addColorStop(1, '#0d0d20');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Stars
        for (const st of stars) {
            st.x -= st.s;
            if (st.x < 0) { st.x = W; st.y = Math.random() * H; }
            const alpha = 0.3 + 0.7 * Math.sin(ts / 1000 + st.x);
            ctx.beginPath();
            ctx.arc(st.x % W, st.y % H, st.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180,220,255,${alpha * 0.6})`;
            ctx.fill();
        }

        // Floating bricks
        for (const d of deco) {
            d.x += d.vx;
            d.y += d.vy;
            if (d.y > H + 20) { d.y = -20; d.x = Math.random() * W; }
            ctx.globalAlpha = d.alpha;
            ctx.fillStyle = d.color;
            ctx.beginPath();
            ctx.roundRect(d.x % W, d.y, d.w, d.h, 3);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
})();

// ──────────────────────── GAME INSTANCE ─────────────────────────
let activeGame = null;

function startGame() {
    if (activeGame) { activeGame.destroy(); activeGame = null; }

    showScreen('game');

    const canvas      = document.getElementById('game-canvas');
    const hudScore    = document.getElementById('hud-score');
    const hudLevel    = document.getElementById('hud-level');
    const hudLives    = document.getElementById('hud-lives');
    const hudPowerup  = document.getElementById('hud-powerup');

    activeGame = new Game(
        canvas,
        hudScore,
        hudLevel,
        hudLives,
        hudPowerup,
        () => { showScreen('menu'); activeGame = null; },
        (score, level) => saveScore(score, level)
    );
    activeGame.start(0);
}

// ──────────────────────── BUTTON WIRING ─────────────────────────
document.getElementById('btn-play').addEventListener('click', startGame);

document.getElementById('btn-scores').addEventListener('click', () => {
    renderScores();
    showScreen('scores');
});

document.getElementById('btn-help').addEventListener('click', () => {
    showScreen('help');
});

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => showScreen('menu'));
});
