var app = new App();

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

function initMainSketch(){
  return new p5((sketchMain) => {
  
    sketchMain.setup = () => {
      sketchMain.noCanvas();

      app.init();

      exampleTile.tileParams = app.params;

      // Hook up the example tile too
      exampleTile.tiles = app.tiles;
      exampleTile.front.fill(234); // fillRandomly();
      exampleTile.back.fill(213); // fillRandomly();

      sketchMain.setupInputs();
      sketchMain.clearGrid();
      // s.noLoop();

      window.electronAPI.getServerURL().then((url) => {
        console.log('got server url', url);
        app.serverURL = url;
        sketchMain.select('#server-url-link').attribute('href', url).html(url);
      })
    }

    sketchMain.draw = () => {
      // Update curves if params have changed
      if (app.paramsChanged){
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

    sketchMain.showJSON = () => {
      const json = sketchMain.toJSON();
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

    sketchMain.formatDate = () => {
      let d = new Date();
      let retStr = `${d.getFullYear()}${sketchMain.nf(d.getMonth() + 1, 2, 0)}${sketchMain.nf(d.getDate(),2, 0)}-${sketchMain.nf(d.getHours(), 2, 0)}${sketchMain.nf(d.getMinutes(), 2, 0)}.${sketchMain.nf(d.getSeconds(), 2, 0)}`;
      return retStr;
    }
    
    sketchMain.toJSON = (includeCurves) => {
      let morpholo = {
        tileParams: app.params.toJSON(),
        front: app.frontBoard2D.getBoard().toJSON(),
        back: app.backBoard2D.getBoard().toJSON(),
        tiles: app.tiles.map(e => e.toJSON()),
      };
      
      return morpholo;
    }
  })
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