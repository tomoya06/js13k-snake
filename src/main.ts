import {
  Sprite,
  init,
  GameLoop,
  onKey,
  initKeys,
  onInput,
  initInput,
} from "kontra";
import { genRandomPos, Pos } from "./util";

const canvasElem = document.getElementById("game") as HTMLCanvasElement;
const boardSize: Pos = [20, 20];
canvasElem.width = boardSize[0] * 10;
canvasElem.height = boardSize[1] * 10;
const boardBoarder = [boardSize[0] * 10, boardSize[1] * 10];

// 这一行要放在最上层
init(canvasElem);
initKeys();
initInput();

const cells: Sprite[] = [];
let headDirection: number = 1; // 0up 1right 2bottom 3left
let isDirectionChangeConsumed = true;
let updateCnt = 0;

let speed = 0.1;
let moveSpeed = 10;

const appleSprite = Sprite({
  x: 0,
  y: 0,
  color: "green",
  width: 10,
  height: 10,
});

function updateScore() {
  const text = `
  SCORE: ${cells.length}
  SPEED: ${Math.floor(10 / speed)}
  `;
  document.getElementById("score")!.innerText = text;
}

function grow(dpos?: Pos) {
  let pos: Pos;
  if (dpos) {
    pos = dpos;
  } else {
    pos = genNextPos();
  }

  const newCell = Sprite({
    x: pos[0],
    y: pos[1],
    color: "red",
    width: 10,
    height: 10,
  });
  cells.unshift(newCell);
}

function genNextPos(): Pos {
  const nextPos: Pos = [cells[0].x, cells[0].y];
  switch (headDirection) {
    case 0:
      nextPos[1] -= moveSpeed;
      break;
    case 1:
      nextPos[0] += moveSpeed;
      break;
    case 2:
      nextPos[1] += moveSpeed;
      break;
    case 3:
      nextPos[0] -= moveSpeed;
      break;
    default:
      break;
  }
  if (nextPos[0] > boardBoarder[0] - 10) {
    nextPos[0] = 0;
  } else if (nextPos[0] < 0) {
    nextPos[0] = boardBoarder[0] - 10;
  }

  if (nextPos[1] > boardBoarder[1] - 10) {
    nextPos[1] = 0;
  } else if (nextPos[1] < 0) {
    nextPos[1] = boardBoarder[1] - 10;
  }

  return nextPos;
}

function handleLeft() {
  if (
    headDirection === 3 ||
    headDirection === 1 ||
    !isDirectionChangeConsumed
  ) {
    return;
  }
  headDirection = 3;
  isDirectionChangeConsumed = false;
}

function handleRight() {
  if (
    headDirection === 3 ||
    headDirection === 1 ||
    !isDirectionChangeConsumed
  ) {
    return;
  }
  headDirection = 1;
  isDirectionChangeConsumed = false;
}

function handleUp() {
  if (
    headDirection === 0 ||
    headDirection === 2 ||
    !isDirectionChangeConsumed
  ) {
    return;
  }
  headDirection = 0;
  isDirectionChangeConsumed = false;
}

function handleDown() {
  if (
    headDirection === 0 ||
    headDirection === 2 ||
    !isDirectionChangeConsumed
  ) {
    return;
  }
  headDirection = 2;
  isDirectionChangeConsumed = false;
}

function speedUp() {
  speed = Math.max(0.02, speed - 0.02);

  updateScore();
}

function speedDown() {
  speed = Math.min(0.18, speed + 0.02);

  updateScore();
}

onKey("g", () => {
  grow();
});
onInput(["a", "swipeleft"], handleLeft);
onInput(["d", "swiperight"], handleRight);
onInput(["w", "swipeup"], handleUp);
onInput(["s", "swipedown"], handleDown);
document.getElementById("btn-up")!.onclick = handleUp;
document.getElementById("btn-left")!.onclick = handleLeft;
document.getElementById("btn-right")!.onclick = handleRight;
document.getElementById("btn-down")!.onclick = handleDown;
document.getElementById("btn-speedup")!.onclick = speedUp;
document.getElementById("btn-speeddown")!.onclick = speedDown;

(
  [].slice.call(document.getElementsByTagName("button")) as HTMLButtonElement[]
).forEach((elem) =>
  elem.addEventListener("click", (e) => {
    e.preventDefault();
  })
);

function move() {
  const nextPos = genNextPos();

  if (nextPos[0] === appleSprite.x && nextPos[1] === appleSprite.y) {
    grow();
    genApple();
  }

  const tail = cells.pop()!;
  tail.x = nextPos[0];
  tail.y = nextPos[1];

  cells.unshift(tail);
  isDirectionChangeConsumed = true;
}

function updateSnakeColor() {
  let headPos = "";
  const visited = new Set([""]);
  for (let idx = 0; idx <= cells.length - 1; idx++) {
    const cell = cells[idx];
    const myPos = `${cell.x},${cell.y}`;
    if (idx === 0 || myPos === headPos) {
      cell.color = "#ff7d7d";
      headPos = myPos;
      continue;
    }
    if (visited.has(myPos)) {
      cell.color = "#a10000";
    } else {
      cell.color = "red";
    }
    visited.add(myPos);
  }
}

function updateSnake(dt: number) {
  updateCnt += dt;
  if (updateCnt < speed) {
    return;
  }
  updateCnt = 0;

  move();
  updateSnakeColor();
}

function pickEmptyPos(): Pos {
  const cellPosKeys = new Set(
    cells.map((cell) => {
      return `${Math.floor(cell.x / 10)},${Math.floor(cell.y / 10)}`;
    })
  );

  if (cellPosKeys.size === boardSize[0] * boardSize[1]) {
    loop.stop();
    alert("Sorry but you must stop now");
    return [0, 0];
  }

  while (true) {
    const newPos = genRandomPos(boardSize[0], boardSize[1]);
    if (cellPosKeys.has(`${newPos[0]},${newPos[1]}`)) {
      continue;
    }

    return [newPos[0] * 10, newPos[1] * 10];
  }
}

function genApple() {
  const newPos = pickEmptyPos();
  appleSprite.x = newPos[0];
  appleSprite.y = newPos[1];

  updateScore();
}

for (let i = 0; i < 3; i++) {
  grow([0, 0]);
}
genApple();

let loop = GameLoop({
  update: function (dt) {
    cells.forEach((cell) => {
      cell.update();
    });
    appleSprite.update();

    updateSnake(dt);
  },
  render: function () {
    cells.forEach((cell) => {
      cell.render();
    });
    appleSprite.render();
  },
});

loop.start(); // start the game
