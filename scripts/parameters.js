
class Parameters {

  static defaults = {
    MIN_ROTATION:     -60,
    MAX_ROTATION:      60,
    ROTATION:          60,
    MIN_MAG:            0,
    MAX_MAG:           30,
    MAG:               20,
    MIN_PULL:          20,
    MAX_PULL:          60,
    PULL:              50,
    MIN_SIDE_PULL:      0,
    MAX_SIDE_PULL:     60,
    SIDE_PULL:         50,
    MIN_ROWS:           1,
    MAX_ROWS:          12,
    ROWS:               2,
    MIN_COLS:           1,
    MAX_COLS:          12,
    COLS:               2,
  };

  constructor({x, y, rotation, mag, pull, sidePull, cols, rows}) {
    this.x = x;
    this.y = y;
    this.rotation = rotation || Parameters.defaults.ROTATION;
    this.mag = mag           || Parameters.defaults.MAG;
    this.pull = pull         || Parameters.defaults.PULL;
    this.sidePull = sidePull || Parameters.defaults.SIDE_PULL;
    this.cols = cols         || Parameters.defaults.COLS;
    this.rows = rows         || Parameters.defaults.ROWS;

    this.domParent = select("#params");

    this.hasChanges = false;

    // Set up UI elements.
    let sldX = this.x;
    let sldY = this.y;

    this.sldRotation = new LabelSlider({
      x: sldX,
      y: sldY, 
      min: Parameters.defaults.MIN_ROTATION,
      max: Parameters.defaults.MAX_ROTATION,
      val: this.rotation,
      label: "Rotation",
      mouseMoved: () => this.sldRotationChanged(),
    });

    sldY += uiParams.sldSpaceY;

    this.sldMag = new LabelSlider({
      parent: this.domParent,
      x: sldX,
      y: sldY, 
      min: Parameters.defaults.MIN_MAG, 
      max: Parameters.defaults.MAX_MAG, 
      val: this.mag,
      label: "Magnitude",
      mouseMoved: () => this.sldMagChanged(),
    });

    sldY += uiParams.sldSpaceY;

    this.sldPull = new LabelSlider({
      parent: this.domParent,
      x: sldX,
      y: sldY, 
      min: Parameters.defaults.MIN_PULL, 
      max: Parameters.defaults.MAX_PULL, 
      val: this.pull,
      label: "Pull",
      mouseMoved: () => this.sldPullChanged(),
    });

    sldY += uiParams.sldSpaceY;

    this.sldSidePull = new LabelSlider({
      parent: this.domParent,
      x: sldX,
      y: sldY, 
      min: Parameters.defaults.MIN_SIDE_PULL, 
      max: Parameters.defaults.MAX_SIDE_PULL, 
      val: this.sidePull,
      label: "Side Pull",
      mouseMoved: () => this.sldSidePullChanged(),
    });

    sldY += uiParams.sldSpaceY;

    this.sldNumCols = new LabelSlider({
      parent: this.domParent,
      x: sldX,
      y: sldY,
      min: Parameters.defaults.MIN_COLS, 
      max: Parameters.defaults.MAX_COLS, 
      val: this.cols,
      label: "Columns",
      mouseMoved: () => this.sldNumColsChanged(),
    });
    
    sldY += uiParams.sldSpaceY;

    this.sldNumRows = new LabelSlider({
      parent: this.domParent,
      x: sldX,
      y: sldY,
      min: Parameters.defaults.MIN_ROWS, 
      max: Parameters.defaults.MAX_ROWS, 
      val: this.rows,
      label: "Rows",
      mouseMoved: () => this.sldNumRowsChanged(),
    });
  }

  // Function to draw the parameters to the canvas
  show(){
    this.sldRotation.show();
    this.sldMag.show();
    this.sldPull.show();
    this.sldSidePull.show();
    this.sldNumCols.show();
    this.sldNumRows.show();
  }

  /**
   * Function to stop event propagation (used in initialisation of dom)
   */
  fnFalse(e) {
    e.stopPropagation();
    return false;
  }
    
  /**
   * Event handler for slider that adjusts central rotation
   */
  sldRotationChanged() {
    console.log('mm sld');
    if (this.sldRotation.value() != this.rotation) {
      this.rotation = this.sldRotation.value();
      // this.txtRotation.html(this.rotation);
      this.hasChanges = true;
      // loop();
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return false;
  }

  /**
   * Event handler for slider that adjusts central magnitude
   */
  sldMagChanged() {
    if (this.sldMag.value() != this.mag) {
      this.mag = this.sldMag.value();
      // this.txtMag.html(this.mag);
      this.hasChanges = true;
      // loop();
    }
  }

  /**
   * Event handler for slider that adjusts central pull
   */
  sldPullChanged() {
    if (this.sldPull.value() != this.pull) {
      this.pull = this.sldPull.value();
      // this.txtPull.html(this.pull);
      this.hasChanges = true;
      // loop();
    }
  }

  /**
   * Event handler for slider that adjusts side pull
   */
  sldSidePullChanged() {
    if (this.sldSidePull.value() != this.sidePull) {
      this.sidePull = this.sldSidePull.value();
      // this.txtSidePull.html(this.sidePull);
      this.hasChanges = true;
      // loop();
    }
  }

  /**
   * Event handler for slider that adjusts the number of cols
   */
  sldNumColsChanged() {
    // console.log(this.sldNumCols.value());
    if (this.sldNumCols.value() != this.cols){
      this.cols = this.sldNumCols.value();
      board3D.clearLastClicked();
      // this.txtNumCols.html(this.cols);
      this.hasChanges = true;
    }
  }

  /**
   * Event handler for slider that adjusts the number of rows
   */
  sldNumRowsChanged() {
    // console.log(this.sldNumRows.value());
    if (this.sldNumRows.value() != this.rows){
      this.rows = this.sldNumRows.value();
      board3D.clearLastClicked();
      // this.txtNumRows.html(this.rows);
      this.hasChanges = true;
    }
  }

  setParams(params) {
    this.rotation = params.rotation;
    this.mag = params.mag;
    this.pull = params.mag;
    this.sidePull = params.sidePull;
    this.hasChanges = true;
    this.updateUI();
  }
  
  updateUI() {
    this.sldRotation.value(this.rotation);
    this.sldMag.value(this.mag);
    this.sldPull.value(this.pull);
    this.sldSidePull.value(this.sidePull);
  }

  toJSON(){
    return {
      rotation: this.rotation,
      mag: this.mag,
      pull: this.pull,
      sidePull: this.sidePull,
    };
  }
}
