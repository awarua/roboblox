var app = {
  ROWS: 2,
  COLS: 2,
  MARGIN: 0,
  brickSteps: 7,
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
  serverURL: '',
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

    window.electronAPI.getServerURL().then((url) => {
      console.log('got server url', url);
      app.serverURL = url;
      s.select('#server-url-link').attribute('href', url).html(url);
    })

    // Listen for changes in the front and back tiles
    app.front.registerListener(s.showJSON);
    app.back.registerListener(s.showJSON);
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
    console.log('showJSON', json);
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
app.board3D = new p5(make3DBoard('#canvas-holder-3d', () => app, false, 1, 
  app.brickSteps));

app.exampleTile = new p5(make3DBoard('#example-tile-holder', 
  () => exampleTile, false, 0.8, app.brickSteps))
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