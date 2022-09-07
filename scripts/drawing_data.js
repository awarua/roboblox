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
    this.start = app.p1.createVector(
      app.tiles[0].vertices[oIdx][0], app.tiles[0].vertices[oIdx][1]);

    this.markCols = Array(8);
    app.p1.colorMode(app.p1.HSB, 360, 100, 100, 100);
    for (let i = 0; i < this.markCols.length; i++){
      let c = app.p1.color((360 / 8) * i, 100, 100);
      if (i % 2 == 0){
        this.markCols[i] = c;
      } else {
        this.markCols[(i + 4) % this.markCols.length] = c;
      }
    }
    app.p1.colorMode(app.p1.RGB, 255, 255, 255, 255);
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

  toCanvas(s){
    s.vertex(this.start.x, this.start.y);
    for (let i = 0; i < this.pathParts.length; i++){
      this.pathParts[i].toCanvas(s);
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
  toCanvas(s) {
    if (this.partType == 'L' && this.params.length == 2){
      s.vertex(this.params[0], this.params[1]);
     
    } else if (this.partType == 'C' && this.params.length == 6){
      s.bezierVertex(this.params[0], this.params[1], this.params[2], 
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

}