var app = {
  ROWS: 6,
  COLS: 8,
  MARGIN: 0,
  masterTileSize: 1,
  paramsChanged: true,
  isTileSelected: false,
  tileParams: null,
  tiles: null,
  projector: null,
  p1: null,
  front: null,
  back: null,
  frontBoard2D: null,
  backBoard2D: null,
  board3D: null,
  showFront: null,
  showBack: null,
  settingsVisible: false,
}

var exampleTile = {
  ROWS: 1,
  COLS: 1,
  MARGIN: 0,
  masterTileSize: 1,
  paramsChanged: true,
  isTileSelected: false,
  tileParams: null,
  tiles: null,
  front: new Board(1, 1, () => app.tiles),
  back: new Board(1, 1, () => app.tiles),
}

app.front = new Board(app.ROWS, app.COLS, () => app.tiles);
app.back = new Board(app.ROWS, app.COLS, () => app.tiles);

app.p1 = new p5((s) => {

  s.setup = () => {
    s.noCanvas();

    app.tileParams = new TileParameters();
    exampleTile.tileParams = app.tileParams;

    // Initialise the collection of tiles.
    app.tiles = new Array(256);
    for (let i = 0; i < 256; i++) {
      app.tiles[i] = new Tile(i);
    }

    for (let i = 0; i < 256; i++) {
      app.tiles[i].calculateData(1);
    }

    // Hook up the example tile too
    exampleTile.tiles = app.tiles;
    exampleTile.front.fillRandomly();
    exampleTile.back.fillRandomly();
    
    // Just once - at setup, loop over all the tiles and figure out which are compatibile
    for (let ta of app.tiles) {
      for (let tb of app.tiles) {
        ta.checkCompatability(tb);
      }
    }

    s.setupInputs();
    s.clearGrid();
    // s.noLoop();
  }

  s.draw = () => {
    // Update curves if params have changed
    if (app.paramsChanged){
      for (let i = 0; i < 256; i++) {
        app.tiles[i].calculateData(1);
      }
      s.showJSON();
      app.frontBoard2D.loop();
      app.backBoard2D.loop();
      app?.board3D?.doSetupBricks();
      app?.projector?.window?.board3D?.doSetupBricks();
      app?.exampleTile?.doSetupBricks();
      app.paramsChanged = false;  
    }

    if (app.settingsVisible){
      console.log("settings visible");
      // app?.board3D.noLoop();
      app?.board3D.setDoOrbit(false);
    } else {
      // app?.board3D.loop();
      app?.board3D.setDoOrbit(true);
    }

    // s.clearGrid();
    if (app?.board3D?._setupDone){
      let rot = app?.board3D.getCamRot() || 0;

      //console.log(rot);
      
      if (app?.projector?.window?.board3D?._setupDone){
        app?.projector?.window?.board3D.setCamRot(rot);
      }
    }
  }

  s.setupInputs = () => {
    // Set up the buttons that toggle screens
    let btnShowFront = s.select('#btn-show-front');
    btnShowFront.mouseClicked(() => {
      app?.board3D.setCamFront();
      app?.projector?.window?.board3D?.setCamFront();
    })

    let btnShowBack = s.select('#btn-show-back');
    btnShowBack.mouseClicked(() => {
      app?.board3D.setCamBack();
      app?.projector?.window?.board3D.setCamBack();
    })

    // let btnJSON = s.select('#btn-json');
    // btnJSON.mouseClicked(() => {
    //   s.showJSON();
    // })

    let btnProjector = s.select('#btn-projector');
    btnProjector.mouseClicked(() => {
      app.projector = window.open('projector.html', 'projector', 
        'width=900,height=627');
      app?.projector?.addEventListener('load', () => {
        app?.projector?.setParent(window);
      }, true);
    })

    let btnShowControls = s.select('#btn-show-settings');
    btnShowControls.mouseClicked(() => {
      // console.log('show settings');
      s.select('#settings-row').addClass('isShown');
      app.settingsVisible = true;
    });

    let btnHideControls = s.select('#btn-close-params');
    btnHideControls.mouseClicked(() => {
      s.select('#settings-row').removeClass('isShown');
      app.settingsVisible = false;
    });

    let btnSave = s.select('#btn-save-file');
    btnSave.mouseClicked(() => {
      let json = s.toJSON();
      s.createStringDict(json).saveJSON(`roboblox-${s.formatDate()}.json`);
    })

    // let btnLoad = s.createFileInput((file) => {
    //   let json = file.data;
    //   console.log('loaded json', json);
    // });
    // btnLoad.parent('#file-input-holder');
  }

  s.clearGrid = () => {
    // Set up markup for grid of allowed tiles
    s.select('#allowedTiles-holder').elt.innerHTML = generateGridMarkup(8, 32);
  }

  // HELPERS

  s.showJSON = () => {
    const json = s.toJSON();
    // console.log('showJSON', json);
    // debugger;
    window.electronAPI.updateJSON(json);
    
    // jQuery('#json-holder').get(0).value = JSON.stringify(toJSONBoard(false));

    //   let a = selJSON.value()
    //   saveJSON(toJSONBoard(true), a + '-Pattern-JSON-' + formatDate());
    
    // function formatDate() {
    //   let d = new Date();
    //   let retStr = `${d.getFullYear()}${nf(d.getMonth() + 1, 2, 0)}${nf(d.getDate(),2, 0)}-${nf(d.getHours(), 2, 0)}${nf(d.getMinutes(), 2, 0)}.${nf(d.getSeconds(), 2, 0)}`;
    //   return retStr;
    // }
  
  }

  s.formatDate = () => {
    let d = new Date();
    let retStr = `${d.getFullYear()}${s.nf(d.getMonth() + 1, 2, 0)}${s.nf(d.getDate(),2, 0)}-${s.nf(d.getHours(), 2, 0)}${s.nf(d.getMinutes(), 2, 0)}.${s.nf(d.getSeconds(), 2, 0)}`;
    return retStr;
  }
  
  s.toJSON = (includeCurves) => {
    let morpholo = {
      tileParams: app.tileParams.toJSON(),
      front: app.frontBoard2D.getBoard().toJSON(),
      back: app.backBoard2D.getBoard().toJSON(),
      tiles: app.tiles.map(e => e.toJSON()),
    };
    
    return morpholo;
  }
})
 
app.frontBoard2D = new p5(makeBoard('#canvas-holder-front', app, 
  app.front, false));
app.backBoard2D = new p5(makeBoard('#canvas-holder-back', app, 
  app.back, true));
app.board3D = new p5(make3DBoard('#canvas-holder-3d', () => app, false, 1));

app.exampleTile = new p5(make3DBoard('#example-tile-holder', 
  () => exampleTile, false, 0.8))
// setTimeout(() => {
//   app.p1.select('#settings-row').addClass('hidden');
// }, 100);

app.showFront = () => {
  app.p1.select('#btn-show-front').hide();
  app.p1.select('#btn-show-back').show();
  app.frontBoard2D.setVisible(true);
  app.backBoard2D.setVisible(false);
}

app.showBack = () => {
  app.p1.select('#btn-show-back').hide();
  app.p1.select('#btn-show-front').show();
  app.backBoard2D.setVisible(true);
  app.frontBoard2D.setVisible(false);
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
      if (app.isTileSelected && selectedTile == tileNum) {
        className = ' class="selected" ';
      }

      let svgString = app.tiles[tileNum].svgString

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
