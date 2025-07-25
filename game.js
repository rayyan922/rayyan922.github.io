const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerImg = new Image();
playerImg.src = "https://i.imgur.com/zL8jFND.png";
const enemyImg = new Image();
enemyImg.src = "https://i.imgur.com/U5fLJYg.png";

// Game state
let keys = {};
let score = 0;
let gameOver = false;

// Entities
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 5;
    this.h = 12;
    this.speed = 8;
  }

  move() {
    this.y -= this.speed;
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

  isOut() {
    return this.y + this.h < 0;
  }
}

class Enemy {
  constructor() {
    this.w = 50;
    this.h = 50;
    this.x = Math.random() * (canvas.width - this.w);
    this.y = -this.h;
    this.speed = 2 + Math.random() * 2;
  }

  move() {
    this.y += this.speed;
  }

  draw() {
    ctx.drawImage(enemyImg, this.x, this.y, this.w, this.h);
  }

  isOffScreen() {
    return this.y > canvas.height;
  }
}

class Jet {
  constructor() {
    this.w = 60;
    this.h = 60;
    this.x = canvas.width / 2 - this.w / 2;
    this.y = canvas.height - this.h - 20;
    this.speed = 5;
    this.bullets = [];
    this.fireDelay = 0;
  }

  update() {
    if (keys["ArrowLeft"]) this.x -= this.speed;
    if (keys["ArrowRight"]) this.x += this.speed;
    if (keys["ArrowUp"]) this.y -= this.speed;
    if (keys["ArrowDown"]) this.y += this.speed;

    this.x = Math.max(0, Math.min(this.x, canvas.width - this.w));
    this.y = Math.max(0, Math.min(this.y, canvas.height - this.h));

    if (keys["Space"] && this.fireDelay <= 0) {
      this.bullets.push(new Bullet(this.x + this.w / 2 - 2, this.y));
      this.fireDelay = 15;
    }
    if (this.fireDelay > 0) this.fireDelay--;

    this.bullets = this.bullets.filter(b => !b.isOut());
    this.bullets.forEach(b => b.move());
  }

  draw() {
    ctx.drawImage(playerImg, this.x, this.y, this.w, this.h);
    this.bullets.forEach(b => b.draw());
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}

// Initialize
const player = new Jet();
let enemies = [];
let spawnRate = 40;
let spawnTimer = spawnRate;

// Input handling
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Collision
function checkCollision(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function updateEnemies() {
  spawnTimer--;
  if (spawnTimer <= 0) {
    enemies.push(new Enemy());
    spawnTimer = spawnRate;
  }

  enemies.forEach(enemy => enemy.move());
  enemies = enemies.filter(e => !e.isOffScreen());
}

function checkBulletHits() {
  player.bullets.forEach((bullet, bi) => {
    enemies.forEach((enemy, ei) => {
      if (checkCollision(bullet, enemy)) {
        enemies.splice(ei, 1);
        player.bullets.splice(bi, 1);
        score += 10;
      }
    });
  });
}

function checkPlayerCollision() {
  for (let e of enemies) {
    if (checkCollision(player.getBounds(), e)) {
      gameOver = true;
      break;
    }
  }
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);
}

function renderGameOver() {
  ctx.fillStyle = "red";
  ctx.font = "48px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
  ctx.font = "24px Arial";
  ctx.fillText("Final Score: " + score, canvas.width / 2 - 80, canvas.height / 2 + 40);
}

// Main loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    renderGameOver();
    return;
  }

  player.update();
  player.draw();

  updateEnemies();
  enemies.forEach(e => e.draw());

  checkBulletHits();
  checkPlayerCollision();
  drawScore();

  requestAnimationFrame(gameLoop);
}

gameLoop();
