function makeBoard(domParentId, _app, _board, hideAfter, initialTile, _label){
  console.log('make2DBoard', domParentId, _app, _board, hideAfter, initialTile, _label);

  return (sketch2DBoard) => {
    let board = _board;
    let lastClicked = null;
    let tileSize = _app.masterTileSize;
    let scaleFactor = 1;
    let margin = 35;
    let isVisible = true;
    let label = _label;
    let showLabel = true;
  
    sketch2DBoard.setup = () => {
      // Get the parent dom element and figure out width
      let domParent = sketch2DBoard.select(domParentId);
      let mainDiv = sketch2DBoard.select('#main-area');
      let w = domParent.width;
      // debugger;
      // let t = domParent.elt.offsetTop + domParent.elt.offsetParent.offsetTop;
      let h = mainDiv.height; // - t;

      // console.log('makeBoard', 'w', w, 't', t, 'h', h, 'mainDiv.h', mainDiv.height);

      let sideL = sketch2DBoard.min(w, h);

      tileSize = sideL / _app.params.cols;
      scaleFactor = (sideL - 2 * margin) / sideL;

      let canvasW = margin * 2 + tileSize * _app.params.cols * scaleFactor;
      let canvasH = h;

      // if (w < h){
      //   canvasHeight = margin * 2 + tileSize * _app.params.rows * scaleFactor;
      // } else {
      //   canvasWidth = margin
      // }

      // canvasW = 100;
      // canvasH = 100;
      
      let cnv = sketch2DBoard.createCanvas(canvasW, canvasH);
      cnv.parent(domParent);

      if (typeof(initialTile) != "undefined" && initialTile !== null){
        board.fill(initialTile);        
      } else {
        board.fillRandomly();
      }

      // Hide the board if asked to.
      if (hideAfter){
        sketch2DBoard.setVisible(false);
      }

      sketch2DBoard.noLoop();
    };
  
    sketch2DBoard.draw = () => {
      // console.log(domParentId, 'draw()', 'lastClicked', lastClicked);
      sketch2DBoard.push();
      sketch2DBoard.background(0);
      sketch2DBoard.translate(sketch2DBoard.width / 2, sketch2DBoard.height / 2);
      sketch2DBoard.scale(scaleFactor);
      sketch2DBoard.translate(-tileSize * _app.params.cols / 2, -tileSize * _app.params.rows / 2);

      sketch2DBoard.displayTiles();

      // s.stroke(0, 255, 255);
      // s.line(0, 20, s.width, 20);
      // s.translate(s.width / 2, s.height / 2);
      // s.scale(scaleFactor);
      // s.translate(-tileSize * _app.params.cols / 2, -tileSize * _app.params.rows / 2);
      sketch2DBoard.displayGrid();

      sketch2DBoard.displayLastClicked();
      // s.fill(255, 0, 0);
      // s.text(domParentId, 20, 20);
      sketch2DBoard.pop();

      if (showLabel){
        sketch2DBoard.push();
        sketch2DBoard.fill(255, 150);
        sketch2DBoard.textAlign(sketch2DBoard.LEFT, sketch2DBoard.TOP);
        sketch2DBoard.text(label, margin, sketch2DBoard.height - margin + 6);
        sketch2DBoard.pop();
      }
      sketch2DBoard.noLoop();
    };

    // Iterate over the tiles in the board and display them
    sketch2DBoard.displayTiles = () => {
      for (let c = 0; c < _app.params.cols; c++){
        for (let r = 0; r < _app.params.rows; r++){
          // Draw the tile (if one has been placed)
          if (board.getTile(c, r) >= 0){
            let n = board.getTile(c, r);
            let x = c * tileSize + (tileSize / 2);
            let y = r * tileSize + (tileSize / 2);

            sketch2DBoard.noStroke();
            sketch2DBoard.fill(255);
            _app.tiles[n].display(x, y, sketch2DBoard, tileSize);

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

    sketch2DBoard.displayGrid = () => {
      sketch2DBoard.push();
      sketch2DBoard.strokeWeight(1);
      sketch2DBoard.stroke(100, 200);
      for (let c = 0; c < _app.params.cols + 1; c++) {
        sketch2DBoard.line(c * tileSize, 0, c * tileSize, _app.params.rows * tileSize);
      }
      for (let r = 0; r < _app.params.rows + 1; r++) {
        sketch2DBoard.line(0, r * tileSize, _app.params.cols * tileSize, r * tileSize);
      }
      sketch2DBoard.pop();
    };

    sketch2DBoard.displayLastClicked = () => {
      if (lastClicked){
        sketch2DBoard.push();
        sketch2DBoard.stroke(200, 200, 255);
        sketch2DBoard.noFill();
        // s.fill(255, 0, 0);
        let x = lastClicked.c * tileSize;
        let y = lastClicked.r * tileSize;
        sketch2DBoard.square(x, y, tileSize);
        sketch2DBoard.pop();

        let n = sketch2DBoard.getCurrentTileNumber() 
        _app.tiles[n].showUI(x, y, sketch2DBoard, tileSize);
      }
    };
              
    // Returns a copy of the current board
    sketch2DBoard.getBoard = () => {
      return board;
    }
              
    // Returns true if a given point is inside the canvas
    sketch2DBoard.isInside = (x, y) => {
      return x > 0 && x < sketch2DBoard.width && y > 0 && y < sketch2DBoard.height;
    };

    sketch2DBoard.getCurrentTileNumber = () => {
      if (lastClicked){
        return sketch2DBoard.getTileNumber(lastClicked);
      }
      return null;
    }

    sketch2DBoard.getTileNumber = (position) => {
      return board.getTileNumber(position);
    }    

    sketch2DBoard.setVisible = (newIsVisible) => {
      // console.log('s.setVisible', newIsVisible, isVisible, domParentId);
      isVisible = newIsVisible;
      let domParent = sketch2DBoard.select(domParentId);
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

    sketch2DBoard.keyPressed = () => {
      if (lastClicked && isVisible){
        if (sketch2DBoard.keyCode == sketch2DBoard.UP_ARROW){
          lastClicked.r = sketch2DBoard.max(lastClicked.r - 1, 0);
        } else if (sketch2DBoard.keyCode == sketch2DBoard.DOWN_ARROW){
          lastClicked.r = sketch2DBoard.min(lastClicked.r + 1, _app.params.rows - 1);
        } else if (sketch2DBoard.keyCode == sketch2DBoard.LEFT_ARROW){
          lastClicked.c = sketch2DBoard.max(lastClicked.c - 1, 0);
        } else if (sketch2DBoard.keyCode == sketch2DBoard.RIGHT_ARROW){
          lastClicked.c = sketch2DBoard.min(lastClicked.c + 1, _app.params.cols - 1);
        } else if (sketch2DBoard.key == '1'){
          board.toggleSide(0, lastClicked);
        } else if (sketch2DBoard.key == '2'){
          board.toggleSide(1, lastClicked);
        } else if (sketch2DBoard.key == '3'){
          board.toggleSide(2, lastClicked);
        } else if (sketch2DBoard.key == '4'){
          board.toggleSide(3, lastClicked);
        } else if (sketch2DBoard.key == '5'){
          board.toggleSide(4, lastClicked);
        } else if (sketch2DBoard.key == '6'){
          board.toggleSide(5, lastClicked);
        } else if (sketch2DBoard.key == '7'){
          board.toggleSide(6, lastClicked);
        } else if (sketch2DBoard.key == '8'){
          board.toggleSide(7, lastClicked);
        }
        sketch2DBoard.loop();
        return false;
      }
    }

    sketch2DBoard.mouseClicked = () => {
      // console.log(domParentId, s.mouseX, s.mouseY, 
      //  `${s.isInside(s.mouseX, s.mouseY)}`);

      // console.log(isVisible, s.isInside(s.mouseX, s.mouseY), 
      //   scaleFactor, tileSize, tileSize * scaleFactor, s.width);

      if (sketch2DBoard.isInside(sketch2DBoard.mouseX, sketch2DBoard.mouseY) && isVisible) {
        // Take account of the scale factor
        let xMargin = (sketch2DBoard.width - (_app.params.cols * tileSize * scaleFactor)) / 2;
        let yMargin = (sketch2DBoard.height - (_app.params.rows * tileSize * scaleFactor)) / 2;

        let scaledX = (sketch2DBoard.mouseX - xMargin) / scaleFactor;
        let scaledY = (sketch2DBoard.mouseY - yMargin) / scaleFactor;

        // console.log(s.mouseX, xMargin, scaledX);

        // Calculate the row and column index
        let c = sketch2DBoard.floor(scaledX / tileSize);
        let r = sketch2DBoard.floor(scaledY / tileSize);
    
        // Just to be doubly-sure, use the constrain function to make sure the index is valid
        c = sketch2DBoard.constrain(c, 0, _app.params.cols - 1);
        r = sketch2DBoard.constrain(r, 0, _app.params.rows - 1);
    
        // If it is over the last clicked tile, first check that it's not
        // over one of that tile's UI elements
        if (lastClicked){
          let n = sketch2DBoard.getCurrentTileNumber();
          let x = lastClicked.c * tileSize;
          let y = lastClicked.r * tileSize;

          // If one of the sides is clicked, then figure out which one
          // And toggle that side for this tile and it's neighbor.
          let sideClicked = _app.tiles[n].sideClicked(
            scaledX, scaledY, x, y, sketch2DBoard, tileSize);
          if (sideClicked >= 0){
            // console.log('in last clicked tile. s:', sideClicked);
            board.toggleSide(sideClicked, lastClicked);
          } else {
            lastClicked = {c, r};
          }
        } else {
          lastClicked = {c, r};
        }
    
        sketch2DBoard.loop();
        return false;
      } else {
        lastClicked = null;
        sketch2DBoard.loop();
      }
    }; 
  }
}