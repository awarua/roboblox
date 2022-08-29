// this is the draw for displaying in 3D
function draw3D() {



  //rotateDisplay();

  viewer.page.ambientLight(70)
  viewer.page.pointLight(150, 150, 150, 0, -height / 2 * ROWS, 200 * ROWS);
  viewer.page.pointLight(100, 100, 100, 0, -height / 2 * ROWS, -200 * ROWS);




  // background(0)
  viewer.page.background(0)




  //  drawGrid3D();

  viewer.page.push()
 
  viewer.page.fill(255, 255, 0)
  viewer.page.noStroke()
  viewer.page.translate(-tileSize * (COLS / 2), -tileSize * (ROWS - 1))


  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (board[c][r] > -1) {

        bricks[c][r].loft()
        
         viewer.page.push()
         viewer.page.ambientLight(255)
        bricks[c][r].display()
         viewer.page.pop()

      }
    }
  }

  viewer.page.pop()


 drawBase();


  image(viewer.page, 0, 0)


}

function drawGrid3D() {
  viewer.page.push();


  viewer.page.translate(-tileSize * (COLS / 2), -tileSize * (ROWS - 1))

  viewer.page.stroke(255);
  for (let c = 0; c < COLS + 1; c++) {
    viewer.page.line(c * tileSize, 0, c * tileSize, ROWS * tileSize);
  }
  for (let r = 0; r < ROWS + 1; r++) {
    viewer.page.line(0, r * tileSize, COLS * tileSize, r * tileSize);
  }
  viewer.page.pop();
}

function camSetup() {

  easycam = new Dw.EasyCam(viewer.page._renderer);

    // loads the easy cam library
    easycam = new Dw.EasyCam(viewer.page._renderer, {
      distance: 500,
      center: [0,-50,0]
      
    });
    document.oncontextmenu = () => false;
    setAttributes('antialias', true);

    //locks the cam rotation axis to yaw
     easycam.setRotationConstraint(true, false, false)

    // turns of defualt mouse controls
     easycam.removeMouseListeners()

    easycam.setDistanceMin(300);

    easycam.setDistanceMax(700);

     camState = easycam.getState();



}

//function rotateDisplay() {



  //   let a = slideRotate.value()
  // easycam.rotateY(a)
  //   print(a)
  //   noLoop()



  //   let sideBar = width * 0.25

  //   let mDist = dist(width / 2, mouseY, mouseX, mouseY)

  //   let rSpeed = map(mDist, (width / 2) - sideBar, width / 2, 1, 10)

  // //   if (mouseX > 0 && mouseX < sideBar && mouseY > 0 && mouseY < height) {
  // //     easycam.rotateY(0.01 * rSpeed);




  //   } else {
  //     if (mouseX > width - sideBar && mouseX < width && mouseY > 0 & mouseY < height) {
  //       easycam.rotateY(-0.01 * rSpeed);

  //     }
  //   }
//}

function drawBase() {


  viewer.page.push();

  viewer.page.translate(0, tileSize, 0)
  viewer.page.angleMode(DEGREES);

  viewer.page.fill(250);

  viewer.page.ellipseMode(CENTER)

  viewer.page.rotateX(90)

  viewer.page.circle(0, 0, 100 + (COLS * tileSize))
  viewer.page.pop();

}


function mouseDragged() {
 
  let a = abs(mouseX - pmouseX)
  let b = abs(mouseY - pmouseY)
  
  if (isInsideFrontCanvas(mouseX, mouseY)) {
    if (mouseX > pmouseX) {

      easycam.rotateY(-0.005 * a);
     
    } else {
      easycam.rotateY(0.005 * a);
      
    }
  }
  
//    if (isInsideCanvas(mouseX, mouseY)) {
//     if (mouseY > pmouseY) {

//       easycam.rotateX(0.001 * b);
//        easycam.setState(camState)
//     } else {
//       easycam.rotateX(-0.001 * b);
//       easycam.setState(camState)
//     }
//   }
  
  
  
}


// function offCvn() {
//   easycam.setState(camState, 2000)
// }

function mouseWheel() {
if (isInsideFrontCanvas(mouseX, mouseY)) {
  let scroll = event.delta

  easycam.zoom(scroll / 5)
  event.preventDefault();
  return false;  
     }
  
}