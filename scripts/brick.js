class Brick {
  constructor(fTile, bTile, center, g) {
    this.fTile = fTile;
    this.bTile = bTile;
    this.center = center;
    this.g = g;

    this.loftColor = color(120, 120, 120);
    this.loftStroke = color(20, 20, 20);

    this.frontTile = fTile.drawingData;
    this.backTile = bTile.drawingData;
    this.frontPoints = this.findPoints(this.frontTile, false)
    this.backPoints = this.findPoints(this.backTile, true);

    // sets the z location for the points 
    let l = this.frontPoints.length
    for (let i = 0; i < l; i++) {
      this.frontPoints[i].z = 0.5 - 0.001;
    }
    let k = this.backPoints.length
    for (let i = 0; i < k; i++) {
      this.backPoints[i].z = -0.5 + 0.001;
    }
  }

  display(tileSize) {
    this.displayLoft(tileSize);
    // this.displayPoints(tileSize);
    
    // Translate and draw front tile
    this.g.push();
    this.g.translate(0, 0, tileSize / 2);
    this.g.fill(255, 255, 0);
    this.displayTile(this.frontTile, tileSize, false)
    this.g.pop();

    // Translate and draw the back tile (relative to front)
    this.g.push();
    this.g.translate(tileSize, 0, -tileSize / 2);
    this.g.rotateY(radians(180));
    this.g.fill(0, 255, 255);
    this.displayTile(this.backTile, tileSize, true)
    this.g.pop();

  }

  displayTile(drawingData, tileSize, flip) {
    this.g.push();
    // this.g.noStroke();
    // this.g.fill(255);
    // this.g.stroke(200);
    // this.g.strokeWeight(1);
    this.g.scale(tileSize);
    this.g.ambientMaterial(255, 255, 255);

    if (flip) {
      this.g.rotateY(radians(180))   
      // this.g.translate(-1, 0, 0); 
      this.g.scale(-1, 1, 1);  
    }

    this.g.beginShape();

    for (let i = 0; i < drawingData.length; i++) {
      let pathParts = drawingData[i].pathParts;
      for (let j = 0; j < pathParts.length; j++) {
        let pathPart = pathParts[j];
        let pathType = pathPart.partType;
        let params = pathPart.params;

        // set a vertex for the line path
        if (pathType == 'L' && params.length == 2) {
          let x = params[0]
          let y = params[1]
          this.g.vertex(x, y);
      } else if (pathType == 'C' && params.length == 6) {
          if (pathParts.length == 2 && j == 1) {
            let x = pathParts[0].params[4]
            let y = pathParts[0].params[5]
            this.g.vertex(x, y)
          } else {
            let x = drawingData[i].start.x
            let y = drawingData[i].start.y
            this.g.vertex(x, y)
          }
          let a = params[0]
          let b = params[1]
          let c = params[2]
          let d = params[3]
          let e = params[4]
          let f = params[5]
          this.g.bezierVertex(a, b, c, d, e, f);
        }
      }
    }

    this.g.endShape(this.g.CLOSE);
    this.g.pop();
  }

  displayPoints(tileSize){
    this.g.push();
    this.g.scale(tileSize);
    this.g.noStroke();

    for (let i = 0; i < this.frontPoints.length; i++){
      let p = this.frontPoints[i];
      this.g.push();
      this.g.fill(0, 255, 255);
      this.g.translate(p.x, p.y, p.z);
      this.g.box(0.1);

      // Draw the number of the point.
      let tY = i % 2 ? 0.025 : -0.025;
      this.g.push();
      this.g.translate(0, tY, 0.06);
      this.g.fill(0);
      this.g.text(i, 0, 0, 0);
      this.g.pop();

      this.g.pop();
    }

    for (let i = 0; i < this.backPoints.length; i++){
      let p = this.backPoints[i];
      this.g.push();
      this.g.fill(255, 255, 0);
      this.g.translate(p.x, p.y, p.z);
      this.g.box(0.1);

      // Draw the number of the point.
      let tY = i % 2 ? 0.025 : -0.025;
      this.g.push();
      this.g.translate(0, tY, -0.06);
      this.g.rotateY(radians(180));
      this.g.fill(0);
      this.g.text(i, 0, 0, 0);
      this.g.pop();
      
      this.g.pop();
    }

    this.g.pop();
  }

  displayLoft(tileSize) {
    this.g.push();
    this.g.scale(tileSize);
    this.g.ambientMaterial(this.loftColor);
    this.g.noStroke();
    // this.g.stroke(255, 100);

    let maxPoints = max(this.backPoints.length, this.frontPoints.length);

    for (let pointIdx = 0; pointIdx < maxPoints; pointIdx++) {
      let frontPointIdx = pointIdx;
      if (frontPointIdx >= this.frontPoints.length){
        frontPointIdx = 0;
      }
      let backPointIdx = pointIdx;
      if (backPointIdx >= this.backPoints.length){
        backPointIdx = 0;
      }

      let nextFrontPointIdx = pointIdx + 1;
      if (nextFrontPointIdx >= this.frontPoints.length){
        nextFrontPointIdx = 0;
      }
      let nextBackPointIdx = pointIdx + 1;
      if (nextBackPointIdx >= this.backPoints.length){
        nextBackPointIdx = 0;
      }

      let a = this.frontPoints[frontPointIdx];
      let b = this.backPoints[backPointIdx];
      let c = this.frontPoints[nextFrontPointIdx];
      let d = this.backPoints[nextBackPointIdx];

      // Draw triangle a, b, c
      this.g.beginShape();
      this.g.vertex(a.x, a.y, a.z);
      this.g.vertex(b.x, b.y, b.z);
      this.g.vertex(c.x, c.y, c.z);
      this.g.endShape(CLOSE);

      // Drag triangle b, c, d
      this.g.beginShape();
      this.g.vertex(b.x, b.y, b.z);
      this.g.vertex(c.x, c.y, c.z);
      this.g.vertex(d.x, d.y, d.z);
      this.g.endShape(CLOSE);

      // Every third point, draw a stroked line
      // if (pointIdx % 3 == 0){
        this.g.push();
        this.g.strokeWeight(tileSize / 250);
        this.g.stroke(this.loftStroke);
        this.g.line(a.x, a.y, a.z, b.x, b.y, b.z);
        this.g.pop();
      // }
    }

    // // Draw the outline of the front points.
    // this.g.push();
    // this.g.stroke(0, 255, 0);
    // this.g.strokeWeight(4);
    // this.g.beginShape();
    // for (let i = 0; i < this.frontPoints.length; i++){
    //   let p = this.frontPoints[i];
    //   this.g.vertex(p.x, p.y, p.z);
    // }
    // this.g.endShape(CLOSE);
    // this.g.pop();

    // // Draw the outline of the back points.
    // this.g.push();
    // this.g.stroke(255, 0, 0);
    // this.g.strokeWeight(4);
    // this.g.beginShape();
    // for (let i = 0; i < this.backPoints.length; i++){
    //   let p = this.backPoints[i];
    //   this.g.vertex(p.x, p.y, p.z);
    // }
    // this.g.endShape(CLOSE);
    // this.g.pop();


    this.g.pop();
  }

  findPoints(drawingData, flip) {
    let points = []

    // for every path of drawingData
    let l = drawingData.length
    for (let i = 0; i < l; i++) {

      // if the pathPart is a line
      if (drawingData[i].pathType == 'LINE') {

        // stores front points under the index number of the parent path

        // finds x and y points on line
        for (let u = 0; u <= params.detail; u++) {
          let t = u / params.detail;

          let a = drawingData[i].start.x;
          let b = drawingData[i].pathParts[0].params[0];
          let c = drawingData[i].start.y;
          let d = drawingData[i].pathParts[0].params[1];

          let bezPointX = bezierPoint(a, a, b, b, t);
          let bezPointY = bezierPoint(c, c, d, d, t);
          let point = createVector(bezPointX, bezPointY);
          points.push(point);
        }
      }

      // if the path is a curve with no splits
      if (drawingData[i].pathType == 'CURVE' 
        && drawingData[i].pathParts.length == 1) {

        // finds points for curve 
        for (let u = 0; u <= params.detail; u++) {

          let t = u / params.detail;
          let a = drawingData[i].start.x;
          let b = drawingData[i].pathParts[0].params[0];
          let c = drawingData[i].pathParts[0].params[2];
          let d = drawingData[i].pathParts[0].params[4];

          let a2 = drawingData[i].start.y;
          let b2 = drawingData[i].pathParts[0].params[1];
          let c2 = drawingData[i].pathParts[0].params[3];
          let d2 = drawingData[i].pathParts[0].params[5];

          let bezPointX = bezierPoint(a, b, c, d, t);
          let bezPointY = bezierPoint(a2, b2, c2, d2, t);

          let point = createVector(bezPointX, bezPointY);
          points.push(point);
        }
      }

      // when the curve has more then two paths divide steps between them
      if (drawingData[i].pathType == 'CURVE' 
          && drawingData[i].pathParts.length == 2) {

        let a = drawingData[i].pathParts.length;
        let splitSteps = params.detail / a;

        //for every pathPart in a path
        for (let j = 0; j < drawingData[i].pathParts.length; j++) {

          if (j == 0) {
            for (let u = 0; u <= splitSteps; u++) {

              let t = u / splitSteps;
              let a = drawingData[i].start.x
              let b = drawingData[i].pathParts[j].params[0]
              let c = drawingData[i].pathParts[j].params[2]
              let d = drawingData[i].pathParts[j].params[4]

              let a2 = drawingData[i].start.y
              let b2 = drawingData[i].pathParts[j].params[1]
              let c2 = drawingData[i].pathParts[j].params[3]
              let d2 = drawingData[i].pathParts[j].params[5]

              let bezPointX = bezierPoint(a, b, c, d, t)
              let bezPointY = bezierPoint(a2, b2, c2, d2, t)

              let point = createVector(bezPointX, bezPointY)
              points.push(point);
            }
          }
          if (j == 1) {
            // finds points for curve 
            for (let u = 0; u <= splitSteps; u++) {
              let t = u / splitSteps;
              let a = drawingData[i].pathParts[0].params[4]
              let b = drawingData[i].pathParts[j].params[0]
              let c = drawingData[i].pathParts[j].params[2]
              let d = drawingData[i].pathParts[j].params[4]

              let a2 = drawingData[i].pathParts[0].params[5]
              let b2 = drawingData[i].pathParts[j].params[1]
              let c2 = drawingData[i].pathParts[j].params[3]
              let d2 = drawingData[i].pathParts[j].params[5]

              let bezPointX = bezierPoint(a, b, c, d, t)
              let bezPointY = bezierPoint(a2, b2, c2, d2, t)

              let point = createVector(bezPointX, bezPointY)
              points.push(point);
            }
          }
        }
      }
    }

    if (flip) {

      let hold = []
      let center = 0.5
      // this loop swaps x value around the center axis of the tile
      for (let i = 0; i < points.length; i++) {
        points[i].x = (center - points[i].x) + center
      }

      // this loop takes the first 2 segment points so they can be added to the front of the reversed array
      let t = (params.detail + 1) * 2
      for (let j = 0; j < t; j++) {
        hold.push(points.shift(j))
      }

      points.reverse();

      // add the hold array back to the front of points
      for (let l = 0; l < hold.length; l++) {
        points.unshift(hold[l])
      }
    }
    return points
  }
}