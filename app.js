const G = 5;

let can, con;
let timePrior = 0;
let asteroidImage;
let laserImage;
let canShoot = true;
let isRunning = true;

let player = {
  img: undefined,
  pos: { a: 0, x: 0, y: 0 },
  dim: { x: 50, y: 50 },
  vel: { a: 0, x: 0.1, y: 0 },
  thrust: 0.0002,
  spin: 0.0025,
  controls: { a: 0, t: 0 },
};

let lasers = [];
let asteroids = [];

window.onload = init;

function animate(timeNow) {
  let timeChange = timeNow - timePrior;
  updatePlayer(timeChange);
  updateAsteroids(timeChange);
  updateLasers(timeChange);
  con.clearRect(0, 0, can.width, can.height);
  drawPlayer();
  drawAsteroids();
  drawLasers();
  timePrior = timeNow;
  if (isRunning) {
    requestAnimationFrame(animate);
  }
}

function drawAsteroids() {
  for (asteroid of asteroids) {
    con.save();
    con.translate(asteroid.pos.x, asteroid.pos.y);
    con.rotate(asteroid.pos.a);
    con.drawImage(
      asteroid.img,
      -0.5 * asteroid.dim.x,
      -0.5 * asteroid.dim.y,
      asteroid.dim.x,
      asteroid.dim.y
    );
    con.restore();
  }
}

function drawLasers() {
  for (laser of lasers) {
    con.save();
    con.translate(laser.pos.x, laser.pos.y);
    con.rotate(laser.pos.a);
    con.drawImage(
      laser.img,
      -0.5 * laser.dim.x,
      -0.5 * laser.dim.y,
      laser.dim.x,
      laser.dim.y
    );
    con.restore();
  }
}

function drawPlayer() {
  con.save();
  con.translate(player.pos.x, player.pos.y);
  con.rotate(player.pos.a);
  con.drawImage(
    player.img,
    -0.5 * player.dim.x,
    -0.5 * player.dim.y,
    player.dim.x,
    player.dim.y
  );
  con.restore();
}

function handleKD(e) {
  switch (e.key) {
    case "ArrowLeft":
      if (player.controls.a < 0) {
        break;
      }
      player.controls.a--;
      break;
    case "ArrowRight":
      if (player.controls.a > 0) {
        break;
      }
      player.controls.a++;
      break;
    case "ArrowUp":
      player.controls.t = 1;
      break;
    case " ":
      if (canShoot) {
        canShoot = false;
        makeLaser();
      }
      break;
  }
}

function handleKU(e) {
  switch (e.key) {
    case "ArrowLeft":
      if (player.controls.a > 0) {
        break;
      }
      player.controls.a++;
      break;
    case "ArrowRight":
      if (player.controls.a < 0) {
        break;
      }
      player.controls.a--;
      break;
    case "ArrowUp":
      player.controls.t = 0;
      break;
    case " ":
      canShoot = true;
      break;
  }
}

function init() {
  can = document.getElementById("can");
  con = can.getContext("2d");
  player.img = document.getElementById("player");
  asteroidImage = document.getElementById("asteroid");
  laserImage = document.getElementById("projectile");
  document.body.addEventListener("keydown", handleKD);
  document.body.addEventListener("keyup", handleKU);
  window.onresize = resize;
  resize();
  for (let i = 0; i < 5; i++) {
    makeAsteroid();
  }
  requestAnimationFrame(animate);
}

function makeAsteroid() {
  let theta = 2 * Math.PI * Math.random();
  let r = 100 + Math.random() * (can.height / 2 - 100);
  let x = r * Math.cos(theta) + can.width / 2;
  let y = r * Math.sin(theta) + can.height / 2;
  let a = 2 * Math.PI * Math.random();
  let v = Math.sqrt(G / r);
  asteroids.push({
    img: asteroidImage,
    pos: { a: a, x: x, y: y },
    dim: { x: 30, y: 30, r: 15 },
    vel: {
      a: 0.001,
      x: v * Math.cos(theta + Math.PI / 2),
      y: v * Math.sin(theta + Math.PI / 2),
    },
    isActive: true,
  });
}

function makeLaser() {
  lasers.push({
    img: laserImage,
    pos: { a: player.pos.a, x: player.pos.x, y: player.pos.y },
    dim: { x: 15, y: 15, r: 7 },
    vel: {
      a: 0.003,
      x: 0.2 * Math.cos(player.pos.a) + player.vel.x,
      y: 0.2 * Math.sin(player.pos.a) + player.vel.y,
    },
    isActive: true,
  });
}

function resize() {
  can.width = window.innerWidth;
  can.height = window.innerHeight;
}

function updateAsteroid(asteroid, timeChange) {
  asteroid.pos.a += asteroid.vel.a * timeChange;
  let dX = 0.5 * can.width - asteroid.pos.x;
  let dY = 0.5 * can.height - asteroid.pos.y;
  let angle = Math.atan2(dY, dX);
  let rSquared = dX * dX + dY * dY;
  let force = G / rSquared;
  asteroid.vel.x += force * Math.cos(angle) * timeChange;
  asteroid.vel.y += force * Math.sin(angle) * timeChange;
  asteroid.pos.x += asteroid.vel.x * timeChange;
  asteroid.pos.y += asteroid.vel.y * timeChange;
  if (rSquared > 2 * can.width * can.width) {
    isActive = false;
  }
}

function updateAsteroids(timeChange) {
  let keepers = [];
  for (asteroid of asteroids) {
    updateAsteroid(asteroid, timeChange);
    if (asteroid.isActive) {
      keepers.push(asteroid);
    }
  }
  asteroids = keepers;
  if (asteroids.length === 0) {
    //TODO: Win code
    document.getElementById("win").style.display = "block";
    isRunning = false;
  }
}

function updateLaser(laser, timeChange) {
  laser.pos.a += laser.vel.a * timeChange;
  let dX = 0.5 * can.width - laser.pos.x;
  let dY = 0.5 * can.height - laser.pos.y;
  let angle = Math.atan2(dY, dX);
  let rSquared = dX * dX + dY * dY;
  let force = G / rSquared;
  laser.vel.x += force * Math.cos(angle) * timeChange;
  laser.vel.y += force * Math.sin(angle) * timeChange;
  laser.pos.x += laser.vel.x * timeChange;
  laser.pos.y += laser.vel.y * timeChange;
  if (rSquared > 2 * can.width * can.width) {
    isActive = false;
  }
}

function updateLasers(timeChange) {
  let laserKeepers = [];
  for (laser of lasers) {
    updateLaser(laser, timeChange);
    if (laser.isActive) {
      let asteroidKeepers = [];
      let isDestroyed = false;
      for (asteroid of asteroids) {
        let dX = asteroid.pos.x - laser.pos.x;
        let dY = asteroid.pos.y - laser.pos.y;
        let dSquared = dX * dX + dY * dY;
        let sumOfR = asteroid.dim.r + laser.dim.r;
        let sumOfRSquared = sumOfR * sumOfR;
        if (dSquared < sumOfRSquared) {
          //Collision occured
          isDestroyed = true;
        } else {
          asteroidKeepers.push(asteroid);
        }
      }
      asteroids = asteroidKeepers;
      if (!isDestroyed) {
        laserKeepers.push(laser);
      }
    }
  }
  lasers = laserKeepers;
}

function updatePlayer(timeChange) {
  player.vel.a = player.controls.a * player.spin;
  player.pos.a += player.vel.a * timeChange;
  let dX = 0.5 * can.width - player.pos.x;
  let dY = 0.5 * can.height - player.pos.y;
  let angle = Math.atan2(dY, dX);
  let rSquared = dX * dX + dY * dY;
  let force = G / rSquared;
  player.vel.x += force * Math.cos(angle) * timeChange;
  player.vel.y += force * Math.sin(angle) * timeChange;
  if (player.controls.t) {
    player.vel.x += player.thrust * Math.cos(player.pos.a) * timeChange;
    player.vel.y += player.thrust * Math.sin(player.pos.a) * timeChange;
  }
  player.pos.x += player.vel.x * timeChange;
  player.pos.y += player.vel.y * timeChange;
}
