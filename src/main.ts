import kontra, { Sprite } from "kontra";

let { init, GameLoop, onKey, initKeys } = kontra;

type Pos = [number, number];

const canvasElem = document.getElementById("app") as HTMLCanvasElement;
canvasElem.width = 800;
canvasElem.height = 800;
const boardBoarder = [800, 800];

const cells: Sprite[] = [];
let headDirection: number = 1; // 0up 1right 2bottom 3left
let isDirectionChangeConsumed = true;
let updateCnt = 0;

let speed = 0.5;

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
      nextPos[1] -= 10;
      break;
    case 1:
      nextPos[0] += 10;
      break;
    case 2:
      nextPos[1] += 10;
      break;
    case 3:
      nextPos[0] -= 10;
      break;
    default:
      break;
  }
  if (nextPos[0] > boardBoarder[0]) {
    nextPos[0] = 0;
  } else if (nextPos[0] < 0) {
    nextPos[0] = boardBoarder[0];
  }

  if (nextPos[1] > boardBoarder[1]) {
    nextPos[1] = 0;
  } else if (nextPos[1] < 0) {
    nextPos[1] = boardBoarder[1];
  }

  return nextPos;
}

onKey("g", () => {
  grow();
});

onKey("a", () => {
  if (
    headDirection === 3 ||
    headDirection === 1 ||
    !isDirectionChangeConsumed
  ) {
    return;
  }
  headDirection = 3;
  isDirectionChangeConsumed = false;
});

onKey("d", () => {
  if (
    headDirection === 3 ||
    headDirection === 1 ||
    !isDirectionChangeConsumed
  ) {
    return;
  }
  headDirection = 1;
  isDirectionChangeConsumed = false;
});

onKey("w", () => {
  if (
    headDirection === 0 ||
    headDirection === 2 ||
    !isDirectionChangeConsumed
  ) {
    return;
  }
  headDirection = 0;
  isDirectionChangeConsumed = false;
});

onKey("s", () => {
  if (
    headDirection === 0 ||
    headDirection === 2 ||
    !isDirectionChangeConsumed
  ) {
    return;
  }
  headDirection = 2;
  isDirectionChangeConsumed = false;
});

function move() {
  const nextPos = genNextPos();

  const tail = cells.pop()!;
  tail.x = nextPos[0];
  tail.y = nextPos[1];

  cells.unshift(tail);
  isDirectionChangeConsumed = true;
}

function update(dt: number) {
  updateCnt += dt;
  if (updateCnt < speed) {
    return;
  }
  updateCnt = 0;

  move();
}

init(canvasElem);
initKeys();

for (let i = 0; i < 3; i++) {
  grow([0, 0]);
}

let loop = GameLoop({
  update: function (dt) {
    cells.forEach((cell) => {
      cell.update();
    });

    update(dt);
  },
  render: function () {
    cells.forEach((cell) => {
      cell.render();
    });
  },
});

loop.start(); // start the game
