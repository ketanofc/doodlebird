(function () {
    'use strict';

    // ---------- Game configuration ----------
    const CONFIG = {
        GRAVITY: 0.42,
        JUMP_FORCE: -7.5,
        PIPE_SPEED: 2.8,
        PIPE_WIDTH: 88,
        PIPE_CAP_HEIGHT: 44,
        PIPE_CAP_SOURCE_RATIO: 0.18,
        PIPE_JOIN_OVERLAP: 2,
        PIPE_GAP: 170,
        SPAWN_INTERVAL: 95,
        STORAGE_KEY: 'scribble_bird_seamless_ground_best'
    };

    const GameState = { START: 'START', PLAY: 'PLAY', OVER: 'OVER' };

    // ---------- Game state ----------
    const stateContext = {
        current: GameState.START,
        score: 0,
        bestScore: parseInt(localStorage.getItem(CONFIG.STORAGE_KEY), 10) || 0,
        frames: 0,
        width: 0,
        height: 0
    };

    // ---------- DOM and canvas references ----------
    const container = document.getElementById('app-container');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const scoreBadge = document.getElementById('score-badge');
    const endScoreDisplay = document.getElementById('end-score');
    const bestScoreDisplay = document.getElementById('best-score');
    const startBtn = document.getElementById('start-btn');
    const retryBtn = document.getElementById('retry-btn');
    const shareBtn = document.getElementById('share-btn');

    // ---------- Asset loading ----------
    const assets = {
        bg: new Image(),
        bird: new Image(),
        pipe: new Image(),
        ground: new Image()
    };

    assets.bg.src = 'https://i.ibb.co/v4WPXQXP/background.webp';
    assets.bird.src = 'https://i.ibb.co/sJNbdh7F/bird.png';
    assets.pipe.src = 'https://i.ibb.co/7tTjN6v9/pipe.png';
    assets.ground.src = 'https://i.ibb.co/gZCp5Lpd/groundmain.png';

    // ---------- Audio ----------
    class AudioSubsystem {
        constructor() { this.ctx = null; this.initialized = false; }
        init() {
            if (this.initialized) return;
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AC();
                this.initialized = true;
            } catch (e) { }
        }
        playTone(freq, type, duration, volume) {
            if (!this.initialized || !this.ctx) return;
            if (this.ctx.state === 'suspended') this.ctx.resume();
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(volume, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (err) { }
        }
        sfxFlap() { this.playTone(340, 'triangle', 0.08, 0.3); }
        sfxScore() {
            this.playTone(580, 'sine', 0.1, 0.15);
            setTimeout(() => this.playTone(760, 'sine', 0.12, 0.15), 80);
        }
        sfxHit() { this.playTone(130, 'sawtooth', 0.25, 0.4); }
    }
    const audio = new AudioSubsystem();

    // ---------- Bird ----------
    let bird = {
        x: 0, y: 0, velocity: 0, width: 48, height: 36, radius: 18,
        reset(w, h) { this.x = w * 0.32; this.y = h / 2; this.velocity = 0; },
        update() { this.velocity += CONFIG.GRAVITY; this.y += this.velocity; }
    };

    // ---------- Ground loop ----------
    let pipes = [];
    const groundAspectRatio = 134 / 638;
    const groundDownwardOffsetRatio = 0.08;
    const groundOverlap = 8;
    let groundTileWidth = 0;
    const groundMesh1 = { position: { x: 0 } };
    const groundMesh2 = { position: { x: 0 } };

    function getGroundHeight() {
        return Math.round(stateContext.width * groundAspectRatio);
    }

    function getGroundTop() {
        const groundHeight = getGroundHeight();
        return stateContext.height - groundHeight + Math.round(groundHeight * groundDownwardOffsetRatio);
    }

    function resetGroundMeshes() {
        groundTileWidth = stateContext.width;
        groundMesh1.position.x = 0;
        groundMesh2.position.x = groundTileWidth - groundOverlap;
    }

    function updateGroundMovement(speed, dt) {
        groundMesh1.position.x -= speed * dt;
        groundMesh2.position.x -= speed * dt;

        if (groundMesh1.position.x <= -groundTileWidth) {
            groundMesh1.position.x = groundMesh2.position.x + groundTileWidth - groundOverlap;
        }
        if (groundMesh2.position.x <= -groundTileWidth) {
            groundMesh2.position.x = groundMesh1.position.x + groundTileWidth - groundOverlap;
        }
    }

    function drawGroundMesh(mesh, blendFromLeft) {
        const groundHeight = getGroundHeight();
        const groundY = getGroundTop();
        const drawWidth = groundTileWidth + groundOverlap;
        const drawX = Math.floor(mesh.position.x);
        const previousSmoothing = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        if (blendFromLeft) {
            const blendSlices = 16;
            const sliceWidth = groundOverlap / blendSlices;
            for (let slice = 0; slice < blendSlices; slice++) {
                const sliceX = slice * sliceWidth;
                ctx.globalAlpha = (slice + 1) / blendSlices;
                ctx.drawImage(assets.ground,
                    assets.ground.naturalWidth * sliceX / drawWidth, 0,
                    assets.ground.naturalWidth * sliceWidth / drawWidth, assets.ground.naturalHeight,
                    drawX + sliceX, groundY, sliceWidth, groundHeight);
            }
            ctx.globalAlpha = 1;
            ctx.drawImage(assets.ground,
                assets.ground.naturalWidth * groundOverlap / drawWidth, 0,
                assets.ground.naturalWidth * (drawWidth - groundOverlap) / drawWidth, assets.ground.naturalHeight,
                drawX + groundOverlap, groundY, drawWidth - groundOverlap, groundHeight);
        } else {
            ctx.drawImage(assets.ground,
                0, 0, assets.ground.naturalWidth, assets.ground.naturalHeight,
                drawX, groundY,
                drawWidth, groundHeight);
        }
        ctx.imageSmoothingEnabled = previousSmoothing;
    }

    function drawSeamlessGround() {
        const groundHeight = getGroundHeight();
        const groundY = getGroundTop();
        const isIntroScreen = stateContext.current === GameState.START;
        const firstX = isIntroScreen ? 0 : Math.floor(groundMesh1.position.x);
        const secondX = isIntroScreen
            ? groundTileWidth - groundOverlap
            : Math.floor(groundMesh2.position.x);

        ctx.fillStyle = '#6fbd38';
        ctx.fillRect(0, groundY, stateContext.width, groundHeight);
        if (!assets.ground.complete || !assets.ground.naturalWidth) return;

        const leftMesh = firstX <= secondX ? firstX : secondX;
        const rightMesh = firstX <= secondX ? secondX : firstX;
        drawGroundMesh({ position: { x: leftMesh } }, false);
        drawGroundMesh({ position: { x: rightMesh } }, true);
    }

    function resizeCanvas() {
        stateContext.width = canvas.width = container.clientWidth;
        stateContext.height = canvas.height = container.clientHeight;
        resetGroundMeshes();
        if (stateContext.current === GameState.START) {
            bird.reset(stateContext.width, stateContext.height);
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ---------- Game updates ----------
    function updateGameEngine() {
        if (stateContext.current !== GameState.PLAY) return;

        bird.update();
        updateGroundMovement(CONFIG.PIPE_SPEED, 1);

        if (stateContext.frames % CONFIG.SPAWN_INTERVAL === 0) {
            let minH = 60;
            let maxH = stateContext.height - CONFIG.PIPE_GAP - minH - 90;
            let topH = Math.floor(Math.random() * maxH) + minH;

            pipes.push({
                x: stateContext.width,
                topHeight: topH,
                bottomY: topH + CONFIG.PIPE_GAP,
                passed: false
            });
        }

        let bLeft = bird.x - bird.width / 2 + 6;
        let bRight = bird.x + bird.width / 2 - 6;
        let bTop = bird.y - bird.height / 2 + 6;
        let bBottom = bird.y + bird.height / 2 - 6;

        for (let i = pipes.length - 1; i >= 0; i--) {
            let p = pipes[i];
            p.x -= CONFIG.PIPE_SPEED;

            if (bRight > p.x && bLeft < p.x + CONFIG.PIPE_WIDTH) {
                if (bTop < p.topHeight || bBottom > p.bottomY) {
                    triggerGameOver();
                }
            }

            if (p.x + CONFIG.PIPE_WIDTH < bLeft && !p.passed) {
                stateContext.score++;
                scoreBadge.innerText = `SCORE: ${stateContext.score}`;
                p.passed = true;
                audio.sfxScore();
            }
        }

        if (bird.y + bird.height / 2 >= getGroundTop() || bird.y - bird.height / 2 <= 0) {
            triggerGameOver();
        }

        if (pipes.length > 0 && pipes[0].x + CONFIG.PIPE_WIDTH < 0) {
            pipes.shift();
        }
    }

    // ---------- Pipe rendering ----------
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
        if (assets.bg.complete) {
            ctx.drawImage(assets.bg, 0, 0, stateContext.width, stateContext.height);
        } else {
            ctx.fillStyle = '#70c5ce';
            ctx.fillRect(0, 0, stateContext.width, stateContext.height);
        }

        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];
            drawPipe(p.x, 0, p.topHeight, false);
            drawPipe(p.x, p.bottomY, stateContext.height - p.bottomY, true);
        }

        drawSeamlessGround();

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
