var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var scale = 1;
canvas.height = canvas.getBoundingClientRect().height;
canvas.width = canvas.getBoundingClientRect().width;

// canvas.height = Math.min(400, 0.6*window.innerHeight);
// canvas.width = Math.min(500, 0.9*window.innerWidth);

// console.log(canvas.height, canvas.width, canvas.clientHeight, canvas.clientWidth);

// console.log(canvas.getBoundingClientRect().left, canvas.getBoundingClientRect().top)

// console.log(document.getElementById("mainDiv").offsetLeft);
// console.log(document.getElementById("gameContainer").offsetTop);

var isGameRunning = false;
var refreshRate = 80;
var levelInterval = 3500;

var moveBall = true;
var gameIntervalId;
var levelIntervalId;

var score = 0;
var level = 1;

var ballRadius = 50;
var coinRadius = 10;
var posX = 665; // canvas.width / 2;
var posY = 530; // canvas.height / 2;
var coinPosX = getRandomPosition(2*coinRadius, canvas.width - (2*coinRadius));
var coinPosY = getRandomPosition(2*coinRadius, canvas.height - (2*coinRadius));

var clickOffsetLeft = canvas.getBoundingClientRect().left;
var clickOffsetTop = canvas.getBoundingClientRect().top

var ballSpeed = getBallSpeed()
var ballSpeedIncrement = getBallSpeedIncrement()
var dx = 0; // positive x => right
var dy = 0; // positive y => down

function getBallSpeed () {
  var dimension = Math.max(canvas.height, canvas.width);
  var speedScaleFactor = 12000;

  var speed = (refreshRate * (dimension/2)) / speedScaleFactor;
  speed = speed > 3 ? 3 : speed
  return speed;
}

function getBallSpeedIncrement () {
  return ballSpeed*0.25
}

function getRandomPosition(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(posX, posY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawCoin() {
  ctx.beginPath();
  ctx.arc(coinPosX, coinPosY, coinRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#e1b820";
  ctx.fill();
  ctx.closePath();
}

function isBallCloseToCoin(bufferGap) {
  if (!bufferGap) bufferGap = 0
  return distance(posX, posY, coinPosX, coinPosY) <= (ballRadius+coinRadius+bufferGap)
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (isBallCloseToCoin(0)) {
    score++;
    document.getElementById("scoreboard").innerHTML = "SCORE " + score;
    
    coinPosX = getRandomPosition(2*coinRadius, canvas.width - (2*coinRadius));
    coinPosY = getRandomPosition(2*coinRadius, canvas.height - (2*coinRadius));
    
    // if coin is very close, move to another position
    if (isBallCloseToCoin(50)) {
      if (coinPosX < canvas.width) {
        coinPosX = canvas.width - (2*coinRadius);
      } else {
        coinPosX = (2*coinRadius);
      }
    }
  }
  
  drawBall();
  drawCoin();

  if (!moveBall) return;

  if (
    (posX >= canvas.width + ballRadius) ||
    (posX < 0 - ballRadius) ||
    (posY >= canvas.height + ballRadius) ||
    (posY < 0 - ballRadius)
  ) {
    document.getElementById("finalScore").innerHTML = score;
    document.getElementById("popupSection").style.display = "block";
    moveBall = false;
    isGameRunning = false;

    if (gameIntervalId) clearInterval(gameIntervalId);
    if (levelIntervalId) {
      clearInterval(levelIntervalId);
      levelIntervalId = null;
    }
  }

  posX += ballSpeed * dx;
  posY += ballSpeed * dy;
}

function distance(x1, y1, x2, y2) {
  var _x = x1 - x2;
  var _y = y1 - y2;
  return Math.sqrt((_x * _x) + (_y * _y))
}

function changeDirection(e) {
  if (!isGameRunning) return

  if (!levelIntervalId) {
    levelIntervalId = setInterval(bumpLevel, levelInterval);
  }
  // gameContainer
  
  var relativeX = ((e.x - clickOffsetLeft)*canvas.width)/canvas.clientWidth;
  var relativeY = ((e.y - clickOffsetTop)*canvas.height)/canvas.clientHeight;

  var xDiff = relativeX - posX;
  var yDiff = relativeY - posY;

  var scaleFactor = distance(relativeX, relativeY, posX, posY);

  dx = xDiff / scaleFactor;
  dy = yDiff / scaleFactor;
}

function bumpLevel () {
  level++;
  document.getElementById("level").innerHTML = level + " LEVEL";
  
  ballSpeed = ballSpeed + ballSpeedIncrement;
}

function resetAndStart() {
  document.getElementById("popupSection").style.display = "none";
  
  ballSpeed = getBallSpeed();
  dx = 0;
  dy = 0;
  posX = canvas.width / 2;
  posY = canvas.height / 2;
  moveBall = true;
  isGameRunning = true;
  
  score = 0;
  document.getElementById("scoreboard").innerHTML = "SCORE " + score;
  
  level = 1;
  document.getElementById("level").innerHTML = level + " LEVEL";

  gameIntervalId = setInterval(draw, (1000/refreshRate));
}

canvas.onclick = changeDirection
document.getElementById("startButton").onclick = function () {
  resetAndStart()
}

if (navigator && navigator.share) {
  document.getElementById("shareButton").onclick = function () {
    navigator.share({
      text: "I grabbed " + (score > 0 ? score : "some") + " coins on Coin Man! Grab yours too at : https://coinman.com"
    })
  }
} else {
  document.getElementById("shareButton").style.display = "none";  
}

resetAndStart()
