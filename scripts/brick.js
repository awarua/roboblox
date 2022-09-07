class Brick {
  constructor(fTile, bTile, center) {
    this.fTile = fTile
    this.bTile = bTile
    this.frontTile = fTile.drawingData;
    this.backTile = bTile.drawingData;
    this.center = center;
    this.steps = 15;
    this.frontPoints = this.findPoints(this.frontTile)
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

  display(viewer, tileSize) {
    this.displayLoft(viewer, tileSize);
    
    // Translate and draw front tile
    viewer.push();    
    viewer.translate(0, 0, tileSize / 2);
    this.displayTile(viewer, this.frontTile, tileSize, false)

    // Translate and draw the back tile (relative to front)
    viewer.push();
    viewer.translate(tileSize, 0, -tileSize);
    this.displayTile(viewer, this.backTile, tileSize, true)
    viewer.pop();
    viewer.pop();
  }

  displayTile(viewer, drawingData, tileSize, flip) {
    viewer.push();
    viewer.noStroke();
    viewer.fill(255);
    viewer.stroke(200);
    viewer.strokeWeight(1);
    viewer.scale(tileSize, tileSize, tileSize);
    viewer.ambientMaterial(255);

    if (flip) {
      viewer.rotateY(180)
    }

    viewer.beginShape();

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
          viewer.vertex(x, y);
      } else if (pathType == 'C' && params.length == 6) {
          if (pathParts.length == 2 && j == 1) {
            let x = pathParts[0].params[4]
            let y = pathParts[0].params[5]
            viewer.vertex(x, y)
          } else {
            let x = drawingData[i].start.x
            let y = drawingData[i].start.y
            viewer.vertex(x, y)
          }
          let a = params[0]
          let b = params[1]
          let c = params[2]
          let d = params[3]
          let e = params[4]
          let f = params[5]
          viewer.bezierVertex(a, b, c, d, e, f);
        }
      }
    }

    viewer.endShape(viewer.CLOSE);
    viewer.pop();
  }

  displayLoft(viewer, tileSize) {
    viewer.push();
    viewer.scale(tileSize, tileSize, tileSize);
    viewer.ambientMaterial(20, 20, 20);
    viewer.noStroke();

    let maxPoints = viewer.max(this.backPoints.length, this.frontPoints.length);

    for (let pointIdx = 0; pointIdx < maxPoints; pointIdx++) {
      let nextPointIdx = pointIdx + 1;
      if (nextPointIdx >= maxPoints) {
        nextPointIdx = 0;
      }

      let a = this.frontPoints[pointIdx];
      let b = this.backPoints[pointIdx];
      let c = this.frontPoints[nextPointIdx];
      let d = this.backPoints[nextPointIdx];

      viewer.beginShape();
      viewer.vertex(a.x, a.y, a.z);
      viewer.vertex(b.x, b.y, b.z);
      viewer.vertex(c.x, c.y, c.z);
      viewer.endShape(viewer.CLOSE);

      viewer.beginShape();
      viewer.vertex(b.x, b.y, b.z);
      viewer.vertex(c.x, c.y, c.z);
      viewer.vertex(d.x, d.y, d.z);
      viewer.endShape(viewer.CLOSE);

      if (pointIdx % 3 == 0){
        viewer.push();
        viewer.strokeWeight(tileSize / 250);
        viewer.stroke(255, 100);
        viewer.line(a.x, a.y, a.z, b.x, b.y, b.z);
        viewer.pop();
      }
    }
    viewer.pop();
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
        for (let u = 0; u <= this.steps; u++) {
          let t = u / this.steps;

          let a = drawingData[i].start.x;
          let b = drawingData[i].pathParts[0].params[0];
          let c = drawingData[i].start.y;
          let d = drawingData[i].pathParts[0].params[1];

          let bezPointX = p1.bezierPoint(a, a, b, b, t);
          let bezPointY = p1.bezierPoint(c, c, d, d, t);
          let point = p1.createVector(bezPointX, bezPointY);
          points.push(point);
        }
      }

      // if the path is a curve with no splits
      if (drawingData[i].pathType == 'CURVE' 
        && drawingData[i].pathParts.length == 1) {

        // finds points for curve 
        for (let u = 0; u <= this.steps; u++) {

          let t = u / this.steps;
          let a = drawingData[i].start.x;
          let b = drawingData[i].pathParts[0].params[0];
          let c = drawingData[i].pathParts[0].params[2];
          let d = drawingData[i].pathParts[0].params[4];

          let a2 = drawingData[i].start.y;
          let b2 = drawingData[i].pathParts[0].params[1];
          let c2 = drawingData[i].pathParts[0].params[3];
          let d2 = drawingData[i].pathParts[0].params[5];

          let bezPointX = p1.bezierPoint(a, b, c, d, t);
          let bezPointY = p1.bezierPoint(a2, b2, c2, d2, t);

          let point = p1.createVector(bezPointX, bezPointY);
          points.push(point);
        }
      }

      // when the curve has more then two paths divide steps between them
      if (drawingData[i].pathType == 'CURVE' 
          && drawingData[i].pathParts.length == 2) {

        let a = drawingData[i].pathParts.length;
        this.splitSteps = this.steps / a;

        //for every pathPart in a path
        for (let j = 0; j < drawingData[i].pathParts.length; j++) {

          if (j == 0) {
            for (let u = 0; u <= this.splitSteps; u++) {

              let t = u / this.splitSteps;
              let a = drawingData[i].start.x
              let b = drawingData[i].pathParts[j].params[0]
              let c = drawingData[i].pathParts[j].params[2]
              let d = drawingData[i].pathParts[j].params[4]

              let a2 = drawingData[i].start.y
              let b2 = drawingData[i].pathParts[j].params[1]
              let c2 = drawingData[i].pathParts[j].params[3]
              let d2 = drawingData[i].pathParts[j].params[5]

              let bezPointX = p1.bezierPoint(a, b, c, d, t)
              let bezPointY = p1.bezierPoint(a2, b2, c2, d2, t)

              let point = p1.createVector(bezPointX, bezPointY)
              points.push(point);
            }
          }
          if (j == 1) {
            // finds points for curve 
            for (let u = 0; u <= this.splitSteps; u++) {
              let t = u / this.splitSteps;
              let a = drawingData[i].pathParts[0].params[4]
              let b = drawingData[i].pathParts[j].params[0]
              let c = drawingData[i].pathParts[j].params[2]
              let d = drawingData[i].pathParts[j].params[4]

              let a2 = drawingData[i].pathParts[0].params[5]
              let b2 = drawingData[i].pathParts[j].params[1]
              let c2 = drawingData[i].pathParts[j].params[3]
              let d2 = drawingData[i].pathParts[j].params[5]

              let bezPointX = p1.bezierPoint(a, b, c, d, t)
              let bezPointY = p1.bezierPoint(a2, b2, c2, d2, t)

              let point = p1.createVector(bezPointX, bezPointY)
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
      let t = (this.steps + 1) * 2
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