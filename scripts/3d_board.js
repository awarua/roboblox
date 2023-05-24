function make3DBoard(domParentId, appFn, makeFull, zoom, brickSteps){
  console.log('make3DBoard', domParentId, appFn(), makeFull, zoom, brickSteps);

  return (sketch3DBoard) => {
    let bricks;
    let frontB;
    let backB;
    let frontBData = null;
    let backBData = null;
    let doSetupBricks = false;
    let isShowingFront = true;
    let tileSize = appFn().masterTileSize;
    let marginT = 35;
    let marginL = marginT;
    let scaleFactor = 1;
    let w;
    let h;
    let f;
    let cam;
    let defaultCamZ;
    let doOrbit = true;
    // zoom = 0.75;

    sketch3DBoard.preload = () => {
      f = sketch3DBoard.loadFont('styles/iconsolata/Inconsolata.otf');
    }
    
    sketch3DBoard.setup = () => {
      // console.log('sketch3DBoard.setup()')

      let domParent = sketch3DBoard.select(domParentId);
      let cnv;

      if (makeFull){
        console.log('make full');
  
        let w = window.innerWidth; // s.windowWidth;
        let h = window.innerHeight; // s.windowHeight;

        // console.log('w', w, 'h', h, 
        //   's.windowWidth', s.windowWidth, 
        //   'window.innerWidth', window.innerWidth);

        // setTimeout(() => {
        //   console.log('s.windowWidth after timeout', s.windowWidth)
        // }, 10000);

        // Adjust tileSize in case aspect is more portrait than landscape
        if (h / appFn().params.rows < w / appFn().params.cols){
          console.log('portrait');
          tileSize = h / appFn().params.rows;
          scaleFactor = (h - 2 * marginT) / h;
          marginL = (w - (appFn().params.cols * tileSize * scaleFactor)) / 2;
        } else {
          console.log('landscape');
          // Adjust the top Margin
          tileSize = w / appFn().params.cols;
          scaleFactor = (w - 2 * marginL) / w;

          marginT = (h - (appFn().params.rows * tileSize * scaleFactor)) / 2;
        }

        // console.log('w', w, 'h', h, 'ts', tileSize, 
        //   'ml', marginL, 'mt', marginT, 'sf', scaleFactor);
        cnv = sketch3DBoard.createCanvas(w, h, sketch3DBoard.WEBGL);
      } else {
        // console.log("not make full", domParent);
        let w = domParent.width;
        // console.log('w', w);
        let t, h;

        // Get the parent dom element and figure out width
        if (domParentId === '#example-tile-holder'){
          h = domParent.height;
          // debugger;
        } else {
          let mainDiv = sketch3DBoard.select('#main-area');
          h = mainDiv.height;
        }

        let sideL = sketch3DBoard.min(w, h);

        tileSize = sideL / appFn().params.cols;
        scaleFactor = (sideL - 2 * marginT) / sideL;

        let canvasW = marginL * 2 + tileSize * appFn().params.cols * scaleFactor;

        // console.log('canvasW', {canvasW, marginL, tileSize, 
        //   cols: appFn().params.cols, scaleFactor})

        let canvasH = h;

        //canvasW = 100;
        //canvasH = 100;

        cnv = sketch3DBoard.createCanvas(canvasW, canvasH, sketch3DBoard.WEBGL);
      }
      cnv.parent(domParent);
      sketch3DBoard.angleMode(sketch3DBoard.DEGREES);
      sketch3DBoard.textFont(f);

      cam = sketch3DBoard.createCamera();
      defaultCamZ = cam.eyeZ + tileSize / 2;
      sketch3DBoard.setCamFront();

      // Keep a copy of the front and back boards.
      frontB = appFn().front;
      backB = appFn().back;

      sketch3DBoard.setupBricks();

      // Register listeners
      frontB.registerListener(sketch3DBoard.frontBoardChanged);
      backB.registerListener(sketch3DBoard.backBoardChanged);

      // console.log('sketch3DBoard.setup() ==> at end.')
    }

    sketch3DBoard.draw = () => {
      // console.log('sketch3DBoard.draw()', domParentId, sketch3DBoard.width, sketch3DBoard.height)

      // console.log(domParentId);

      // TODO: This doesn't need to be done every time, but I will leave it
      //       for now.
      if (doSetupBricks){
        sketch3DBoard.setupBricks();
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

      sketch3DBoard.clear();
      if (doOrbit){
        sketch3DBoard.orbitControl(4, 0, 0);
      }
      
      sketch3DBoard.lightFalloff(0, 0.00015, 0);
      sketch3DBoard.pointLight(255, 255, 255, 
        cam.eyeX + cam.eyeZ * 0.8, 
        cam.eyeY - sketch3DBoard.height / 2, 1.5 * cam.eyeZ);
      sketch3DBoard.pointLight(255, 255, 255, 
        cam.eyeX + cam.eyeZ * 0.8, 
        cam.eyeY - sketch3DBoard.height / 2, 1.5 * -cam.eyeZ);

      sketch3DBoard.drawBricks();

      // console.log("sketch3DBoard.draw() ==> at end");
    }

    //////////////////////////////////////////////////////////
    // Drawing helpers
    // 



    // Draw the grid of all the bricks to the board
    sketch3DBoard.drawBricks = () => {
      sketch3DBoard.push();
      sketch3DBoard.scale(scaleFactor);
      sketch3DBoard.scale(zoom);
      sketch3DBoard.translate(-tileSize * (appFn().params.cols / 2), -tileSize * (appFn().params.rows / 2));

      // Iterate over the columns and rows and draw each brick
      for (let c = 0; c < appFn().params.cols; c++) {
        for (let r = 0; r < appFn().params.rows; r++) {
          sketch3DBoard.push();
          sketch3DBoard.translate(c * tileSize, r * tileSize, 0);
          bricks[c][r].display(sketch3DBoard, tileSize);
          sketch3DBoard.pop();
        }
      }
      sketch3DBoard.pop();
    }

    //////////////////////////////////////////////////////////
    // Helpers
    // 

    // Set up the array of bricks based off the front and 
    // back boards
    sketch3DBoard.setupBricks = () => {      
      // Get a copy of the front and back boards
      // frontBData = frontB.copyData();
      // backBData = backB.copyData();
  
      // this loop creates the bricks from the tiles in the board
      bricks = new Array(appFn().params.cols);
      for (let c = 0; c < appFn().params.cols; c++) {
        bricks[c] = new Array(appFn().params.rows);
        for (let r = 0; r < appFn().params.rows; r++) {
          let a = (appFn().params.cols - 1) - c
          // Get the tile num for the front and tile
          let frontTileNum = frontB.getTile(c, r);
          let backTileNum = backB.getTile(a, r);

          // Get front and back tiles
          // debugger;
          let front = appFn().tiles[frontTileNum];
          let back = appFn().tiles[backTileNum];

          // center is for the center of the brick
          let center = sketch3DBoard.createVector(
            c * tileSize + tileSize / 2, 
            r * tileSize + tileSize / 2);

          // size is the size of the tile
          let size = appFn().tiles[frontTileNum].size;

          bricks[c][r] = new Brick(front, back, center, sketch3DBoard, brickSteps);
        }
      }
    }

    sketch3DBoard.frontBoardChanged = (lineNo) => {
      // console.log('front board changed', lineNo);
      doSetupBricks = true;
    }

    sketch3DBoard.backBoardChanged = (lineNo) => {
      // console.log('back board changed', lineNo);
      doSetupBricks = true;
    }

    sketch3DBoard.doSetupBricks = () => {
      doSetupBricks = true;
    }

    sketch3DBoard.setDoOrbit = (newDoOrbit) => {
      doOrbit = newDoOrbit;
    }

    sketch3DBoard.setCamFront = () => {
      cam.setPosition(0, 0, defaultCamZ);
      cam.lookAt(0, 0, 0);
    }

    sketch3DBoard.setCamBack = () => {
      // console.log('set cam back');
      cam.setPosition(0, 0, -defaultCamZ);
      cam.lookAt(0, 0, 0);
    }

    sketch3DBoard.getCamRot = () => {
      let rotVec = sketch3DBoard.createVector(cam.eyeX, cam.eyeZ);
      // console.log('get dz', s.floor(defaultCamZ), 
      //   'h', s.floor(rotVec.heading()),
      //   'x', s.floor(rotVec.x), 'y', s.floor(rotVec.y));
      return (rotVec.heading());
    }

    sketch3DBoard.setCamRot = (rot) => {
      let rotVec = sketch3DBoard.createVector(defaultCamZ, 0);
      rotVec.rotate(rot);
      // console.log('set dz', s.floor(defaultCamZ), 
      //   'h', s.floor(rotVec.heading()),
      //   'x', s.floor(rotVec.x), 'y', s.floor(rotVec.y));
      cam.setPosition(rotVec.x, 0, rotVec.y);
      cam.lookAt(0, 0, 0);
    }

    // Returns true if a given point is inside the canvas
    sketch3DBoard.isInside = (x, y) => {
      return x > 0 && x < sketch3DBoard.width && y > 0 && y < sketch3DBoard.height;
    };

  }
}