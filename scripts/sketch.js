let ROWS = 5;
let COLS = 6;
const MARGIN = 0;
const WIREFRAME = false;

let masterTileSize = 1
// let tileSize = masterTileSize;

const SHOW_FRONT = 0;
const SHOW_BACK = 1;
const SHOW_3D = 2;
const SHOW_SETTINGS = 3;
const SHOW_FILES = 4;

const SCREEN_IDS = {
  [SHOW_FRONT]: {
    id: '#front-row',
    btnId: '#btn-show-front',
    isHidden: true,
  },
  [SHOW_BACK]: {
    id: '#back-row',
    btnId: '#btn-show-back',
    isHidden: true,
  },
  [SHOW_3D]: {
    id: '#3d-row',
    btnId: '#btn-show-3d',
    isHidden: true,
  },
  [SHOW_SETTINGS]: {
    id: '#settings-row',
    btnId: '#btn-show-settings',
    isHidden: true,
  },
  [SHOW_FILES]: {
    id: '#files-row',
    btnId: '#btn-show-files',
    isHidden: true,
  },
}

//let visibleScreen = SHOW_FRONT;

// let nextTileToSave = 0;
// let btnSaveNextTile;

// let cvn;
let tiles;
// let frontBoard;
// let selectedCnv = null

// let bricks = [];

let tileParams;
let paramsChanged = true;

// let lastClicked = null;
let isTileSelected = false;
// let selectedTile = null;

// let btnClearTile;
// let btnFillBoard;
// let btnClearBoard;
// let btnView3D;
// let btnExit3D;
// let selJSON;
// let btnSaveJSON;
// let btnMakeJSON;
// let rowsTxt;
// let colsTxt;
// let btnReset;

// let easycam;
// let camState;

// let viewer = {
//   display: false,
//   page: null
// }


let p1 = new p5((s) => {

  s.setup = () => {
    s.noCanvas();

    tileParams = new TileParameters();

    // Initialise the collection of tiles.
    tiles = new Array(256);
    for (let i = 0; i < 256; i++) {
      tiles[i] = new Tile(i);
    }

    // Just once - at setup, loop over all the tiles and figure out which are compatibile
    for (let ta of tiles) {
      for (let tb of tiles) {
        ta.checkCompatability(tb);
      }
    }

    // // This triggers the tiles to generate and memoize their svg string.
    // for (let i = 0; i < 256; i++) {
    //   tiles[i].display(-tileSize, -tileSize, p1);
    // }

    s.setupInputs();
    s.clearGrid();
    s.noLoop();
  }

  s.setupInputs = () => {
    // Set up the buttons that toggle screens
    for (let i of [SHOW_FRONT, SHOW_BACK, SHOW_3D, SHOW_SETTINGS, SHOW_FILES]){
      let {id, btnId} = SCREEN_IDS[i];
      let btn = p1.select(btnId);
      btn.mouseClicked(() => {
        p1.select(id).toggleClass('hidden');
      });
    }
  }

  s.draw = () => {
    s.clearGrid();
  }

  s.clearGrid = () => {
    // Set up markup for grid of allowed tiles
    s.select('#allowedTiles-holder').elt.innerHTML = generateGridMarkup(8, 32);
  }
  
})
 
let frontBoard = new p5(makeBoard('#canvas-holder-front', ROWS, COLS, 
                        false));
let backBoard = new p5(makeBoard('#canvas-holder-back', ROWS, COLS,
                       true));
let board3D = new p5(make3DBoard('#canvas-holder-3d', ROWS, COLS));

function showFront(){
  p1.select('#front-row').removeClass('hidden');
  p1.select('#back-row').addClass('hidden');
}

function showBack(){
  p1.select('#back-row').removeClass('hidden');
  p1.select('#front-row').addClass('hidden');
}

//////
 // Returns html markup for a grid.
 // @param {*} gridRows rows
 // @param {*} gridCols columns
 // @returns String
 //
 function generateGridMarkup(gridRows, gridCols) {
  let markupString = '<table class="grid">';

  for (let r = 0; r < gridRows; r++) {
    markupString += '  <tr>';
    for (let c = 0; c < gridCols; c++) {
      let tileNum = r * gridCols + c;
      let className = '';
      if (isTileSelected && selectedTile == tileNum) {
        className = ' class="selected" ';
      }

      let svgString = tiles[tileNum].svgString

      markupString += '    <td id="grid_' + tileNum + '" ' +
        className +
        'data-tile-num="' + tileNum + '" ">' +
        svgString + '</td>';
    }
    markupString += '  </tr>'
  }
  markupString += '</table>';
  return markupString;
}




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

  btnView3D = createButton('View 3D');
  btnView3D.parent('#btnView3D-holder')
  btnView3D.elt.addEventListener("click", view3D);

  btnExit3D = createButton('Exit 3D');
  btnExit3D.parent('#btnExit3D-holder')
  btnExit3D.elt.addEventListener("click", exit3D);

  btnSaveJSON = createButton('Save JSON');
  btnSaveJSON.parent('#btnSaveJSON-holder');
  btnSaveJSON.elt.addEventListener("click", saveJSONBoard);

  btnMakeJSON = createButton('Make JSON');
  btnMakeJSON.parent('#btnMakeJSON-holder');
  btnMakeJSON.elt.addEventListener("click", makeJSON);
  
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
  
  //"btnReset-holder"
  
  btnReset = createButton('Reset Grid');
  btnReset.parent('#btnReset-holder')
  btnReset.elt.addEventListener("click", reGrid);
  
  // change the JSON button text 
  selJSONEvent()

  // let btnLoadJSON = createButton('Load JSON');
  // btnLoadJSON.parent('#btnLoadJSON-holder');
  // btnLoadJSON.elt.addEventListener("click", loadJSON2);

  // let btnSaveSVG = createButton('Download SVG');
  // btnSaveSVG.parent('#btnSaveSVG-holder');
  // btnSaveSVG.elt.addEventListener("click", saveSVG);

  // btnSaveNextTile = createButton('Save Tile: ' + nextTileToSave);
  // btnSaveNextTile.parent('#btnSaveTileJSON-holder');
  // btnSaveNextTile.elt.addEventListener("click", saveTileJSON);

  // slideRotate = createSlider(0, 360, 180);
  // slideRotate.parent(select('#rotate-holder'));
  // slideRotate.mouseMoved(rotateDisplay);
  // // slideRotate.mouseClicked(fnFalse);
  // // this.txtPull = select('#txtPull-holder');
  // // this.txtPull.html(this.pull);



}

/////
 // Main draw loop
 //
function _draw() {
  // frontBoard.display();


  // if (viewer.display == false) {
  //   draw2D()
  // } else {
  //   draw3D()
  //   viewer.page.reset()
  // }

  // selectCnv()
}


/////////////////////////////////////////////////
// Helpers

function makeJSON() {
  jQuery('#json-holder').get(0).value = JSON.stringify(toJSONBoard(false));
}

function saveJSONBoard() {
  let a = selJSON.value()
  saveJSON(toJSONBoard(true), a + '-Pattern-JSON-' + formatDate());
}

function formatDate() {
  let d = new Date();
  let retStr = `${d.getFullYear()}${nf(d.getMonth() + 1, 2, 0)}${nf(d.getDate(),2, 0)}-${nf(d.getHours(), 2, 0)}${nf(d.getMinutes(), 2, 0)}.${nf(d.getSeconds(), 2, 0)}`;
  return retStr;
}

// function saveTileJSON(){
//   let json = tiles[nextTileToSave].toJSON();
//   saveJSONTile(json, 'tile-' + nextTileToSave);
//   nextTileToSave = (nextTileToSave + 1) % tiles.length;
//   btnSaveNextTile.elt.textContent = "Save Tile: " + nextTileToSave;
// }

function loadJSON2() {
  let json = jQuery('#json-holder').get(0).value;
  // console.log(json);
  fromJSON(json);
}

//////
 // Returns a json representation of current state
 //
function toJSONBoard(includeCurves){
  let morpholo = {};
  if ( selJSON.value() == 'Front'){
    if (includeCurves) {
      morpholo = {
        tileParams,
        board,
        tiles,
      };
    } else {
      morpholo = {
        tileParams,
        board,
      }
    }
  }
  if ( selJSON.value() == 'Back'){
    if (includeCurves) {
      morpholo = {
        tileParams,
        boardBack,
        tiles,
      };
    } else {
      morpholo = {
        tileParams,
        boardBack,
      }
    }
  }
  return morpholo;
}

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

function view3D() {
  if ( ROWS * 100 >400){
    let a = 700 + (ROWS*100)
    easycam.setDistanceMax(a);
    
    let b = -50-(ROWS*30)
     camState.center= [0,b,0]
    easycam.setState(camState)
   
  } else {
    easycam.setDistanceMax(700);
    easycam.center= [0,-50,0]
  }
  
  fullBrickCheck()

  if (fullBrickCheck() === true) {
    hideBackCanvas();

    resizeCanvas(900, 400)
    viewer.display = true

    btnClearTile.elt.disabled = true;
    btnClearBoard.elt.disabled = true;
    btnFillBoard.elt.disabled = true;
    btnView3D.elt.disabled = true;
    btnExit3D.elt.disabled = false;
    btnReset.elt.disabled = true;

    // this loop creates the bricks from the tiles in the board
    bricks = new Array(COLS);
    for (let c = 0; c < COLS; c++) {
      bricks[c] = new Array(ROWS);
      for (let r = 0; r < ROWS; r++) {
        if (board[c][r] > -1) {
          let a = (COLS - 1) - c
          // q is the tile num for the front tile
          let q = board[c][r]
          //s is the tile num for the back tile
          let s = boardBack[a][r]

          // front is the drawing data for the front tile

          tiles[q].drawingData.sides = tiles[q].sides
          let front = tiles[q];

          // back is for the back tile drawing data 
          let back = tiles[s];

          // center is for the center of the brick
          let center = createVector(c * tileSize, r * tileSize);

          // size is the size of the tile
          let size = tiles[q].size;

          bricks[c][r] = new Brick(front, back, center, size);
          // print(bricks[c][r].frontPoints.length)
          // print(bricks[c][r].backPoints.length)
        }
      }
    }
  } else {
    window.alert("Please fill yellow spaces to make a full brick");
  }
  loop()
}

function exit3D() {
  showBackCanvas();

  resizeCanvas(tileSize * COLS, tileSize * ROWS);
  viewer.display = false;

  btnClearTile.elt.disabled = false;
  btnClearBoard.elt.disabled = false;
  btnFillBoard.elt.disabled = false;
  btnView3D.elt.disabled = false;
  btnExit3D.elt.disabled = true;
  btnReset.elt.disabled = false;
}

// check to see if there are matching front and back tils pairs to make a full brick
function fullBrickCheck() {
  let t = true
  // Iterate over the BoardBack and display on the fontCanvas the missing tiles to make a brick.
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      let a = (COLS - 1) - c


      if (board[c][r] >= 0 && boardBack[a][r] == -1) {
        t = false
      }
      if (board[a][r] == -1 && boardBack[c][r] >= 0) {
        t = false
      }
    }
  }

  return t
}

// selectedCnv = true is the front canvase 
//selectedCnv = false is the back canvas 
function selectCnv (){
  
  // change buttons to front canvas 
  if (selectedCnv == true) { 
    btnClearBoard.elt.innerHTML  = "Clear Front Board"
    btnFillBoard.elt.innerHTML  = "Fill Front Board"
  } 

  //change buttons to back canvas
  if(selectedCnv == false ) {
    btnFillBoard.elt.innerHTML  = "Fill Back Board"
    btnClearBoard.elt.innerHTML  = "Clear Back Board"   
  }
  
  if (selectedCnv == null) { 
    btnClearBoard.elt.innerHTML  = "Clear Boards"
    btnFillBoard.elt.innerHTML  = "Fill Boards 3"
  }
}

function selJSONEvent(){
  //   let btnSaveJSON = createButton('Save JSON');
  //   btnSaveJSON.parent('#btnSaveJSON-holder');
  //   btnSaveJSON.elt.addEventListener("click", saveJSONBoard);

  //   let btnMakeJSON = createButton('Make JSON');
  //   btnMakeJSON.parent('#btnMakeJSON-holder');
  //   btnMakeJSON.elt.addEventListener("click", makeJSON);

  if ( selJSON.value() == 'Front'){ 
    btnSaveJSON.elt.innerHTML  = "Save Front JSON"
    btnMakeJSON.elt.innerHTML  = "Make Front JSON"
  }

  if( selJSON.value() == 'Back'){
    btnSaveJSON.elt.innerHTML  = "Save Back JSON"
    btnMakeJSON.elt.innerHTML  = "Make Back JSON" 
  }
}

function reGrid(){
  //    let frontWidth = document.getElementById('front-div')
  //      .getBoundingClientRect(),
  //        colWidth = frontWidth.right - frontWidth.left;
   
  ROWS = rowSlider.value()
  COLS = colsSlider.value()
  
  // Initialise the board. -1 signifies no tile.
  board = new Array(COLS);
  for (let c = 0; c < COLS; c++) {
    board[c] = new Array(ROWS);
    for (let r = 0; r < ROWS; r++) {
      board[c][r] = -1;
    }
  }
  
  // Initialise the board. -1 signifies no tile.
  boardBack = new Array(COLS);
  for (let c = 0; c < COLS; c++) {
    boardBack[c] = new Array(ROWS);
    for (let r = 0; r < ROWS; r++) {
      boardBack[c][r] = -1;
    }
  }

  resizeWindow()
 
  //frontCanvas.reset();
  //backCanvas.reset(); 
  //   resizeCanvas(tileSize * COLS, tileSize * ROWS);
  //   backCanvas.resizeCanvas(tileSize * COLS, tileSize * ROWS);
  
  loop();
  backCanvas.loop();
}

function resizeWindow(){
  let frontWidth = document.getElementById('front-div').getBoundingClientRect();
  let colWidth = frontWidth.right - frontWidth.left;
  
  // if the canvas is bigger then the column width resize tiles 
  if ( masterTileSize*COLS >= colWidth){
    tileSize = (colWidth-20)/COLS;
  }  else if ( colWidth >= masterTileSize*COLS  ){
    tileSize = masterTileSize;
  }
  
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].size = tileSize  
  }
 
  resizeCanvas(tileSize * COLS, tileSize * ROWS);
  backCanvas.resizeCanvas(tileSize * COLS, tileSize * ROWS);
}

function windowResized() {
  resizeWindow()
}
*/