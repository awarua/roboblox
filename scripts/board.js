function makeBoard(domParentId, rows, cols, hideAfter, initialTile){
  return (s) => {
    let board;
    let lastClicked = null;
    let tileSize = masterTileSize;
    let toggles; 
    let scaleFactor = 1;
    let margin = 20;
  
    s.setup = () => {
      // Get the parent dom element and figure out width
      let domParent = s.select(domParentId);
      let w = domParent.width;
      tileSize = w / cols;
      scaleFactor = (w - 2 * margin) / w;

      let canvasHeight = margin * 2 + tileSize * rows * scaleFactor;
      let cnv = s.createCanvas(w, canvasHeight);
      cnv.parent(domParent);

      board = new Array(cols);
      toggles = new Array(cols);
      s.initializeBoard();

      if (typeof(initialTile) != "undefined"){
        s.fillBoard(initialTile);        
      } else {
        s.fillBoardRandomly();
      }

      // Hide the board if asked to.
      if (hideAfter){
        domParent.elt.parentElement.parentElement.classList.add('hidden');
      }

      s.noLoop();
    };
  
    s.draw = () => {
      // console.log(domParentId, 'draw()', 'lastClicked', lastClicked);
      s.push();
      s.background(0);
      s.translate(s.width / 2, s.height / 2);
      s.scale(scaleFactor);
      s.translate(-tileSize * cols / 2, -tileSize * rows / 2);

      s.displayTiles();

      // s.stroke(0, 255, 255);
      // s.line(0, 20, s.width, 20);
      // s.translate(s.width / 2, s.height / 2);
      // s.scale(scaleFactor);
      // s.translate(-tileSize * cols / 2, -tileSize * rows / 2);
      s.displayGrid();

      s.displayLastClicked();
      // s.fill(255, 0, 0);
      // s.text(domParentId, 20, 20);
      s.pop();
      s.noLoop();
    };

    // Iterate over the tiles in the board and display them
    s.displayTiles = () => {
      for (let c = 0; c < cols; c++){
        for (let r = 0; r < rows; r++){
          // Draw the tile (if one has been placed)
          if (board[c][r] >= 0){
            let n = board[c][r];
            let x = c * tileSize + (tileSize / 2);
            let y = r * tileSize + (tileSize / 2);

            s.noStroke();
            s.fill(255);
            tiles[n].display(x, y, s, tileSize);

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
      for (let c = 0; c < cols + 1; c++) {
        s.line(c * tileSize, 0, c * tileSize, rows * tileSize);
      }
      for (let r = 0; r < rows + 1; r++) {
        s.line(0, r * tileSize, cols * tileSize, r * tileSize);
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

        let n = board[lastClicked.c][lastClicked.r];
        tiles[n].showUI(x, y, s, tileSize);
      }
    };

    // Initialize the board with zero tiles
    s.initializeBoard = () => {
      for (let c = 0; c < cols; c++) {
        board[c] = new Array(rows);
        toggles[c] = new Array(rows);
        for (let r = 0; r < rows; r++) {
          board[c][r] = 0
          toggles[c][r] = false;
        }
      }
    }

    // Fill the board with the specified tile (don't care about neighbors)
    s.fillBoard = (tileNum) => {
      for (let c = 0; c < cols; c++){
        for (let r = 0; r < rows; r++){
          board[c][r] = tileNum;
        }
      }      
    }

    // Fill the board with random tiles (making sure they all fit)
    s.fillBoardRandomly = () => {
      for (let c = 0; c < cols; c++){
        for (let r = 0; r < rows; r++){
          for (let i = 0; i < 8; i++){
            let sideNum = s.floor(s.random(8));
            s.toggleSide(sideNum, {c, r});  
          }
        }
      }
    }

    // Adjust tiles so they can stand up!
    // This is an attempt to apply a simple heuristic to ensure that the
    // board will stand up. At least one of either side 4 or 5 must be present
    s.stabilizeBoard = () => {
      for (let r = 0; r < rows; r++){
        for (let c = 0; c < cols; c++){
          let t = tiles[board[c][r]]; 
          if (t.sides[4] && t.sides[5]){
            let sideNum = (s.random() < 0.5) ? 4 : 5;
            s.toggleSide(sideNum, {c, r});
            toggles[c][r] = true;
          } else {
              console.log(domParentId, c, r, 'ok', t.sides[4], t.sides[5]);
          };
        }
      }
    }
              
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
      return board[position.c][position.r];
    }    

    s.toggleSide = (sideNum, position) => {
      // console.log('toggleSide', sideNum, position);
      let n = s.getTileNumber(position);
      if (position){
        n = board[position.c][position.r];
      }

      // This maps the side clicked to the relevant neighbor
      // Order is important. The index corresponds to the side
      // that was clicked.
      // dc = delta-column
      // dr = delta-row
      // sideNum = side of the neighbor.
      let neighbors = [
        {dc:  0, dr: -1, sideNum: 5}, {dc:  0, dr: -1, sideNum: 4},
        {dc:  1, dr:  0, sideNum: 7}, {dc:  1, dr:  0, sideNum: 6},
        {dc:  0, dr:  1, sideNum: 1}, {dc:  0, dr:  1, sideNum: 0},
        {dc: -1, dr:  0, sideNum: 3}, {dc: -1, dr:  0, sideNum: 2},
      ];

      // Toggle the tile side and the neighbor tile's side
      let newN = tiles[n].toggleSide(sideNum);
      board[position.c][position.r] = newN;

      // Check that the neighbor is on the board
      let neighbor = neighbors[sideNum];
      let nc = position.c + neighbor.dc;
      let nr = position.r + neighbor.dr;

      if (nc >= 0 && nc < cols && nr >= 0 && nr < rows){
        let neighborN = board[nc][nr];
        let newNeighborN = tiles[neighborN].toggleSide(neighbor.sideNum);   
        board[nc][nr] = newNeighborN;      
      }
    }

    s.keyPressed = () => {
      if (lastClicked){
        if (s.keyCode == s.UP_ARROW){
          lastClicked.r = s.max(lastClicked.r - 1, 0);
        } else if (s.keyCode == s.DOWN_ARROW){
          lastClicked.r = s.min(lastClicked.r + 1, rows - 1);
        } else if (s.keyCode == s.LEFT_ARROW){
          lastClicked.c = s.max(lastClicked.c - 1, 0);
        } else if (s.keyCode == s.RIGHT_ARROW){
          lastClicked.c = s.min(lastClicked.c + 1, cols - 1);
        } else if (s.key == '1'){
          s.toggleSide(0, lastClicked);
        } else if (s.key == '2'){
          s.toggleSide(1, lastClicked);
        } else if (s.key == '3'){
          s.toggleSide(2, lastClicked);
        } else if (s.key == '4'){
          s.toggleSide(3, lastClicked);
        } else if (s.key == '5'){
          s.toggleSide(4, lastClicked);
        } else if (s.key == '6'){
          s.toggleSide(5, lastClicked);
        } else if (s.key == '7'){
          s.toggleSide(6, lastClicked);
        } else if (s.key == '8'){
          s.toggleSide(7, lastClicked);
        }
        s.loop();
        return false;
      }
    }

    s.mouseClicked = () => {
      // console.log(domParentId, s.mouseX, s.mouseY, 
      //  `${s.isInside(s.mouseX, s.mouseY)}`);

      if (s.isInside(s.mouseX, s.mouseY)) {
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
        c = s.constrain(c, 0, cols - 1);
        r = s.constrain(r, 0, rows - 1);
    
        // If it is over the last clicked tile, first check that it's not
        // over one of that tile's UI elements
        if (lastClicked){
          let n = s.getCurrentTileNumber();
          let x = lastClicked.c * tileSize;
          let y = lastClicked.r * tileSize;

          // If one of the sides is clicked, then figure out which one
          // And toggle that side for this tile and it's neighbor.
          let sideClicked = tiles[n].sideClicked(
            scaledX, scaledY, x, y, s, tileSize);
          if (sideClicked >= 0){
            // console.log('in last clicked tile. s:', sideClicked);
            s.toggleSide(sideClicked, lastClicked);
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