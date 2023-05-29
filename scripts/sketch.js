var app;
let params;
let uiParams = {
  margin: 10,
  brickSteps: 6,
  masterTileSize: 1,
  btnSpaceX: 80,
  sldSpaceY: 30,
  pickerBand: 20,
};
let tiles;
let front;
let back;
// let front2D;
// let back2D;
// let currentBoard2D;
let board3D;
let fnt;

let btn = {};

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
    x: 0,
    y: 0,
    width, 
    height,
    front,
    back,
    isVisible: true,
    label: "3D Board",
  });

  // front2D = new Board2D({
  //   x: 2 * uiParams.margin + board3D.width,
  //   y: board3D.y,
  //   width: board3D.width, 
  //   height: board3D.height,
  //   board: front, 
  //   isVisible: true,
  //   label: "Front",
  // });

  // back2D = new Board2D({
  //   x: front2D.x,
  //   y: front2D.y,
  //   width: front2D.width,
  //   height: front2D.height,
  //   board: back, 
  //   isVisible: false,
  //   label: "Back",
  // });

  // currentBoard2D = front2D;
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
  params.show();
}

/////////////////////////////////////////////////
// Event handlers

function mouseClicked(){
  board3D.mouseClicked(mouseX, mouseY);
}

function mousePressed(){
  board3D.mousePressed(mouseX, mouseY);
}

function mouseDragged(){
  board3D.mouseDragged(mouseX, mouseY);
}

// Event handler for 'show front' button
function showFront(){
  board3D.setRotY(0);
}

// Event handler for 'show back' button
function showBack(){
  board3D.setRotY(180);
}

/////////////////////////////////////////////////
// Helpers

function processChangedParams(){
  for (let i = 0; i < 256; i++) {
    tiles[i].calculateData(1);
  }
  board3D.setupScale();
  board3D.setupBricks();
  // projector?.window?.board3D?.doSetupBricks();
  params.hasChanges = false;
}

function showJSON() {
  const json = toJSON();
  window?.electronAPI?.updateJSON(json);
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
