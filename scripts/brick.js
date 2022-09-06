class Brick {

  constructor(fTile, bTile, center) {

    this.fTile = fTile
    this.bTile = bTile

    this.frontTile = fTile.drawingData;
    this.backTile = bTile.drawingData;
    this.center = center;
    this.steps = 5
    this.frontPoints = this.findPoints(this.frontTile)

    let flip = true
    this.backPoints = this.findPoints(this.backTile, flip)

    // sets the z location for the points 
    let l = this.frontPoints.length
    for (let i = 0; i < l; i++) {
      this.frontPoints[i].z = 0.5 - 0.01;
    }
    let k = this.backPoints.length
    for (let i = 0; i < k; i++) {
      this.backPoints[i].z = -0.5 + 0.01;
    }
  }

  display(viewer, tileSize) {
    viewer.page.push();
    // Translate so that the tile is centred
    // viewer.page.translate(-tileSize / 2, -tileSize / 2, 0)
    
    // Translate and draw front tile
    viewer.page.translate(0, 0, tileSize / 2);
    this.displayTile(viewer, this.frontTile, tileSize, false)


    viewer.page.translate(tileSize, 0, -tileSize);

    viewer.page.push();
    let flip = true
    this.displayTile(viewer, this.backTile, tileSize, flip)
    viewer.page.pop();

    viewer.page.pop();
  }

  loft(viewer, tileSize) {
    viewer.page.push();
    // viewer.page.translate(-tileSize / 2, -tileSize / 2, 0);

    // viewer.page.translate(this.center.x, this.center.y);
    viewer.page.scale(tileSize, tileSize, tileSize);

    if (WIREFRAME){
      viewer.page.stroke(100);
      viewer.page.strokeWeight(0.5);
      viewer.page.noFill();  
    } else {
      viewer.page.stroke(255, 200);
      viewer.page.strokeWeight(0.5);
      viewer.page.fill(255);  
    }

    // This makes the lofting render dark
    viewer.page.lightFalloff(tileSize / 2, 0.001, 0)
    viewer.page.pointLight(
      255, 255, 255, 
      this.center.x - 500, this.center.y - 300, this.center.z + 40)

    let q = (this.backPoints.length + this.frontPoints.length) / 2

    for (let i = 0; i < q; i++) {
      viewer.page.beginShape()

      let a = i + 1;
      if (a >= q) {
        a = i;
      }

      viewer.page.vertex(
        this.frontPoints[i].x, this.frontPoints[i].y, this.frontPoints[i].z)
      viewer.page.vertex(
        this.backPoints[i].x, this.backPoints[i].y, this.backPoints[i].z)

      viewer.page.vertex(
        this.backPoints[a].x, this.backPoints[a].y, this.backPoints[a].z)
      viewer.page.vertex(
        this.frontPoints[a].x, this.frontPoints[a].y, this.frontPoints[a].z)

      viewer.page.endShape(viewer.page.CLOSE)
    }
    viewer.page.pop();
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
      if (drawingData[i].pathType == 'CURVE' && drawingData[i].pathParts.length == 1) {

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

  displayTile(viewer, drawingData, tileSize, flip) {
    viewer.page.push();
    // viewer.page.translate(this.center.x, this.center.y, 0);


    // TODO: Hack - not sure why I have to scale x differently front and back
    //       The value 1.7 is also arrived at by trial and error, so probably
    //       fragile to changes in the sketch. 
    // let xScale = flip ? 1.7 * tileSize : tileSize;
    viewer.page.scale(tileSize, tileSize, 0);

    if (WIREFRAME){
      viewer.page.stroke(255);
      viewer.page.strokeWeight(3); 
      viewer.page.fill(255, 200);  
    } else {
      viewer.page.stroke(100);
      viewer.page.strokeWeight(1);
      viewer.page.fill(255);      
    }

    if (flip) {
      viewer.page.rotateY(180)
    }

    viewer.page.beginShape();
    let p = drawingData.length
    for (let i = 0; i < p; i++) {
      let l = drawingData[i].pathParts.length
      for (let j = 0; j < l; j++) {

        // set a vertex for the line path
        if (drawingData[i].pathParts[j].partType == 'L' 
            && drawingData[i].pathParts[j].params.length == 2) {
          let x = drawingData[i].pathParts[j].params[0]
          let y = drawingData[i].pathParts[j].params[1]
          viewer.page.vertex(x, y);
        } else if (drawingData[i].pathParts[j].partType == 'C' 
                   && drawingData[i].pathParts[j].params.length == 6) {
          if (drawingData[i].pathParts.length == 2 && j == 1) {
            let x = drawingData[i].pathParts[0].params[4]
            let y = drawingData[i].pathParts[0].params[5]
            viewer.page.vertex(x, y)
          } else {
            let x = drawingData[i].start.x
            let y = drawingData[i].start.y
            viewer.page.vertex(x, y)
          }

          let a = drawingData[i].pathParts[j].params[0]
          let b = drawingData[i].pathParts[j].params[1]
          let c = drawingData[i].pathParts[j].params[2]
          let d = drawingData[i].pathParts[j].params[3]
          let e = drawingData[i].pathParts[j].params[4]
          let f = drawingData[i].pathParts[j].params[5]
          viewer.page.bezierVertex(a, b, c, d, e, f);
        }
      }
    }

    viewer.page.endShape(viewer.page.CLOSE);
    viewer.page.pop();
  }
}