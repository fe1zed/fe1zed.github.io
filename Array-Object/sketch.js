let terrain = [];
const numberOfRects = 25;

let character = {
  height: 100,
  width: 50,
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

function setup() {
  createCanvas(windowWidth, windowHeight);
  let widthOfRects = width / numberOfRects;
  generateTerrain(widthOfRects, 0); // Generating the initial terrain
  character.y = 0; // Set character on the ground
}

function draw() {
  background(220);
  noStroke();

  // Camera follows the player
  let cameraEdgeOffset = 200; // Proximity zone to the edges of the screen

  // Shift the camera left or right when the player approaches the edges of the screen
  if (character.x - cameraOffset > width - cameraEdgeOffset) {
    cameraOffset += character.speed;
  } else if (character.x - cameraOffset < cameraEdgeOffset && cameraOffset > 0) {
    cameraOffset -= character.speed;
  }

  // Terrain generation as you approach the right edge of the screen
  let widthOfRects = width / numberOfRects;
  if (terrain[terrain.length - 1].x < cameraOffset + width) {
    generateTerrain(widthOfRects, terrain[terrain.length - 1].x + widthOfRects);
  }

  // Terrain rendering taking into account camera displacement
  for (let someRect of terrain) {
    fill("green");
    rect(someRect.x - cameraOffset, someRect.y, someRect.w, someRect.h);
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

function generateTerrain(widthOfRect, startX) {
  let time = startX / width; // For Perlin noise consistency
  let deltaTime = 0.15;
  let heightStep = character.height / 2; // Height step - half the character's height

  for (let x = startX; x < startX + width; x += widthOfRect) {
    let newHeight = noise(time) * height;

    // Round the height to the nearest multiple of half the character's height
    newHeight = Math.round(newHeight / heightStep) * heightStep;

    // Limit the height within the screen
    newHeight = constrain(newHeight, 0, height);

    let someRect = spawnRetangle(x, widthOfRect, newHeight);
    terrain.push(someRect);

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
    //console.log("Jumping!");
    character.velocityY = character.jumpHeight; // Start jump
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
  //character.onGround = character.y + character.height >= height - 1;
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
