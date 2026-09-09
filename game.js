// ============================================================
// GAZTi & JESI — BASE DEL JUEGO
// Todo está dibujado con JavaScript: no necesita imágenes.
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;

const keys = {};
let lives = 3;
let cards = 0;
let gameWon = false;
let paused = false;

document.addEventListener("keydown", e => {
  keys[e.code] = true;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === "KeyR") resetLevel();
});

document.addEventListener("keyup", e => {
  keys[e.code] = false;
});

// ---------- DATOS DEL NIVEL ----------

const platforms = [
  {x: 0,   y: 485, w: 960, h: 55},
  {x: 80,  y: 400, w: 180, h: 22},
  {x: 330, y: 330, w: 170, h: 22},
  {x: 570, y: 395, w: 150, h: 22},
  {x: 750, y: 300, w: 130, h: 22},
  {x: 440, y: 210, w: 130, h: 22},
  {x: 150, y: 250, w: 150, h: 22}
];

const collectibles = [
  {
    x: 180, y: 355, taken: false,
    title: "EL PRIMER MATE",
    text: "Un árbol, unos mates y el comienzo de todo."
  },
  {
    x: 470, y: 165, taken: false,
    title: "05:05 AM",
    text: "Una hora cualquiera... que terminó siendo una fecha importante."
  },
  {
    x: 815, y: 255, taken: false,
    title: "NOSOTROS",
    text: "Un pequeño recuerdo para la persona que hace más lindos mis días."
  }
];

const enemies = [
  {x: 390, y: 296, w: 28, h: 34, vx: 1.1, min: 330, max: 472, alive: true},
  {x: 620, y: 361, w: 28, h: 34, vx: -1.2, min: 575, max: 690, alive: true}
];

const goal = {x: 885, y: 430, w: 32, h: 55};

const player = {
  x: 45, y: 430,
  w: 30, h: 44,
  vx: 0, vy: 0,
  speed: 4.2,
  jump: 11.5,
  grounded: false,
  invincible: 0
};

let cameraX = 0;

// ---------- UTILIDADES ----------

function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function resetLevel() {
  player.x = 45;
  player.y = 430;
  player.vx = 0;
  player.vy = 0;
  player.invincible = 60;

  enemies.forEach((e, i) => {
    e.alive = true;
    e.x = i === 0 ? 390 : 620;
  });

  collectibles.forEach(c => c.taken = false);
  cards = 0;
  lives = 3;
  gameWon = false;
  paused = false;
  hideMessage();
  updateHUD();
}

function loseLife() {
  if (player.invincible > 0) return;

  lives--;
  updateHUD();

  if (lives <= 0) {
    showMessage(
      "💔",
      "GAME OVER",
      "No pasa nada. Hasta los mejores héroes se caen. Probá otra vez.",
      "Reintentar"
    );
    paused = true;
    return;
  }

  player.x = 45;
  player.y = 430;
  player.vx = 0;
  player.vy = 0;
  player.invincible = 100;
}

function updateHUD() {
  document.getElementById("lives").textContent = lives;
  document.getElementById("cards").textContent = cards;
}

function showMessage(icon, title, text, buttonText) {
  document.getElementById("message-icon").textContent = icon;
  document.getElementById("message-title").textContent = title;
  document.getElementById("message-text").textContent = text;
  document.getElementById("message-button").textContent = buttonText;
  document.getElementById("message").classList.remove("hidden");
}

function hideMessage() {
  document.getElementById("message").classList.add("hidden");
}

document.getElementById("message-button").addEventListener("click", () => {
  if (gameWon || lives <= 0) {
    resetLevel();
  } else {
    paused = false;
    hideMessage();
  }
});

// ---------- FÍSICAS ----------

function update() {
  if (paused) return;

  // Movimiento
  if (keys.ArrowLeft || keys.KeyA) {
    player.vx = -player.speed;
  } else if (keys.ArrowRight || keys.KeyD) {
    player.vx = player.speed;
  } else {
    player.vx *= 0.78;
  }

  // Salto
  if ((keys.Space || keys.ArrowUp || keys.KeyW) && player.grounded) {
    player.vy = -player.jump;
    player.grounded = false;
  }

  player.vy += 0.55;
  if (player.vy > 13) player.vy = 13;

  // Movimiento horizontal
  player.x += player.vx;

  if (player.x < 0) player.x = 0;
  if (player.x > W - player.w) player.x = W - player.w;

  // Colisión vertical con plataformas
  const oldY = player.y;
  player.y += player.vy;
  player.grounded = false;

  for (const p of platforms) {
    const wasAbove = oldY + player.h <= p.y;
    const nowBelow = player.y + player.h >= p.y;

    if (wasAbove && nowBelow &&
        player.x + player.w > p.x &&
        player.x < p.x + p.w &&
        player.vy >= 0) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }

  // Caída
  if (player.y > H + 80) {
    loseLife();
  }

  // Enemigos
  for (const e of enemies) {
    if (!e.alive) continue;

    e.x += e.vx;
    if (e.x <= e.min || e.x + e.w >= e.max) e.vx *= -1;

    if (rectsOverlap(player, e)) {
      // Si caemos encima, eliminamos al enemigo.
      if (player.vy > 0 && player.y + player.h - e.y < 18) {
        e.alive = false;
        player.vy = -7;
      } else {
        loseLife();
      }
    }
  }

  // Cromos
  for (const c of collectibles) {
    const box = {x: c.x - 12, y: c.y - 16, w: 24, h: 32};

    if (!c.taken && rectsOverlap(player, box)) {
      c.taken = true;
      cards++;
      updateHUD();

      showMessage("🃏", "¡NUEVO RECUERDO!", c.title + "\n\n" + c.text, "Continuar");
      paused = true;
    }
  }

  // Meta
  if (rectsOverlap(player, goal)) {
    gameWon = true;
    showMessage(
      "💗",
      "¡NIVEL COMPLETADO!",
      `Conseguiste ${cards}/3 recuerdos.\n\nEsto recién empieza...`,
      "Jugar de nuevo"
    );
    paused = true;
  }

  if (player.invincible > 0) player.invincible--;

  // Cámara sencilla
  cameraX = Math.max(0, Math.min(player.x - 300, 0));
}

// ---------- DIBUJO ----------

function drawBackground() {
  // Cielo
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#667ccf");
  gradient.addColorStop(1, "#f5a6b9");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Luna/sol
  ctx.fillStyle = "#fff1bd";
  ctx.beginPath();
  ctx.arc(790, 95, 48, 0, Math.PI * 2);
  ctx.fill();

  // Montañas
  ctx.fillStyle = "#495486";
  for (let x = -100; x < W + 200; x += 230) {
    ctx.beginPath();
    ctx.moveTo(x, 430);
    ctx.lineTo(x + 110, 220);
    ctx.lineTo(x + 250, 430);
    ctx.fill();
  }

  // Nubes pixeladas
  ctx.fillStyle = "rgba(255,255,255,.55)";
  for (let x = 50; x < W; x += 300) {
    ctx.fillRect(x, 90, 70, 18);
    ctx.fillRect(x + 18, 75, 42, 18);
  }
}

function drawPlatforms() {
  for (const p of platforms) {
    // tierra
    ctx.fillStyle = "#3d2d3d";
    ctx.fillRect(p.x, p.y, p.w, p.h);

    // pasto
    ctx.fillStyle = "#77b255";
    ctx.fillRect(p.x, p.y, p.w, 7);

    // pequeños píxeles
    ctx.fillStyle = "#5b8745";
    for (let x = p.x + 10; x < p.x + p.w; x += 28) {
      ctx.fillRect(x, p.y + 11, 7, 7);
    }
  }
}

function drawCollectibles() {
  for (const c of collectibles) {
    if (c.taken) continue;

    const bob = Math.sin(Date.now() / 180 + c.x) * 4;

    // Cromo
    ctx.fillStyle = "#fff4cf";
    ctx.fillRect(c.x - 15, c.y - 21 + bob, 30, 42);

    ctx.fillStyle = "#e84f82";
    ctx.fillRect(c.x - 11, c.y - 17 + bob, 22, 30);

    ctx.fillStyle = "#fff4cf";
    ctx.fillRect(c.x - 6, c.y - 11 + bob, 12, 12);

    // Brillito
    ctx.fillStyle = "#fff";
    ctx.fillRect(c.x + 18, c.y - 22 + bob, 4, 4);
  }
}

function drawGoal() {
  ctx.fillStyle = "#3b2744";
  ctx.fillRect(goal.x + 11, goal.y, 7, goal.h);

  ctx.fillStyle = "#ff5b91";
  ctx.beginPath();
  ctx.moveTo(goal.x + 18, goal.y + 4);
  ctx.lineTo(goal.x + 42, goal.y + 15);
  ctx.lineTo(goal.x + 18, goal.y + 27);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.fillRect(goal.x + 23, goal.y + 14, 6, 4);
}

function drawEnemies() {
  for (const e of enemies) {
    if (!e.alive) continue;

    ctx.fillStyle = "#25233c";
    ctx.fillRect(e.x, e.y + 8, e.w, e.h - 8);

    ctx.fillStyle = "#ffcf56";
    ctx.fillRect(e.x + 4, e.y, e.w - 8, 13);

    ctx.fillStyle = "#fff";
    ctx.fillRect(e.x + 5, e.y + 13, 6, 7);
    ctx.fillRect(e.x + 17, e.y + 13, 6, 7);

    ctx.fillStyle = "#171827";
    ctx.fillRect(e.x + 7, e.y + 15, 3, 4);
    ctx.fillRect(e.x + 19, e.y + 15, 3, 4);
  }
}

function drawPlayer() {
  if (player.invincible > 0 && Math.floor(player.invincible / 6) % 2 === 0) {
    return;
  }

  // sombra
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.fillRect(player.x + 3, player.y + player.h + 2, 25, 5);

  // pelo
  ctx.fillStyle = "#4a2c27";
  ctx.fillRect(player.x + 5, player.y, 20, 11);

  // cara
  ctx.fillStyle = "#f1b98f";
  ctx.fillRect(player.x + 6, player.y + 8, 18, 17);

  // remera
  ctx.fillStyle = "#e94f80";
  ctx.fillRect(player.x + 3, player.y + 24, 24, 14);

  // pantalón
  ctx.fillStyle = "#273b75";
  ctx.fillRect(player.x + 5, player.y + 38, 20, 6);

  // ojos
  ctx.fillStyle = "#111";
  ctx.fillRect(player.x + 9, player.y + 14, 3, 3);
  ctx.fillRect(player.x + 18, player.y + 14, 3, 3);
}

function drawText() {
  ctx.fillStyle = "rgba(10,12,25,.65)";
  ctx.fillRect(18, 18, 440, 43);

  ctx.fillStyle = "#fff";
  ctx.font = '12px "Press Start 2P"';
  ctx.fillText("NIVEL 1 — EL COMIENZO", 32, 45);

  ctx.font = '9px "Press Start 2P"';
  ctx.fillStyle = "#fff4cf";
  ctx.fillText("Encontrá los recuerdos ♥", 690, 45);
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  drawBackground();

  ctx.save();
  ctx.translate(cameraX, 0);

  drawPlatforms();
  drawCollectibles();
  drawGoal();
  drawEnemies();
  drawPlayer();

  ctx.restore();

  drawText();
}

// ---------- LOOP ----------

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

updateHUD();
loop();
