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
let board3D;
let fnt;

let btn = {};

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

  // Set up the electron server to serve json to network
  // (must be running as an electron app for this to work)
  window?.electronAPI?.getServerURL().then((url) => {
    console.log('got server url', url);
    app.serverURL = url;
    sketchMain.select('#server-url-link').attribute('href', url).html(url);
  })

  // Set up buttons
  btn["showFront"] = createButton("Show Front").mousePressed(showFront);
  btn["showBack"] = createButton("Show Back")
    .mousePressed(showBack);

  btn["showBack"].position(
    width - btn["showBack"].width - uiParams.margin, 
    height - btn["showBack"].height - uiParams.margin);    

  btn["showFront"].position(
    width - btn["showFront"].width - btn["showBack"].width 
    - 2 * uiParams.margin , 
    height - btn["showFront"].height - uiParams.margin);

}

function draw(){
  // Update curves if params have changed
  if (params.hasChanges){
    processChangedParams();
    showJSON();
  }

  board3D.show();
}

/////////////////////////////////////////////////
// Event handlers

function mousePressed(){
  board3D.mousePressed(mouseX, mouseY);
}

function mouseDragged(){
  board3D.mouseDragged(mouseX, mouseY);
}

function mouseClicked(){
  board3D.mouseClicked(mouseX, mouseY);
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
