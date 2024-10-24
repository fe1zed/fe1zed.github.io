// Grid Demo
// Dmitrii Pletminsev
// 10/22/2024
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// let grid = [[1, 0, 0, 1], // eslint-disable-next-line indent
//             [0, 1, 1, 0], // eslint-disable-next-line indent
//             [1, 1, 1, 0], // eslint-disable-next-line indent
//             [0, 1, 1, 1]];

let grid;
let cellSize;
const GRID_SIZE = 10;
let shouldToggleNeighbours = false;

function setup() {
  if (windowWidth < windowHeight) {
    createCanvas(windowWidth, windowWidth);
  }
  else {
    createCanvas(windowHeight, windowHeight);
  }
  cellSize = height / GRID_SIZE;
  grid = generateRandomGrid(GRID_SIZE, GRID_SIZE);

  noStroke();
}

function draw() {
  background(220);
  displayGrid();
}

function keyPressed() {
  if (key === "r") {
    grid = generateRandomGrid(GRID_SIZE, GRID_SIZE);
  }
  if (key === "e") {
    grid = generateEmptyGrid(GRID_SIZE, GRID_SIZE);
  }
  if (key === "n") {
    shouldToggleNeighbours = !shouldToggleNeighbours;
  }
  if (key === "space") {
    grid = updateGrid();
  }
}


function displayGrid() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      fill(grid[y][x] === 1? "black": "white");
      square(x * cellSize, y * cellSize, cellSize);
    }
  }
}


function generateRandomGrid(cols, rows) {
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      //make it a 1 half the time, a 0 half the time
      if (random(100) < 50) {
        newGrid[y].push(1);
      }
      else {
        newGrid[y].push(0);
      }
    }
  }
  return newGrid;
}

function generateEmptyGrid(cols, rows) {
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      newGrid[y].push(0);
    }
  }
  return newGrid;
}

function mousePressed() {
  let x = Math.floor(mouseX / cellSize);
  let y = Math.floor(mouseY / cellSize);

  toggleCell(x, y);
  if (shouldToggleNeighbours) {
    toggleCell(x - 1, y);
    toggleCell(x, y + 1);
    toggleCell(x + 1, y);
    toggleCell(x, y - 1);
  }
}

function toggleCell(_x, _y) {
  if (_x >= 0 && _x <= GRID_SIZE && _y >= 0 && _y < GRID_SIZE) {
    grid[_y][_x] = grid[_y][_x] === 1? 0: 1;
  }
}

function windowResized() {
  if (windowWidth < windowHeight) {
    resizeCanvas(windowWidth, windowWidth);
  }
  else {
    resizeCanvas(windowHeight, windowHeight);
  }
  cellSize = height / GRID_SIZE;
}

function updateGrid() {
  // Make another array to hold next turn
  let nextTurn = generateEmptyGrid(GRID_SIZE, GRID_SIZE);

  // Look at every cell
  for (let y = 0; y < GRID_SIZE; y ++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let theNeighbours = 0;

      // look at every neighbour around
      for (let i = -1; i <= 1; i++) {
        for (let j = 1; j <= 1; j++) {
          if (x + i >= 0 && x + i <= cellSize && y + 1 >= 0 && y + i <= cellSize) {
            theNeighbours += grid[y + i][x+j];
          }
        }
      }
    }
  }

  theNeighbours = grid[y][x];

  if (grid[y][x] === 1) {
    if (theNeighbours === 2 || theNeighbours === 3) {
      theNeighbours[y][x] = 1;
    }
  }
}