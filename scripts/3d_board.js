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
    let f;
    let cam;

    s.preload = () => {
      f = s.loadFont('styles/iconsolata/Inconsolata.otf');
    }
    
    s.setup = () => {
      let domParent = s.select(domParentId);
      w = domParent.width;
      // console.log(w);
      tileSize = w / cols;
      scaleFactor = (w - 2 * margin) / w;
      let canvasHeight = margin * 2 + tileSize * rows * scaleFactor;

      let cnv = s.createCanvas(tileSize * cols, canvasHeight, s.WEBGL);
      console.log('3d w', w, '3d height', canvasHeight, 
        'tileSize', tileSize, 'scaleFactor', scaleFactor);
      cnv.parent(domParent);

      s.angleMode(s.DEGREES);
      s.textFont(f);

      cam = s.createCamera();
      cam.setPosition(0, 0, cam.eyeZ + tileSize / 2);
      cam.lookAt(0, 0, 0);

      // s.camSetup();
    }

    s.draw = () => {
      // TODO: This doesn't need to be done every time, but I will leave it
      //       for now.
      s.setupBricks();

      // s.ambientLight(255);
      // s.pointLight(255, 255, 255, 0, 0, -10000);

      // console.log(s.floor(easyCam.state.distance));

      // Figure out the current amount of rotation and use this to decide
      // whether to display the front or back tile layout. 
      //
      // I was previously doing this with a bit of a hack, because I was
      //  figuring out the rotation based on the easyCam camera quaternion.
      // But it worked good enough, so I'm keeping for reference in case I
      // need it again (next line).
      // let rotationAngle = s.degrees(2 * s.asin(easyCam.getRotation()[0]));

      //if (rotation > 90 && rotation <= 270){
      if (cam.eyeZ < 0){
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

      // // Implements a simple 'momentum' effect for the rotation.
      // if (s.abs(rotationMomentum) > 0){
      //   rotationMomentum *= 0.5;
      //   s.addRotation(rotationMomentum);
      // }

      // let rotVec = s.createVector(s.mouseX - s.width / 2, tileSize);
      // rotVec.rotate(rotation);

      s.clear();
      s.orbitControl(4, 0, 0);
      
      // s.ambientLight(250);
      s.lightFalloff(0, 0.00015, 0);

      s.pointLight(255, 255, 255, 
        cam.eyeX + cam.eyeZ * 0.8, 
        cam.eyeY - s.height / 2, 1.5 * cam.eyeZ);
      s.pointLight(255, 255, 255, 
        cam.eyeX + cam.eyeZ * 0.8, 
        cam.eyeY - s.height / 2, 1.5 * -cam.eyeZ);

      // s.ambientLight(255, 255, 255);
      
      // s.lights();

      // s.push();
      // s.sphere(tileSize / 2);
      // s.pop();


      
      // s.camera(0, 0, tileSize * 10, 0, 0, 0);

      // s.drawBase();
      
      // // TODO: Rotate the camera rather than rotating the objects.
      // let rotVec = s.createVector(0, 10 * tileSize); 
      // rotVec.rotate(rotation);
      // s.camera(rotVec.x, 0, rotVec.y, 0, 0, 0, 0, 1, 0);
      
      // s.spotLight(
      //   s.color(255), rotVec.x, 0, rotVec.y, 0, 0, 0);
      
      //s.pointLight(
      //  100, 100, 100, 0, -s.height / 2 * rows, -200 * rows);

      // This makes the lofting render dark
      // s.lightFalloff(tileSize / 2, 0.001, 0)
      // s.pointLight(
      //   255, 255, 255, 
      //   this.center.x - 500, this.center.y - 300, this.center.z + 40)

      // s.drawGrid3D();
      s.drawBricks();
      
    }

    //////////////////////////////////////////////////////////
    // Drawing helpers
    // 

    // Draw the grid of all the bricks to the board
    s.drawBricks = () => {
      s.push();
      s.scale(scaleFactor);
      // s.translate(0, 0, -tileSize / 2);
      // s.rotateY(rotation);      
      
      s.translate(-tileSize * (cols / 2), -tileSize * (rows / 2));

      // Iterate over the columns and rows and draw each brick
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          s.push();
          s.translate(c * tileSize, r * tileSize, 0);
          bricks[c][r].display(s, tileSize);
          s.pop();

        }
      }

      s.pop();
    }

    // TODO: Not sure if this is used?
    s.drawGrid3D = () => {
      s.push();
      // s.scale(scaleFactor);
      // s.translate(-s.width / 2 + margin, 
      //   -s.height / 2 + margin, 0);
              
      // s.fill(255, 100);
      // s.stroke(255, 0, 0);
      // s.square(0, 0, 100);
      // s.translate(0, 0, -100);
      // s.square(0, 0, 100);
      // s.translate(0, 0, 100);

      // s.scale(scaleFactor);
      s.stroke(255, 255, 0);
      s.strokeWeight(1);
    
      for (let c = 0; c < cols + 1; c++) {
        // s.line(c * tileSize, 0, 0, c * tileSize, rows * tileSize, 0);
      }
    
      for (let r = 0; r < rows + 1; r++) {
        // s.line(0, r * tileSize, 0, cols * tileSize, r * tileSize, 0);
      }

      for (let c = 0; c < cols; c++){
        for (let r = 0; r < rows; r++){
          // s.push();
          // s.translate(
          //   c * tileSize + tileSize / 2, 
          //   r * tileSize + tileSize / 2, 0);
          // s.noFill();
          // s.box(tileSize, tileSize, tileSize);
          // s.pop();
        }
      }

      s.fill(255, 0, 0);
      s.plane(100, 100);

      s.fill(255, 200);
      s.translate(0, 0, tileSize / 2);
      s.plane(s.width - 2 * margin, s.height - 2 * margin);

      s.translate(0, 0, -tileSize);
      s.plane(s.width - 2 * margin, s.height - 2 * margin);

      s.pop();
    }    

    // s.drawBase = () => {
    //   s.push();
    //   s.translate(0, 2 * tileSize, 0);
    //   s.angleMode(s.DEGREES);
    //   s.fill(255, 200);
    //   s.ellipseMode(s.CENTER);
    //   s.rotateX(90);
    //   s.circle(0, 0, (2 * cols * tileSize));
    //   s.pop();
    // }

    //////////////////////////////////////////////////////////
    // Helpers
    // 

    // // Helper to set up the easyCam camera.
    // s.camSetup = () => {
    //   easyCam = new Dw.EasyCam(s._renderer);

    //   // TODO: Calculate the distance depending on number
    //   // of rows and columns. The formula below was calculated
    //   // using an online curve fitter: https://mycurvefit.com/
    //   // It works well if the number of columns and rows is the same
    //   // but not otherwise.

    //   let p = [
    //     -2.14911422e-02,  4.47768998e-01, -3.04788531e+00, -4.47644293e+04,
    //     2.39588187e-04, -3.50547786e-03,  2.66209479e-01,  4.47706588e+04
    //   ];

    //   let d1 =
    //     p[0]*s.pow(cols,3) + p[1]*s.pow(cols,2) + p[2]*cols + p[3] + 
    //     p[4]*s.pow(rows,3) + p[5]*s.pow(rows,2) + (p[6]*rows) + p[7];

    //   let d = d1 * w * 0.65;

    //   d = 396;

    //   console.log('d1', d1, 'd', d);



    //   // let x = s.min(cols, rows);
    //   // let d = 529.7265 + (150316400 - 529.7265)/
    //   //   (1 + s.pow(x/0.0000004845181,0.9083027))
    //   //let d = 0;  

    //   // loads the easy cam library
    //   easyCam = new Dw.EasyCam(s._renderer, {
    //     distance: d,
    //     center: [0,0,0] 
    //   });

    //   // console.log(d);
    
    //   document.oncontextmenu = () => false;
    //   s.setAttributes('antialias', true);
    
    //   //locks the cam rotation axis to yaw
    //   easyCam.setRotationConstraint(true, false, false);
    
    //   // turns of default mouse controls
    //   easyCam.removeMouseListeners();
    //   // easyCam.setDistanceMin(10);
    //   // easyCam.setDistanceMax(10000);
    //   camState = easyCam.getState();    
    // }

    // Set up the array of bricks based off the front and 
    // back boards
    s.setupBricks = () => {
      
      // Get a copy of the front and back boards
      frontB = frontBoard.getBoard();
      backB = backBoard.getBoard();
  
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
    // s.mouseDragged = () => {
    //   if (s.isInside(s.mouseX, s.mouseY)) {
    //     rotationMomentum = 0;
    //     let deltaX = s.abs(s.mouseX - s.pmouseX);
    //     if (s.mouseX < s.pmouseX) {
    //       rotationMomentum = -0.05 * deltaX;
    //     } else {
    //       rotationMomentum = 0.05 * deltaX
    //     }
    //     // console.log('rotationMomentum', rotationMomentum, 
    //     //             s.degrees(rotationMomentum), 'rotation', rotation);
    //     rotationMomentum = s.degrees(rotationMomentum);
    //     // s.addRotation(rotationMomentum);
    //     // easyCam.rotateY(rotationMomentum);
    //   }
    //   return false;
    // }
    
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