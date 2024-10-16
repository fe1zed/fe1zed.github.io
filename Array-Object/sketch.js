let terrain = [];
let trees = [];

const numberOfRects = 25;

let character = {
  width: 50,
  height: 100,
  speed: 5,
  jumpSpeed: 15,
  x: 0,
  y: 0,
  gravity: 0.8,
  velocityY: 0,
  isJumping: false,
  onGround: false,
  jumpHeight: -15,
};

let cameraOffset = 0; // Camera X offset

let distanceBetweenTrees = 1; // Min distance between trees
let currentDistanceBetweenTrees = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  let widthOfRects = width / numberOfRects;
  generateTerrain(widthOfRects, 0); // Generating the initial terrain
  character.x = width / 2; // Ste character in the center of screen
  character.y = 0; // Set character on the ground
}

function draw() {
  background(37, 225, 235); // blue
  noStroke();

  // Camera follows the player
  let cameraEdgeOffset = 200; // Proximity zone to the edges of the screen

  // Shift the camera with speed of player to left or right when the player approaches the edges of the screen
  if (character.x - cameraOffset > width - cameraEdgeOffset) {
    cameraOffset += character.speed;
  }
  else if (character.x - cameraOffset < cameraEdgeOffset) {
    cameraOffset -= character.speed;
  }

  // Terrain generation as you approach the right edge of the screen
  let widthOfRects = width / numberOfRects;
  if (terrain[terrain.length - 1].x < cameraOffset + width) {
    generateTerrain(widthOfRects, terrain[terrain.length - 1].x + widthOfRects);
  }

  // Terrain generation as you approach the left edge of the screen
  if (terrain[0].x > cameraOffset - width) { // Проверка для левой стороны
    generateTerrain(widthOfRects, terrain[0].x - widthOfRects, true); // Генерация влево
  }

  // Terrain rendering taking into account camera displacement
  for (let someRect of terrain) {
    fill(someRect.color.r, someRect.color.g, someRect.color.b); // green
    rect(someRect.x - cameraOffset, someRect.y, someRect.w, someRect.h);
  }
  // Tree rendering taking into account camera displacement
  for (let tree of trees) {
    // drawing tree trunck
    fill("brown");
    rect(tree.x - cameraOffset, tree.y, tree.width, -tree.height);

    //drwaing tree leaves
    fill(36, 170, 33);
    rect(tree.x - cameraOffset - tree.width, tree.y - tree.height, tree.width * 3, -tree.height / 3 - 1); // top leave
    rect(tree.x - cameraOffset - tree.width, tree.y - tree.height / 3 * 4, tree.width * 3, -tree.height / 3 - 1); // top leave 2
    rect(tree.x - cameraOffset, tree.y - tree.height / 3 * 5, tree.width, -tree.height / 3);
  }

  // Character rendering taking into account camera offset
  fill("red");
  showCharacter();

  // Handling motion, gravity and collisions
  isOnGround();
  applyGravity();
  moveCharacter();

  // Terrain Collision Checking
  checkCollision();

  // --------------------------------------- Debug ---------------------------------------  [DELETE ON FINAL BUILD]
  fill("black");

  textSize(20);
  text("Coordinates", 10, 25);

  textSize(16);
  text(`X: ${character.x}`, 10, 50);
  text(`Y: ${character.y}`, 10, 75);

  textSize(20);
  text("Physics", 10, 100);

  textSize(16);
  text(`On ground: ${character.onGround}`, 10, 125);
  text(`Is iumping: ${character.isJumping}`, 10, 150);
}

function spawnRetangle(leftSide, rectWidth, rectHeight) {
  let theRect = {
    x: leftSide,
    y: height - rectHeight,
    w: rectWidth,
    h: rectHeight,
  };
  return theRect;
}

function generateTerrain(widthOfRect, startX, reverse = false) {
  let time = startX / width; // For Perlin noise consistency
  let deltaTime = 0.15;
  let heightStep = character.height / 2; // Height step - half the character's height

  // If reverse, generate in negative X direction
  let direction = reverse ? -1 : 1;

  for (let x = startX; reverse ? x > startX - width : x < startX + width; x += direction * widthOfRect) {
    let newHeight = noise(time) * height;

    // Round the height to the nearest multiple of half the character's height
    newHeight = Math.round(newHeight / heightStep) * heightStep;

    // Limit the height within the screen
    newHeight = constrain(newHeight, 0, height);

    let someRect = spawnRetangle(x, widthOfRect, newHeight); // Increment by 1 so there is no white line between rects
    
    let minSandHeight = 300;

    someRect.color = {
      r: someRect.h > minSandHeight? 133: 247,
      g: someRect.h > minSandHeight? 235: 233,
      b: someRect.h > minSandHeight? 37: 118,
    };

    // Insert terrain block either at the end (right) or beginning (left)
    if (reverse) {
      terrain.unshift(someRect); // For left-side generation // array.unshift(...); is an array method in JavaScript that adds one or more elements to the beginning of an array and returns the new length of the array.
    }
    else {
      terrain.push(someRect); // For right-side generation
    }
    currentDistanceBetweenTrees -= 1;

    if (currentDistanceBetweenTrees < 0 && someRect.h > minSandHeight) { // Reducing spawn of tree on sand
      let treeSpawnChance = random(0, 100);

      if(treeSpawnChance < 20) {
        let someTree = spawnTree(someRect);
        trees.push(someTree);

        currentDistanceBetweenTrees = distanceBetweenTrees;
      }
    }

    time += deltaTime;
  }
}

function showCharacter() {
  rect(character.x - cameraOffset, character.y, character.width, character.height);
}

function moveCharacter() {
  // Moving left and right
  if (keyIsDown(RIGHT_ARROW)) {
    character.x += character.speed;
  }
  if (keyIsDown(LEFT_ARROW)) {
    character.x -= character.speed;
  }

  // Jumping
  if (character.onGround && !character.isJumping && keyIsDown(32)) { // Space key
    character.velocityY = character.jumpHeight;
    character.isJumping = true;
  }
}

function applyGravity() {
  character.y += character.velocityY;
  character.velocityY += character.gravity; // Gravity pulls down

  if (character.y + character.height > height) { // Keep on the ground
    character.y = height - character.height;
    character.velocityY = 0;
  }
}

function isOnGround() {
  if (character.onGround) {
    character.isJumping = false; // Reset jump when on the ground
  }
}

function checkCollision() {
  character.onGround = false; // Suppose that player already on ground

  for (let someRect of terrain) {
    // Check if character collides with the terrain rectangle
    if (// eslint-disable-next-line indent
        character.x < someRect.x + someRect.w && // Right side of character
        character.x + character.width > someRect.x && // Left side of character
        character.y + character.height > someRect.y && // Bottom side of character
        character.y < someRect.y + someRect.h // Top side of character
    ) {
      // Collision detected, place character on top of the terrain
      character.y = someRect.y - character.height;
      character.velocityY = 0;
      character.onGround = true;
      break; // No need to check other terrain if collision is detected
    }
  }
}

function spawnTree(rectangleOn) {
  let someTree = {
    x: rectangleOn.x,
    y: rectangleOn.y,
    width: rectangleOn.w,
    height: rectangleOn.w * 3,
  };

  // console.log(`Spawning some tree on x: ${someTree.x}, y: ${someTree.y}, with w: ${someTree.width}, h: ${someTree.height}`);
  
  return someTree;
}