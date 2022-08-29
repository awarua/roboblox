

/**
 * 
 */
 class Path {
  /**
   * 
   * @param {*} dataType 
   * @param {*} params 
   * @param {*} markColIdx 
   */
  constructor(pathType, oIdx, cIdx, markColIdx){
    this.pathType = pathType;

    // Figure out the number of edges it crosses.
    this.numEdges = cIdx - oIdx + 1;

    // If it is a path that wraps around from the end of
    // the list of sides to the start, adjust the calculation
    // for the number of edges.
    if (cIdx < oIdx) {
      // TODO: Avoid hard-coding '8'. 
      this.numEdges = (((8 + cIdx) - oIdx) % 8) + 1;
      // this.numEdges = ((8 - cIdx) - oIdx) + 1;
    }

    // Figure out the start of the path from the opening vertex
    this.start = createVector(tiles[0].vertices[oIdx][0], tiles[0].vertices[oIdx][1]);

    this.markCols = Array(8);
    colorMode(HSB, 360, 100, 100, 100);
    for (let i = 0; i < this.markCols.length; i++){
      let c = color((360 / 8) * i, 100, 100);
      if (i % 2 == 0){
        this.markCols[i] = c;
      } else {
        this.markCols[(i + 4) % this.markCols.length] = c;
      }
    }
    colorMode(RGB, 255, 255, 255, 255);
    this.markColIdx = 0;
    if (typeof(markColIdx) == 'number'){
      this.markColIdx = markColIdx
    }    
    this.markCol = this.markCols[this.markColIdx];

    this.pathParts = [];

    this.markColIdx;
  }

  setMarkCol (markColIdx){
    this.markColIdx = markColIdx % this.markCols.length;
    this.markCol = this.markCols[this.markColIdx];
  }

  addPart (dataType, params){
    let part = new PathPart(dataType, params)
    this.pathParts.push(part);
  }

  toCanvas(){
    vertex(this.start.x, this.start.y);
    for (let i = 0; i < this.pathParts.length; i++){
      this.pathParts[i].toCanvas();
    }
  }

  toSVGString(joinStart, joinEnd, sCol, fCol){
    fCol = fCol || 'none';
    sCol = sCol || 'rgb(' + red(this.markCol) + ',' + green(this.markCol) + ',' + blue(this.markCol) + ')';
    let svgPathString = '';
    if (!joinStart){
      svgPathString = '<g><path stroke="' + sCol + '" fill="' + fCol 
        + '" d="M ' + this.start.x + ' ' + this.start.y + ' ';
      }
    for (let i = 0; i < this.pathParts.length; i++){
      svgPathString += this.pathParts[i].toSVGString();
    }
    if (!joinEnd){
      svgPathString += '" /></g>\n';
    }
    return svgPathString;
  }

  toJSONString(){
    let retJSON = [['M', this.start.x, this.start.y]];
    for (let i = 0; i < this.pathParts.length; i++){
      retJSON.push(this.pathParts[i].toJSONString());
    }
    return retJSON;
  }

  numCommands(){
    return this.pathParts.length;
  }

  toConsole(){
    console.log(this.pathType + ' start: ' + this.start.x + ', ' + this.start.y);
    for (let i = 0; i < this.pathParts.length; i++){
      this.pathParts[i].toConsole();
    }
  }
}

class PathPart {
  constructor(partType, params) {
    this.partType = partType;
    this.params = params;
  }

  /**
   * Draws the path to the canvas
   */
  toCanvas() {
    if (this.partType == 'L' && this.params.length == 2){
     vertex(this.params[0], this.params[1]);
     
    } else if (this.partType == 'C' && this.params.length == 6){
   bezierVertex(this.params[0], this.params[1], this.params[2], 
        this.params[3], this.params[4], this.params[5]);
      
      
      
    }
  }
  
  

  /**
   * Returns an SVG string representation of the path. 
   */
  toSVGString() {
    let svgPartString = '';
    if (this.partType == 'M' && this.params.length == 2){
      // Add a 'move to' command.
      svgPartString += 'M ' + this.params[0] + ' ' + this.params[1] + ' ';
    } else if (this.partType == 'L' && this.params.length == 2){
      svgPartString += 'L ' + this.params[0] + ' ' + this.params[1] + ' ';
    } else if (this.partType == 'C' && this.params.length == 6){
      svgPartString += 'C ' 
        + this.params[0] + ' ' + this.params[1] + ', ' 
        + this.params[2] + ' ' + this.params[3] + ', ' 
        + this.params[4] + ' ' + this.params[5] + ', ';
    }
    return svgPartString;
  }

  toJSONString(){
    let retJSON = [];
    if (this.partType == 'M' && this.params.length == 2){
      // Add a 'move to' command.
      retJSON = ['M', this.params[0], this.params[1]];
    } else if (this.partType == 'L' && this.params.length == 2){
      retJSON = ['L', this.params[0], this.params[1]];
    } else if (this.partType == 'C' && this.params.length == 6){
      retJSON = ['C', 
        this.params[0], this.params[1], 
        this.params[2], this.params[3], 
        this.params[4], this.params[5]];
    }
    return retJSON;
  }

  /**
   * Prints a representation of the path to the console.
   * Useful for debugging.
   */
  toConsole(){
    console.log(this.partType + ": " + this.params);
  }

//   /**
//    * Displays the number of this path on the canvas. 
//    * Useful for debugging. 
//    */
//   drawPathNum(pathNum, c){
//     let m = firstPoint();
//     let mx = m.x;
//     let my = m.y;

//     push();
//     translate(mx, my);
//     fill(c);

//     // Calculate angle to draw text at and text alignment to make 
//     // it more readable. 
//     let angleToCenter = atan2(my - tileSize / 2, mx - tileSize / 2);
//     let offsetX = 10;
//     textAlign(LEFT, CENTER);
//     if (abs(angleToCenter) > HALF_PI) {
//       angleToCenter += PI;
//       offsetX = -10;
//       textAlign(RIGHT, CENTER);
//     }
//     rotateZ(angleToCenter);
//     text(pathNum + ": " + this.numEdges + " edges", offsetX, 0);
//     print(1)
//     pop();
//   }

//   /**
//    * Draws all of the handles of the path to the canvas. 
//    * Useful for debugging.
//    */
//   drawHandles(p, c){
//     let pts = this.points.getHandles();

//     if (pts != null) {
//       for (let i = 0; i < pts.length; i++) {
//         let pt = pts[i];
//         fill(c);
//         text(i, pt.x, pt.y);
//       }
//     }
//   }

}