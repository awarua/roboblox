function make3DBoard(domParentId, rows, cols, front, back){
  return (s) => {

    let easyCam;
    let camState = {};
    let bricks;
    let frontB;
    let backB;

    let viewer = {
      display: false,
      page: null,
    };
    
    s.setup = () => {
      let cnv = s.createCanvas(tileSize * cols, tileSize * rows);
      cnv.parent(s.select(domParentId));

      viewer.page = s.createGraphics(900, 400, s.WEBGL);
      s.camSetup();
    }

    s.draw = () => {
      s.background(0);
      s.setupBricks();

      viewer.page.background(0);

      viewer.page.ambientLight(70);
      viewer.page.pointLight(
        150, 150, 150, 0, -s.height / 2 * rows, 200 * rows);
      viewer.page.pointLight(
        100, 100, 100, 0, -s.height / 2 * rows, -200 * rows);

      //  s.drawGrid3D();

      viewer.page.push();
      viewer.page.fill(255, 255, 0);
      viewer.page.noStroke();
      viewer.page.translate(-tileSize * (cols / 2), -tileSize * (cols - 1));

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (frontB[c][r] > -1) {
            bricks[c][r].loft(viewer);
            viewer.page.push();
            viewer.page.ambientLight(255);
            bricks[c][r].display(viewer);
            viewer.page.pop();
          }
        }
      }

      viewer.page.pop();
      s.drawBase();
      s.image(viewer.page, 0, 0);
    }

    //////////////////////////////////////////////////////////
    // Drawing helpers
    // 

    s.drawBase = () => {
      viewer.page.push();
      viewer.page.translate(0, tileSize, 0);
      viewer.page.angleMode(s.DEGREES);
      viewer.page.fill(250);
      viewer.page.ellipseMode(s.CENTER);
      viewer.page.rotateX(90);
      viewer.page.circle(0, 0, 100 + (cols * tileSize));
      viewer.page.pop();
    }

    // TODO: Not sure if this is used?
    s.drawGrid3D = () => {
      viewer.page.push();
      viewer.page.translate(-tileSize * (cols / 2), -tileSize * (rows - 1));
      viewer.page.stroke(255);
    
      for (let c = 0; c < cols + 1; c++) {
        viewer.page.line(c * tileSize, 0, c * tileSize, rows * tileSize);
      }
    
      for (let r = 0; r < rows + 1; r++) {
        viewer.page.line(0, r * tileSize, cols * tileSize, r * tileSize);
      }
    
      viewer.page.pop();
    }    

    //////////////////////////////////////////////////////////
    // Helpers
    // 

    s.camSetup = () => {
      easyCam = new Dw.EasyCam(viewer.page._renderer);

      // loads the easy cam library
      easyCam = new Dw.EasyCam(viewer.page._renderer, {
        distance: 500,
        center: [0,-50,0] 
      });
    
      document.oncontextmenu = () => false;
      s.setAttributes('antialias', true);
    
      //locks the cam rotation axis to yaw
      easyCam.setRotationConstraint(true, false, false);
    
      // turns of default mouse controls
      easyCam.removeMouseListeners();
      easyCam.setDistanceMin(300);
      easyCam.setDistanceMax(700);
      camState = easyCam.getState();
    
    }

    // Set up the array of bricks based off the front and 
    // back boards
    s.setupBricks = () => {
      // Get a copy of the front and back boards
      frontB = frontBoard.getBoard();
      backB = backBoard.getBoard();

      if ( rows * 100 > 400 ){
        let a = 700 + ( rows * 100 );
        easyCam.setDistanceMax(a);
        
        let b = -50 - (rows*30);
        camState.center = [ 0, b ,0 ];
        easyCam.setState(camState);
      } else {
        easyCam.setDistanceMax( 700 );
        easyCam.center = [0, -50, 0];
      }
    
      // if (s.fullBrickCheck()) {
        
        viewer.display = true;
    
        // this loop creates the bricks from the tiles in the board
        bricks = new Array(cols);
        for (let c = 0; c < cols; c++) {
          bricks[c] = new Array(rows);
          for (let r = 0; r < rows; r++) {
            if (frontB[c][r] > -1) {

              let a = (cols - 1) - c
              // q is the tile num for the front tile
              let frontTileNum = frontB[c][r]
              //s is the tile num for the back tile
              let backTileNum = backB[a][r]
    
              // front is the drawing data for the front tile
              tiles[frontTileNum].drawingData.sides = tiles[frontTileNum].sides
              let front = tiles[frontTileNum];
    
              // back is for the back tile drawing data 
              let back = tiles[backTileNum];
    
              // center is for the center of the brick
              let center = s.createVector(c * tileSize, r * tileSize);
    
              // size is the size of the tile
              let size = tiles[frontTileNum].size;
    
              bricks[c][r] = new Brick(front, back, center, size);
            }
          }
        }
      // } else {
      //   console.log("Please fill yellow spaces to make a full brick");
      // }
    }

    // Returns true if a given point is inside the canvas
    s.isInside = (x, y) => {
      return x > 0 && x < s.width && y > 0 && y < s.height;
    };

    //////////////////////////////////////////////////////////
    // Event handlers
    // 

    s.mouseDragged = () => {
      if (s.isInside(s.mouseX, s.mouseY)) {
        let deltaX = s.abs(s.mouseX - s.pmouseX);
        if (s.mouseX > s.pmouseX) {
          easyCam.rotateY(-0.005 * deltaX);
        } else {
          easyCam.rotateY(0.005 * deltaX);
        }
      }
    }
    
    // function offCvn() {
    //   easycam.setState(camState, 2000)
    // }
    
    s.mouseWheel = () => {
      if (s.isInside(s.mouseX, s.mouseY)) {
        let scroll = event.delta;
        easyCam.zoom(scroll / 5);
        event.preventDefault();
        return false;  
      }
    }

  }
}