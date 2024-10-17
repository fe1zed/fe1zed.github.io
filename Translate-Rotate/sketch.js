// Translate Rotate
// Dmitrii Pletminsev
// 10/17/24
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  rectMode(CENTER);
}

function draw() {
  background(220);

  push();

  translate(200, 200);
  rotate(mouseX);

  fill("red");
  square(0, 0, 50);

  pop();
  fill("green");
  rect(width/2, 400, width, 200);
}
