// Simple Tetris game implemented in JavaScript

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
  null,
  'cyan',
  'blue',
  'orange',
  'yellow',
  'green',
  'purple',
  'red'
];

const SHAPES = [
  [],
  [[1, 1, 1, 1]], // I
  [[2, 0, 0], [2, 2, 2]], // J
  [[0, 0, 3], [3, 3, 3]], // L
  [[4, 4], [4, 4]], // O
  [[0, 5, 5], [5, 5, 0]], // S
  [[0, 6, 0], [6, 6, 6]], // T
  [[7, 7, 0], [0, 7, 7]]  // Z
];

class Piece {
  constructor(ctx) {
    this.ctx = ctx;
    this.spawn();
  }

  spawn() {
    const typeId = Math.floor(Math.random() * (COLORS.length - 1)) + 1;
    this.shape = SHAPES[typeId];
    this.color = COLORS[typeId];
    this.x = Math.floor((COLS - this.shape[0].length) / 2);
    this.y = -1;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    for (let row = 0; row < this.shape.length; row++) {
      for (let col = 0; col < this.shape[row].length; col++) {
        if (this.shape[row][col]) {
          this.ctx.fillRect((this.x + col) * BLOCK_SIZE,
                            (this.y + row) * BLOCK_SIZE,
                            BLOCK_SIZE,
                            BLOCK_SIZE);
        }
      }
    }
  }

  move(p) {
    this.x = p.x;
    this.y = p.y;
    this.shape = p.shape;
  }
}

class Board {
  constructor(ctx) {
    this.ctx = ctx;
    this.grid = this.getEmptyBoard();
    this.gameOver = false;
  }

  reset() {
    this.grid = this.getEmptyBoard();
    this.gameOver = false;
  }

  getEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  drop() {
    let p = moves['ArrowDown'](this.piece);
    if (this.valid(p)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clearLines();
      if (this.piece.y < 0) {
        this.gameOver = true;
      }
      this.piece = new Piece(this.ctx);
    }
  }

  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = y + this.piece.y;
          if (boardY >= 0) {
            this.grid[boardY][x + this.piece.x] = value;
          }
        }
      });
    });
  }

  clearLines() {
    let lines = 0;
    this.grid = this.grid.filter(row => {
      if (row.every(value => value > 0)) {
        lines++;
        return false;
      }
      return true;
    });
    while (this.grid.length < ROWS) {
      this.grid.unshift(Array(COLS).fill(0));
    }
  }

  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return value === 0 || (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y));
      });
    });
  }

  insideWalls(x) {
    return x >= 0 && x < COLS;
  }

  aboveFloor(y) {
    return y < ROWS;
  }

  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0;
  }

  drawBoard() {
    this.ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          this.ctx.fillStyle = COLORS[value];
          this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  }
}

const moves = {
  ArrowLeft: p => ({ ...p, x: p.x - 1 }),
  ArrowRight: p => ({ ...p, x: p.x + 1 }),
  ArrowDown: p => ({ ...p, y: p.y + 1 }),
  ArrowUp: p => rotate(p)
};

function rotate(p) {
  let m = p.shape.map((_, i) => p.shape.map(row => row[i])).reverse();
  return { ...p, shape: m };
}

const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.scale(1, 1);

let board = new Board(ctx);
board.piece = new Piece(ctx);
let dropInterval = null;
let lastTime = 0;

function play() {
  if (dropInterval) return;
  dropInterval = setInterval(() => {
    board.drop();
    if (board.gameOver) {
      clearInterval(dropInterval);
      alert('Game Over');
    }
    draw();
  }, 500);
}

function draw() {
  board.drawBoard();
  board.piece.draw();
}

document.addEventListener('keydown', event => {
  if (moves[event.key]) {
    let p = moves[event.key](board.piece);
    if (board.valid(p)) {
      board.piece.move(p);
      draw();
    }
  }
});

play();
