function make3DBoard(domParentId, appFn, makeFull, zoom){
  return (s) => {
    let bricks;
    let frontB;
    let backB;
    let frontBData = null;
    let backBData = null;
    let doSetupBricks = false;
    let isShowingFront = true;
    let tileSize = appFn().masterTileSize;
    let marginL = 20;
    let marginT = marginL;
    let scaleFactor = 1;
    let w;
    let h;
    let f;
    let cam;
    let defaultCamZ;
    let rows = appFn().ROWS
    let cols = appFn().COLS
    let doOrbit = true;
    // zoom = 0.75;

    s.preload = () => {
      f = s.loadFont('styles/iconsolata/Inconsolata.otf');
    }
    
    s.setup = () => {
      let domParent = s.select(domParentId);
      let cnv;

      if (makeFull){
        console.log('make full');
  
        w = window.innerWidth; // s.windowWidth;
        h = window.innerHeight; // s.windowHeight;

        // console.log('w', w, 'h', h, 
        //   's.windowWidth', s.windowWidth, 
        //   'window.innerWidth', window.innerWidth);

        // setTimeout(() => {
        //   console.log('s.windowWidth after timeout', s.windowWidth)
        // }, 10000);

        // Adjust tileSize in case aspect is more portrait than landscape
        if (h / rows < w / cols){
          console.log('portrait');
          tileSize = h / rows;
          scaleFactor = (h - 2 * marginT) / h;
          marginL = (w - (cols * tileSize * scaleFactor)) / 2;
        } else {
          console.log('landscape');
          // Adjust the top Margin
          tileSize = w / cols;
          scaleFactor = (w - 2 * marginL) / w;

          marginT = (h - (rows * tileSize * scaleFactor)) / 2;
        }

        console.log('w', w, 'h', h, 'ts', tileSize, 
          'ml', marginL, 'mt', marginT, 'sf', scaleFactor);

        cnv = s.createCanvas(w, h, s.WEBGL);
      } else {
        w = domParent.width;
        tileSize = w / cols;
        h = tileSize * rows;
        scaleFactor = (w - 2 * marginL) / w;
        let canvasHeight = marginL * 2 + tileSize * rows * scaleFactor;
         cnv = s.createCanvas(tileSize * cols, canvasHeight, s.WEBGL);
      }
      cnv.parent(domParent);
      s.angleMode(s.DEGREES);
      s.textFont(f);

      cam = s.createCamera();
      defaultCamZ = cam.eyeZ + tileSize / 2;
      s.setCamFront();

      // Keep a copy of the front and back boards.
      frontB = appFn().front;
      backB = appFn().back;

      s.setupBricks();

      // Register listeners
      frontB.registerListener(s.frontBoardChanged);
      backB.registerListener(s.backBoardChanged);
    }

    s.draw = () => {
      // console.log(domParentId);

      // TODO: This doesn't need to be done every time, but I will leave it
      //       for now.
      if (doSetupBricks){
        s.setupBricks();
        doSetupBricks = false;
        // console.log('set up bricks');
      }

      // Figure out the current amount of rotation and use this to decide
      // whether to display the front or back tile layout. 
      if (cam.eyeZ < 0){
        if (isShowingFront){
          appFn()?.showBack && appFn().showBack();
          isShowingFront = false;
        }
      } else {
        if (!isShowingFront){
          appFn()?.showFront && appFn().showFront();
          isShowingFront = true;
        }
      } 

      // TODO: Re-implement 'momentum' effect for rotation?

      s.clear();
      if (doOrbit){
        s.orbitControl(4, 0, 0);
      }
      
      s.lightFalloff(0, 0.00015, 0);
      s.pointLight(255, 255, 255, 
        cam.eyeX + cam.eyeZ * 0.8, 
        cam.eyeY - s.height / 2, 1.5 * cam.eyeZ);
      s.pointLight(255, 255, 255, 
        cam.eyeX + cam.eyeZ * 0.8, 
        cam.eyeY - s.height / 2, 1.5 * -cam.eyeZ);

      s.drawBricks();
    }

    //////////////////////////////////////////////////////////
    // Drawing helpers
    // 



    // Draw the grid of all the bricks to the board
    s.drawBricks = () => {
      s.push();
      s.scale(scaleFactor);
      s.scale(zoom);
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

    //////////////////////////////////////////////////////////
    // Helpers
    // 

    // Set up the array of bricks based off the front and 
    // back boards
    s.setupBricks = () => {      
      // Get a copy of the front and back boards
      // frontBData = frontB.copyData();
      // backBData = backB.copyData();
  
      // this loop creates the bricks from the tiles in the board
      bricks = new Array(cols);
      for (let c = 0; c < cols; c++) {
        bricks[c] = new Array(rows);
        for (let r = 0; r < rows; r++) {
          let a = (cols - 1) - c
          // Get the tile num for the front and tile
          let frontTileNum = frontB.getTile(c, r);
          let backTileNum = backB.getTile(a, r);

          // Get front and back tiles
          // debugger;
          let front = appFn().tiles[frontTileNum];
          let back = appFn().tiles[backTileNum];

          // center is for the center of the brick
          let center = s.createVector(
            c * tileSize + tileSize / 2, 
            r * tileSize + tileSize / 2);

          // size is the size of the tile
          let size = appFn().tiles[frontTileNum].size;

          bricks[c][r] = new Brick(front, back, center, s);
        }
      }
    }

    s.frontBoardChanged = (lineNo) => {
      // console.log('front board changed', lineNo);
      doSetupBricks = true;
    }

    s.backBoardChanged = (lineNo) => {
      // console.log('back board changed', lineNo);
      doSetupBricks = true;
    }

    s.doSetupBricks = () => {
      doSetupBricks = true;
    }

    s.setDoOrbit = (newDoOrbit) => {
      doOrbit = newDoOrbit;
    }

    s.setCamFront = () => {
      cam.setPosition(0, 0, defaultCamZ);
      cam.lookAt(0, 0, 0);
    }

    s.setCamBack = () => {
      // console.log('set cam back');
      cam.setPosition(0, 0, -defaultCamZ);
      cam.lookAt(0, 0, 0);
    }

    s.getCamRot = () => {
      let rotVec = s.createVector(cam.eyeX, cam.eyeZ);
      // console.log('get dz', s.floor(defaultCamZ), 
      //   'h', s.floor(rotVec.heading()),
      //   'x', s.floor(rotVec.x), 'y', s.floor(rotVec.y));
      return (rotVec.heading());
    }

    s.setCamRot = (rot) => {
      let rotVec = s.createVector(defaultCamZ, 0);
      rotVec.rotate(rot);
      // console.log('set dz', s.floor(defaultCamZ), 
      //   'h', s.floor(rotVec.heading()),
      //   'x', s.floor(rotVec.x), 'y', s.floor(rotVec.y));
      cam.setPosition(rotVec.x, 0, rotVec.y);
      cam.lookAt(0, 0, 0);
    }

    // Returns true if a given point is inside the canvas
    s.isInside = (x, y) => {
      return x > 0 && x < s.width && y > 0 && y < s.height;
    };

  }
}