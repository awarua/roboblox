
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
    MAX_ROWS:          20,
    ROWS:               2,
    MIN_COLS:           1,
    MAX_COLS:          20,
    COLS:               2,
  };

  constructor({rotation, mag, pull, sidePull, cols, rows}) {
    this.rotation = rotation || Parameters.defaults.ROTATION;
    this.mag = mag           || Parameters.defaults.MAG;
    this.pull = pull         || Parameters.defaults.PULL;
    this.sidePull = sidePull || Parameters.defaults.SIDE_PULL;
    this.cols = cols         || Parameters.defaults.COLS;
    this.rows = rows         || Parameters.defaults.ROWS;
    
    // Dom elements that will be initialized later
    this.sldNumCols = null;
    this.txtNumCols = null;
    this.sldNumRows = null;
    this.txtNumRows = null;
    this.sldRotation = null;
    this.txtRotation = null;
    this.sldMag = null;
    this.txtMag = null;
    this.sldPull = null;
    this.txtPull = null;
    this.sldSidePull = null;
    this.txtSidePull = null;
    this.hasChanges = false;

    /* TODO: Figure out the UI for the parameters.
    // Function to initialize dom elements once p5 is ready.
    this.sldNumCols = createSlider(2, 10, this.cols);
    this.sldNumCols.parent(select("#sldNumCols-holder"));
    this.sldNumCols.mouseClicked(this.fnFalse);
    this.sldNumCols.mouseMoved(this.sldNumColsChanged)
    this.txtNumCols = select('#txtNumCols-holder');
    this.txtNumCols.html(this.cols);

    this.sldNumRows = createSlider(2, 10, this.rows);
    this.sldNumRows.parent(select("#sldNumRows-holder"));
    this.sldNumRows.mouseClicked(this.fnFalse);
    this.sldNumRows.mouseMoved(this.sldNumRowsChanged)
    this.txtNumRows = select('#txtNumRows-holder');
    this.txtNumRows.html(this.rows);

    this.sldRotation = createSlider(
      Parameters.defaults.MIN_ROTATION,
      Parameters.defaults.MAX_ROTATION,
      this.rotation);
    this.sldRotation.parent(select('#sldRotation-holder'));
    this.sldRotation.mouseMoved(this.sldRotationChanged);
    this.sldRotation.mouseClicked(this.fnFalse);
    this.txtRotation = select('#txtRotation-holder');
    this.txtRotation.html(this.rotation);

    this.sldMag = createSlider(
      Parameters.defaults.MIN_MAG, 
      Parameters.defaults.MAX_MAG, 
      this.mag);
    this.sldMag.parent(select('#sldMag-holder'));
    this.sldMag.mouseMoved(this.sldMagChanged);
    this.sldMag.mouseClicked(this.fnFalse);
    this.txtMag = select('#txtMag-holder');
    this.txtMag.html(this.mag);

    this.sldPull = createSlider(
      Parameters.defaults.MIN_PULL, 
      Parameters.defaults.MAX_PULL, 
      this.pull);
    this.sldPull.parent(select('#sldPull-holder'));
    this.sldPull.mouseMoved(this.sldPullChanged);
    this.sldPull.mouseClicked(this.fnFalse);
    this.txtPull = select('#txtPull-holder');
    this.txtPull.html(this.pull);

    this.sldSidePull = createSlider(
      Parameters.defaults.MIN_SIDE_PULL, 
      Parameters.defaults.MAX_SIDE_PULL, 
      this.sidePull);
    this.sldSidePull.parent(select('#sldSidePull-holder'));
    this.sldSidePull.mouseMoved(this.sldSidePullChanged);
    this.sldSidePull.mouseClicked(this.fnFalse);
    this.txtSidePull = select('#txtSidePull-holder');
    this.txtSidePull.html(this.sidePull);
    */
  }

  /**
   * Function to stop event propagation (used in initialisation of dom)
   */
  fnFalse(e) {
    e.stopPropagation();
    return false;
  }

  /**
   * Event handler for slider that adjusts the number of cols
   */
  sldNumColsChanged() {
    // console.log(this.sldNumCols.value());
    if (this.sldNumCols.value() != this.cols){
      this.cols = this.sldNumCols.value();
      this.txtNumCols.html(this.cols);
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
      this.txtNumRows.html(this.rows);
      // TODO
      // this.hasChanges = true;
    }
  }
    
  /**
   * Event handler for slider that adjusts central rotation
   */
  sldRotationChanged() {
    if (this.sldRotation.value() != this.rotation) {
      this.rotation = this.sldRotation.value();
      this.txtRotation.html(this.rotation);
      this.hasChanges = true;
      // loop();
    }
  }

  /**
   * Event handler for slider that adjusts central magnitude
   */
  sldMagChanged() {
    if (this.sldMag.value() != this.mag) {
      this.mag = this.sldMag.value();
      this.txtMag.html(this.mag);
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
      this.txtPull.html(this.pull);
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
      this.txtSidePull.html(this.sidePull);
      this.hasChanges = true;
      // loop();
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
