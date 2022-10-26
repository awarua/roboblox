function makeBoard(domParentId, _app, _board, hideAfter, initialTile, _label){
  console.log('makeBoard', domParentId, _app, _board, hideAfter, initialTile, _label);

  return (s) => {
    let board = _board;
    let lastClicked = null;
    let tileSize = _app.masterTileSize;
    let scaleFactor = 1;
    let margin = 35;
    let isVisible = true;
    let label = _label;
    let showLabel = true;
  
    s.setup = () => {
      // Get the parent dom element and figure out width
      let domParent = s.select(domParentId);
      let mainDiv = s.select('#main-area');
      let w = domParent.width;
      // debugger;
      // let t = domParent.elt.offsetTop + domParent.elt.offsetParent.offsetTop;
      let h = mainDiv.height; // - t;

      // console.log('makeBoard', 'w', w, 't', t, 'h', h, 'mainDiv.h', mainDiv.height);

      let sideL = s.min(w, h);

      tileSize = sideL / _app.COLS;
      scaleFactor = (sideL - 2 * margin) / sideL;

      let canvasW = margin * 2 + tileSize * _app.COLS * scaleFactor;
      let canvasH = h;

      // if (w < h){
      //   canvasHeight = margin * 2 + tileSize * _app.ROWS * scaleFactor;
      // } else {
      //   canvasWidth = margin
      // }

      // canvasW = 100;
      // canvasH = 100;
      
      let cnv = s.createCanvas(canvasW, canvasH);
      cnv.parent(domParent);

      if (typeof(initialTile) != "undefined" && initialTile !== null){
        board.fill(initialTile);        
      } else {
        board.fillRandomly();
      }

      // Hide the board if asked to.
      if (hideAfter){
        s.setVisible(false);
      }

      s.noLoop();
    };
  
    s.draw = () => {
      // console.log(domParentId, 'draw()', 'lastClicked', lastClicked);
      s.push();
      s.background(0);
      s.translate(s.width / 2, s.height / 2);
      s.scale(scaleFactor);
      s.translate(-tileSize * _app.COLS / 2, -tileSize * _app.ROWS / 2);

      s.displayTiles();

      // s.stroke(0, 255, 255);
      // s.line(0, 20, s.width, 20);
      // s.translate(s.width / 2, s.height / 2);
      // s.scale(scaleFactor);
      // s.translate(-tileSize * _app.COLS / 2, -tileSize * _app.ROWS / 2);
      s.displayGrid();

      s.displayLastClicked();
      // s.fill(255, 0, 0);
      // s.text(domParentId, 20, 20);
      s.pop();

      if (showLabel){
        s.push();
        s.fill(255, 150);
        s.textAlign(s.LEFT, s.TOP);
        s.text(label, margin, s.height - margin + 6);
        s.pop();
      }
      s.noLoop();
    };

    // Iterate over the tiles in the board and display them
    s.displayTiles = () => {
      for (let c = 0; c < _app.COLS; c++){
        for (let r = 0; r < _app.ROWS; r++){
          // Draw the tile (if one has been placed)
          if (board.getTile(c, r) >= 0){
            let n = board.getTile(c, r);
            let x = c * tileSize + (tileSize / 2);
            let y = r * tileSize + (tileSize / 2);

            s.noStroke();
            s.fill(255);
            _app.tiles[n].display(x, y, s, tileSize);

            // Display the tile number at the top left corner.
            // s.push();
            // s.fill(255, 0, 0);
            // s.textSize(tileSize / 5);
            // s.text(n, x - tileSize / 2, y - tileSize / 2 + tileSize / 5);
            // s.pop();
          }
        }
      }
    };

    s.displayGrid = () => {
      s.push();
      s.strokeWeight(1);
      s.stroke(100, 200);
      for (let c = 0; c < _app.COLS + 1; c++) {
        s.line(c * tileSize, 0, c * tileSize, _app.ROWS * tileSize);
      }
      for (let r = 0; r < _app.ROWS + 1; r++) {
        s.line(0, r * tileSize, _app.COLS * tileSize, r * tileSize);
      }
      s.pop();
    };

    s.displayLastClicked = () => {
      if (lastClicked){
        s.push();
        s.stroke(200, 200, 255);
        s.noFill();
        // s.fill(255, 0, 0);
        let x = lastClicked.c * tileSize;
        let y = lastClicked.r * tileSize;
        s.square(x, y, tileSize);
        s.pop();

        let n = s.getCurrentTileNumber() 
        _app.tiles[n].showUI(x, y, s, tileSize);
      }
    };
              
    // Returns a copy of the current board
    s.getBoard = () => {
      return board;
    }
              
    // Returns true if a given point is inside the canvas
    s.isInside = (x, y) => {
      return x > 0 && x < s.width && y > 0 && y < s.height;
    };

    s.getCurrentTileNumber = () => {
      if (lastClicked){
        return s.getTileNumber(lastClicked);
      }
      return null;
    }

    s.getTileNumber = (position) => {
      return board.getTileNumber(position);
    }    

    s.setVisible = (newIsVisible) => {
      // console.log('s.setVisible', newIsVisible, isVisible, domParentId);
      isVisible = newIsVisible;
      let domParent = s.select(domParentId);
      if (isVisible){
        domParent.elt.parentElement.parentElement.classList.remove('hidden');
      } else {
        lastClicked = null;
        domParent.elt.parentElement.parentElement.classList.add('hidden');
      }
    }  
  

    //////////////////////////////////////////////////////////////////////////
    // Event handlers
    // 

    s.keyPressed = () => {
      if (lastClicked && isVisible){
        if (s.keyCode == s.UP_ARROW){
          lastClicked.r = s.max(lastClicked.r - 1, 0);
        } else if (s.keyCode == s.DOWN_ARROW){
          lastClicked.r = s.min(lastClicked.r + 1, _app.ROWS - 1);
        } else if (s.keyCode == s.LEFT_ARROW){
          lastClicked.c = s.max(lastClicked.c - 1, 0);
        } else if (s.keyCode == s.RIGHT_ARROW){
          lastClicked.c = s.min(lastClicked.c + 1, _app.COLS - 1);
        } else if (s.key == '1'){
          board.toggleSide(0, lastClicked);
        } else if (s.key == '2'){
          board.toggleSide(1, lastClicked);
        } else if (s.key == '3'){
          board.toggleSide(2, lastClicked);
        } else if (s.key == '4'){
          board.toggleSide(3, lastClicked);
        } else if (s.key == '5'){
          board.toggleSide(4, lastClicked);
        } else if (s.key == '6'){
          board.toggleSide(5, lastClicked);
        } else if (s.key == '7'){
          board.toggleSide(6, lastClicked);
        } else if (s.key == '8'){
          board.toggleSide(7, lastClicked);
        }
        s.loop();
        return false;
      }
    }

    s.mouseClicked = () => {
      // console.log(domParentId, s.mouseX, s.mouseY, 
      //  `${s.isInside(s.mouseX, s.mouseY)}`);

      if (s.isInside(s.mouseX, s.mouseY) && isVisible) {
        // Take account of the scale factor
        let xMargin = s.width * (1 - scaleFactor) / 2;
        let yMargin = s.height * (1 - scaleFactor) / 2;

        let scaledX = (s.mouseX - xMargin) / scaleFactor;
        let scaledY = (s.mouseY - yMargin) / scaleFactor;

        // console.log(s.mouseX, xMargin, scaledX);

        // Calculate the row and column index
        let c = s.floor(scaledX / tileSize);
        let r = s.floor(scaledY / tileSize);
    
        // Just to be doubly-sure, use the constrain function to make sure the index is valid
        c = s.constrain(c, 0, _app.COLS - 1);
        r = s.constrain(r, 0, _app.ROWS - 1);
    
        // If it is over the last clicked tile, first check that it's not
        // over one of that tile's UI elements
        if (lastClicked){
          let n = s.getCurrentTileNumber();
          let x = lastClicked.c * tileSize;
          let y = lastClicked.r * tileSize;

          // If one of the sides is clicked, then figure out which one
          // And toggle that side for this tile and it's neighbor.
          let sideClicked = _app.tiles[n].sideClicked(
            scaledX, scaledY, x, y, s, tileSize);
          if (sideClicked >= 0){
            // console.log('in last clicked tile. s:', sideClicked);
            board.toggleSide(sideClicked, lastClicked);
          } else {
            lastClicked = {c, r};
          }
        } else {
          lastClicked = {c, r};
        }
    
        s.loop();
        return false;
      } else {
        lastClicked = null;
        s.loop();
      }
    }; 
  }
}