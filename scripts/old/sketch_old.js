

/*

function _setup() {
  viewer.page = createGraphics(900, 400, WEBGL)
  camSetup();

  clearGrid();
  
  selJSON = createSelect();
  selJSON.parent('#selJSON-holder');
  selJSON.option('Front');
  selJSON.option('Back');
  selJSON.selected('Front');
  selJSON.changed(selJSONEvent);
  
  btnFillBoard = createButton('Fill Boards 2');
  btnFillBoard.parent('#btnFillBoard-holder')
  btnFillBoard.elt.addEventListener("click", fillBoard);

  btnClearBoard = createButton('Clear Board');
  btnClearBoard.parent('#btnClearBoard-holder')
  btnClearBoard.elt.addEventListener("click", clearBoard);

  btnClearTile = createButton('Clear Tile');
  btnClearTile.parent('#btnClearTile-holder');
  btnClearTile.elt.addEventListener("click", clearTile);

  btnSaveJSON = createButton('Save JSON');
  btnSaveJSON.parent('#btnSaveJSON-holder');
  btnSaveJSON.elt.addEventListener("click", saveJSONBoard);
  
  rowSlider = createSlider(1, 100, 3);
  rowSlider.parent(select('#sldRows-holder'));
  rowSlider.mouseMoved(sldRowsChanged);
  //rowSlider.mouseClicked(fnFalse);
  rowsTxt = select("#txtRows-holder");
  rowsTxt.html(rowSlider.value());
  
  colsSlider = createSlider(1, 100, 3);
  colsSlider.parent(select('#sldCols-holder'));
  colsSlider.mouseMoved(sldColsChanged);
  //rowSlider.mouseClicked(fnFalse);
  colsTxt = select("#txtCols-holder");
  colsTxt.html(colsSlider.value());
  
  // let btnLoadJSON = createButton('Load JSON');
  // btnLoadJSON.parent('#btnLoadJSON-holder');
  // btnLoadJSON.elt.addEventListener("click", loadJSON2);

  // let btnSaveSVG = createButton('Download SVG');
  // btnSaveSVG.parent('#btnSaveSVG-holder');
  // btnSaveSVG.elt.addEventListener("click", saveSVG);

  
  // slideRotate = createSlider(0, 360, 180);
  // slideRotate.parent(select('#rotate-holder'));
  // slideRotate.mouseMoved(rotateDisplay);
  // // slideRotate.mouseClicked(fnFalse);
  // // this.txtPull = select('#txtPull-holder');
  // // this.txtPull.html(this.pull);
}

/////////////////////////////////////////////////
// Helpers

///////
 // Restores a state from a provided json representation.
 // @param {*} json json representation of state.
 //
function fromJSON(json) {
  // TODO: For now, no sanity checking. Just trust whatever we are given.
  let morpholo = JSON.parse(json);
  tileParams.setParams(morpholo.tileParams);

  // TODO: We should anticipate that there will be different numbers of rows and cols.
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      board[c][r] = morpholo.board[c][r];
    }
  }
  loop();
  backCanvas.loop();
}

function saveSVG() {
  const finalTileSize = 100;
  const margin = MARGIN;
  let w = (finalTileSize + margin) * COLS - margin;
  let h = (finalTileSize + margin) * ROWS - margin;
  let scale = finalTileSize;

  // console.log('fts w: ' + w + ', fts h: ' + h);

  let svgString = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' +
    w + ' ' + h + '" ' +
    'class="bgwhite" xmlns="http://www.w3.org/2000/svg">\n' +
    '<g transform="scale(' + scale + ' ' + scale + ')" >';

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (board[c][r] >= 0) {
        svgString += tiles[board[c][r]].toSVGGroup(c, r, (margin / scale));
      }
    }
  }
  svgString += '</g></svg>';

  jQuery('#svg-holder').get(0).value = svgString;

  save([svgString], 'morpholo-15-' + formatDate(), 'svg');
}

function generateSVGTileSet() {
  let tileCols = 16;
  let tileRows = 16;
  let svgWidth = tileCols * tileSize * 1.2;
  let svgHeight = tileCols * tileSize * 1.2;

  let svgString = '<svg width="' + svgWidth + '" height="' + svgHeight + '" viewBox="0 0 ' +
    svgWidth + ' ' + svgHeight + '" ' +
    'class="bgwhite" xmlns="http://www.w3.org/2000/svg">\n';

  let tileNum = 0;

  for (let c = 0; c < tileCols; c++) {
    for (let r = 0; r < tileRows; r++) {
      svgString += tiles[tileNum].toSVGGroup(c * 1.2, r * 1.2, 1);
      tileNum += 1;
    }
  }
  return svgString += '</svg>';
}

function showAllowedInGrid(allowed) {
  for (let i = 0; i < allowed.length; i++) {
    jQuery('#grid_' + allowed[i]).addClass('allowed');
  }
}

//////
 // Returns an array of all the allowed tiles for a given position.
 // @param {*} x 
 // @param {*} y 
 // @returns Array
 //
function getAllowed(c, r) {
  c = constrain(c, 0, COLS - 1);
  r = constrain(r, 0, ROWS - 1);

  // Get the lists of tiles that are not allowed by the neighbours
  let topDisallowed = [];
  if (r > 0 && board[c][r - 1] >= 0) {
    topDisallowed = tiles[board[c][r - 1]].bottomDisallowed;
  }

  let leftDisallowed = [];
  if (c > 0 && board[c - 1][r] >= 0) {
    leftDisallowed = tiles[board[c - 1][r]].rightDisallowed;
  }

  let rightDisallowed = [];
  if (c < COLS - 1 && board[c + 1][r] >= 0) {
    rightDisallowed = tiles[board[c + 1][r]].leftDisallowed;
  }

  let bottomDisallowed = [];
  if (r < ROWS - 1 && board[c][r + 1] >= 0) {
    bottomDisallowed = tiles[board[c][r + 1]].topDisallowed;
  }

  // Create a list of only those tiles that are allowed by neighbours
  let allowed = [];
  for (let i = 0; i < tiles.length; i++) {
    if (topDisallowed.indexOf(i) == -1 && bottomDisallowed.indexOf(i) == -1 &&
      leftDisallowed.indexOf(i) == -1 && rightDisallowed.indexOf(i) == -1) {
      allowed.push(i);
    }
  }

  return [allowed, topDisallowed, leftDisallowed, rightDisallowed, bottomDisallowed];
}


/////////////////////////////////////////////////
// Event Handlers


function sldRowsChanged(){
  rowsTxt.html(rowSlider.value());
}
function sldColsChanged(){
  colsTxt.html(colsSlider.value());
}

///////
 // Event handler for mouse click. Place a tile at the given x, y.
 ///
function mouseClicked() {
  
 let a = isInsideFrontCanvas(mouseX, mouseY)
 let b = isInsideBackCanvas(backCanvas.mouseX, backCanvas.mouseY)
 
  if (a=== false && b === false) {
  selectedCnv = null
  }
  
  if (isInsideFrontCanvas(mouseX, mouseY)) {
     selectedCnv = true
    // Calculate the row and column index
    let c = floor(mouseX / tileSize);
    let r = floor(mouseY / tileSize);

    // Just to be doubly-sure, use the constrain function to make sure the index is valid
    c = constrain(c, 0, COLS - 1);
    r = constrain(r, 0, ROWS - 1);

    let [allowed, topDisallowed, leftDisallowed, rightDisallowed, bottomDisallowed] = getAllowed(c, r);


    if (isTileSelected) {
      // Check if the selected tile can go at this position. If not, then 
      // clear any neighbours that are blocking it.
      if (topDisallowed.indexOf(selectedTile) != -1) {
        board[c][r - 1] = -1;
      }
      if (leftDisallowed.indexOf(selectedTile) != -1) {
        board[c - 1][r] = -1;
      }
      if (rightDisallowed.indexOf(selectedTile) != -1) {
        board[c + 1][r] = -1;
      }
      if (bottomDisallowed.indexOf(selectedTile) != -1) {
        board[c][r + 1] = -1;
      }

      board[c][r] = selectedTile;

    } else {
      lastClicked = [c, r];
      // Highlight the allowed ones in the grid
      clearGrid();
      showAllowedInGrid(allowed);
    }

    loop();
    backCanvas.loop();
    return false;
  } else {
    lastClicked = null;
    isTileSelected = false;
    selectedTile = null;
    clearGrid();
    loop();
    backCanvas.loop();
  }
}

function fillBoard() {
  console.log('fillBoard()');

  if ( selectedCnv == null){
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (board[c][r] < 0) {
          let [allowed, ...rest] = getAllowed(c, r);
          let newTileNum = allowed[floor(random(allowed.length))];
          board[c][r] = newTileNum;
        }
      }
    }

    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (boardBack[c][r] < 0) {
          let [allowed, ...rest] = getAllowedBack(c, r);
          let newTileNum = allowed[floor(random(allowed.length))];
          boardBack[c][r] = newTileNum;
        }
      }
    }
  }
  
  if ( selectedCnv == true){
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (board[c][r] < 0) {
          let [allowed, ...rest] = getAllowed(c, r);
          let newTileNum = allowed[floor(random(allowed.length))];
          board[c][r] = newTileNum;
        }
      }
    }
  }
  
  if ( selectedCnv == false){
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (boardBack[c][r] < 0) {
          let [allowed, ...rest] = getAllowedBack(c, r);
          let newTileNum = allowed[floor(random(allowed.length))];
          boardBack[c][r] = newTileNum;
        }
      }
    }
  }

  loop();
  backCanvas.loop();
}

function clearBoard() {

  if (selectedCnv == null){
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        board[c][r] = -1;
      }
    }
    //clear back board
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        boardBack[c][r] = -1;
      }
    }
  }
  
  if( selectedCnv == true){
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        board[c][r] = -1;
      }
    }
  }
  
  if (selectedCnv == false){
    //clear back board
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        boardBack[c][r] = -1;
      }
    }
  }
  loop()
  backCanvas.loop();
}

function clearTile() {
  if (lastClicked) {
    board[lastClicked[0]][lastClicked[1]] = -1;
    loop();
  }
  if (lastClickedBack) {
    boardBack[lastClickedBack[0]][lastClickedBack[1]] = -1;

    backCanvas.loop();
  }
}
*/
