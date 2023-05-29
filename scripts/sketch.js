var app;
let params;
let uiParams = {
  margin: 10,
  brickSteps: 6,
  masterTileSize: 1,
};
let tiles;
let front;
let back;
let front2D;
let back2D;
let currentBoard2D;
let board3D;
let fnt;

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

  params = new Parameters({rows: 4, cols: 6});
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

  front = new Board(params.rows, params.cols).fillRandomly();
  back = new Board(params.rows, params.cols).fillRandomly();

  // Listen for changes in the front and back tiles
  front.registerListener(showJSON);
  back.registerListener(showJSON); 

  front2D = new Board2D({
    x: uiParams.margin,
    y: 100,
    width: 600, 
    height: 300,
    board: front, 
    isVisible: true,
    label: "Front",
  });

  back2D = new Board2D({
    x: 2 * uiParams.margin + front2D.width,
    y: 100,
    width: 600,
    height: 300,
    board: back, 
    isVisible: true,
    label: "Back",
  });

  currentBoard2D = front2D;
  // app = new App();

  board3D = new Board3D({
    x: uiParams.margin,
    y: front2D.y + front2D.height + uiParams.margin,
    width: front2D.width + uiParams.margin + back2D.width, 
    height: 600,
    front,
    back,
    isVisible: true,
    label: "3D Board",
  });
  // this.board3D = new p5(make3DBoard('#canvas-holder-3d', () => this, 
  // false, 1, this.brickSteps));

  // Set up the electron server to serve json to network
  // (must be running as an electron app for this to work)
  window?.electronAPI?.getServerURL().then((url) => {
    console.log('got server url', url);
    app.serverURL = url;
    sketchMain.select('#server-url-link').attribute('href', url).html(url);
  })
}

function draw(){
  background(50, 125, 50);
  text(`width: ${width}, height: ${height}, fc: ${frameCount}, 
    fr: ${floor(frameRate())}`, 20, 40);

  front2D.show();
  back2D.show();

  // Visual debugging to check layout. 
  // push();
  // fill(255, 0, 0);
  // noStroke();
  // translate(front2D.x, front2D.y);
  // rect(0, 0, front2D.width / 2, 35);
  // rect(0, 0, 35, front2D.height / 2)
  // pop();

  board3D.show();
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

/////////////////////////////////////////////////
// Helpers

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
      // Update curves if params have changed
      if (params.hasChanges){
        app.processChangedParams();
        sketchMain.showJSON();
      }

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