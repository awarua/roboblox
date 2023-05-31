class Board {

  // Initialize the board with zero tiles
  constructor(rows, cols){
    this.cols = cols;
    this.rows = rows;
    this._data = new Array(this.rows);
    for (let r = 0; r < this.rows; r++){
      this._data[r] = new Array(this.cols).fill(0);
    }
    this.listeners = [];
  }

  // Return the tile number at the provided col, row
  getTile(c, r){
    return this._data[r][c];
  }

  // Set the tile number at the provided col, row
  setTile(c, r, n, skipNeighbors){
    this._data[r][c] = n;

    // console.log('setTile()', c, r, n, skipNeighbors);

    // Only check the neighbours if asked
    if (!skipNeighbors){
      let thisTile = tiles[n];
      let tileSides = tiles[n].sides;

      // Correct top neighbour if present
      if (r > 0){
        let topNum = this.getTile(c, r - 1);
        let topTile = tiles[topNum];
        let [tbl, tbr] = [topTile.sides[5], topTile.sides[4]];
        let [tl, tr] = [thisTile.sides[0], thisTile.sides[1]];

        if (tbl !== tl){
          this.toggleNeighborSide(0, {c, r});
        } 
        if (tbr !== tr){
          this.toggleNeighborSide(1, {c, r});
        }
      }

      // Correct bottom neighbor if present
      if (r < this.rows - 1){
        let bottomNum = this.getTile(c, r + 1);
        let bottomTile = tiles[bottomNum];
        let [btl, btr] = [bottomTile.sides[0], bottomTile.sides[1]];
        let [bl, br] = [thisTile.sides[5], thisTile.sides[4]];

        if (btl !== bl){
          this.toggleNeighborSide(5, {c, r});
        } 
        if (btr !== br){
          this.toggleNeighborSide(4, {c, r});
        }
      } 

      // Correct left neighbor if present
      if (c > 0){
        let leftNum = this.getTile(c - 1, r);
        let leftTile = tiles[leftNum];
        let [lrt, lrb] = [leftTile.sides[2], leftTile.sides[3]];
        let [lt, lb] = [thisTile.sides[7], thisTile.sides[6]];

        if (lrt !== lt){
          this.toggleNeighborSide(7, {c, r});
        } 
        if (lrb !== lb){
          this.toggleNeighborSide(6, {c, r});
        }
      } 

      // Correct right neighbor if present
      if (c < this.cols - 1){
        let rightNum = this.getTile(c + 1, r);
        let rightTile = tiles[rightNum];
        let [rlt, rlb] = [rightTile.sides[7], rightTile.sides[6]];
        let [rt, rb] = [thisTile.sides[2], thisTile.sides[3]];

        if (rlt !== rt){
          this.toggleNeighborSide(2, {c, r});
        } 
        if (rlb !== rb){
          this.toggleNeighborSide(3, {c, r});
        }
      }
    }

    // Alert any listeners that the data has changed.
    this.alertListeners();
  }

  // Fill the board with the specified tile (don't care about neighbors)
  fill(tileNum, skipNeighbors) {
    for (let c = 0; c < this.cols; c++){
      for (let r = 0; r < this.rows; r++){
        this.setTile(c, r, tileNum, skipNeighbors);
      }
    }
    return this;   
  }

  // Fill the board with random tiles (making sure they all fit)
  fillRandomly() {
    this.fill(0, true);
    for (let c = 0; c < this.cols; c++){
      for (let r = 0; r < this.rows; r++){
        // Toggle the top and left sides
        for (let sideNum of [0, 1, 6, 7]){
          if (random() < 0.5){
            this.toggleSide(sideNum, {c, r});
          }
        }

        // On the last column, toggle right side
        if (c == this.cols - 1){
          for (let sideNum of [2, 3]){
            if (random() < 0.5){
              this.toggleSide(sideNum, {c, r});
            }
          }  
        }

        // On the last row, toggle bottom side
        if (r == this.rows - 1){
          for (let sideNum of [5, 4]){
            if (random() < 0.5){
              this.toggleSide(sideNum, {c, r});
            }
          }  
        }
      }
    }
    return this;
  }

  toggleSide(sideNum, position, skipNeighbors) {
    let n = this.getTile(position.c, position.r);

    // Toggle the tile side and the neighbor tile's side
    let newN = tiles[n].toggleSide(sideNum);
    this.setTile(position.c, position.r, newN, true);

    if (!skipNeighbors){
      this.toggleNeighborSide(sideNum, position);
    }
  }

  toggleNeighborSide(sideNum, position){
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

    // Check that the neighbor is on the board
    let neighbor = neighbors[sideNum];
    let nc = position.c + neighbor.dc;
    let nr = position.r + neighbor.dr;

    if (nc >= 0 && nc < this.cols && nr >= 0 && nr < this.rows){
      let neighborN = this.getTile(nc, nr);
      let newNeighborN = tiles[neighborN].toggleSide(
        neighbor.sideNum);   
      this.setTile(nc, nr, newNeighborN, true);      
    }
  }

  // Adjust tiles so they can stand up!
  // This is an attempt to apply a simple heuristic to ensure that the
  // board will stand up. At least one of either side 4 or 5 must be present
  stabilize(){
    for (let r = 0; r < this.rows; r++){
      for (let c = 0; c < this.cols; c++){
        let t = tiles[this.getTile(c, r)]; 
        if (t.sides[4] && t.sides[5]){
          let sideNum = (Math.random() < 0.5) ? 4 : 5;
          this.toggleSide(sideNum, {c, r});
        }
      }
    }
  }

  toJSON(){
    let json = new Array(this.cols);
    for (let c = 0; c < this.cols; c++){
      json[c] = new Array(this.rows);
      for (let r = 0; r < this.rows; r++){
        json[c][r] = this.getTile(c, r);
      }
    }
    return json;
  }   

  // Register a listener that will be called when the board changes
  // cbk, the callback. Should send a copy of the data
  registerListener(cbk){
    this.listeners.push(cbk);
  }

  // Alerts any listeners that the data has changed
  alertListeners(lineNo){
    for (let cbk of this.listeners){
      cbk(lineNo);
    }
  }
}