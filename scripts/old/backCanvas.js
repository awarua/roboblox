/*

let boardBack = [];

let lastClickedBack = null;
let isTileSelectedBack = false;
let selectedTileBack = null;

// this is the setup() and Draw() for the second canvas
//it acts as a template to create a new "sketch"
let sketch = function(p) {

  //
  //setup function
  //
  p.setup = function() {

    p.createCanvas(tileSize * COLS, tileSize * ROWS);

    //backTileParams = new TileParameters()


    //  make a 2nd board
    boardBack = new Array(COLS);
    for (let c = 0; c < COLS; c++) {
      boardBack[c] = new Array(ROWS);
      for (let r = 0; r < ROWS; r++) {
        boardBack[c][r] = -1;
      }
    }

    //end of setup
  };


  //
  //draw function
  //
  p.draw = function() {


    p.background(51)

    drawBackGrid(p)


    let allowedBack = [];




    if (lastClickedBack) {
      [allowedBack, ...rest] = getAllowedBack(lastClickedBack[0], lastClickedBack[1]);
    }

    showAllowedInGrid(allowedBack);

    p.push();

    // Draw a grid to show where the tiles go.
    drawBackGrid(p);


    // Iterate over the tiles and display each one.
    for (let c = 0; c < COLS; c++) {
      p.push()

      // p.translate(0, c * tileSize)
      p.translate(c * tileSize, 0)
      for (let r = 0; r < ROWS; r++) {
        p.push()

        // p.translate(r * tileSize,0)
        p.translate(0, r * tileSize)

        // Draw the tile if one has been placed.
        if (boardBack[c][r] >= 0) {
          let n = boardBack[c][r];
          tiles[n].calculateGroup();
          displayTile(tiles[n].drawingData, p)

        }
        p.pop()
      }
      p.pop()
    }
    p.pop();


   // btnClearTile.elt.disabled = true;

    // displaying last clicked tile 
    if (lastClickedBack) {

      btnClearTile.elt.disabled = false;

      p.push();
      p.noFill();
      p.stroke(0, 128, 255, 100);
      p.strokeWeight(2);
      p.rect(lastClickedBack[0] * tileSize, lastClickedBack[1] * tileSize, tileSize, tileSize);
      p.pop();



      let lastClickedIdBack = boardBack[lastClickedBack[0]][lastClickedBack[1]];

      if (lastClickedIdBack >= 0) {
        jQuery('#currentTileSVG-holder').get(0).innerHTML = tiles[lastClickedIdBack].svgString;
      } else {
        jQuery('#currentTileSVG-holder').get(0).innerHTML = '';
      }
    } else if (isTileSelectedBack) {
      jQuery('#currentTileSVG-holder').get(0).innerHTML = tiles[selectedTileBack].svgString;
    } else {
      jQuery('#currentTileSVG-holder').get(0).innerHTML = '';
    }

    // shows what tiles need to be selected to back a full brick
    showFrontSelected(p);

    p.noLoop();
    //params.hasChanges = true;

    //end of draw
  };

  p.mouseClicked = function() {


    if (isInsideBackCanvas(p.mouseX, p.mouseY)) {
selectedCnv = false

      // Calculate the row and column index
      let c = floor(backCanvas.mouseX / tileSize);
      let r = floor(backCanvas.mouseY / tileSize);

      // Just to be doubly-sure, use the constrain function to make sure the index is valid
      c = constrain(c, 0, COLS - 1);
      r = constrain(r, 0, ROWS - 1);

      let [allowedBack, topDisallowed, leftDisallowed, rightDisallowed, bottomDisallowed] = getAllowedBack(c, r);


      if (isTileSelectedBack) {

        // Check if the selected tile can go at this position. If not, then 
        // clear any neighbours that are blocking it.
        if (topDisallowed.indexOf(selectedTileBack) != -1) {
          boardBack[c][r - 1] = -1;
        }
        if (leftDisallowed.indexOf(selectedTileBack) != -1) {
          boardBack[c - 1][r] = -1;
        }
        if (rightDisallowed.indexOf(selectedTileBack) != -1) {
          boardBack[c + 1][r] = -1;
        }
        if (bottomDisallowed.indexOf(selectedTileBack) != -1) {
          boardBack[c][r + 1] = -1;
        }

        boardBack[c][r] = selectedTileBack;


      } else {
        lastClickedBack = [c, r];
        // Highlight the allowed ones in the grid
        clearGrid();
        showAllowedInGrid(allowedBack);

      }
      loop();
      p.loop();
      return false;
    } else {
      lastClickedBack = null;
      isTileSelectedBack = false;
      selectedTileBack = null;
      clearGrid();
      p.loop();
      loop();
    }

  }


};

//this creates a new sketch using the templat above
let backCanvas = new p5(sketch, 'canvas-holder-back');

// this draws the grid for the tiles "p" gets swapped for "backPattern"
function drawBackGrid(p) {
  p.push();


  p.stroke(100);
  for (let c = 0; c < COLS + 1; c++) {
    p.line(c * tileSize, 0, c * tileSize, ROWS * tileSize);
  }
  for (let r = 0; r < ROWS + 1; r++) {
    p.line(0, r * tileSize, COLS * tileSize, r * tileSize);
  }
  p.pop();

}

function displayTile(drawingData, p) {



  // This updates the params for the tiles
  // if (params.hasChanges) {
  //   for (let c = 0; c < COLS; c++) {
  //     for (let r = 0; r < ROWS; r++) {
  //       boardBack[c][r].calculateGroup();
  //     }
  //   }
  // }


  // code for displaying front tile
  p.push();
  //p.translate(tileSize, tileSize);
  p.scale(tileSize, tileSize);
  p.strokeWeight(2 / tileSize);
  p.stroke('red');
  p.fill(255);
  //p.noStroke();



  p.beginShape();
  let t = drawingData.length
  for (let i = 0; i < t; i++) {
    let l = drawingData[i].pathParts.length
    for (let j = 0; j < l; j++) {

      // set a vertext for the line path
      if (drawingData[i].pathParts[j].partType == 'L' && drawingData[i].pathParts[j].params.length == 2) {

        let x = drawingData[i].pathParts[j].params[0]
        let y = drawingData[i].pathParts[j].params[1]
        p.vertex(x, y);


      } else if (drawingData[i].pathParts[j].partType == 'C' && drawingData[i].pathParts[j].params.length == 6) {

        if (drawingData[i].pathParts.length == 2 && j == 1) {
          let x = drawingData[i].pathParts[0].params[4]
          let y = drawingData[i].pathParts[0].params[5]
          p.vertex(x, y)

        } else {
          let x = drawingData[i].start.x
          let y = drawingData[i].start.y
          p.vertex(x, y)
        }

        let a = drawingData[i].pathParts[j].params[0]
        let b = drawingData[i].pathParts[j].params[1]
        let c = drawingData[i].pathParts[j].params[2]
        let d = drawingData[i].pathParts[j].params[3]
        let e = drawingData[i].pathParts[j].params[4]
        let f = drawingData[i].pathParts[j].params[5]
        p.bezierVertex(a, b, c, d, e, f);

      }
    }
  }

  p.endShape(CLOSE);
  p.pop();
}


function getAllowedBack(c, r) {
  c = constrain(c, 0, COLS - 1);
  r = constrain(r, 0, ROWS - 1);

  // Get the lists of tiles that are not allowed by the neighbours
  let topDisallowed = [];
  if (r > 0 && boardBack[c][r - 1] >= 0) {
    topDisallowed = tiles[boardBack[c][r - 1]].bottomDisallowed;
  }

  let leftDisallowed = [];
  if (c > 0 && boardBack[c - 1][r] >= 0) {
    leftDisallowed = tiles[boardBack[c - 1][r]].rightDisallowed;
  }

  let rightDisallowed = [];
  if (c < COLS - 1 && boardBack[c + 1][r] >= 0) {
    rightDisallowed = tiles[boardBack[c + 1][r]].leftDisallowed;
  }

  let bottomDisallowed = [];
  if (r < ROWS - 1 && boardBack[c][r + 1] >= 0) {
    bottomDisallowed = tiles[boardBack[c][r + 1]].topDisallowed;
  }

  // Create a list of only those tiles that are allowed by neighbours
  let allowedBack = [];
  for (let i = 0; i < tiles.length; i++) {
    if (topDisallowed.indexOf(i) == -1 && bottomDisallowed.indexOf(i) == -1 &&
      leftDisallowed.indexOf(i) == -1 && rightDisallowed.indexOf(i) == -1) {
      allowedBack.push(i);
    }
  }

  return [allowedBack, topDisallowed, leftDisallowed, rightDisallowed, bottomDisallowed];
}

function setTileBack(tileNum) {


  if (lastClickedBack) {
    let c = lastClickedBack[0];
    let r = lastClickedBack[1];

    let [allowedBack, topDisallowed, leftDisallowed, rightDisallowed, bottomDisallowed] = getAllowedBack(c, r);

    // Check if the selected tile can go at this position. If not, then 
    // clear any neighbours that are blocking it.
    if (r > 0 && topDisallowed.indexOf(tileNum) != -1) {
      boardBack[c][r - 1] = -1;
    }
    if (c > 0 && leftDisallowed.indexOf(tileNum) != -1) {
      boardBack[c - 1][r] = -1;
    }
    if (c < COLS - 1 && rightDisallowed.indexOf(tileNum) != -1) {
      boardBack[c + 1][r] = -1;
    }
    if (r < COLS - 1 && bottomDisallowed.indexOf(tileNum) != -1) {
      boardBack[c][r + 1] = -1;
    }

    boardBack[c][r] = tileNum;


  } else {
    isTileSelectedBack = true;
    selectedTileBack = tileNum;
    backCanvas.loop();
  }
  backCanvas.loop();
  return false;

}


function hideBackCanvas() {
  let back = document.getElementById('back-canvas-title');
  let front = document.getElementById('front-canvas-title');
  let hideCanvas = document.getElementById('canvas-holder-back');
  let hideTiles = document.getElementById('allowedTiles-holder');
  

  hideCanvas.style.display = "none";
  hideTiles.style.display = "none";
  back.innerHTML = ""
  front.innerHTML = "3D View"

}

function showBackCanvas() {
  let back = document.getElementById('back-canvas-title');
  let front = document.getElementById('front-canvas-title');
  let hideCanvas = document.getElementById('canvas-holder-back');
  let hideTiles = document.getElementById('allowedTiles-holder');


  hideCanvas.style.display = "block";
   hideTiles.style.display = "block";
  back.innerHTML = "Back Pattern"
  front.innerHTML = "Front Pattern"

}

function showFrontSelected(p) {

  // Iterate over the font Board and display on the backCanvas the missing tiles to make a brick.
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      let a = (COLS - 1) - c
      // Draw the tile if one has been placed.
      // if (board[c][r] >= 0 && boardBack[a][r] == -1) {


      //   p.push();
      //   p.noFill();
      //   p.stroke('yellow');
      //   p.strokeWeight(2);
      //   p.rect(a * tileSize, r * tileSize, tileSize, tileSize);
      //   p.pop();

      // }
    }
  }
  //p.noLoop();
}
*/