class Brick {

  constructor(fTile, bTile, center, size) {

    this.fTile = fTile
    this.bTile = bTile

    this.frontTile = fTile.drawingData;
    this.backTile = bTile.drawingData;


    //     for (let i = 0; i < this.backTile.length; i++) {
    //       for (let j = 0; j < this.backTile[i].pathParts.length; j++) {

    //         if (this.backTile[i].pathParts[j].pathType === 'L') {

    //           for (let l = 0; l < this.backTile[i].pathParts[j].params.length; l++) {
    //             let center = 1
    //             this.backTile[i].pathParts[j].params[l] = (center - this.backTile[i].pathParts[j].params[l]) + center
    //           }

    //         } else {

    //           for (let l = 0; l < this.backTile[i].pathParts[j].params.length; l = l + 2) {
    //             let center = 0.5
    //             this.backTile[i].pathParts[j].params[l] = (center - this.backTile[i].pathParts[j].params[l]) + center
    //           }
    //         }
    //       }
    //     }




    this.center = center;
    this.size = size
    this.steps = 5
    this.frontPoints = this.findPoints(this.frontTile)

    let flip = true
    this.backPoints = this.findPoints(this.backTile, flip)

    // sets the z location for the points 
    let l = this.frontPoints.length
    for (let i = 0; i < l; i++) {
      this.frontPoints[i].z = ((this.size / 2) / this.size) - 0.01
    }
    let k = this.backPoints.length
    for (let i = 0; i < k; i++) {
      this.backPoints[i].z = ((-this.size / 2) / this.size) + 0.01
    }


  }


  display() {
    viewer.page.push();
    viewer.page.translate(0, 0, this.size / 2);
    this.displayTile(this.frontTile)

    viewer.page.translate(this.size, 0, -this.size);

    viewer.page.push();

    let flip = true
    this.displayTile(this.backTile, flip)
    viewer.page.pop();

    viewer.page.pop();
  }


  loft() {
    viewer.page.push();
    viewer.page.translate(this.center.x, this.center.y);
    viewer.page.scale(this.size, this.size, this.size);
    //viewer.page.noStroke();


    viewer.page.strokeWeight(0.5);
    viewer.page.stroke(50);


    viewer.page.fill(255);



    viewer.page.lightFalloff(0.09, 0.001, 0)
    viewer.page.pointLight(255, 255, 255, this.center.x - 500, this.center.y - 300, this.center.z + 40)


    let q = (this.backPoints.length + this.frontPoints.length) / 2
    for (let i = 0; i < q; i++) {

      viewer.page.beginShape()

      let a = i + 1
      if (a >= q) {
        a = i
      }
      viewer.page.vertex(this.frontPoints[i].x, this.frontPoints[i].y, this.frontPoints[i].z)
      viewer.page.vertex(this.backPoints[i].x, this.backPoints[i].y, this.backPoints[i].z)

      viewer.page.vertex(this.backPoints[a].x, this.backPoints[a].y, this.backPoints[a].z)
      viewer.page.vertex(this.frontPoints[a].x, this.frontPoints[a].y, this.frontPoints[a].z)


      viewer.page.endShape(CLOSE)
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

          let bezPointX = bezierPoint(a, a, b, b, t);
          let bezPointY = bezierPoint(c, c, d, d, t);
          let point = createVector(bezPointX, bezPointY);
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

          let bezPointX = bezierPoint(a, b, c, d, t);
          let bezPointY = bezierPoint(a2, b2, c2, d2, t);

          let point = createVector(bezPointX, bezPointY);
          points.push(point);
        }
      }

      // when the curve has more then two pats devide steps between them
      if (drawingData[i].pathType == 'CURVE' && drawingData[i].pathParts.length == 2) {


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

              let bezPointX = bezierPoint(a, b, c, d, t)
              let bezPointY = bezierPoint(a2, b2, c2, d2, t)

              let point = createVector(bezPointX, bezPointY)
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

      // this loop takes the first 2 segment points so they can be added to the front of the reveresed array
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

  displayTile(drawingData, flip) {

    viewer.page.push();
    viewer.page.translate(this.center.x, this.center.y, 0);
    viewer.page.scale(this.size, this.size);
    // viewer.page.strokeWeight(10 / this.size);
    viewer.page.stroke('red');
    viewer.page.fill(255);
    //viewer.page.noStroke();

    // //display circle on front points 
    // viewer.page.push();
    // viewer.page.noStroke();
    // viewer.page.fill(0, 255, 0);
    // for (let i = 0; i < this.frontPoints.length; i++) {
    //   let x = this.frontPoints[i].x
    //   let y = this.frontPoints[i].y
    //   viewer.page.circle(x, y, 0.1)
    // }
    // viewer.page.pop();
    if (flip) {
      viewer.page.rotateY(180)
    }

    viewer.page.beginShape();
    let p = drawingData.length
    for (let i = 0; i < p; i++) {
      let l = drawingData[i].pathParts.length
      for (let j = 0; j < l; j++) {

        // set a vertext for the line path
        if (drawingData[i].pathParts[j].partType == 'L' && drawingData[i].pathParts[j].params.length == 2) {

          let x = drawingData[i].pathParts[j].params[0]
          let y = drawingData[i].pathParts[j].params[1]
          viewer.page.vertex(x, y);


        } else if (drawingData[i].pathParts[j].partType == 'C' && drawingData[i].pathParts[j].params.length == 6) {

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

    viewer.page.endShape(CLOSE);
    viewer.page.pop();
  }

}