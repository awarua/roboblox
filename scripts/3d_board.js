function make3DBoard(domParentId, rows, cols){
  return (s) => {

    // let easyCam;
    // let camState = {};
    let bricks;
    let frontB;
    let backB;
    let isShowingFront = true;
    let rotation = 0;
    let rotationMomentum = 0;
    let tileSize = masterTileSize;
    let margin = 20;
    let scaleFactor = 1;
    let w;

    let viewer = {
      display: false,
      page: null,
    };
    
    s.setup = () => {
      let domParent = s.select(domParentId);
      w = domParent.width;
      // console.log(w);
      tileSize = w / cols;
      scaleFactor = (w - 2 * margin) / w;
      let canvasHeight = margin * 2 + tileSize * rows * scaleFactor;

      let cnv = s.createCanvas(tileSize * cols, canvasHeight);
      console.log('3d w', w, '3d height', canvasHeight, 
        'tileSize', tileSize, 'scaleFactor', scaleFactor);
      cnv.parent(domParent);

      viewer.page = s.createGraphics(s.width, s.height, s.WEBGL);
      viewer.page.angleMode(viewer.page.DEGREES);
      // s.camSetup();
    }

    s.draw = () => {
      s.background(0);
      viewer.page.clear();

      // console.log(s.floor(easyCam.state.distance));

      // Figure out the current amount of rotation and use this to decide
      // whether to display the front or back tile layout. This is a bit of 
      // a hack, because I'm figuring out the rotation based on the easyCam
      // camera quaternion. But it works good enough.
      // let rotationAngle = s.degrees(2 * s.asin(easyCam.getRotation()[0]));
      
      // console.log(s.floor(rotation));

      if (rotation > 90 && rotation <= 270){
        if (isShowingFront){
          showBack();
          isShowingFront = false;
        }
      } else {
        if (!isShowingFront){
          showFront();
          isShowingFront = true;
        }
      } 

      // Implements a simple 'momentum' effect for the rotation.
      if (s.abs(rotationMomentum) > 0){
        rotationMomentum *= 0.5;
        s.addRotation(rotationMomentum);
      }

      // s.drawBase();

      // Recalculate the bricks (this probably doesn't need to be done every
      // draw loop, but it works fine for now).
      s.setupBricks();

      // viewer.page.ambientLight(70);
      //viewer.page.pointLight(
      //  150, 150, 150, 0, -s.height / 2 * rows, 200 * rows);
      //viewer.page.pointLight(
      //  100, 100, 100, 0, -s.height / 2 * rows, -200 * rows);

      // s.drawGrid3D();
      s.drawBricks();
      
      s.background(0);
      // s.stroke(0, 255, 255);
      // s.line(0, 20, s.width, 20);
      // s.line(0, s.height - 20, s.width, s.height - 20);
      // s.line(20, 0, 20, s.height);
      // s.line(s.width - 20, 0, s.width - 20, s.height);

      s.image(viewer.page, 0, 0);

      // s.line(0, s.height / 2, s.width, s.height / 2);
      // s.line(s.width / 2, 0, s.width / 2, s.height);

    }

    //////////////////////////////////////////////////////////
    // Drawing helpers
    // 

    // s.drawBase = () => {
    //   viewer.page.push();
    //   viewer.page.translate(0, 2 * tileSize, 0);
    //   viewer.page.angleMode(s.DEGREES);
    //   viewer.page.fill(255, 200);
    //   viewer.page.ellipseMode(s.CENTER);
    //   viewer.page.rotateX(90);
    //   viewer.page.circle(0, 0, (2 * cols * tileSize));
    //   viewer.page.pop();
    // }

    // TODO: Not sure if this is used?
    s.drawGrid3D = () => {
      viewer.page.push();
      viewer.page.translate(0, 0, -tileSize / 2);
      viewer.page.rotateY(rotation);
      // viewer.page.scale(scaleFactor);
      // viewer.page.translate(-viewer.page.width / 2 + margin, 
      //   -viewer.page.height / 2 + margin, 0);
              
      // viewer.page.fill(255, 100);
      // viewer.page.stroke(255, 0, 0);
      // viewer.page.square(0, 0, 100);
      // viewer.page.translate(0, 0, -100);
      // viewer.page.square(0, 0, 100);
      // viewer.page.translate(0, 0, 100);

      // viewer.page.scale(scaleFactor);
      viewer.page.stroke(255, 255, 0);
      viewer.page.strokeWeight(1);
    
      for (let c = 0; c < cols + 1; c++) {
        // viewer.page.line(c * tileSize, 0, 0, c * tileSize, rows * tileSize, 0);
      }
    
      for (let r = 0; r < rows + 1; r++) {
        // viewer.page.line(0, r * tileSize, 0, cols * tileSize, r * tileSize, 0);
      }

      for (let c = 0; c < cols; c++){
        for (let r = 0; r < rows; r++){
          // viewer.page.push();
          // viewer.page.translate(
          //   c * tileSize + tileSize / 2, 
          //   r * tileSize + tileSize / 2, 0);
          // viewer.page.noFill();
          // viewer.page.box(tileSize, tileSize, tileSize);
          // viewer.page.pop();
        }
      }

      viewer.page.fill(255, 0, 0);
      viewer.page.plane(100, 100);

      viewer.page.fill(255, 200);
      viewer.page.translate(0, 0, tileSize / 2);
      viewer.page.plane(viewer.page.width - 2 * margin, viewer.page.height - 2 * margin);

      viewer.page.translate(0, 0, -tileSize);
      viewer.page.plane(viewer.page.width - 2 * margin, viewer.page.height - 2 * margin);

      viewer.page.pop();
    }    

    // Draw the grid of all the bricks to the board
    s.drawBricks = () => {
      viewer.page.push();
      viewer.page.scale(scaleFactor);
      viewer.page.translate(0, 0, -tileSize / 2);
      viewer.page.rotateY(rotation);      
      
      viewer.page.translate(-tileSize * (cols / 2), -tileSize * (rows / 2));




      // Iterate over the columns and rows and draw each brick
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          viewer.page.push();
          viewer.page.translate(c * tileSize, r * tileSize, 0);
          bricks[c][r].loft(viewer, tileSize);
          bricks[c][r].display(viewer, tileSize);
          viewer.page.pop();

        }
      }

      viewer.page.pop();
    }


    //////////////////////////////////////////////////////////
    // Helpers
    // 

    // Helper to set up the easyCam camera.
    s.camSetup = () => {
      easyCam = new Dw.EasyCam(viewer.page._renderer);

      // TODO: Calculate the distance depending on number
      // of rows and columns. The formula below was calculated
      // using an online curve fitter: https://mycurvefit.com/
      // It works well if the number of columns and rows is the same
      // but not otherwise.

      let p = [
        -2.14911422e-02,  4.47768998e-01, -3.04788531e+00, -4.47644293e+04,
        2.39588187e-04, -3.50547786e-03,  2.66209479e-01,  4.47706588e+04
      ];

      let d1 =
        p[0]*s.pow(cols,3) + p[1]*s.pow(cols,2) + p[2]*cols + p[3] + 
        p[4]*s.pow(rows,3) + p[5]*s.pow(rows,2) + (p[6]*rows) + p[7];

      let d = d1 * w * 0.65;

      d = 396;

      console.log('d1', d1, 'd', d);



      // let x = s.min(cols, rows);
      // let d = 529.7265 + (150316400 - 529.7265)/
      //   (1 + s.pow(x/0.0000004845181,0.9083027))
      //let d = 0;  

      // loads the easy cam library
      easyCam = new Dw.EasyCam(viewer.page._renderer, {
        distance: d,
        center: [0,0,0] 
      });

      // console.log(d);
    
      document.oncontextmenu = () => false;
      s.setAttributes('antialias', true);
    
      //locks the cam rotation axis to yaw
      easyCam.setRotationConstraint(true, false, false);
    
      // turns of default mouse controls
      easyCam.removeMouseListeners();
      // easyCam.setDistanceMin(10);
      // easyCam.setDistanceMax(10000);
      camState = easyCam.getState();    
    }

    // Set up the array of bricks based off the front and 
    // back boards
    s.setupBricks = () => {
      // Get a copy of the front and back boards
      frontB = frontBoard.getBoard();
      backB = backBoard.getBoard();
        
      viewer.display = true;
  
      // this loop creates the bricks from the tiles in the board
      bricks = new Array(cols);
      for (let c = 0; c < cols; c++) {
        bricks[c] = new Array(rows);
        for (let r = 0; r < rows; r++) {
          let a = (cols - 1) - c
          // Get the tile num for the front and tile
          let frontTileNum = frontB[c][r]
          let backTileNum = backB[a][r]

          // Get front and back tiles
          let front = tiles[frontTileNum];
          let back = tiles[backTileNum];

          // center is for the center of the brick
          let center = s.createVector(
            c * tileSize + tileSize / 2, 
            r * tileSize + tileSize / 2);

          // size is the size of the tile
          let size = tiles[frontTileNum].size;

          bricks[c][r] = new Brick(front, back, center, size);
        }
      }
    }

    // Returns true if a given point is inside the canvas
    s.isInside = (x, y) => {
      return x > 0 && x < s.width && y > 0 && y < s.height;
    };

    // Add the provided rotation onto the existing rotation
    s.addRotation = (rot) => {
      rot = rot % 360;
      rotation = (rotation + rotationMomentum) % 360;
      if (rotation < 0){
        rotation = (rotation + 360) % 360;
      }
      // console.log('new rotation', s.floor(rotation));
    }

    //////////////////////////////////////////////////////////
    // Event handlers
    // 

    // When the user drags the mouse, rotate the model left and right.
    s.mouseDragged = () => {
      if (s.isInside(s.mouseX, s.mouseY)) {
        rotationMomentum = 0;
        let deltaX = s.abs(s.mouseX - s.pmouseX);
        if (s.mouseX < s.pmouseX) {
          rotationMomentum = -0.05 * deltaX;
        } else {
          rotationMomentum = 0.05 * deltaX
        }
        // console.log('rotationMomentum', rotationMomentum, 
        //             s.degrees(rotationMomentum), 'rotation', rotation);
        rotationMomentum = s.degrees(rotationMomentum);
        // s.addRotation(rotationMomentum);
        // easyCam.rotateY(rotationMomentum);
      }
      return false;
    }
    
    // // Mousewheel handler to zoom in and out. I've disabled this.
    // s.mouseWheel = (evt) => {
    //   if (s.isInside(s.mouseX, s.mouseY)) {
    //     let scroll = evt.delta;
    //     easyCam.zoom(scroll / 5);
    //     // console.log(easyCam.state.distance);
    //     evt.preventDefault();
    //     return false;  
    //   }
    // }

  }
}