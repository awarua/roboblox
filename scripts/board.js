function makeBoard(domParentId, rows, cols){
  return (s) => {
    let board;
    let lastClicked = null;
  
    s.setup = () => {
      let cnv = s.createCanvas(tileSize * cols, tileSize * rows);
      cnv.parent(s.select(domParentId));

      // Initialise the board. -1 signifies no tile.
      board = new Array(cols);
      for (let c = 0; c < cols; c++) {
        board[c] = new Array(rows);
        for (let r = 0; r < rows; r++) {
          board[c][r] = 0
        }
      }

      // TODO: This is an attempt to randomise the board.
      //       It is not really working though...
      for (let c = 0; c < cols; c++){
        for (let r = 0; r < rows; r++){
          for (let i = 0; i < 8; i++){
            let sideNum = s.floor(s.random(8));
            s.toggleSide(sideNum, {c, r});  
          }
        }
      }

      s.noLoop();
    };
  
    s.draw = () => {
      // console.log(domParentId, 'draw()', 'lastClicked', lastClicked);
      s.push();
      s.background(51);
      s.displayTiles();
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
            tiles[n].display(x, y, s);
          }
        }
      }
    };

    s.displayGrid = () => {
      s.push();
      s.strokeWeight(1);
      s.stroke(100);
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
        s.stroke(255, 0, 0);
        s.noFill();
        // s.fill(255, 0, 0);
        let x = lastClicked.c * tileSize;
        let y = lastClicked.r * tileSize;
        s.square(x, y, tileSize);
        s.pop();

        let n = board[lastClicked.c][lastClicked.r];
        tiles[n].showUI(x, y, s);
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
      return board[position.c][position.r];
    }    

    s.toggleSide = (sideNum, position) => {
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
        // Calculate the row and column index
        let c = s.floor(s.mouseX / tileSize);
        let r = s.floor(s.mouseY / tileSize);
    
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
          let sideClicked = tiles[n].sideClicked(s.mouseX, s.mouseY, x, y, s);
          if (sideClicked >= 0){
            // console.log('in last clicked tile. s:', sideClicked);
            s.toggleSide(sideClicked, lastClicked);
          } else {
            lastClicked = {c, r};
          }
        } else {
          lastClicked = {c, r};
        }

        // let [allowed, 
        //   topDisallowed, leftDisallowed, rightDisallowed, bottomDisallowed] 
        //   = getAllowed(c, r);
    
        // if (isTileSelected) {
        //   // Check if the selected tile can go at this position. If not, then 
        //   // clear any neighbours that are blocking it.
        //   if (topDisallowed.indexOf(selectedTile) != -1) {
        //     board[c][r - 1] = -1;
        //   }
        //   if (leftDisallowed.indexOf(selectedTile) != -1) {
        //     board[c - 1][r] = -1;
        //   }
        //   if (rightDisallowed.indexOf(selectedTile) != -1) {
        //     board[c + 1][r] = -1;
        //   }
        //   if (bottomDisallowed.indexOf(selectedTile) != -1) {
        //     board[c][r + 1] = -1;
        //   }
    
        //   board[c][r] = selectedTile;
    
        // } else {
          // 
          // Highlight the allowed ones in the grid
          // clearGrid();
          // showAllowedInGrid(allowed);
        // }
    
        s.loop();
        return false;
      } else {
        lastClicked = null;
        // isTileSelected = false;
        // selectedTile = null;
        // clearGrid();
        s.loop();
        // backCanvas.loop();
      }
    };
 
  }

}