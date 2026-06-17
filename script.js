const canvas = document.getElementById("gameCanvas");
// =====================
// SOUND ENGINE
// =====================
// =====================
// =====================
// =====================
// =====================
// BIRD SKINS
// =====================
const skins = [
  { name: "Classic", unlockAt: 0,   colors: { body: "#FFD700", wing: "#FFA500", beak: "#FF6B35" } },
  { name: "Cyber",   unlockAt: 10,  colors: { body: "#00ffcc", wing: "#00bfae", beak: "#ff00ff" } },
  { name: "Neon",    unlockAt: 25,  colors: { body: "#ff00ff", wing: "#cc00cc", beak: "#00ffcc" } },
  { name: "Rocket",  unlockAt: 50,  colors: { body: "#ff4444", wing: "#cc2222", beak: "#FFD700" } }
];

function getCurrentSkin() {
  let current = skins[0];
  skins.forEach(s => {
    if (highScore >= s.unlockAt) current = s;
  });
  return current;
}
// ACHIEVEMENTS
// =====================
const achievements = [
  { score: 10,  label: "🔥 On Fire! Score 10",   unlocked: false },
  { score: 25,  label: "⚡ Electric! Score 25",   unlocked: false },
  { score: 50,  label: "🚀 Rocket! Score 50",     unlocked: false },
  { score: 100, label: "👑 Legend! Score 100",    unlocked: false }
];

let activeAchievement = null;
let achievementTimer = 0;

function checkAchievements() {
  achievements.forEach(a => {
    if (!a.unlocked && score >= a.score) {
      a.unlocked = true;
      activeAchievement = a.label;
      achievementTimer = 180;
    }
  });
}

function drawAchievement() {
  if (!activeAchievement || achievementTimer <= 0) return;

  const alpha = Math.min(1, achievementTimer / 30);
  ctx.globalAlpha = alpha;

  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath();
  ctx.roundRect(40, 20, 320, 45, 12);
  ctx.fill();

  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 14px Poppins, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Achievement Unlocked!", canvas.width / 2, 38);
  ctx.fillStyle = "#ffffff";
  ctx.font = "13px Poppins, Arial";
  ctx.fillText(activeAchievement, canvas.width / 2, 57);

  ctx.globalAlpha = 1;
  achievementTimer--;
  if (achievementTimer <= 0) activeAchievement = null;
}
// SCREEN SHAKE
// =====================
let shakeAmount = 0;

function triggerShake(amount) {
  shakeAmount = amount;
}

function applyShake() {
  if (shakeAmount > 0) {
    const dx = (Math.random() - 0.5) * shakeAmount;
    const dy = (Math.random() - 0.5) * shakeAmount;
    ctx.translate(dx, dy);
    shakeAmount *= 0.85;
    if (shakeAmount < 0.5) shakeAmount = 0;
  }
}
// PARTICLES
// =====================
let particles = [];

function spawnParticles(x, y, type) {
  const configs = {
    feather: { count: 5, colors: ["#FFD700", "#FFA500", "#fff"], speed: 2, size: 4, life: 25 },
    spark:   { count: 8, colors: ["#FFD700", "#fff", "#00ffcc"], speed: 3, size: 3, life: 20 },
    explosion: { count: 18, colors: ["#ff4444", "#ff8800", "#FFD700", "#fff"], speed: 5, size: 5, life: 35 }
  };
  const c = configs[type];
  for (let i = 0; i < c.count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * c.speed + 1;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: c.colors[Math.floor(Math.random() * c.colors.length)],
      size: Math.random() * c.size + 2,
      life: c.life,
      maxLife: c.life
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  particles.forEach(p => {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playSound(type) {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === "flap") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  if (type === "score") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  }

  if (type === "hit") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }
}
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

// =====================
// PARALLAX LAYERS
// =====================
const clouds = Array.from({ length: 5 }, (_, i) => ({
  x: i * 90,
  y: Math.random() * 150 + 20,
  width: Math.random() * 80 + 60,
  height: Math.random() * 30 + 20,
  speed: 0.4
}));

const mountains = Array.from({ length: 4 }, (_, i) => ({
  x: i * 110,
  y: 350,
  width: 120,
  height: Math.random() * 80 + 60,
  speed: 0.8
}));

const groundTiles = Array.from({ length: 6 }, (_, i) => ({
  x: i * 80,
  speed: 2
}));

// =====================
// BIRD
// =====================
const bird = {
  x: 80,
  y: 250,
  radius: 18,
  velocityY: 0,
  gravity: 0.4,
  lift: -7,
  rotation: 0
};

// =====================
// PIPES
// =====================
const pipeWidth = 60;
const pipeGap = 150;
const pipeSpeed = 2;
let pipes = [];
let frameCount = 0;
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;
let gameState = "start";

// =====================
// SKY GRADIENT (Day/Night will come in step 4)
// =====================
function getSkyColors() {
  const cycle = Math.floor(score / 10) % 4;
  const themes = [
    { top: "#87CEEB", bottom: "#c9f0ff" },   // Morning
    { top: "#f7b733", bottom: "#fc4a1a" },    // Sunset
    { top: "#0f2027", bottom: "#203a43" },    // Night
    { top: "#b8d4f0", bottom: "#e8f4f8" }     // Afternoon
  ];
  return themes[cycle];
}

// =====================
// DRAW FUNCTIONS
// =====================
function drawSky() {
  const colors = getSkyColors();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, colors.top);
  gradient.addColorStop(1, colors.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClouds() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  clouds.forEach(cloud => {
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cloud.x + 30, cloud.y - 10, cloud.width / 3, cloud.height / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawMountains() {
  ctx.fillStyle = "rgba(150, 180, 210, 0.6)";
  mountains.forEach(m => {
    ctx.beginPath();
    ctx.moveTo(m.x, canvas.height - 80);
    ctx.lineTo(m.x + m.width / 2, canvas.height - 80 - m.height);
    ctx.lineTo(m.x + m.width, canvas.height - 80);
    ctx.closePath();
    ctx.fill();
  });
}

function drawGround() {
  ctx.fillStyle = "#5d8a3c";
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
  ctx.fillStyle = "#7ab648";
  ctx.fillRect(0, canvas.height - 60, canvas.width, 12);

  groundTiles.forEach(tile => {
    ctx.fillStyle = "#6aaa3a";
    ctx.fillRect(tile.x, canvas.height - 60, 70, 12);
  });
}

function drawPipes() {
  pipes.forEach(pipe => {
    // Top pipe
    const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
    topGrad.addColorStop(0, "#27ae60");
    topGrad.addColorStop(0.5, "#2ecc71");
    topGrad.addColorStop(1, "#1a8a45");
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.roundRect(pipe.x, 0, pipeWidth, pipe.topHeight, [0, 0, 8, 8]);
    ctx.fill();

    // Top pipe cap
    ctx.fillStyle = "#27ae60";
    ctx.beginPath();
    ctx.roundRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20, [4, 4, 0, 0]);
    ctx.fill();

    // Bottom pipe
    const botGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
    botGrad.addColorStop(0, "#27ae60");
    botGrad.addColorStop(0.5, "#2ecc71");
    botGrad.addColorStop(1, "#1a8a45");
    ctx.fillStyle = botGrad;
    ctx.beginPath();
    ctx.roundRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY, [8, 8, 0, 0]);
    ctx.fill();

    // Bottom pipe cap
    ctx.fillStyle = "#27ae60";
    ctx.beginPath();
    ctx.roundRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20, [0, 0, 4, 4]);
    ctx.fill();
  });
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);

  // Rotation based on velocity
  bird.rotation = Math.min(Math.max(bird.velocityY * 0.05, -0.5), 1.2);
  ctx.rotate(bird.rotation);

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, bird.radius, bird.radius * 0.85, 0, 0, Math.PI * 2);
  const skin = getCurrentSkin();
ctx.fillStyle = skin.colors.body;
ctx.fill();

// Wing
ctx.beginPath();
ctx.ellipse(-5, 4, 10, 6, -0.3, 0, Math.PI * 2);
ctx.fillStyle = skin.colors.wing;
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(7, -5, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, -5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "#222";
  ctx.fill();

  // Beak
  ctx.beginPath();
  ctx.moveTo(14, -1);
  ctx.lineTo(20, 2);
  ctx.lineTo(14, 5);
  ctx.closePath();
  ctx.fillStyle = skin.colors.beak;
  ctx.fill();

  ctx.restore();
}

function drawScore() {
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.font = "bold 36px Orbitron, Arial";
  ctx.fillText(score, canvas.width / 2 + 2, 62);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(score, canvas.width / 2, 60);
}

function drawStartScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.roundRect(60, canvas.height / 2 - 100, 280, 200, 20);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 24px Orbitron, Arial";
  ctx.fillText("FLAPPY BIRD", canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = "bold 18px Orbitron, Arial";
  ctx.fillStyle = "#87CEEB";
  ctx.fillText("2026", canvas.width / 2, canvas.height / 2 - 20);

  ctx.font = "14px Poppins, Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Tap or Press Space to Start", canvas.width / 2, canvas.height / 2 + 20);

  ctx.fillStyle = "#FFD700";
  ctx.font = "13px Poppins, Arial";
  ctx.fillText("🏆 Best: " + highScore, canvas.width / 2, canvas.height / 2 + 60);
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.beginPath();
  ctx.roundRect(60, canvas.height / 2 - 110, 280, 220, 20);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ff6b6b";
  ctx.font = "bold 28px Orbitron, Arial";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 55);

  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Poppins, Arial";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 - 15);
  ctx.fillStyle = "#FFD700";
  ctx.fillText("🏆 Best: " + highScore, canvas.width / 2, canvas.height / 2 + 15);

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.roundRect(110, canvas.height / 2 + 45, 180, 45, 12);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px Poppins, Arial";
  ctx.fillText("Tap to Restart", canvas.width / 2, canvas.height / 2 + 74);
}

// =====================
// UPDATE FUNCTIONS
// =====================
function updateParallax() {
  clouds.forEach(cloud => {
    cloud.x -= cloud.speed;
    if (cloud.x + cloud.width < 0) {
      cloud.x = canvas.width + 20;
      cloud.y = Math.random() * 150 + 20;
    }
  });

  mountains.forEach(m => {
    m.x -= m.speed;
    if (m.x + m.width < 0) {
      m.x = canvas.width + 20;
      m.height = Math.random() * 80 + 60;
    }
  });

  groundTiles.forEach(tile => {
    tile.x -= tile.speed;
    if (tile.x + 80 < 0) {
      tile.x = canvas.width + 10;
    }
  });
}

function createPipe() {
  const difficulty = Math.floor(score / 10);
  const currentGap = Math.max(110, pipeGap - difficulty * 8);
  const currentSpeed = Math.min(5, pipeSpeed + difficulty * 0.3);

  const minHeight = 60;
  const maxHeight = canvas.height - currentGap - minHeight - 60;
  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + currentGap,
    scored: false,
    speed: currentSpeed
  });
}
function updateScore() {
  pipes.forEach(pipe => {
    if (!pipe.scored && bird.x > pipe.x + pipeWidth) {
      score++;
      pipe.scored = true;
      playSound("score");
      spawnParticles(bird.x, bird.y, "spark");
      checkAchievements();
    }
  });
}

function checkCollision() {
  if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= canvas.height - 60) return true;
  for (let pipe of pipes) {
    const birdLeft = bird.x - bird.radius;
    const birdRight = bird.x + bird.radius;
    const birdTop = bird.y - bird.radius;
    const birdBottom = bird.y + bird.radius;
    const hitsPipeX = birdRight > pipe.x && birdLeft < pipe.x + pipeWidth;
    const hitsTopPipe = birdTop < pipe.topHeight;
    const hitsBottomPipe = birdBottom > pipe.bottomY;
    if (hitsPipeX && (hitsTopPipe || hitsBottomPipe)) return true;
  }
  return false;
}

function update() {
  updateParallax();
  if (gameState !== "playing") return;

  bird.velocityY += bird.gravity;
  bird.y += bird.velocityY;

  frameCount++;
  if (frameCount % 90 === 0) createPipe();

  pipes.forEach(pipe => pipe.x -= pipe.speed || pipeSpeed);
  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
updateParticles();
  updateScore();

  if (checkCollision()) {
  gameState = "gameover";
  playSound("hit");
  spawnParticles(bird.x, bird.y, "explosion");
  triggerShake(12);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("flappyHighScore", highScore);
  }
}
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("flappyHighScore", highScore);
    }
  }

function draw() {
  ctx.save();
  applyShake();
  drawSky();
  drawClouds();
  drawMountains();
  drawPipes();
  drawGround();
  drawBird();
  drawParticles();
  if (gameState === "playing") drawScore();
  if (gameState === "start") drawStartScreen();
  if (gameState === "gameover") drawGameOverScreen();
  ctx.restore();
  drawAchievement();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

// =====================
// INPUT HANDLERS
// =====================
function flap() {
  bird.velocityY = bird.lift;
  playSound("flap");
  spawnParticles(bird.x - 10, bird.y + 5, "feather");
}
function handleInput() {
  if (gameState === "start") { gameState = "playing"; flap(); }
  else if (gameState === "playing") { flap(); }
  else if (gameState === "gameover") { resetGame(); }
}

function resetGame() {
  achievements.forEach(a => a.unlocked = false);
activeAchievement = null;
achievementTimer = 0;
  bird.y = 250;
  bird.velocityY = 0;
  bird.rotation = 0;
  pipes = [];
  frameCount = 0;
  score = 0;
  gameState = "playing";
}

document.addEventListener("keydown", e => { if (e.code === "Space") handleInput(); });
canvas.addEventListener("click", () => handleInput());
canvas.addEventListener("touchstart", e => { e.preventDefault(); handleInput(); });