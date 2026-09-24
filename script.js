(() => {
    // ========== GAME CONFIG ==========
    const CONFIG = {
        GRAVITY: 0.6,
        JUMP_FORCE: -12,
        PIPE_WIDTH: 52,
        PIPE_GAP: 120,
        PIPE_SPACING: 200,
        PIPE_CAP_HEIGHT: 12,
        PIPE_CAP_SOURCE_RATIO: 0.15,
        PIPE_JOIN_OVERLAP: 3,
        BIRD_WIDTH: 48,
        BIRD_HEIGHT: 36,
        BIRD_START_Y_RATIO: 0.35,
        SPAWN_FRAME_INTERVAL: 120,
        GROUND_HEIGHT: 42,
        STORAGE_KEY: 'doodlebird_best_score',
    };

    // ========== GAME STATE ==========
    const GameState = Object.freeze({
        START: 'start',
        PLAY: 'play',
        OVER: 'over',
    });

    const stateContext = {
        current: GameState.START,
        score: 0,
        bestScore: parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0,
        frames: 0,
        width: 0,
        height: 0,
    };

    // ========== ASSETS ==========
    const assets = {
        bg: new Image(),
        pipe: new Image(),
        bird: new Image(),
    };

    assets.bg.src = 'https://i.ibb.co/gwGt8Sxy/Group-24.png';
    assets.pipe.src = 'https://i.ibb.co/7Y9hM9Vt/pipe.png';
    assets.bird.src = 'https://i.ibb.co/YRQVwX8r/Group-3.png';

    // ========== AUDIO ==========
    const audio = {
        ctx: null,
        isInitialized: false,

        init() {
            if (this.isInitialized) return;
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        },

        sfxFlap() {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setTargetAtTime(659.25, now, 0.02);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        },

        sfxHit() {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.setTargetAtTime(50, now, 0.1);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        },
    };

    // ========== BIRD ==========
    const bird = {
        x: 0,
        y: 0,
        velocity: 0,
        width: CONFIG.BIRD_WIDTH,
        height: CONFIG.BIRD_HEIGHT,

        reset(canvasWidth, canvasHeight) {
            this.x = canvasWidth * 0.25;
            this.y = canvasHeight * CONFIG.BIRD_START_Y_RATIO;
            this.velocity = 0;
        },
    };

    // ========== PIPES ==========
    let pipes = [];

    function generatePipeGap() {
        const minY = CONFIG.PIPE_GAP * 0.3;
        const maxY = stateContext.height - CONFIG.PIPE_GAP - CONFIG.GROUND_HEIGHT - CONFIG.PIPE_GAP * 0.3;
        return Math.random() * (maxY - minY) + minY;
    }

    // ========== DOM ELEMENTS ==========
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const scoreBadge = document.getElementById('scoreBadge');
    const endScoreDisplay = document.getElementById('endScore');
    const bestScoreDisplay = document.getElementById('bestScore');
    const startBtn = document.getElementById('startBtn');
    const retryBtn = document.getElementById('retryBtn');
    const shareBtn = document.getElementById('shareBtn');

    // ========== CANVAS SETUP ==========
    function resizeCanvas() {
        const container = document.getElementById('app-container');
        stateContext.width = container.clientWidth;
        stateContext.height = container.clientHeight;
        canvas.width = stateContext.width;
        canvas.height = stateContext.height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ========== GAME LOGIC ==========
    function drawSeamlessGround() {
        const groundY = stateContext.height - CONFIG.GROUND_HEIGHT;
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(0, groundY, stateContext.width, CONFIG.GROUND_HEIGHT);

        ctx.strokeStyle = '#6b5344';
        ctx.lineWidth = 2;
        for (let i = 0; i < stateContext.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, groundY + 10);
            ctx.lineTo(i + 10, groundY + 20);
            ctx.stroke();
        }
    }

    function checkCollision() {
        const padding = 4;
        const birdLeft = bird.x - bird.width / 2 + padding;
        const birdRight = bird.x + bird.width / 2 - padding;
        const birdTop = bird.y - bird.height / 2 + padding;
        const birdBottom = bird.y + bird.height / 2 - padding;

        // Check ground collision
        if (birdBottom >= stateContext.height - CONFIG.GROUND_HEIGHT) {
            return true;
        }

        // Check pipe collision
        for (let p of pipes) {
            const pipeLeft = p.x;
            const pipeRight = p.x + CONFIG.PIPE_WIDTH;

            if (birdRight > pipeLeft && birdLeft < pipeRight) {
                if (birdTop < p.topHeight || birdBottom > p.bottomY) {
                    return true;
                }
            }
        }

        return false;
    }

    function updateGameEngine() {
        if (stateContext.current !== GameState.PLAY) return;

        // Apply gravity
        bird.velocity += CONFIG.GRAVITY;
        bird.y += bird.velocity;

        // Collision detection
        if (checkCollision()) {
            triggerGameOver();
            return;
        }

        // Spawn pipes
        if (stateContext.frames % CONFIG.SPAWN_FRAME_INTERVAL === 0) {
            const gapY = generatePipeGap();
            pipes.push({
                x: stateContext.width,
                topHeight: gapY,
                bottomY: gapY + CONFIG.PIPE_GAP,
            });
        }

        // Update pipes and scoring
        for (let p of pipes) {
            p.x -= 5;

            // Score increment when pipe passes bird
            if (p.x + CONFIG.PIPE_WIDTH === Math.floor(bird.x) && stateContext.current === GameState.PLAY) {
                stateContext.score++;
                scoreBadge.innerText = `SCORE: ${stateContext.score}`;
                audio.sfxFlap();
            }
        }

        if (pipes.length > 0 && pipes[0].x + CONFIG.PIPE_WIDTH < 0) {
            pipes.shift();
        }
    }

    // ---------- Pipe rendering ----------
    // The asset contains a cap at its top edge. Keep that cap fixed and
    // repeat only the plain shaft so every pipe height looks natural.
    function drawPipe(x, y, height, capAtTop) {
        if (!assets.pipe.complete || !assets.pipe.naturalWidth) return;

        const sourceWidth = assets.pipe.naturalWidth;
        const sourceHeight = assets.pipe.naturalHeight;
        const sourceCapHeight = Math.max(1, Math.floor(sourceHeight * CONFIG.PIPE_CAP_SOURCE_RATIO));
        const capHeight = Math.min(CONFIG.PIPE_CAP_HEIGHT, height);
        const shaftHeight = Math.max(0, height - capHeight);
        const shaftSourceHeight = Math.max(1, sourceHeight - sourceCapHeight);
        const joinOverlap = Math.min(CONFIG.PIPE_JOIN_OVERLAP, capHeight, shaftHeight);

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        if (capAtTop) {
            ctx.drawImage(
                assets.pipe,
                0, 0, sourceWidth, sourceCapHeight,
                x, y, CONFIG.PIPE_WIDTH, capHeight
            );
            if (shaftHeight > 0) {
                drawPipeShaft(x, y + capHeight - joinOverlap, shaftHeight + joinOverlap,
                    sourceWidth, sourceCapHeight, shaftSourceHeight);
            }
        } else {
            if (shaftHeight > 0) {
                drawPipeShaft(x, y, shaftHeight + joinOverlap,
                    sourceWidth, sourceCapHeight, shaftSourceHeight);
            }
            ctx.save();
            ctx.translate(x, y + height);
            ctx.scale(1, -1);
            ctx.drawImage(
                assets.pipe,
                0, 0, sourceWidth, sourceCapHeight,
                0, -joinOverlap, CONFIG.PIPE_WIDTH, capHeight + joinOverlap
            );
            ctx.restore();
        }

        ctx.restore();
    }

    function drawPipeShaft(x, y, height, sourceWidth, sourceCapHeight, sourceShaftHeight) {
        const sourceTileHeight = Math.min(sourceShaftHeight, 64);
        const tileHeight = Math.max(1, Math.round(
            CONFIG.PIPE_WIDTH * sourceTileHeight / sourceWidth
        ));

        for (let offset = 0; offset < height; offset += tileHeight) {
            const remainingHeight = Math.min(tileHeight, height - offset);
            const sourceHeight = sourceTileHeight * remainingHeight / tileHeight;
            ctx.drawImage(
                assets.pipe,
                0, sourceCapHeight, sourceWidth, sourceHeight,
                x, y + offset, CONFIG.PIPE_WIDTH, remainingHeight
            );
        }
    }

    // ---------- Rendering ----------
    function renderFrame() {
        // Draw Background Asset
        if (assets.bg.complete) {
            ctx.drawImage(assets.bg, 0, 0, stateContext.width, stateContext.height);
        } else {
            ctx.fillStyle = '#70c5ce';
            ctx.fillRect(0, 0, stateContext.width, stateContext.height);
        }

        // Draw pipes with fixed-aspect caps and flexible shafts.
        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];
            drawPipe(p.x, 0, p.topHeight, false);
            drawPipe(p.x, p.bottomY, stateContext.height - p.bottomY, true);
        }

        drawSeamlessGround();

        // Draw Bird Asset with 4:3 aspect ratio (width: 48, height: 36) and rotation
        ctx.save();
        ctx.translate(bird.x, bird.y);
        let rot = Math.min(Math.PI / 3.5, Math.max(-Math.PI / 3.5, bird.velocity * 0.09));
        ctx.rotate(rot);
        ctx.drawImage(assets.bird, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
        ctx.restore();
    }

    function mainLoop() {
        updateGameEngine();
        renderFrame();
        stateContext.frames++;
        requestAnimationFrame(mainLoop);
    }

    // ---------- Game actions ----------
    function executeFlapAction() {
        audio.init();
        if (stateContext.current === GameState.PLAY) {
            bird.velocity = CONFIG.JUMP_FORCE;
            audio.sfxFlap();
        } else if (stateContext.current === GameState.START) {
            initializeGameSession();
        }
    }

    function initializeGameSession() {
        audio.init();
        stateContext.current = GameState.PLAY;
        stateContext.score = 0;
        stateContext.frames = 0;
        bird.reset(stateContext.width, stateContext.height);
        bird.velocity = CONFIG.JUMP_FORCE;
        pipes = [];
        scoreBadge.innerText = `SCORE: ${stateContext.score}`;
        scoreBadge.style.display = 'block';
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        audio.sfxFlap();
    }

    function triggerGameOver() {
        stateContext.current = GameState.OVER;
        audio.sfxHit();
        scoreBadge.style.display = 'none';

        if (stateContext.score > stateContext.bestScore) {
            stateContext.bestScore = stateContext.score;
            localStorage.setItem(CONFIG.STORAGE_KEY, stateContext.bestScore.toString());
        }

        endScoreDisplay.innerText = stateContext.score;
        bestScoreDisplay.innerText = stateContext.bestScore;
        gameOverScreen.classList.remove('hidden');
    }

    function resetToStartup() {
        gameOverScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        stateContext.current = GameState.START;
        bird.reset(stateContext.width, stateContext.height);
        pipes = [];
        stateContext.frames = 0;
    }

    // ---------- Input handlers ----------
    function handleKeyDown(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            executeFlapAction();
        }
    }

    function handlePointerDown(e) {
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            executeFlapAction();
        }
    }

    function handleStartClick(e) {
        e.stopPropagation();
        initializeGameSession();
    }

    function handleRetryClick(e) {
        e.stopPropagation();
        resetToStartup();
    }

    async function handleShareClick(e) {
        e.stopPropagation();
        const shareData = {
            title: 'doodlebird',
            text: `I scored ${stateContext.score} in doodlebird!`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if (error.name !== 'AbortError') console.error('Share failed:', error);
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(window.location.href);
            shareBtn.setAttribute('aria-label', 'Game link copied');
        } catch (error) {
            window.prompt('Copy this game link:', window.location.href);
        }
    }

    function registerEventHandlers() {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('pointerdown', handlePointerDown);
        startBtn.addEventListener('click', handleStartClick);
        retryBtn.addEventListener('click', handleRetryClick);
        shareBtn.addEventListener('click', handleShareClick);
    }

    // ---------- Start the game ----------
    registerEventHandlers();
    requestAnimationFrame(mainLoop);

})();
