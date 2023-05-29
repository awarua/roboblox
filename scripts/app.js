class App {
  constructor() {
    this.isTileSelected = false
    this.projector = null
    this.frontBoard2D = null
    this.backBoard2D = null
    this.board3D = null
    this.showFront = null
    this.showBack = null
    this.settingsVisible = false
    this.serverURL = ''

    /*

    // this.exampleTile = new p5(make3DBoard('#example-tile-holder', 
    //   () => exampleTile, false, 0.8, this.brickSteps))

    // setTimeout(() => {
    //   select('#settings-row').addClass('hidden');
    // }, 100);
    */
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
    select('#btn-show-front').hide();
    select('#btn-show-back').show();
    this.frontBoard2D.setVisible(true);
    this.backBoard2D.setVisible(false);
  }
  
  showBack() {
    select('#btn-show-back').hide();
    select('#btn-show-front').show();
    this.backBoard2D.setVisible(true);
    this.frontBoard2D.setVisible(false);
  }

  processChangedParams(){
    for (let i = 0; i < 256; i++) {
      tiles[i].calculateData(1);
    }

    this.frontBoard2D.loop();
    this.backBoard2D.loop();
    this?.board3D?.doSetupBricks();
    this?.projector?.window?.board3D?.doSetupBricks();
    this?.exampleTile?.doSetupBricks();
    params.hasChanges = false;
  }
}
