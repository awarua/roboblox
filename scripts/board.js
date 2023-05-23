class Board {

  // Initialize the board with zero tiles
  constructor(rows, cols, tilesFn){
    this.cols = cols;
    this.rows = rows;
    this.tilesFn = tilesFn;
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
  setTile(c, r, n){
    this._data[r][c] = n;
    // Alert any listeners that the data has changed.
    this.alertListeners();
  }

  // Return a copy of the internal data for this array
  // copyData(){
  //   return [...this._data];
  // }

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

  // Fill the board with the specified tile (don't care about neighbors)
  fill(tileNum) {
    for (let c = 0; c < this.cols; c++){
      for (let r = 0; r < this.rows; r++){
        this.setTile(c, r, tileNum);
      }
    }      
  }

  // Fill the board with random tiles (making sure they all fit)
  fillRandomly() {
    for (let c = 0; c < this.cols; c++){
      for (let r = 0; r < this.rows; r++){
        for (let i = 0; i < 8; i++){
          let sideNum = Math.floor(Math.random() * 8);
          this.toggleSide(sideNum, {c, r});
        }
      }
    }
  }

  // Adjust tiles so they can stand up!
  // This is an attempt to apply a simple heuristic to ensure that the
  // board will stand up. At least one of either side 4 or 5 must be present
  stabilize(){
    for (let r = 0; r < this.rows; r++){
      for (let c = 0; c < this.cols; c++){
        let t = this.tilesFn()[this.getTile(c, r)]; 
        if (t.sides[4] && t.sides[5]){
          let sideNum = (Math.random() < 0.5) ? 4 : 5;
          this.toggleSide(sideNum, {c, r});
        }
      }
    }
  }

  getTileNumber(position) {
    return this.getTile(position.c, position.r);
  }    

  toggleSide(sideNum, position) {
    let n = this.getTileNumber(position);
    if (position){
      n = this.getTile(position.c, position.r);
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
    let newN = this.tilesFn()[n].toggleSide(sideNum);
    this.setTile(position.c, position.r, newN);

    // Check that the neighbor is on the board
    let neighbor = neighbors[sideNum];
    let nc = position.c + neighbor.dc;
    let nr = position.r + neighbor.dr;

    if (nc >= 0 && nc < this.cols && nr >= 0 && nr < this.rows){
      let neighborN = this.getTile(nc, nr);
      let newNeighborN = this.tilesFn()[neighborN].toggleSide(
        neighbor.sideNum);   
      this.setTile(nc, nr, newNeighborN);      
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
}