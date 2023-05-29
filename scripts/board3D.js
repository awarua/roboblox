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
    this.lastClicked = null;

    // UI properties
    this.r = 0.15; // 0.3;
    this.maxR = 64; // 0000000000;

    this.margin = 35;

    // TODO: Is this needed? 
    this.zoom = 1;

    // Set up the scale so that we can see all bricks.
    // This needs to be redone if cols/rows change.
    this.tileSize = 100;
    this.scaleFactor = 1;
    this.setupScale();

    // let graphicsW = this.margin * 2 + this.tileSize * 
    //   params.cols; //  * this.scaleFactor;
    // let graphicsH = this.margin * 2 + this.tileSize *
    //   params.rows; //  * this.scaleFactor;

    // The margin between the left and right sides and where the edges
    // of the 'g' object will be.

    this.g = createGraphics(this.width, this.height, WEBGL);
    // this.g.textFont(fnt);
    // this.g.textAlign(CENTER, CENTER);
    // this.g.textSize(0.05);

    // A 'picker' graphics object that we can use to detect mouse clicks
    this.picker = createGraphics(this.width, this.height, WEBGL);   
    this.pickerImg = this.picker.get(
      0, 0, this.picker.width, this.picker.height); 

    // this.cam = this.g.createCamera();
    // this.defaultCamZ = this.cam.eyeZ + this.tileSize / 2;
    // this.setCamFront();  
    
    this.bricks = null;    
    this.setupBricks();    

    this.front.registerListener(() => this.setupBricks());
    this.back.registerListener(() => this.setupBricks());

    /* TODO - Can I use the following to handle clicks? (from perspective() ref)
    // If no parameters are given, the following default is used: 
    //   perspective({
    //     fovy: PI/3, 
    //     aspect: width/height, 
    //     near: eyeZ/10,
    //     far: eyeZ*10
    //   })
    // where eyeZ is equal to ((height/2) / tan(PI/6)).
    */


    // console.log('2 sf', this.scaleFactor, 'mT', this.marginT, 'mL', this.marginL);
  }

  setupScale(){
    // These calculations are to figure out how much we need to scale
    // things by in order to fit them into the graphics size.
    let maxTileW = (this.width - (2 * this.margin)) / params.cols;
    let maxTileH = (this.height - (2 * this.margin)) / params.rows;

    let [shortSide,   divisions  ] = maxTileW < maxTileH ? 
        [this.width - this.margin,  params.cols] : 
        [this.height - this.margin, params.rows] ;

    this.tileSize = shortSide / divisions;
    this.scaleFactor = 0.8 * (shortSide - 2 * this.margin) / shortSide;
    // console.log('this.scaleFactor', this.scaleFactor);
  }

  show(){
    let tX = 0.5 * this.tileSize * sin(radians(2 * this.rotY));

    // Draw the picker
    this.picker.push();
    this.picker.clear();
    this.picker.background(255);

    this.picker.translate(tX, 0, 0);

    this.picker.rotateY(radians(this.rotY));
    this.picker.scale(this.scaleFactor);
    this.showPickerGrid();
    if (this.lastClicked && this.lastClicked.side == this.getSide()){
      this.showLastClickedPicker();
    }
    this.picker.pop();

    // Draw the bricks.
    this.g.push();
    this.g.clear(0);
    this.g.background(40, 40, 50);

    this.g.translate(tX, 0, 0);

    this.g.rotateY(radians(this.rotY));
    this.g.scale(this.scaleFactor);

    // Set up lights
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
  
    this.showBricks();
    if (this.lastClicked && this.lastClicked.side == this.getSide()){
      this.showLastClicked();
    }    
    this.g.pop();

    // Draw to the main canvas.
    push();
    translate(this.x, this.y);
    noStroke();
    fill(255, 255, 0);
    rect(0, 0, this.width, this.height);
    imageMode(CENTER);
    // image(this.picker, this.width / 2, this.height / 2);
    image(this.g, this.width / 2, this.height / 2);

    noStroke();
    fill(150);
    // text(`drag: ${this.drag}, didDrag: ${this.drag?.didDrag || false}`, 10, 20);
    text(`sin(this.rotY): ${sin(radians(2 * this.rotY))}`, 10, 20);

    pop();

    this.pickerImg = this.picker.get(
      0, 0, this.picker.width, this.picker.height); 
  }

  // Function for visual debugging. Show the bounding box.
  showBoundingBox(){
    this.g.push();
    this.g.stroke(255, 0, 0);
    this.g.strokeWeight(5);
    this.g.noFill();
    this.g.translate(-this.g.width / 2, -this.g.height / 2);
    this.g.beginShape();
    this.g.vertex(           0,             0, 0);
    this.g.vertex(this.g.width,             0, 0);
    this.g.vertex(this.g.width, this.g.height, 0);
    this.g.vertex(           0, this.g.height, 0);
    this.g.endShape(CLOSE);
    this.g.pop();
  }

  // Function for visual debugging. Show the x, y axes.
  showAxes(){
    // Draw x, y axes
    this.g.push();
    this.g.stroke(0, 0, 255);
    this.g.strokeWeight(1);
    this.g.line(0, -this.g.height, 0, 0, this.g.height, 0);
    this.g.line(-this.g.width, 0, 0, this.g.width, 0, 0);
    this.g.pop();
  }

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
  showBricks() {
    this.g.push();
    this.g.stroke(200);
    this.g.translate(
      -this.tileSize * params.cols / 2, -this.tileSize * params.rows / 2);

    // Iterate over the columns and rows and draw each brick
    for (let c = 0; c < params.cols; c++) {
      for (let r = 0; r < params.rows; r++) {
        this.g.push();
        this.g.translate(c * this.tileSize, r * this.tileSize, 0);
        this.bricks[c][r].display(this.tileSize);
        this.g.pop();
      }
    }
    this.g.pop();
  }

  // Draw the grid of all the brickcs for the picker
  showPickerGrid(){
    this.picker.push();
    this.picker.background(0);
    this.picker.stroke(0);
    this.picker.translate(
      -this.tileSize * params.cols / 2, -this.tileSize * params.rows / 2);

    let isFront = this.getSide() == "front"

    // Iterate over the columns and rows and draw each brick
    for (let c = 0; c < params.cols; c++) {
      for (let r = 0; r < params.rows; r++) {
        this.picker.push();
        this.picker.translate(c * this.tileSize, r * this.tileSize, 0);
        if (isFront){
          this.picker.translate(0, 0, this.tileSize / 2)
        } else {
          this.picker.translate(0, 0, -this.tileSize / 2);
        }

        // let re = map(r, 0, params.rows - 1, 0, 255);
        // let gr = map(c, 0, params.cols - 1, 0, 255);
        // TODO: The following assumes no more than 255/pickerBand rows & cols
        let re = r * uiParams.pickerBand;
        let gr = c * uiParams.pickerBand;

        this.picker.noStroke();
        this.picker.fill(re, gr, 255);
        
        this.picker.push();
        this.picker.scale(this.tileSize);
        this.picker.beginShape();
        this.picker.vertex(0, 0, 0);
        this.picker.vertex(1, 0, 0);
        this.picker.vertex(1, 1, 0);
        this.picker.vertex(0, 1, 0);
        this.picker.endShape(CLOSE);
        this.picker.pop();

        // this.picker.fill(0, 255, 255);
        // this.picker.box(10);
        // this.bricks[c][r].display(this.tileSize);
        this.picker.pop();
      }
    }
    this.picker.pop();
  }

  // Show the picker for the last clicked tile
  showLastClickedPicker(){
    let buttonCentres = this.getButtonCentres();
    let scaledR = this.getR();
    // console.log('scaledR', scaledR);
    let scaledT = scaledR / 4.6;

    this.picker.push();
    this.picker.translate(
      -this.tileSize * params.cols / 2, -this.tileSize * params.rows / 2);
    let isFront = this.getSide() == "front"
    
    this.picker.translate(
      this.lastClicked.c * this.tileSize, 
      this.lastClicked.r * this.tileSize, 0);
    if (isFront){
      this.picker.translate(0, 0, this.tileSize / 2)
    } else {
      this.picker.translate(0, 0, -this.tileSize / 2);
    }
    this.picker.scale(this.tileSize);
    this.picker.noStroke();
    // this.picker.ambientLight(255, 255, 255);
    // this.picker.ambientMaterial(0, 255, 0);

    for(let i = 0; i < buttonCentres.length; i++){
      let c = buttonCentres[i];

      let gr = i * uiParams.pickerBand;
      this.picker.fill(255, gr, 255);

      this.picker.push();
      this.picker.translate(c.x, c.y);
      this.picker.ellipsoid(scaledR, scaledR, 0.01);
      this.picker.pop();
    }

    this.picker.pop();
  }

  // Show the picker for the last clicked tile
  showLastClicked(){
    let buttonCentres = this.getButtonCentres();
    let scaledR = this.getR();
    // console.log('scaledR', scaledR);
    let scaledT = scaledR / 4.6;

    this.g.push();
    this.g.translate(
      -this.tileSize * params.cols / 2, -this.tileSize * params.rows / 2);
    let isFront = this.getSide() == "front"
    
    this.g.translate(
      this.lastClicked.c * this.tileSize, 
      this.lastClicked.r * this.tileSize, 0);
    if (isFront){
      this.g.translate(0, 0, this.tileSize / 2)
    } else {
      this.g.translate(0, 0, -this.tileSize / 2);
    }
    this.g.scale(this.tileSize);
    this.g.noStroke();

    for(let i = 0; i < buttonCentres.length; i++){
      let c = buttonCentres[i];

      let gr = i * uiParams.pickerBand;
      this.g.noLights();
      this.g.fill(2, 117, 255);
      // this.g.ambientMaterial(255, 0, 255);

      this.g.push();
      this.g.translate(c.x, c.y);
      this.g.ellipsoid(scaledR, scaledR, 0.01);

      let currentTileNum = this.getCurrentTile();

      let z = this.getSide() == "front" ? 0.01 : -0.01;

      let sideNum = this.getTileSide(i);

      if (tiles[currentTileNum].sides[sideNum]){
        this.g.fill(255);
        this.g.beginShape();        
        this.g.vertex(-scaledT * 0.8, -scaledT * 0.8, z);
        this.g.vertex(-scaledT * 0.8, -scaledT * 2  , z);
        this.g.vertex( scaledT * 0.8, -scaledT * 2  , z);
        this.g.vertex( scaledT * 0.8, -scaledT * 0.8, z);
        this.g.vertex( scaledT * 2  , -scaledT * 0.8, z);
        this.g.vertex( scaledT * 2  ,  scaledT * 0.8, z);
        this.g.vertex( scaledT * 0.8,  scaledT * 0.8, z);
        this.g.vertex( scaledT * 0.8,  scaledT * 2  , z);
        this.g.vertex(-scaledT * 0.8,  scaledT * 2  , z);
        this.g.vertex(-scaledT * 0.8,  scaledT * 0.8, z);
        this.g.vertex(-scaledT * 2  ,  scaledT * 0.8, z);
        this.g.vertex(-scaledT * 2  , -scaledT * 0.8, z);
        this.g.endShape(CLOSE);
      } else {
        this.g.fill(0);
        this.g.beginShape();
        this.g.vertex(-scaledT * 2, -scaledT * 0.8, z);
        this.g.vertex( scaledT * 2, -scaledT * 0.8, z);
        this.g.vertex( scaledT * 2,  scaledT * 0.8, z);
        this.g.vertex(-scaledT * 2,  scaledT * 0.8, z);
        this.g.endShape(CLOSE);
      }


      // this.g.rect(c.x, c.y, 2.6 * scaledT, scaledT);
      // } else {
      //   s.fill(0);
      //   s.rect(c.x, c.y, 2.6 * scaledT, scaledT);
      // }

      this.g.pop();
    }

    this.g.pop();
  }  

  getCurrentTile(){
    if (this.lastClicked){
      if (this.lastClicked.side === "front"){
        return this.front.getTile(this.lastClicked.c, this.lastClicked.r)
      } else {
        return this.back.getTile(
          (params.cols - 1) - this.lastClicked.c, this.lastClicked.r)        
      }
    }
  }

  getTileSide(s){
    if (this.getSide() == "front"){
      return s;
    }
    return [1, 0, 7, 6, 5, 4, 3, 2][s];
  }

  getM(){
    let scaledR = this.getR();
    return (1 - 2 * scaledR) / 3 + scaledR / 2;    
  }

  getR(){
    return Math.min(this.r, this.maxR / this.tileSize)
  }

  getButtonCentres(){
    let m = this.getM();
    // Order of button centres. Note - order matters because these 
    // correspond to the openings in the tile.
    let buttonCentres = [
      {x: m,     y: 0},
      {x: 1 - m, y: 0},
      {x: 1,     y: m},
      {x: 1,     y: 1 - m},  
      {x: 1 - m, y: 1},
      {x: m,     y: 1},
      {x: 0,     y: 1 - m},
      {x: 0,     y: m},
    ];   
    
    return buttonCentres;
  }

  isInside(x, y){
    return (x > this.x && x < this.x + this.width &&
      y > this.y && y < this.y + this.height);
  }

  toLocalCoords(x, y){
    return {
      lX: x - (this.x),
      lY: y - (this.y),
    };
  }

  getSide(r){
    if (typeof(r) == 'undefined'){
      r = this.rotY;
    }
    return r <= 90 || r > 270 ? "front" : "back";
  }

  setLastClicked({c, r, side}){
    this.lastClicked = {
      c,
      r,
      side,
    }
  }

  clearLastClicked(){
    this.lastClicked = null;
  }

  mouseClicked(mX, mY){
    if (this.isInside(mX, mY)){
      // console.log('mc');
      // If not dragging, test for clicks.
      if (!this.drag || !this.drag.didDrag){
        let {lX, lY} = this.toLocalCoords(mX, mY); 
        let side = this.getSide();
        
        let mouseColor = this.pickerImg.get(lX , lY);
        let isClickedUI = mouseColor[0] === 255;
        let isClickedGrid = mouseColor[2] === 255;
        let r = mouseColor[0] / uiParams.pickerBand;
        let c = mouseColor[1] / uiParams.pickerBand;
        
        let rValid = r === floor(r);
        let cValid = c === floor(c);

        // console.log('  ', {mouseColor, isClickedUI, isClickedGrid})

        if (isClickedUI &&  c >= 0 && c < 8 && cValid){
          // Get the button clicked
          let sideClicked = this.getTileSide(c);
          // console.log('  side clicked', c, this.lastClicked);
          if (this.lastClicked.side == "front"){
            this.front.toggleSide(c, this.lastClicked);
          } else {
            this.back.toggleSide(
              sideClicked, 
              {c: (params.cols - 1) - this.lastClicked.c,
              r: this.lastClicked.r,
              side: this.lastClicked.side
            });
          }
        }
        else if (isClickedGrid 
          && r >= 0 && r < params.rows && rValid
          && c >= 0 && c < params.cols && cValid){
          if (side == "front"){
            this.setLastClicked({c, r, side});
          } else {
            this.setLastClicked({c, r, side});      
          }
        } else {
          this.clearLastClicked();
        }
      } 
    } else {
      this.clearLastClicked();
    }
    this.drag = false;       
  }

  mousePressed(mX, mY){
    // console.log('mp');
    if (this.isInside(mX, mY)){
      // console.log('mp');
      this.drag = {
        sRot: this.rotY, sX: mX, sY: mY, eX: mX, eY: mY, didDrag: false};
    }
  }

  mouseDragged(mX, mY){
    console.log("bo mm");
    if (this.drag){
      // console.log('md');
      // console.log('md');
      this.drag.eX = mX;
      this.drag.eY = mY;
      this.drag.didDrag = this.drag.didDrag || mX !== this.drag.sX;
      this.processDrag();
    }
  }

  // mouseReleased(){
  //   console.log('mr');
  //   this.drag = false;
  // }

  processDrag(){
    let rotDelta = (this.drag.eX - this.drag.sX) * this.rotSpeed;
    let newRotY = (360 + this.drag.sRot + rotDelta) % 360;

    let newSide =  this.getSide(newRotY);
    let currSide = this.getSide();

    // if (newSide !== currSide){
    //   sideChanged(newSide, false);
    // }

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