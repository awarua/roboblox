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
    this.copy = false;

    // UI properties
    this.r = 0.12; // 0.3;
    this.maxR = 48; // 0000000000;

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

    // Process any residual rotation
    // if (!this.drag && this.rotVel > 0){
    //   console.log(this.rotVel);
    //   this.rotVel *= 0.8;
    //   this.rotY += this.rotVel;
    //   if (this.rotVel < 0.001){
    //     this.rotVel = 0;
    //   }
    // }

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
    // text(`sin(this.rotY): ${sin(radians(2 * this.rotY))}`, 10, 20);

    let sideLabel = this.isFront() ? "Front" : "Back";
    textAlign(CENTER);
    text(sideLabel, this.width / 2, height - uiParams.margin);

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

        this.bricks[c][r] = new Brick(frontTile, backTile, center, this.g);
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

    let isFront = this.isFront();

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
    let isFront = this.isFront();
    
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
    let isFront = this.isFront();
    
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

      let z = this.isFront() ? 0.01 : -0.01;

      let sideNum = this.getTileSide(i, this.lastClicked.side);

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

  ///////////////////////////////////////////////
  // 
  // Getters/setters
  // 

  getRot() {
    return this.rotY;
  }

  setRotY(rotY) {
    this.rotY = rotY;
  }

  getTile(position){
    if (position.side === "front"){
      return this.front.getTile(position.c, position.r)
    } else {
      return this.back.getTile(
        (params.cols - 1) - position.c, position.r)        
    }
  }

  setTile(position, num){ 
    if (position.side === "front"){
      return this.front.setTile(position.c, position.r, num)
    } else {
      return this.back.setTile(
        (params.cols - 1) - position.c, position.r, num)        
    }
  }

  getCurrentTile(){
    if (this.lastClicked){
      return this.getTile(this.lastClicked);
    }
    return null;
  }

  setCurrentTile(num){
    if (this.lastClicked){
      return this.setTile(this.lastClicked, num);
    }
    return null;
  }

  getSide(r){
    if (typeof(r) == 'undefined'){
      r = this.rotY;
    }
    return r <= 90 || r > 270 ? "front" : "back";
  }

  isFront(){
    return this.getSide() === "front"
  }

  getCurrentBoard(){
    return this.isFront() ? front : back;
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

  getTileSide(sideNum, side){
    if (side == "front"){
      return sideNum;
    }
    let correctedSideNum = [1, 0, 7, 6, 5, 4, 3, 2][sideNum];
    return correctedSideNum;
  }  

  toggleSide(sideNum, position){
    // Correct sideNum for back tiles.
    sideNum = this.getTileSide(sideNum, position.side);

    // Correct position for back tiles.
    if (position.side == "front"){
      this.front.toggleSide(sideNum, position);
    } else {
      this.back.toggleSide(
        sideNum, {
          c: (params.cols - 1) - this.lastClicked.c,
          r: this.lastClicked.r,
          side: this.lastClicked.side,
      });
    }
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

  ///////////////////////////////////////////////
  // 
  // Helpers
  // 

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

  moveSelectionUp(){
    if (this.lastClicked){
      this.lastClicked.r = max(this.lastClicked.r - 1, 0);
    }
  }

  moveSelectionDown(){
    if (this.lastClicked){
      this.lastClicked.r = min(this.lastClicked.r + 1, params.rows - 1);
    }
  }

  moveSelectionLeft(){
    if (this.lastClicked){
      if (this.isFront()){
        this.lastClicked.c = max(this.lastClicked.c - 1, 0);
      } else {
        this.lastClicked.c = min(this.lastClicked.c + 1, params.cols - 1);
      }
    }
  }

  moveSelectionRight(){
    if (this.lastClicked){
      if (this.isFront()){
        this.lastClicked.c = min(this.lastClicked.c + 1, params.cols - 1);
      } else {
        this.lastClicked.c = max(this.lastClicked.c - 1, 0);
      }
    }
  }

  paste(copyNum, position){
    this.setTile(position, copyNum);
  }

  processDrag(){
    let rotDelta = (this.drag.eX - this.drag.sX) * this.rotSpeed;
    let newRotY = (360 + this.drag.sRot + rotDelta) % 360;
    // let newSide =  this.getSide(newRotY);
    // let currSide = this.getSide();
    // if (newSide !== currSide){
    //   sideChanged(newSide, false);
    // }
    this.rotY = newRotY;
  }  

  ///////////////////////////////////////////////
  // 
  // Event handlers
  // 

  keyPressed(k){
    if (this.lastClicked){
      if (keyCode == UP_ARROW){
        this.moveSelectionUp();
      } else if (keyCode == DOWN_ARROW){
        this.moveSelectionDown();
      } else if (keyCode == LEFT_ARROW){
        this.moveSelectionLeft();
      } else if (keyCode == RIGHT_ARROW){
        this.moveSelectionRight();
      } else if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(key)){
        let num = this.lastClicked.side == "front" 
          ? parseInt(key) - 1
          : 7 - ((parseInt(key) + 5) % 8);
        this.toggleSide(num, this.lastClicked);
      } else if (keyCode == 67 && keyIsDown(ALT)){ // c
        this.copy = this.getCurrentTile();
      } else if (keyCode == 86 && keyIsDown(ALT)){ // v
        if (this.copy !== false){
          this.paste(this.copy, this.lastClicked);
        }
      } else if (keyCode == 82 && keyIsDown(ALT)){  // r
        this.setCurrentTile(floor(random(256)));
      } else if (keyCode == 88 && keyIsDown(ALT) || keyCode == BACKSPACE){  // x
        this.setCurrentTile(0);
      } 
      // console.log(key, keyCode, BACKSPACE, DELETE, keyIsDown(DELETE));
    }
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
          this.toggleSide(c, this.lastClicked);
        }
        else if (isClickedGrid 
          && r >= 0 && r < params.rows && rValid
          && c >= 0 && c < params.cols && cValid){
          if (this.isFront()){
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
    if (this.isInside(mX, mY)){
      this.drag = {
        sRot: this.rotY, sX: mX, sY: mY, eX: mX, eY: mY, didDrag: false};
    }
  }

  mouseDragged(mX, mY){
    if (this.drag){
      this.drag.eX = mX;
      this.drag.eY = mY;
      this.drag.didDrag = this.drag.didDrag || mX !== this.drag.sX;
      this.processDrag();
    }
  }

  mouseReleased(){
    this.drag = false;
  }
}
