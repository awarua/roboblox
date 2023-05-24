class App {
  constructor() {
    this.MARGIN = 0
    this.brickSteps = 7
    this.masterTileSize = 1
    this.paramsChanged = true
    this.isTileSelected = false
    this.projector = null
    this.frontBoard2D = null
    this.backBoard2D = null
    this.board3D = null
    this.showFront = null
    this.showBack = null
    this.settingsVisible = false
    this.serverURL = ''

    this.tiles = new Array(256);
    this.params = new TileParameters({});

    this.mainSketch = initMainSketch();

    this.front = new Board(
      this.params.rows, this.params.cols, () => this.tiles);
    this.back = new Board(
      this.params.rows, this.params.cols, () => this.tiles);

    this.setupBoards();

    // this.exampleTile = new p5(make3DBoard('#example-tile-holder', 
    //   () => exampleTile, false, 0.8, this.brickSteps))

    // setTimeout(() => {
    //   this.mainSketch.select('#settings-row').addClass('hidden');
    // }, 100);
  }

  init() {
    this.params.init();

    // Initialise the collection of tiles.
    for (let i = 0; i < 256; i++) {
      this.tiles[i] = new Tile(i);
    }

    for (let i = 0; i < 256; i++) {
      this.tiles[i].calculateData(1);
    }

    // Just once - at setup, loop over all the tiles and figure out which are compatibile
    for (let ta of this.tiles) {
      for (let tb of this.tiles) {
        ta.checkCompatability(tb);
      }
    }  

    // Listen for changes in the front and back tiles
    this.front.registerListener(this.mainSketch.showJSON);
    this.back.registerListener(this.mainSketch.showJSON);    
  }
   
  setupBoards() {
    this.frontBoard2D = new p5(makeBoard('#canvas-holder-front', this, 
      this.front, false, null, 'Front Side'));
    this.backBoard2D = new p5(makeBoard('#canvas-holder-back', this, 
      this.back, true, null, 'Back Side'));

    this.board3D = new p5(make3DBoard('#canvas-holder-3d', () => this, 
      false, 1, this.brickSteps));
  }

  show(){
    if (this.settingsVisible){
      this?.board3D.setDoOrbit(false);
    } else {
      this?.board3D.setDoOrbit(true);
    }

    if (this?.board3D?._setupDone){
      let rot = this?.board3D.getCamRot() || 0;
      if (this?.projector?.window?.board3D?._setupDone){
        this?.projector?.window?.board3D.setCamRot(rot);
      }
    } else {
      console.log('board3D setup not done', this, this.board3D, this.board3D._setupDone);
    }   
  }
  
  showFront() {
    this.mainSketch.select('#btn-show-front').hide();
    this.mainSketch.select('#btn-show-back').show();
    this.frontBoard2D.setVisible(true);
    this.backBoard2D.setVisible(false);
  }
  
  showBack() {
    this.mainSketch.select('#btn-show-back').hide();
    this.mainSketch.select('#btn-show-front').show();
    this.backBoard2D.setVisible(true);
    this.frontBoard2D.setVisible(false);
  }

  processChangedParams(){
    for (let i = 0; i < 256; i++) {
      this.tiles[i].calculateData(1);
    }

    this.frontBoard2D.loop();
    this.backBoard2D.loop();
    this?.board3D?.doSetupBricks();
    this?.projector?.window?.board3D?.doSetupBricks();
    this?.exampleTile?.doSetupBricks();
    this.paramsChanged = false;
  }
}
