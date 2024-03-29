class Tile {
  constructor (num) {
    this.bgColor = color(20);
    // this.bgColor = color(80, 80, 80);

    this.openings = [];
    
    this.sides = new Array(8);
    this.vertices = new Array(8);
    this.num = num;
    this.tilePoints = [];
    
    // Arrays to store all tiles that are allowed beside this one.
    this.leftAllowed = [];
    this.rightAllowed = [];
    this.topAllowed = [];
    this.bottomAllowed = [];

    // Arrays to store all tiles that are not allowed beside this one.
    this.leftDisallowed = [];
    this.rightDisallowed = [];
    this.topDisallowed = [];
    this.bottomDisallowed = [];

    // String to store SVG code to reproduce curve.
    this.svgString = "";

    this.currentMarkCol = 0;
    this.markCols = [
      color(255, 0, 0),
      color(0, 255, 0),
      color(255, 100, 0),
      color(0, 255, 255),
    ];

    // UI properties
    this.r = 0.3;
    this.maxR = 64; // 0000000000;

    this.markCol = this.markCols[this.currentMarkCol];

    this.drawingData = [];

    for (let i = 0; i < this.sides.length; i++){
      this.sides[i] = false;
    }

    let acc = this.num;
    for (let i = this.sides.length - 1; i >= 0; i--) {
      let p = pow(2, i);
      if (acc >= p) {
        acc -= p;
        this.sides[i] = true;
      }
    }

    this.binStr = this.makeBinStr(this.sides);
    // console.log(
    //   this.num, this.binStr, parseInt(this.binStr, 2), 
    //   this.numFromSideArray(this.sides));

    this.vertices = [
      [0, 0], [0.5,   0],
      [1, 0], [  1, 0.5],
      [1, 1], [0.5,   1],
      [0, 1], [  0, 0.5],
    ];

    this.center = createVector(0.5, 0.5);
  }

  getM(tileSize){
    let scaledR = this.getR(tileSize);
    return (1 - 2 * scaledR) / 3 + scaledR / 2;    
  }

  getR(tileSize){
    return Math.min(this.r, this.maxR / tileSize)
  }

  getButtonCentres(tileSize){
    let m = this.getM(tileSize);
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

  calculateData(tileSize){
    this.calculateGroup();
    this.svgString = this.toSVGString(tileSize);
  }

  display(x, y, s, tileSize) {
    if (params.hasChanges){
      this.calculateData(tileSize);
    }

    this.drawToCanvas(x, y, s, tileSize);
  }

  makeBinStr(sideArray){
    return sideArray.map(e => e ? 1 : 0).reverse().join('');
  }

  numFromSideArray(sideArray){
    return parseInt(this.makeBinStr(sideArray), 2);
  }

  calculateGroup(){
    this.drawingData = new Array(this.sides.length);
    for (let i = 0; i < this.drawingData.length; i++){
      this.drawingData[i] = false;
    }

    // Deal with special case of tile number 255 (black tile)
    if (this.num == 255){
      for (let i = 0; i < this.vertices.length; i++){
        let endIdx = (i + 1) % this.vertices.length;
        let startVx = createVector(
          this.vertices[i][0] - this.center.x, 
          this.vertices[i][1] - this.center.y);
        let endVx = createVector(
          this.vertices[endIdx][0] - this.center.x, 
          this.vertices[endIdx][1] - this.center.y);
        startVx.setMag(0.001);
        endVx.setMag(0.001);
        startVx.add(this.center);
        endVx.add(this.center);
        let p = this.pathFromLineData([startVx, endVx]);
        p.setMarkCol(i);
        this.drawingData[i] = p;
      }
      return;
    }

    // Use the value of 'num' to draw the tile.
    let numOpenings = this.countOpenings();  
    let openingIndex = 0;
    
    for (let i = 0; i < numOpenings; i++){
      openingIndex = this.findNextOpening(openingIndex);
      let closingIndex = this.findClosing(openingIndex);

      let path = this.calculatePath(openingIndex, closingIndex, openingIndex);

      // If the path covers more than one edge, then we need to split it.
      if (path.numEdges > 1){
        let paths = this.splitPath(path, path.numEdges);
        
        //debugger;

        for (let j = 0; j < paths.length; j++){
          paths[j].setMarkCol(openingIndex + j);
          this.drawingData[(openingIndex + j) % this.drawingData.length] = paths[j];
        }
      } else {
        this.drawingData[openingIndex] = path;
      }
      
      // this data will be used to spread the loft points across the paths
      this.openings[i] = {
        numEdges : path.numEdges,  
        startIndex: openingIndex,
        endIndex:closingIndex
      } 
    }

    // Now add the straight edges in
    for (let i = 0; i < this.sides.length; i++){
      if (!this.sides[i]){
        this.drawingData[i] = this.calculateEdge(i, i, i);
      }
    }
  }

  calculatePath(oIdx, cIdx, colIdx){
    let pathData = new Path('CURVE', oIdx, cIdx, colIdx);

    if (cIdx < oIdx){
      cIdx += this.sides.length;
    }

    oIdx = oIdx % this.sides.length;
    cIdx = (cIdx + 1) % this.sides.length;
    let oVx = this.vertices[oIdx];
    let cVx = this.vertices[cIdx];

    let middleVertex = this.avgVertex(oIdx, cIdx);
    let magVec = createVector(oVx[0] - cVx[0], oVx[1] - cVx[1])
    magVec.setMag(magVec.mag() * (params.mag / 100));
    magVec.rotate(radians(params.rotation));

    // Create a vector for control point from opening edge of tile towards centre
    // Scale the control vector according to user input
    let openSideCxVec = createVector(this.center.x - oVx[0], this.center.y - oVx[1]);
    openSideCxVec.setMag(openSideCxVec.mag() * (params.sidePull / 100));
    let openSideCxVx = [oVx[0] + openSideCxVec.x, oVx[1] + openSideCxVec.y];

    pathData.addPart('C', [
      openSideCxVx[0],             openSideCxVx[1],
      middleVertex[0] + magVec.x,  middleVertex[1] + magVec.y,
      middleVertex[0],             middleVertex[1]    
    ]);

    magVec.rotate(radians(180));

    // Create a vector for control point from closing edge of tile towards centre
    // Scale the control vector according to user input
    let closeSideCxVec = createVector(this.center.x - cVx[0], this.center.y - cVx[1]);
    closeSideCxVec.setMag(
      closeSideCxVec.mag() * (params.sidePull / 100));
    let closeSideCxVx = [cVx[0] + closeSideCxVec.x, cVx[1] + closeSideCxVec.y];

    pathData.addPart('C', [
      middleVertex[0] + magVec.x, middleVertex[1] + magVec.y,  
      closeSideCxVx[0],           closeSideCxVx[1], 
      cVx[0],                     cVx[1]
    ]);

    return pathData;
  }

  calculateEdge(eIdx, colIdx){
    let path = new Path('LINE', eIdx, eIdx, colIdx);
    
    let cIdx = (eIdx + 1) % this.sides.length;
    let cVx = this.vertices[cIdx];
    path.addPart('L', [cVx[0], cVx[1]]);
    
    return path;
  }

  drawToCanvas(x, y, g, tileSize) { 
    g.push();
    g.translate(x - tileSize * this.center.x, y - tileSize * this.center.y);
    g.scale(tileSize, tileSize);
    g.push();
    g.fill(this.bgColor);
    g.square(0, 0, 1);
    g.pop();

    g.beginShape();
    
    for (let i = 0; i < this.drawingData.length; i++){
      if (this.drawingData[i]){
        this.drawingData[i].toCanvas(g);
      }
    }
    g.endShape(g.CLOSE);

    g.pop();
  }

  getSideClicked(mx, my, tx, ty, tileSize){
    // Scale the mouseX, mouseY relative to the tile's position on canvas and
    // size so that 1.0 equals the width of the tile
    let x = (mx - tx) / tileSize;
    let y = (my - ty) / tileSize;

    let scaledR = this.getR(tileSize);

    // console.log(x, y);

    let sideClicked = -1;

    // let scaledR = 

    let buttonCentres = this.getButtonCentres(tileSize);

    // Check distance to first circle
    for (let i = 0; i < buttonCentres.length; i++){
      let c = buttonCentres[i];
      if (dist(c.x, c.y, x, y) < scaledR / 2){ 
        sideClicked = i;
      }
    }

    return sideClicked;
  }

  // Return a number for the tile that we would get if we toggled the 
  // specified side on this tile.
  toggleSide(s){
    // console.log(this.sides);
    let newSides = [...this.sides];
    newSides[s] = !newSides[s];
    // console.log(newSides);

    let newN = this.numFromSideArray(newSides);
    return newN;
  }

  showUI(x, y, s, tileSize) {
    let scaledR = this.getR(tileSize);
    let scaledT = scaledR / 4.6;

    s.push();
    s.translate(x, y);
    s.scale(tileSize, tileSize);
    s.rectMode(s.CENTER);
    s.textSize(0.35);
    s.noFill();
    s.fill(150, 200);
    s.stroke(120);
    s.strokeWeight(2 / tileSize);

    // Draw each of the button centres to the screen.
    let buttonCentres = this.getButtonCentres(tileSize);
    for(let i = 0; i < buttonCentres.length; i++){
      let c = buttonCentres[i];
      s.circle(c.x, c.y, scaledR);
      s.push();
      s.noStroke();
      if (this.sides[i]){
        s.fill(255);
        s.rect(c.x, c.y, scaledT, 2.6 * scaledT);
        s.rect(c.x, c.y, 2.6 * scaledT, scaledT);
      } else {
        s.fill(0);
        s.rect(c.x, c.y, 2.6 * scaledT, scaledT);
      }
      s.pop();
    }

    s.pop();
  }

  /**
   * Output an SVG element for this tile.
   * This is used for showing the svg in the UI. 
   */
  toSVGString(tileSize){
    let margin = 0;
    let doJoin = true;
    let svgString = '<svg width="100%" viewBox="0 0 ' + (1 * tileSize) + ' ' + (1 * tileSize) + '"  '
      + 'class="bgblack" xmlns="http://www.w3.org/2000/svg">\n'
      + '<g transform="scale(' + tileSize + ' ' + tileSize + ')">';
    svgString += this.toSVGGroup(0, 0, margin, doJoin);
    svgString += '</g></svg>';
    return svgString;
  }

  toJSON(){
    return this.toJSONString();
  }

  toJSONString(){
    let retJSON = [];
    for (let i = 0; i < this.drawingData.length; i++){
      retJSON.push(this.drawingData[i].toJSONString());
    }
    return retJSON;  
  }

  /**
   * Output an SVG group element for this tile.
   * This is used for outputting the svg that is used both in
   * the UI and in the svg output.
   * @param {*} x x position the group should be placed at
   * @param {*} y y position the group should be placed at
   */
  toSVGGroup(c, r, margin, join, tileSize){
    let svgGroupString = '<g transform="translate(' + (c * (1 + margin)) + ' ' 
      + (r * (1 + margin)) + ')" stroke-width="0.01">';

    if (!join){
      svgGroupString += '<rect x="0" y="0" width="1" height="1" stroke="black" fill="none" />\n';
    }

    // if (this.num == 255){
    //   svgGroupString += '<rect x="0" y="0" width="' + tileSize * scale + '" height="' 
    //     + tileSize * scale + '" stroke="none" fill="black" />';
    // } else {
    //   svgGroupString += '<rect x="0" y="0" width="' + tileSize * scale + '" height="' 
    //     + tileSize * scale + '" stroke="none" fill="white" />';
    // }

    for (let i = 0; i < this.drawingData.length; i++){
      if (this.drawingData[i]){
        if (join){
          svgGroupString += this.drawingData[i].toSVGString((i > 0), 
            (i < this.drawingData.length - 1), 'red', 'white');
        } else {
          svgGroupString += this.drawingData[i].toSVGString();
        }
      }
    }

    svgGroupString += '</g>';

    return svgGroupString;
  }

  avgVertex(o, c){
    let oIdx = o % this.sides.length;
    let cIdx = c % this.sides.length;

    let oV = this.vertices[oIdx];
    let cV = this.vertices[cIdx];

    let mP = [(oV[0] + cV[0]) / 2, (oV[1] + cV[1]) / 2];

    let vec = createVector(this.center.x - mP[0], this.center.y - mP[1]);

    vec.setMag(vec.mag() * (params.pull / 100));

    return [mP[0] + vec.x, mP[1] + vec.y];
  }

  findNextOpening(searchFrom){

    // If we are starting on an opening, search for next wall.
    if (this.sides[searchFrom]){
      for (let i = 0; i < this.sides.length && this.sides[searchFrom]; i++){
          searchFrom = (searchFrom + 1) % this.sides.length;
      }
    }
    
    // Find the next opening after the wall
    for (let i = 0; i < this.sides.length && !this.sides[searchFrom]; i++){
      searchFrom = (searchFrom + 1) % this.sides.length;
    }
    
    return searchFrom;
  }

  findClosing(searchFrom){
    for (let i = 0; i < this.sides.length && this.sides[searchFrom]; i++){
      searchFrom = (searchFrom + 1) % this.sides.length;
    }
    return (searchFrom + (this.sides.length - 1)) % this.sides.length;
  }

  countOpenings(){
    let numOpenings = 0;
    let lastFound = this.sides[0];
    
    for (let i = 0; i < this.sides.length; i++){
      // Deal with special case of first position
      if (i == 0 && !this.sides[i] && this.sides[this.sides.length - 1]){
        numOpenings += 1;
      }
      else if (!this.sides[i] && this.sides[i] != lastFound){
        numOpenings += 1;    
      }
      lastFound = this.sides[i];
    }
  
    return numOpenings;
    
  }

  getNextWallOpening(lastWallOpening){  
    let isOpen = this.sides[lastWallOpening];
    
    // If the last wall opening is not open, then count forward until
    // we find that
    for (let i = 0; i < this.sides.length && !this.sides[lastWallOpening]; i++){
      lastWallOpening = (lastWallOpening + 1) % this.sides.length;
    }
    
    let nextWallOpening = lastWallOpening;

    for (let i = 0; i < this.sides.length && this.sides[nextWallOpening]; i++){
      nextWallOpening = (nextWallOpening + 1) % this.sides.length;
    }

    return nextWallOpening;
  }

  splitPath(path, numPieces){
    
    // numSplits
    // how many times the path is split up 
    //
    
    let numSplits = numPieces - 1;

    let a = this.splitPathDataToPieces(path.start, path.pathParts[0], numPieces);
    let startB = createVector(path.pathParts[0].params[4], path.pathParts[0].params[5]);
    let b = this.splitPathDataToPieces(startB, path.pathParts[1], numPieces);
    

      let paths = [];

    if (numPieces % 2 == 0){
      for (let i = 0; i < a.length; i++){
        paths.push(this.pathFromBezierData(a[i]));
      }
      for (let i = 0; i < b.length; i++){
        paths.push(this.pathFromBezierData(b[i]));
      }
    } else {
      for (let i = 0; i < a.length; i++){
        paths.push(this.pathFromBezierData(a[i]));
      }
      paths[paths.length - 1].addPart('C', [b[0][1].x, b[0][1].y, b[0][2].x, b[0][2].y, b[0][3].x, b[0][3].y]);
      for (let i = 1; i < b.length; i++){
        paths.push(this.pathFromBezierData(b[i]));
      }
    }

    // Convert the splits to paths.
    return paths;
  }

  splitPathDataToPieces(v0, pathPart, numHalfPieces){
    let numSplits = floor((numHalfPieces - 1) / 2);

    let a;
    let b;

    let start = v0;
    let pathParams = pathPart.params;

    let splits = [];

    if (numHalfPieces == 2){
      return [[v0, 
        createVector(pathParams[0], pathParams[1]),
        createVector(pathParams[2], pathParams[3]),
        createVector(pathParams[4], pathParams[5])
      ]];
    }

    for (let i = 0; i < numSplits; i += 1){
      let incThisSplit = 1 / ((numHalfPieces / 2) - i);

      [a, b] = this.splitPathData(start, pathParams, incThisSplit);
      splits.push(a);
      start = b[0];
      pathParams = [b[1].x, b[1].y, b[2].x, b[2].y, b[3].x, b[3].y];
    }

    splits.push(b);
    return splits;
  }

  splitPathData(v0, pathParams, t){
    let v1 = createVector(pathParams[0], pathParams[1]);
    let v2 = createVector(pathParams[2], pathParams[3]);
    let v3 = createVector(pathParams[4], pathParams[5]);  
    let v4 = p5.Vector.lerp(v0, v1, t);
    let v5 = p5.Vector.lerp(v1, v2, t);
    let v6 = p5.Vector.lerp(v2, v3, t);
    let v7 = p5.Vector.lerp(v4, v5, t);
    let v8 = p5.Vector.lerp(v5, v6, t);
    let v9 = p5.Vector.lerp(v7, v8, t);
    
    var firsthalf =   [v0, v4, v7, v9];
    var secondhalf =  [v9, v8, v6, v3];

    return [
      firsthalf, secondhalf
    ];
  }

  pathFromBezierData(data){
    let p = new Path('CURVE', 0, 0, 0);
    p.start = data[0];
    p.addPart('C', [data[1].x, data[1].y, data[2].x, data[2].y, data[3].x, data[3].y])
    return p;
  }

  pathFromLineData(data){
    let p = new Path('LINE', 0, 0, 0);
    p.start = data[0];
    p.addPart('L', [data[1].x, data[1].y]);
    return p;
  }

  checkCompatability(other){
    // Check if other bottom matches this top
    if (other.bottom() == this.top()){
      // Only add it if it is not already added.
      if(this.topAllowed.indexOf(other.num) == -1) {
        this.topAllowed.push(other.num);
      } 
    } else {
      if (this.topDisallowed.indexOf(other.num) == -1) {
        this.topDisallowed.push(other.num);
      }
    }

    // Check if other right matches this left
    if (other.right() == this.left()){
      if (this.leftAllowed.indexOf(other.num) == -1) {
        this.leftAllowed.push(other.num);
      }
    } else {
      if (this.leftDisallowed.indexOf(other.num) == -1) {
        this.leftDisallowed.push(other.num);
      }
    }

    // Check if other top matches this bottom
    if (other.top() == this.bottom()){
      if (this.bottomAllowed.indexOf(other.num) == -1) {
        this.bottomAllowed.push(other.num);
      } 
    } else {
      if (this.bottomDisallowed.indexOf(other.num) == -1) {
        this.bottomDisallowed.push(other.num);
      }
    }

    // Check if other left matches this right
    if (other.left() == this.right()){
      if (this.rightAllowed.indexOf(other.num) == -1){
        this.rightAllowed.push(other.num);
      } 
    } else {
      if (this.rightDisallowed.indexOf(other.num) == -1) {
        this.rightDisallowed.push(other.num);
      }
    }
  }

  top(){
    let t = 0;
    if (this.sides[1]){
      t = 10; 
    }
    if (this.sides[0]){
      t += 1;
    }
    return t;
  }

  right(){
    let r = 0;
    if (this.sides[2]){
      r = 10; 
    }
    if (this.sides[3]){
      r += 1;
    }
    return r;
  }
    
  bottom(){
    let b = 0;
    if (this.sides[4]){
      b = 10; 
    }
    if (this.sides[5]){
      b += 1;
    }
    return b;
  }
    
  left(){
    let l = 0;
    if (this.sides[7]){
      l = 10; 
    }
    if (this.sides[6]){
      l += 1;
    }
    return l;
  }
}
