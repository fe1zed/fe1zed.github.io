/*
Array and object notation
Dmitrii Pletmintsev
10/8/2024 - 10/22/2024

About:
-> In this project, I tried to implement the basic features of a 2D platformer, such as terrain generation, character movement,
day and night cycles, and the ability for the player to swim.
The most difficult thing was to remove the “auto-jump” due to the logic of the player’s collision with the terrain, 
but in the end this was achieved, sacrificing the optimization of the game (this is still the initial version, but I’m sure
that if I had more time, I could make an optimized version).


Extra for Experts:
  -> Used nested object notation (this was not mentioned in the lessons, but it's possible to do this).
  -> Defined a function inside object notation (this also wasn't mentioned in the lessons, but it can be done).
  (However, it's better to use classes since nobody really does it this way anymore, but because the assignment was about object notation, I decided to use it).
  -> Implemented sound usage.
  -> Calculated physics for the player.
  -> Calculated player movement, preventing them from climbing terrain higher than their own height.
  -> Calculated terrain generation based on the player's movement.
  -> Made the "camera" follow the player’s movement.
*/

let terrain = [];
let trees = [];
let stars = [];

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
  defaultSpeed: 5,
  waterSpeed: 2.5,
  isSwimming: false,
};

let cameraOffset = 0; // Camera X offset

let distanceBetweenTrees = 1; // Min distance between trees
let currentDistanceBetweenTrees = 0;

let cycle = {
  timeOfDay: 0, // Range: 0 to 24 (0 is midnight, 12 is noon)
  speed: 0.01, // The speed at which the time of day changes
  colors: {
    day: {
      r: 135,
      g: 206,
      b: 235, // Light blue for day
    },
    night: {
      r: 0,
      g: 0,
      b: 50, // Dark blue for night
    },
  },
  currentColor: {
    r: 0,
    g: 0,
    b: 0, // Will be updated based on time of day
  },
  updateCycle: function () {
    // Increment the time of day
    this.timeOfDay += this.speed;
    if (this.timeOfDay >= 24) {
      this.timeOfDay = 0; // Reset after a full day
    }

    // Calculate the current color based on time of day
    let dayRatio = abs(12 - this.timeOfDay) / 12; // Ratio of how close we are to noon or midnight
    this.currentColor.r = lerp(this.colors.night.r, this.colors.day.r, dayRatio);
    this.currentColor.g = lerp(this.colors.night.g, this.colors.day.g, dayRatio);
    this.currentColor.b = lerp(this.colors.night.b, this.colors.day.b, dayRatio);
  },
};

let maxWaterHeight = 200;

let jumpSound;
let backgroundMusic;

let ableToMoveRight = false;
let ableToMoveLeft = false;

// --------------------------------------- PRELOAD ---------------------------------------

function preload() {
  // Load sounds
  jumpSound = loadSound('jumpSound.mp3'); // jumping sound
  backgroundMusic = loadSound('background.mp3'); // Background music
}

// --------------------------------------- SETUP ---------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Playing background music in a music loop
  backgroundMusic.loop();

  let widthOfRects = width / numberOfRects;
  generateTerrain(widthOfRects, 0); // Generating the initial terrain
  generateStars(20); // Generating the X amount of stars across the screen
  character.x = width / 2; // Ste character in the center of screen
  character.y = 0; // Set character on the ground
  // Adjusting the W and H of player within the screen size;
  character.width = width / 35;
  character.height = height / 8;
}

function draw() {
  // Smooth transition based on time of
  cycle.updateCycle();
  background(cycle.currentColor.r, cycle.currentColor.g, cycle.currentColor.b);
  noStroke();

  // Showing stars
  if (cycle.timeOfDay > 6 && cycle.timeOfDay < 18) {
    fill("white");
    for (let theStar of stars) {
      rect(theStar.x, theStar.y, theStar.size, theStar.size);
    }
  }

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
  if (terrain[0].x > cameraOffset - width) {
    generateTerrain(widthOfRects, terrain[0].x - widthOfRects, true);
  }

  // Terrain rendering taking into account camera displacement
  for (let someRect of terrain) {
    fill(someRect.color.r, someRect.color.g, someRect.color.b);
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
  text(`Is jumping: ${character.isJumping}`, 10, 150);
  text(`Is swimming: ${character.isSwimming}`, 10, 175);

  textSize(20);
  text("Time", 10, 200);

  textSize(16);
  text(`Current time: ${cycle.timeOfDay}`, 10, 225);
}

// --------------------------------------- MAIN ---------------------------------------

function spawnRectangle(leftSide, rectWidth, rectHeight) {
  return {
    x: leftSide,
    y: height - rectHeight,
    w: rectWidth,
    h: rectHeight,
  };
}

function generateTerrain(widthOfRect, startX, reverse = false) {
  let time = startX / width; // For Perlin noise consistency
  let deltaTime = 0.12;
  let heightStep = character.height / 2; // Height step - half the character's height

  // Assigning color based on position to ground
  let maxSandHeight = 300;

  // If reverse, generate in negative X direction
  let direction = reverse ? -1 : 1;

  for (let x = startX; reverse ? x > startX - width : x < startX + width; x += direction * widthOfRect) {
    let newHeight = noise(time) * height;

    // Round the height to the nearest multiple of half the character's height
    newHeight = Math.round(newHeight / heightStep) * heightStep;

    // Limit the height within the screen, min height is maxWaterHeight(200)
    newHeight = constrain(newHeight, maxWaterHeight, height);

    let someRect = spawnRectangle(x, widthOfRect, newHeight); // Increase widthOfRects by 1 so there is no white line between 

    someRect.color = {
      r: someRect.h > maxSandHeight? 133: someRect.h <= maxWaterHeight? 28: 247,
      g: someRect.h > maxSandHeight? 235: someRect.h <= maxWaterHeight? 174: 233,
      b: someRect.h > maxSandHeight? 37: someRect.h <= maxWaterHeight? 182: 118,
    };

    // Insert terrain block either at the end (right) or beginning (left)
    if (reverse) {
      terrain.unshift(someRect); // For left-side generation // array.unshift(...); is an array method in JavaScript that adds one or more elements to the beginning of an array and returns the new length of the array.
    }
    else {
      terrain.push(someRect); // For right-side generation
    }
    currentDistanceBetweenTrees -= 1;

    if (currentDistanceBetweenTrees < 0 && someRect.h > maxSandHeight) { // Reducing spawn of tree on sand and water
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
  for (let i = 0; i < terrain.length; i++) {
    let someRect = terrain[i];

    // getting the rect on which player stands
    if (// eslint-disable-next-line indent
        character.x < someRect.x + someRect.w && // Right side of the character
        character.x + character.width > someRect.x && // Left side of the character
        character.y + character.height > someRect.y && // Bottom side of the character
        character.y < someRect.y + someRect.h // Top side of character
    ) {
      let leftRect = terrain[i - 1];
      let rightRect = terrain[i + 1];
      

      if (character.y <= leftRect.y) {
        console.log("Left rect is lower then player");
        ableToMoveLeft = true;
      }
      else {
        console.log("Left rect is higher then player");
        ableToMoveLeft = character.x - character.speed >= leftRect.x + leftRect.w;
      }

      if (character.y <= rightRect.y) {
        console.log("Right rect is lower then player");
        ableToMoveRight = true;
      }
      else {
        console.log("Right rect is higher then player");
        ableToMoveRight = character.x + character.speed + character.width <= rightRect.x;
      }
      //ableToMoveRight = character.x + character.speed <= rightRect.x;// && character.y <= rightRect.y;
      //ableToMoveLeft = character.y <= leftRect.y? true: character.x - character.speed >= leftRect.x + leftRect.w;
      break;
    }
    else {
      ableToMoveLeft = !character.onGround;
      ableToMoveRight = !character.onGround;
    }
  }

  if (character.y >= height - 200) {
    ableToMoveLeft = true;
    ableToMoveRight = true;
  }

  if (keyIsDown(RIGHT_ARROW) && ableToMoveRight) {
    character.x += character.speed;
  }
  if (keyIsDown(LEFT_ARROW) && ableToMoveLeft) {
    character.x -= character.speed;
  }

  // Jumping
  if (character.onGround && !character.isJumping && keyIsDown(32)) { // Space key
    character.velocityY = character.jumpHeight;
    character.isJumping = true;

    // Play jump sound
    jumpSound.play();
  }
  // Swimming 
  else if (character.y + character.height >= height - maxWaterHeight + character.height / 2) {
    if (keyIsDown(32)) {
      character.isSwimming = true;
      character.velocityY -= character.waterSpeed; // Apply upward force while holding space
    } 
    else {
      character.isSwimming = false; // Stop swimming when space is released
    }
  }
}

function applyGravity() {
  // Check if the character is swimming
  if (!character.isSwimming) {
    character.y += character.velocityY;
    character.velocityY += character.gravity; // Apply normal gravity

    if (character.y + character.height > height) { // Keep on the ground
      character.y = height - character.height;
      character.velocityY = 0;
    }
  } 
  else {
    // Apply movement when swimming
    character.y += character.velocityY;

    // If not pressing space, apply a slower fall speed
    if (!keyIsDown(32)) {
      character.velocityY -= 1; // Slow downward speed
    } 
    else {
      character.velocityY = max(character.velocityY, -character.waterSpeed); // Cap the upward speed
    }
  }
}

function isOnGround() {
  if (character.onGround) {
    character.isJumping = false; // Reset jump when on the ground
  }
  if (character.y - character.height < height - maxWaterHeight) {
    character.isSwimming = false;
  }
}

function checkCollision() {
  character.onGround = false; // Suppose that player already on ground

  for (let i = 0; i < terrain.length; i++) {
    let someRect = terrain[i];

    // Check if the character has collided with terrain
    if (// eslint-disable-next-line indent
        character.x < someRect.x + someRect.w && // Right side of the character
        character.x + character.width > someRect.x && // Left side of the character
        character.y + character.height > someRect.y && // Bottom side of the character
        character.y < someRect.y + someRect.h // Top side of character
    ) {
      // If the character is underwater
      if (character.y + character.height >= height - maxWaterHeight) {
        console.log("Character is under water");
        character.speed = character.waterSpeed; // Reducing speed in water

        // Checking if the terrain is above water level
        if (someRect.y < height - maxWaterHeight) {
          console.log("The character touches the terrain above the water level, throw it up");
          character.y = someRect.y - character.height; // We raise the character to the top of the terrain
          character.velocityY = 0;
          character.onGround = true;
          character.speed = character.defaultSpeed; // Returning to normal speed
        }

        // Check for the right side of the character if there is a following object
        if (i < terrain.length - 1) {
          let nextRect = terrain[i + 1];
          if (character.x + character.width > nextRect.x && nextRect.y < height - maxWaterHeight) {
            console.log("The character touches the terrain with the right side, throw it up");
            character.y = nextRect.y - character.height; // We move the character to the top of the next terrain
            character.velocityY = 0;
            character.onGround = true;
            character.speed = character.defaultSpeed; // Returning to normal speed
          }
        }
      }
      else {
        // If the character is on land
        character.y = someRect.y - character.height;
        character.velocityY = 0;
        character.onGround = true;
        character.speed = character.defaultSpeed;
      }

      break; // Stop checking if a collision is detected
    }
  }
}

function spawnTree(rectangleOn) {
  return {
    x: rectangleOn.x,
    y: rectangleOn.y,
    width: rectangleOn.w,
    height: rectangleOn.w * 3,
  };
}

function spawnStar() {
  return {
    x: random(0, width),
    y: random(0, height),
    size: random(1, 5),
  };
}

function generateStars(starsAmount) {
  for (let i = 0; i < starsAmount; i++) {
    let newStar = spawnStar();
    stars.push(newStar);
  }
} 