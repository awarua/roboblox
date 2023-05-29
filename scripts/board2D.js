class Board2D {
  constructor({x, y, width, height, board, isVisible, label}){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.board = board;
    this.isVisible = isVisible;
    this.label = label;

    // this.loftColor = color(20, 20, 20);
    this.voidColor = color(80, 80, 80);
    this.darkStroke = color(40, 40, 40);  
    this.bgColor = color(40, 40, 50);  
    this.tileColor = color(255);
    this.labelColor = color(255, 150);

    this.margin = 35;
    this.lastClicked = null;
    this.showLabel = true;

    // These fields will be set up in the setupGraphics function.
    // For now, just initialize with some sensible defaults.
    this.marginL = 0;
    this.marginT = 0;
    this.tileSize = 100;
    this.scaleFactor = 1;
    this.g = null;  

    // Set up the graphics. This depends on the number of 
    // rows and collumns, so will need to be redone if that changes.
    this.setupGraphics();

    // console.log({w: this.width, h: this.height, gW: this.g.width, gH: this.g.height, mL: this.marginL, mT: this.marginT});
  }

  setupGraphics(){
    let maxTileW = (this.width - (2 * this.margin)) / params.cols;
    let maxTileH = (this.height - (2 * this.margin)) / params.rows;

    let [shortSide,   divisions  ] = maxTileW < maxTileH ? 
        [this.width,  params.cols] : 
        [this.height, params.rows] ;

    this.tileSize = shortSide / divisions;
    this.scaleFactor = (shortSide - 2 * this.margin) / shortSide;

    let graphicsW = this.margin * 2 + this.tileSize * 
      params.cols * this.scaleFactor;
    let graphicsH = this.margin * 2 + this.tileSize *
      params.rows * this.scaleFactor;

    // The margin between the left and right sides and where the edges
    // of the 'g' object will be.
    this.marginL = (this.width - graphicsW) / 2;
    this.marginT = (this.height - graphicsH) / 2;

    this.g = createGraphics(graphicsW, graphicsH);
  }
  
  show() {
    // if (!this.noLoop){
      // console.log(this.domParentId, 'draw()', 'lastClicked', this.lastClicked);
      push();
      this.g.push();
      // this.g.background(0);
      this.g.clear();
      this.g.translate(this.g.width / 2, this.g.height / 2);
      this.g.scale(this.scaleFactor);
      this.g.translate(
        -this.tileSize * params.cols / 2, 
        -this.tileSize * params.rows / 2
      );

      this.displayTiles();

      // this.g.stroke(0, 255, 255);
      // this.g.line(0, 20, this.g.width, 20);
      // this.g.translate(this.g.width / 2, this.g.height / 2);
      // this.g.scale(this.scaleFactor);
      // this.g.translate(
      //   -this.tileSize * params.cols / 2, 
      //   -this.tileSize * params.rows / 2
      // );

      this.displayGrid();
      this.displayLastClicked();

      // this.g.fill(255, 0, 0);
      // this.g.text(this.domParentId, 20, 20);
      this.g.pop();

      if (this.showLabel){
        this.g.push();
        this.g.fill(this.labelColor);
        this.g.textAlign(LEFT, TOP);
        this.g.text(this.label, this.margin, this.g.height - this.margin + 6);
        this.g.pop();
      }

      noStroke();
      fill(this.bgColor);
      translate(this.x, this.y);
      rect(0, 0, this.width, this.height);

      // Visual debug, show the margins
      // fill(255, 0, 0);
      // console.log(this.marginT);
      // rect(0, 0, this.width, this.marginT);
      // rect(0, 0, this.marginL, this.height);

      // Center the graphics object on the area of the board
      imageMode(CENTER);
      image(this.g, this.width / 2 , this.height / 2);
      pop();
      // sketch2DBoard.noLoop();
      // this.noLoop = true;
    // }
  }

  // Iterate over the tiles in the board and display them
  displayTiles() {
    for (let c = 0; c < params.cols; c++){
      for (let r = 0; r < params.rows; r++){
        // Draw the tile (if one has been placed)
        if (this.board.getTile(c, r) >= 0){
          let n = this.board.getTile(c, r);
          let x = c * this.tileSize + (this.tileSize / 2);
          let y = r * this.tileSize + (this.tileSize / 2);

          this.g.noStroke();
          this.g.fill(this.tileColor);
          tiles[n].display(x, y, this.g, this.tileSize);

          // Display the tile number at the top left corner.
          // this.g.push();
          // this.g.fill(255, 0, 0);
          // this.g.textSize(this.tileSize / 5);
          // this.g.text(n, x - this.tileSize / 2, 
          //   y - this.tileSize / 2 + this.tileSize / 5);
          // this.g.pop();
        }
      }
    }
  }

  displayGrid() {
    this.g.push();
    this.g.strokeWeight(1);
    this.g.stroke(100, 200);
    for (let c = 0; c < params.cols + 1; c++) {
      this.g.line(c * this.tileSize, 0, 
        c * this.tileSize, params.rows * this.tileSize);
    }
    for (let r = 0; r < params.rows + 1; r++) {
      this.g.line(0, r * this.tileSize, 
        params.cols * this.tileSize, r * this.tileSize);
    }
    this.g.pop();
  }

  displayLastClicked() {
    if (this.lastClicked){
      this.g.push();
      this.g.stroke(200, 200, 255);
      this.g.noFill();
      // this.g.fill(255, 0, 0);
      let x = this.lastClicked.c * this.tileSize;
      let y = this.lastClicked.r * this.tileSize;
      this.g.square(x, y, this.tileSize);
      this.g.pop();

      let n = this.getCurrentTileNumber();
      tiles[n].showUI(x, y, this.g, this.tileSize);
    }
  }
            
  // Returns a copy of the current board
  getBoard() {
    return this.board;
  }
            
  // Returns true if a given point is inside the canvas
  isInside(x, y) {
    let {gX, gY} = this.toGCoords(x, y);
    return gX > 0 && gX < this.g.width 
      && gY > 0 && gY < this.g.height;
  }

  // Convert a given x, y to coordinates within 'g'
  toGCoords(x, y) {
    return {
      gX: x - (this.x + this.marginL),
      gY: y - (this.y + this.marginT),
    };
  }

  getCurrentTileNumber() {
    if (this.lastClicked){
      return this.getTileNumber(this.lastClicked);
    }
    return null;
  }

  getTileNumber(position) {
    return this.board.getTileNumber(position);
  }    

  setVisible(newIsVisible) {
    // console.log('Board2D.setVisible', newIsVisible, 
    //   this.isVisible, this.domParentId);
    this.isVisible = newIsVisible;
    // TODO - Do this in canvas only...

    // let domParent = select(domParentId);
    // if (this.isVisible){
    //   domParent.elt.parentElement.parentElement.classList.remove('hidden');
    // } else {
    //   lastClicked = null;
    //   domParent.elt.parentElement.parentElement.classList.add('hidden');
    // }
  }  
  
  //////////////////////////////////////////////////////////////////////////
  // Event handlers
  // 

  keyPressed() {
    if (lastClicked && this.isVisible){
      if (keyCode == UP_ARROW){
        lastClicked.r = max(lastClicked.r - 1, 0);
      } else if (keyCode == DOWN_ARROW){
        lastClicked.r = min(lastClicked.r + 1, params.rows - 1);
      } else if (keyCode == LEFT_ARROW){
        lastClicked.c = max(lastClicked.c - 1, 0);
      } else if (keyCode == RIGHT_ARROW){
        lastClicked.c = min(lastClicked.c + 1, params.cols - 1);
      } else if (key == '1'){
        this.board.toggleSide(0, this.lastClicked);
      } else if (key == '2'){
        this.board.toggleSide(1, this.lastClicked);
      } else if (key == '3'){
        this.board.toggleSide(2, this.lastClicked);
      } else if (key == '4'){
        this.board.toggleSide(3, this.lastClicked);
      } else if (key == '5'){
        this.board.toggleSide(4, this.lastClicked);
      } else if (key == '6'){
        this.board.toggleSide(5, this.lastClicked);
      } else if (key == '7'){
        this.board.toggleSide(6, this.lastClicked);
      } else if (key == '8'){
        this.board.toggleSide(7, this.lastClicked);
      }
      // this.noLoop = false;
      return false;
    }
  }

  // Process mouse clicks
  mouseClicked(mX, mY) {

    // Only respond if inside the area of the graphics object.
    if (this.isInside(mX, mY) && this.isVisible) {

      // Translate mX, mY into 'g' coordinates
      let {gX, gY} = this.toGCoords(mX, mY);

      // console.log(`  mc: ${this.label} is inside`, {mX, mY, gX, gY});

      // Figure out the margin between the top/left edge of the graphics
      // object and where the tiles are actually drawn. This is the
      // margin that allows for the ui buttons to be drawn.
      // TODO: I think I can just use 'this.margin' instead?
      let gLMargin = (this.g.width -
        (params.cols * this.tileSize * this.scaleFactor)) / 2;

      let gTMargin = (this.g.height - 
        (params.rows * this.tileSize * this.scaleFactor)) / 2;

      let scaledX = (gX - gLMargin) / this.scaleFactor;
      let scaledY = (gY - gTMargin) / this.scaleFactor;

      // Calculate the row and column index
      let c = floor(scaledX / this.tileSize);
      let r = floor(scaledY / this.tileSize);
  
      // Just to be doubly-sure, use the constrain function to make sure the index is valid
      c = constrain(c, 0, params.cols - 1);
      r = constrain(r, 0, params.rows - 1);
  
      // console.log({
      //   mX, gX, gXMargin: gLMargin, scaledX,
      //   mY, gY, gYMargin: gTMargin, scaledY,
      //   tileSize: this.tileSize, 
      //   scaleFactor: this.scaleFactor,
      //   r, c,
      // }, r, c);

      // Before we go ahead and set the new lastClicked tile, check if we've 
      // clicked on a tile that was already selected. In that case, we should
      // check to see if we need to toggle a side.
      if (this.lastClicked){
        let n = this.getCurrentTileNumber();
        let lastClickedX = this.lastClicked.c * this.tileSize;
        let lastClickedY = this.lastClicked.r * this.tileSize;

        // If one of the sides is clicked, then figure out which one
        // And toggle that side for this tile and it's neighbor.
        let sideClicked = tiles[n].getSideClicked(
          scaledX, scaledY, lastClickedX, lastClickedY, this.tileSize);
        if (sideClicked >= 0){
          // console.log('in last clicked tile. s:', sideClicked);
          this.board.toggleSide(sideClicked, this.lastClicked);

          // In this case, lastClicked should stay as it is.
        } else {
          // Then set the new lastClicked. We use the else statement for the 
          // case when the user clicks a button over an adjoining tile. In 
          // such cases we do not want to change the lastClicked (see above)
          this.lastClicked = {c, r};
        }
      } else {
        // Set the new lastClicked (there was no previous)
        this.lastClicked = {c, r};  
      }

      // this.noLoop = false;
    } else {
      this.lastClicked = null;
      // this.noLoop = false;
    }
  }
}