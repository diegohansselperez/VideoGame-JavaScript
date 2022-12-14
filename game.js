const canvas = document.querySelector(`#game`);
const game = canvas.getContext(`2d`);
const btnUp = document.querySelector(`#up`);
const btnDown = document.querySelector(`#down`);
const btnRight = document.querySelector(`#right`);
const btnLeft = document.querySelector(`#left`);
const btnStop = document.querySelector(`#stopTime`);
const spanLives = document.querySelector(`#lives`);
const spanTime = document.querySelector(`#time`);
const spanRecord = document.querySelector(`#record`);
const pResult = document.querySelector(`#result`);

let canvasSize;
let elementSize;

let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;

const playerPosition = {
  x: undefined,
  y: undefined,
};

const giftPosition = {
  x: undefined,
  y: undefined,
};

let enemyPositions = [];

window.addEventListener(`load`, setCanvasSize);
window.addEventListener(`resize`, setCanvasSize);

// game.font = `25px Verdana`;
// game.fillStyle = `purple`;
// game.textAlign = `start`;
//game.clearRect(0, 0, 0, 0);
//game.fillRect(0, 0, 0, 0);
// game.fillText(`Puto`, 25, 25);

function setCanvasSize() {
  
  if (window.innerHeight > window.innerWidth) {
    canvasSize = window.innerWidth * 0.7;
  } else {
    canvasSize = window.innerHeight * 0.7;
  }

  canvasSize = Number(canvasSize.toFixed(0));

  canvas.setAttribute("width", canvasSize);
  canvas.setAttribute("height", canvasSize);

  elementSize = Number((canvasSize / 10 + -0.9).toFixed(0));

  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}

function startGame() {
  game.font = elementSize + "px Verdana";
  game.textAlign = "end";

  const mapsArr = maps[level];

  if (!mapsArr) {
    levelWinAndRecord();
    return;
  }

  if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
    showRecord();
  }
  const mapRows = mapsArr.trim().split(`\n`);
  const mapRowCol = mapRows.map((row) => row.trim().split(""));

  showLives();

  enemyPositions = [];

  game.clearRect(0, 0, canvasSize, canvasSize);

  mapRowCol.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      const emoji = emojis[col];
      const posY = elementSize * (rowI + 1);
      const posX = elementSize * (colI + 1);
      game.fillText(emoji, posX, posY);
      if (col === `O`) {
        if (!playerPosition.x && !playerPosition.y) {
          playerPosition.x = posX;
          playerPosition.y = posY;
          console.log({ playerPosition });
        } 
      } else if (col === `I`) {
        giftPosition.x = posX;
        giftPosition.y = posY;
      } else if (col === `X`) {
        enemyPositions.push({
          x: posX,
          y: posY,
        });
      }
    });
  });
  //console.log({mapsArr,mapRowCol});
  movePlayer();
}

function movePlayer() {

  //si la posicion del jugador es igual a la posicion del regalo nos imprimira que pasamos a otro nivel.
  const giftCollisionX =
    playerPosition.x.toFixed(3) === giftPosition.x.toFixed(3);
  const giftCollisionY =
    playerPosition.y.toFixed(3) === giftPosition.y.toFixed(3);
  const giftCollision = giftCollisionX && giftCollisionY;
  //esto nos imprime
  if (giftCollision) {
    levelWin();
  }
  //si la posicion del jugador es igual a la posicion de la bomba(enemyPositions) nos va arrogar un console log de que chocamos con una bomba.
  const enemyCollision = enemyPositions.find((enemy) => {
    const enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3);
    const enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3);
    return enemyCollisionX && enemyCollisionY;
  });
  //si chocamos nos mandara a la funcion levelFail
  if (enemyCollision) {
    levelFail();
  }

  game.fillText(emojis[`PLAYER`], playerPosition.x, playerPosition.y);
}

function levelWin() {
  console.log(`subiste de nivel`);
  level++;
  startGame();
}

function levelFail() {
  console.log(`Chocaste con una Bomba`);
  lives--; // se encarga de restarle vidas
  console.log(lives);
  // esta condicional se encarga de reducir nuestra cantidad de vidas cada vez que perdemos(son 3 vidas) cuando el contados de lives llegue a 0 nos recargara hasta el nivel 0, osea que perdimos.
  if (lives <= 0) {
    level = 0;
    console.log(`Perdiste, inicias de nuevo`);
    lives = 3; // el contador de vidas sera receteado al perder y empezar de nuevo.
    timeStart = undefined;
  }
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}

function levelWinAndRecord() {
  console.log(`Terminaste el juego`);
  clearInterval(timeInterval);

  const playerTime = Date.now() - timeStart;
  const recordTime = localStorage.getItem(`Record_Time`);
  
if(recordTime){
    if(recordTime >= playerTime) {
        localStorage.setItem(`Record_Time`, playerTime);
        pResult.innerHTML = `TIENES UN NUEVO RECORD`;
    } else {
      pResult.innerHTML = `No superaste el record, vuelva a intentarlo`;
    }
  } else {
    localStorage.setItem(`Record_Time`, playerTime);
  }

  console.log({recordTime, playerTime});
}

function showLives() {
  //esta solucion es lo mismo que arriba pero mas limpia
  spanLives.innerHTML = emojis["HEART"].repeat(lives);

  /*creo un array apartir del objeto lives con 3 vidas y les dimos su respectivo emoji.
    const heartsArray = Array(lives).fill(emojis['HEART']);
    sijrve para que cada vez que se mueva la calaberita no se rendericen mas corazones cada que avanze una casilla.
    spanLives.innerHTML = "";
        recorremos el array para que muestra los corazones por separado.
    heartsArray.forEach(heart => {spanLives.append(heart)});*/
}

function showTime() {
  spanTime.innerHTML = Date.now() - timeStart;
}

function showRecord() {
  spanRecord.innerHTML = localStorage.getItem(`Record_Time`);
}
  

  

window.addEventListener(`keydown`, moveByKeys);
btnStop.addEventListener(`click`, stopTime);
btnUp.addEventListener(`click`, moveUp);
btnDown.addEventListener(`click`, moveDown);
btnRight.addEventListener(`click`, moveRight);
btnLeft.addEventListener(`click`, moveLeft);

function moveByKeys(event) {
  if (event.key === `ArrowUp`) {
    moveUp();
  } else if (event.key === `ArrowDown`) {
    moveDown();
  } else if (event.key === `ArrowLeft`) {
    moveLeft();
  } else if (event.key === `ArrowRight`) {
    moveRight();
  } else if (event.key === `a` || `A`) {
    stopTime();
  }
}

function moveUp() {
  console.log(`moverme hacia arriba`);
  if (playerPosition.y < elementSize + 1) {
    console.log("out up");
  } else {
    playerPosition.y -= elementSize;
    startGame();
  }
}
function moveDown() {
  console.log(`moverme hacia abajo`);
  if (playerPosition.y > (elementSize + 1) * 9) {
    console.log(`out down`);
  } else {
    playerPosition.y += elementSize;
    startGame();
  }
}
function moveLeft() {
  console.log(`moverme hacia la izquierda`);
  if (playerPosition.x < (elementSize + 10) * 1) {
    console.log(`out left`);
  } else {
    playerPosition.x -= elementSize;
    startGame();
  }
}
function moveRight() {
  console.log(`moverme hacia la derecha`);
  if (playerPosition.x > (elementSize + 1) * 9) {
    console.log(`out right`);
  } else {
    playerPosition.x += elementSize;
    startGame();
  }
}
function stopTime() {
    console.log(`DETENER TIEMPO`);
    clearInterval(timeInterval);
}

/*// for (let x = 1; x <= 10; x++) {
    //     for(let y = 1; y <= 10; y++){
    //         game.fillText(emojis[mapRowCol[x-1][y-1]], elementSize * y, elementSize * x)
    //             }
    // }*/
