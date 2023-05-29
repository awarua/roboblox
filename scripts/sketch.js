var app;
let params;
let uiParams = {
  margin: 10,
  brickSteps: 6,
  masterTileSize: 1,
  btnSpaceX: 80,
  sldSpaceY: 30,
};
let tiles;
let front;
let back;
let front2D;
let back2D;
let currentBoard2D;
let board3D;
let fnt;

let btn = {};
let sld = {};

/*
var exampleTile = {
  ROWS: 1,
  COLS: 1,
  MARGIN: 0,
  masterTileSize: 1,
  isTileSelected: false,
  tileParams: null,
  tiles: null,
  front: new Board(1, 1, () => tiles),
  back: new Board(1, 1, () => tiles),
}
*/

// Need to load a font to use text in WebGL mode
function preload(){
  fnt = loadFont("styles/iconsolata/Inconsolata.otf");
}

function setup(){
  createCanvas(windowWidth, windowHeight);

  params = new Parameters({
    x: uiParams.margin * 2,
    y: 550,
    rows: 4, 
    cols: 6
  });
  // params = new Parameters({rows: 1, cols: 1});

  // Initialise the collection of tiles.
  tiles = new Array(256);
  for (let i = 0; i < 256; i++) {
    tiles[i] = new Tile(i);
  }

  // Loop over the tiles and figure out which are compatibile
  for (let ta of tiles) {
    for (let tb of tiles) {
      ta.checkCompatability(tb);
    }
  }  

  // Calculate the drawing data for the tiles
  for (let i = 0; i < 256; i++) {
    tiles[i].calculateData(1);
  }

  front = new Board(
    Parameters.defaults.MAX_ROWS,
    Parameters.defaults.MAX_COLS).fillRandomly();
  back = new Board(
    Parameters.defaults.MAX_ROWS,
    Parameters.defaults.MAX_COLS).fillRandomly();

  // Listen for changes in the front and back tiles
  front.registerListener(showJSON);
  back.registerListener(showJSON); 

  board3D = new Board3D({
    x: uiParams.margin,
    y: 100,
    width: 600, 
    height: 400,
    front,
    back,
    isVisible: true,
    label: "3D Board",
  });

  front2D = new Board2D({
    x: 2 * uiParams.margin + board3D.width,
    y: board3D.y,
    width: board3D.width, 
    height: board3D.height,
    board: front, 
    isVisible: true,
    label: "Front",
  });

  back2D = new Board2D({
    x: front2D.x,
    y: front2D.y,
    width: front2D.width,
    height: front2D.height,
    board: back, 
    isVisible: false,
    label: "Back",
  });

  currentBoard2D = front2D;
  // app = new App();

  // this.board3D = new p5(make3DBoard('#canvas-holder-3d', () => this, 
  // false, 1, this.brickSteps));

  // Set up the electron server to serve json to network
  // (must be running as an electron app for this to work)
  window?.electronAPI?.getServerURL().then((url) => {
    console.log('got server url', url);
    app.serverURL = url;
    sketchMain.select('#server-url-link').attribute('href', url).html(url);
  })

  // Set up buttons
  btn["showFront"] = createButton("Show Front")
    .mousePressed(showFront)
    .position(100, 50);
  btn["showBack"] = createButton("Show Back")
    .mousePressed(showBack)
    .position(100 + uiParams.btnSpaceX, 50);

  // Set up sliders
  sld[""]
}

function draw(){
  background(50, 125, 50);
  text(`width: ${width}, height: ${height}, fc: ${frameCount}, 
    fr: ${floor(frameRate())}`, 20, 40);

  // Update curves if params have changed
  if (params.hasChanges){
    processChangedParams();
    showJSON();
  }

  board3D.show();

  currentBoard2D.show();

  params.show();

  // Visual debugging to check layout. 
  // push();
  // fill(255, 0, 0);
  // noStroke();
  // translate(front2D.x, front2D.y);
  // rect(0, 0, front2D.width / 2, 35);
  // rect(0, 0, 35, front2D.height / 2)
  // pop();
}

/////////////////////////////////////////////////
// Event handlers

function mouseClicked(){
  // console.log('mc');
  front2D.mouseClicked(mouseX, mouseY);
  back2D.mouseClicked(mouseX, mouseY);
}

function mousePressed(){
  board3D.mousePressed(mouseX, mouseY);
}

function mouseDragged(){
  board3D.mouseDragged(mouseX, mouseY);
}

function mouseReleased(){
  board3D.mouseReleased(mouseX, mouseY);
}

// Should be called when the side of the 3D board is set to change
// side: string, which side ['front', 'back']
// snap: boolean, whether other elements should snap to 0, 180 deg.
function sideChanged(side, snap){
  console.log('sc', side, snap);
  let snapTo = 0;
  if (side === "front"){
    currentBoard2D = front2D;
  } else if (side === "back"){
    currentBoard2D = back2D;    
    snapTo = 180;
  }
  currentBoard2D.isVisible = true;

  if (snap){
    board3D.setRotY(snapTo);
  }
}

// Event handler for 'show front' button
function showFront(){
  console.log('sf');
  sideChanged("front", true);
}

// Event handler for 'show back' button
function showBack(){
  console.log('sb');
  sideChanged("back", true);
}

/////////////////////////////////////////////////
// Helpers

function processChangedParams(){
  for (let i = 0; i < 256; i++) {
    tiles[i].calculateData(1);
  }

  // front2D.loop();
  // back2D.loop();
  front2D.setupGraphics();
  back2D.setupGraphics();
  board3D.setupScale();
  board3D.setupBricks();
  // projector?.window?.board3D?.doSetupBricks();
  // exampleTile?.doSetupBricks();
  params.hasChanges = false;
}

function showJSON() {
  const json = toJSON();
  // console.log('showJSON', json);
  // debugger;
  window?.electronAPI?.updateJSON(json);
  
  // select('#json-holder').get(0).value = JSON.stringify(toJSONBoard(false));

  //   let a = selJSON.value()
  //   saveJSON(toJSONBoard(true), a + '-Pattern-JSON-' + formatDate());
  
  // function formatDate() {
  //   let d = new Date();
  //   let retStr = `${d.getFullYear()}${nf(d.getMonth() + 1, 2, 0)}${nf(d.getDate(),2, 0)}-${nf(d.getHours(), 2, 0)}${nf(d.getMinutes(), 2, 0)}.${nf(d.getSeconds(), 2, 0)}`;
  //   return retStr;
  // }
}

function toJSON(includeCurves) {
  let morpholo = {
    tileParams: params.toJSON(),
    front: front.toJSON(),
    back: back.toJSON(),
    tiles: tiles.map(e => e.toJSON()),
  };
  
  return morpholo;
}

function initMainSketch(){
  return new p5((sketchMain) => {
  
    sketchMain.setup = () => {
      sketchMain.noCanvas();

      app.init();

      exampleTile.tileParams = params;

      // Hook up the example tile too
      exampleTile.tiles = tiles;
      exampleTile.front.fill(234); // fillRandomly();
      exampleTile.back.fill(213); // fillRandomly();

      sketchMain.setupInputs();
      sketchMain.clearGrid();
      // s.noLoop();

    }

    sketchMain.draw = () => {
      app.show();
    }

    sketchMain.setupInputs = () => {
      // Set up the buttons that toggle screens
      let btnShowFront = sketchMain.select('#btn-show-front');
      btnShowFront.mouseClicked(() => {
        app?.board3D.setCamFront();
        app?.projector?.window?.board3D?.setCamFront();
      })

      let btnShowBack = sketchMain.select('#btn-show-back');
      btnShowBack.mouseClicked(() => {
        app?.board3D.setCamBack();
        app?.projector?.window?.board3D.setCamBack();
      })

      // let btnJSON = s.select('#btn-json');
      // btnJSON.mouseClicked(() => {
      //   s.showJSON();
      // })

      // let btnProjector = s.select('#btn-projector');
      // btnProjector.mouseClicked(() => {
      //   app.projector = window.open('projector.html', 'projector', 
      //     'width=900,height=627');
      //   app?.projector?.addEventListener('load', () => {
      //     app?.projector?.setParent(window);
      //   }, true);
      // })

      let btnShowControls = sketchMain.select('#btn-show-settings');
      btnShowControls.mouseClicked(() => {
        // console.log('show settings');
        sketchMain.select('#settings-row').addClass('isShown');
        app.settingsVisible = true;
      });

      let btnHideControls = sketchMain.select('#btn-close-params');
      btnHideControls.mouseClicked(() => {
        sketchMain.select('#settings-row').removeClass('isShown');
        app.settingsVisible = false;
      });

      let btnSave = sketchMain.select('#btn-save-file');
      btnSave.mouseClicked(() => {
        let json = sketchMain.toJSON();
        sketchMain.createStringDict(json).saveJSON(`roboblox-${sketchMain.formatDate()}.json`);
      })

      // let btnLoad = s.createFileInput((file) => {
      //   let json = file.data;
      //   console.log('loaded json', json);
      // });
      // btnLoad.parent('#file-input-holder');
    }

    sketchMain.clearGrid = () => {
      // Set up markup for grid of allowed tiles
      sketchMain.select('#allowedTiles-holder').elt.innerHTML = generateGridMarkup(8, 32);
    }

    // HELPERS

    sketchMain.formatDate = () => {
      let d = new Date();
      let retStr = `${d.getFullYear()}${sketchMain.nf(d.getMonth() + 1, 2, 0)}${sketchMain.nf(d.getDate(),2, 0)}-${sketchMain.nf(d.getHours(), 2, 0)}${sketchMain.nf(d.getMinutes(), 2, 0)}.${sketchMain.nf(d.getSeconds(), 2, 0)}`;
      return retStr;
    }
})};

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