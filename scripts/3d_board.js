function make3DBoard(domParentId, rows, cols){
  return (s) => {
    let bricks;
    let frontB;
    let backB;
    let isShowingFront = true;
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
      tileSize = w / cols;
      scaleFactor = (w - 2 * margin) / w;
      let canvasHeight = margin * 2 + tileSize * rows * scaleFactor;

      let cnv = s.createCanvas(tileSize * cols, canvasHeight, s.WEBGL);
      cnv.parent(domParent);
      s.angleMode(s.DEGREES);
      s.textFont(f);

      cam = s.createCamera();
      cam.setPosition(0, 0, cam.eyeZ + tileSize / 2);
      cam.lookAt(0, 0, 0);
    }

    s.draw = () => {
      // TODO: This doesn't need to be done every time, but I will leave it
      //       for now.
      s.setupBricks();

      // Figure out the current amount of rotation and use this to decide
      // whether to display the front or back tile layout. 
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

      // TODO: Re-implement 'momentum' effect for rotation?

      s.clear();
      s.orbitControl(4, 0, 0);
      
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

  }
}