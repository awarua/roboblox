class Board3D {
  constructor({x, y, width, height, front, back}){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.front = front;
    this.back = back;

    this.rotY = 0;
    this.rotX = 0;
    this.rotSpeed = 0.5;
    this.drag = false;

    this.margin = 35;

    this.zoom = 1;

    // These calculations are to figure out how much we need to scale
    // things by in order to fit them into the graphics size.
    let maxTileW = (this.width - (2 * this.margin)) / params.cols;
    let maxTileH = (this.height - (2 * this.margin)) / params.rows;

    let [shortSide,   divisions  ] = maxTileW < maxTileH ? 
        [this.width - this.margin,  params.cols] : 
        [this.height - this.margin, params.rows] ;

    this.tileSize = shortSide / divisions;
    this.scaleFactor = (shortSide - 2 * this.margin) / shortSide;
    console.log('this.scaleFactor', this.scaleFactor);

    let graphicsW = this.margin * 2 + this.tileSize * 
      params.cols; //  * this.scaleFactor;
    let graphicsH = this.margin * 2 + this.tileSize *
      params.rows; //  * this.scaleFactor;

    // The margin between the left and right sides and where the edges
    // of the 'g' object will be.

    this.g = createGraphics(this.width, this.height, WEBGL);
    this.g.textFont(fnt);
    this.g.textAlign(CENTER, CENTER);
    this.g.textSize(0.05);

    // this.cam = this.g.createCamera();
    // this.defaultCamZ = this.cam.eyeZ + this.tileSize / 2;
    // this.setCamFront();  
    
    this.bricks = null;    
    this.setupBricks();    

    this.front.registerListener(() => this.setupBricks());
    this.back.registerListener(() => this.setupBricks());


    // console.log('2 sf', this.scaleFactor, 'mT', this.marginT, 'mL', this.marginL);
  }

  show(){
    this.g.push();
    // this.g.clear(100, 100, 100);
    this.g.clear(40, 40, 50);
    this.g.background(40, 40, 50);

    // this.g.ortho();
    // this.g.rotateY(millis() / 2000);
    this.g.rotateY(radians(this.rotY));

    this.g.scale(this.scaleFactor);
    // this.g.scale(0.5);

    // Set up lights
    // this.g.pointLight(255, 255, 255, 
    //   cam.eyeX + cam.eyeZ * 0.8, 
    //   cam.eyeY - this.height / 2, 1.5 * cam.eyeZ);   
    
    this.g.ambientLight(150, 150, 150);
    
    
    let spotX = 0;
    let spotY = -this.tileSize * 0.5;
    let spotZ = this.tileSize * 100;

    let spotV = createVector(spotX, spotZ);
    spotV = spotV.rotate(radians(this.rotY));

    spotX = spotV.x;
    spotZ = spotV.y;

    let lookV = createVector(-spotX, -spotY, -spotZ).setMag(1);

    this.g.lightFalloff(0.5, 0.00001, 0);

    this.g.directionalLight(255, 255, 255, lookV.x, lookV.y, lookV.z);
    // this.g.spotLight(255, 255, 255, 
    //   spotX, spotY, spotZ,
    //   lookV.x, lookV.y, lookV.z,
    //   radians(90), 30);
    // this.g.pointLight(255, 255, 255, 
    //   spotX,
    //   spotY,
    //   spotZ);

    // console.log({
    //   sX: floor(spotX), 
    //   sY: floor(spotY), 
    //   sZ: floor(spotZ), 
    //   lX: nf(lookV.x, 0, 2), 
    //   lY: nf(lookV.y, 0, 2),
    //   lZ: nf(lookV.z, 0, 2),
    // });

    // this.g.rotateX(radians(this.rotX));
    // this.g.rotateX(radians(90));

      // sketch3DBoard.pointLight(255, 255, 255, 
      //   cam.eyeX + cam.eyeZ * 0.8, 
      //   cam.eyeY - sketch3DBoard.height / 2, 1.5 * -cam.eyeZ);
      

    
    // // Draw bounding box
    // this.g.push();
    // this.g.stroke(255, 0, 0);
    // this.g.strokeWeight(5);
    // this.g.noFill();
    // this.g.translate(-this.g.width / 2, -this.g.height / 2);
    // this.g.beginShape();
    // this.g.vertex(           0,             0, 0);
    // this.g.vertex(this.g.width,             0, 0);
    // this.g.vertex(this.g.width, this.g.height, 0);
    // this.g.vertex(           0, this.g.height, 0);
    // this.g.endShape(CLOSE);
    // this.g.pop();

    // // Draw x, y axes
    // this.g.push();
    // this.g.stroke(0, 0, 255);
    // this.g.strokeWeight(1);
    // this.g.line(0, -this.g.height, 0, 0, this.g.height, 0);
    // this.g.line(-this.g.width, 0, 0, this.g.width, 0, 0);
    // this.g.pop();

    // Draw the bricks
    this.drawBricks();

    // this.g.ambientMaterial(255, 255, 255);
    // this.g.beginShape();
    // this.g.vertex(-this.tileSize / 2, -this.tileSize / 2, 0);
    // this.g.vertex(this.tileSize / 2, -this.tileSize / 2, 0);
    // this.g.vertex(this.tileSize / 2, this.tileSize / 2, 0);  
    // this.g.endShape(CLOSE);

    // // Draw the camera.
    // this.g.push();
    // this.g.noLights();
    // this.g.fill(0, 255, 0);
    // this.g.noStroke();
    // this.g.translate(spotX, spotY, spotZ);
    // this.g.sphere(10);
    // this.g.stroke(255, 0, 0);
    // this.g.strokeWeight(10);
    // this.g.line(0, 0, 0, lookV.x * 100, lookV.y * 100, lookV.z * 100);
    // this.g.pop();

    this.g.pop();

    // Draw to the main canvas.
    push();
    translate(this.x, this.y);
    noStroke();
    fill(40, 40, 50);
    rect(0, 0, this.width, this.height);

    // // Draw the axes
    // push();
    // translate(this.width / 2, this.height / 2);
    // stroke(255);
    // strokeWeight(4);
    // line(0, -this.height / 2, 0, this.height / 2);
    // line(-this.width / 2, 0, this.width / 2, 0);

    // strokeWeight(2);
    // let gridSize = 50;
    // let gridRows = floor(this.height / gridSize);
    // let gridCols = floor(this.width / gridSize);

    // for (let i = 0; i < gridCols; i++){
    //   let x = (i - gridCols / 2) * gridSize;
    //   line(x, -this.height / 2, x, this.height / 2);
    // }
    // for (let i = 0; i < gridRows; i++){
    //   let y = (i - gridRows / 2) * gridSize;
    //   line(-this.width / 2, y, this.width / 2, y);
    // }
    // pop();

    // push();
    imageMode(CENTER);
    // tint(255, 200);
    image(this.g, this.width / 2, this.height / 2); // , 
    //   this.width / 2, this.height / 2);
    // pop();

    // this.g.push();
    // this.g.rotateX(radians(90));
    // translate(this.width / 2, 0);
    // image(this.g, this.width / 4, this.height / 4, 
    //   this.width / 2, this.height / 2);
    // this.g.pop();

    pop();
  }

  // setDoOrbit(newDoOrbit) {
  //   doOrbit = newDoOrbit;
  // }

  // setCamFront() {
  //   this.cam.setPosition(0, 0, this.defaultCamZ);
  //   this.cam.lookAt(0, 0, 0);
  // }

  // setCamBack() {
  //   // console.log('set cam back');
  //   this.cam.setPosition(0, 0, -this.defaultCamZ);
  //   this.cam.lookAt(0, 0, 0);
  // }

  getRot() {
    return this.rotY;
  }

  setRotY(rotY) {
    this.rotY = rotY;
  }

  // Set up the array of bricks based off the front and 
  // back boards
  setupBricks() {      
    // Get a copy of the front and back boards
    // frontBData = frontB.copyData();
    // backBData = backB.copyData();

    // this loop creates the bricks from the tiles in the board
    this.bricks = new Array(params.cols);
    for (let c = 0; c < params.cols; c++) {
      this.bricks[c] = new Array(params.rows);
      for (let r = 0; r < params.rows; r++) {
        let a = (params.cols - 1) - c;
        // Get the tile num for the front and tile
        let frontTileNum = this.front.getTile(c, r);
        let backTileNum = this.back.getTile(a, r);

        // Get front and back tiles
        // debugger;
        let frontTile = tiles[frontTileNum];
        let backTile = tiles[backTileNum];

        // center is for the center of the brick
        let center = createVector(
          c * this.tileSize + this.tileSize / 2, 
          r * this.tileSize + this.tileSize / 2);

        // size is the size of the tile
        let size = frontTile.size;

        this.bricks[c][r] = new Brick(frontTile, backTile, center, this.g,
          uiParams.brickSteps);
      }
    }
  }

  // Draw the grid of all the bricks to the board
  drawBricks() {
    this.g.push();

    // Draw the bounding box
    // this.g.push();
    // this.g.strokeWeight(6);
    // this.g.stroke(0, 255, 0);
    // this.g.noFill();
    // this.g.translate(
    //   -this.tileSize * params.cols / 2, -this.tileSize * params.rows / 2, 0);
    // this.g.beginShape();
    // this.g.vertex(                          0,                           0, 0);
    // this.g.vertex(this.tileSize * params.cols,                           0, 0);
    // this.g.vertex(this.tileSize * params.cols, this.tileSize * params.rows, 0);
    // this.g.vertex(                          0, this.tileSize * params.rows, 0);
    // this.g.endShape(CLOSE);
    // this.g.pop();

    this.g.stroke(200);
    // this.g.noFill();
    this.g.translate(
      -this.tileSize * params.cols / 2, -this.tileSize * params.rows / 2);

    // Iterate over the columns and rows and draw each brick
    for (let c = 0; c < params.cols; c++) {
      for (let r = 0; r < params.rows; r++) {
        this.g.push();
        this.g.translate(c * this.tileSize, r * this.tileSize, 0);

        // // Draw a bounding box for the tile
        // this.g.push();
        // this.g.translate(this.tileSize / 2, this.tileSize / 2, 0);
        // this.g.box(this.tileSize);
        // this.g.pop();

        this.bricks[c][r].display(this.tileSize);
        this.g.pop();
      }
    }
    this.g.pop();
  }

  isInside(x, y){
    return (x > this.x && x < this.x + this.width &&
      y > this.y && y < this.y + this.height);
  }

  mousePressed(mX, mY){
    if (this.isInside(mX, mY)){
      // console.log('mp');
      this.drag = {sRot: this.rotY, sX: mX, sY: mY, eX: mX, eY: mY};
    }
  }

  mouseDragged(mX, mY){
    if (this.drag){
      // console.log('md');
      this.drag.eX = mX;
      this.drag.eY = mY;
      this.processDrag();
    }
  }

  mouseReleased(){
    this.drag = false;
  }

  processDrag(){
    let rotDelta = (this.drag.eX - this.drag.sX) * this.rotSpeed;
    let newRotY = (360 + this.drag.sRot + rotDelta) % 360;

    let newSide =  newRotY   <= 90 || newRotY   > 270 ? "front" : "back"
    let currSide = this.rotY <= 90 || this.rotY > 270 ? "front" : "back"

    if (newSide !== currSide){
      sideChanged(newSide, false);
    }

    this.rotY = newRotY;
    // console.log({rotDelta, rot: this.rot})
  }
}



/*
function make3DBoard(domParentId, appFn, makeFull, zoom, brickSteps){
  console.log('make3DBoard', domParentId, appFn(), makeFull, zoom, brickSteps);

  return (sketch3DBoard) => {
    let frontBData = null;
    let backBData = null;
    let doSetupBricks = false;
    let isShowingFront = true;
    let tileSize = appFn().masterTileSize;
    let f;
    let cam;
    let defaultCamZ;
    let doOrbit = true;
    // zoom = 0.75;

    sketch3DBoard.preload = () => {
      f = sketch3DBoard.loadFont('styles/iconsolata/Inconsolata.otf');
    }
    
    sketch3DBoard.setup = () => {
      // console.log('sketch3DBoard.setup()')

      let domParent = sketch3DBoard.select(domParentId);
      let cnv;

      if (makeFull){
        console.log('make full');
  
        let w = window.innerWidth; // s.windowWidth;
        let h = window.innerHeight; // s.windowHeight;

        // console.log('w', w, 'h', h, 
        //   's.windowWidth', s.windowWidth, 
        //   'window.innerWidth', window.innerWidth);

        // setTimeout(() => {
        //   console.log('s.windowWidth after timeout', s.windowWidth)
        // }, 10000);

        // console.log('w', w, 'h', h, 'ts', tileSize, 
        //   'ml', marginL, 'mt', marginT, 'sf', scaleFactor);
        cnv = sketch3DBoard.createCanvas(w, h, sketch3DBoard.WEBGL);
      } else {
        // console.log("not make full", domParent);
        let w = domParent.width;
        // console.log('w', w);
        let t, h;

        // Get the parent dom element and figure out width
        if (domParentId === '#example-tile-holder'){
          h = domParent.height;
          // debugger;
        } else {
          let mainDiv = sketch3DBoard.select('#main-area');
          h = mainDiv.height;
        }

        let sideL = sketch3DBoard.min(w, h);

        tileSize = sideL / appFn().params.cols;
        scaleFactor = (sideL - 2 * marginT) / sideL;

        let canvasW = marginL * 2 + tileSize * appFn().params.cols * scaleFactor;

        // console.log('canvasW', {canvasW, marginL, tileSize, 
        //   cols: appFn().params.cols, scaleFactor})

        let canvasH = h;

        //canvasW = 100;
        //canvasH = 100;

        cnv = sketch3DBoard.createCanvas(canvasW, canvasH, sketch3DBoard.WEBGL);
      }
      cnv.parent(domParent);
      sketch3DBoard.angleMode(sketch3DBoard.DEGREES);
      sketch3DBoard.textFont(f);

      // Keep a copy of the front and back boards.
      frontB = appFn().front;
      backB = appFn().back;

      sketch3DBoard.setupBricks();

      // Register listeners
      frontB.registerListener(sketch3DBoard.frontBoardChanged);
      backB.registerListener(sketch3DBoard.backBoardChanged);

      // console.log('sketch3DBoard.setup() ==> at end.')
    }

    sketch3DBoard.draw = () => {
      // console.log('sketch3DBoard.draw()', domParentId, sketch3DBoard.width, sketch3DBoard.height)

      // console.log(domParentId);

      // TODO: This doesn't need to be done every time, but I will leave it
      //       for now.
      if (doSetupBricks){
        sketch3DBoard.setupBricks();
        doSetupBricks = false;
        // console.log('set up bricks');
      }

      // Figure out the current amount of rotation and use this to decide
      // whether to display the front or back tile layout. 
      if (cam.eyeZ < 0){
        if (isShowingFront){
          appFn()?.showBack && appFn().showBack();
          isShowingFront = false;
        }
      } else {
        if (!isShowingFront){
          appFn()?.showFront && appFn().showFront();
          isShowingFront = true;
        }
      } 

      // TODO: Re-implement 'momentum' effect for rotation?

      sketch3DBoard.clear();
      if (doOrbit){
        sketch3DBoard.orbitControl(4, 0, 0);
      }
      
      // console.log("sketch3DBoard.draw() ==> at end");
    }

    //////////////////////////////////////////////////////////
    // Drawing helpers
    // 


    //////////////////////////////////////////////////////////
    // Helpers
    // 

    sketch3DBoard.frontBoardChanged = (lineNo) => {
      // console.log('front board changed', lineNo);
      doSetupBricks = true;
    }

    sketch3DBoard.backBoardChanged = (lineNo) => {
      // console.log('back board changed', lineNo);
      doSetupBricks = true;
    }

    sketch3DBoard.doSetupBricks = () => {
      doSetupBricks = true;
    }

    // Returns true if a given point is inside the canvas
    sketch3DBoard.isInside = (x, y) => {
      return x > 0 && x < sketch3DBoard.width && y > 0 && y < sketch3DBoard.height;
    };

  }
}
*/