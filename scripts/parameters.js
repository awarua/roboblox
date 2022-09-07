
class TileParameters {
  constructor(rotation, mag, pull, sidePull) {

    const DEFAULT_ROTATION = 60;
    const DEFAULT_MAG = 20;
    const DEFAULT_PULL = 50;
    const DEFAULT_SIDE_PULL = 50;

    let _that = this;

    this.rotation = rotation || DEFAULT_ROTATION;
    this.mag = mag || DEFAULT_MAG;
    this.pull = pull || DEFAULT_PULL;
    this.sidePull = sidePull || DEFAULT_SIDE_PULL;

    this.sldRotation = app.p1.createSlider(-180, 180, this.rotation);
    this.sldRotation.parent(app.p1.select('#sldRotation-holder'));
    this.sldRotation.mouseMoved(sldRotationChanged);
    this.sldRotation.mouseClicked(fnFalse);
    this.txtRotation = app.p1.select('#txtRotation-holder');
    this.txtRotation.html(this.rotation);

    this.sldMag = app.p1.createSlider(0, 100, this.mag);
    this.sldMag.parent(app.p1.select('#sldMag-holder'));
    this.sldMag.mouseMoved(sldMagChanged);
    this.sldMag.mouseClicked(fnFalse);
    this.txtMag = app.p1.select('#txtMag-holder');
    this.txtMag.html(this.mag);

    this.sldPull = app.p1.createSlider(0, 100, this.pull);
    this.sldPull.parent(app.p1.select('#sldPull-holder'));
    this.sldPull.mouseMoved(sldPullChanged);
    this.sldPull.mouseClicked(fnFalse);
    this.txtPull = app.p1.select('#txtPull-holder');
    this.txtPull.html(this.pull);

    this.sldSidePull = app.p1.createSlider(0, 100, this.sidePull);
    this.sldSidePull.parent(app.p1.select('#sldSidePull-holder'));
    this.sldSidePull.mouseMoved(sldSidePullChanged);
    this.sldSidePull.mouseClicked(fnFalse);
    this.txtSidePull = app.p1.select('#txtSidePull-holder');
    this.txtSidePull.html(this.sidePull);

    function fnFalse(e) {
      e.stopPropagation();
      return false;
    }
    
    /**
     * Event handler for slider that adjusts central rotation
     */
    function sldRotationChanged() {
      if (_that.sldRotation.value() != _that.rotation) {
        _that.rotation = _that.sldRotation.value();
        _that.txtRotation.html(_that.rotation);
        paramsChanged = true;
        loop();
       backCanvas.loop();
      }
    }
    /**
     * Event handler for slider that adjusts central magnitude
     */
    function sldMagChanged() {
      if (_that.sldMag.value() != _that.mag) {
        _that.mag = _that.sldMag.value();
        _that.txtMag.html(_that.mag);
        paramsChanged = true;
        loop();
         backCanvas.loop();
      }
    }
    /**
     * Event handler for slider that adjusts central pull
     */
    function sldPullChanged() {
      if (_that.sldPull.value() != _that.pull) {
        _that.pull = _that.sldPull.value();
        _that.txtPull.html(_that.pull);
        paramsChanged = true;
        loop();
         backCanvas.loop();
      }
    }
    /**
     * Event handler for slider that adjusts side pull
     */
    function sldSidePullChanged() {
      if (_that.sldSidePull.value() != _that.sidePull) {
        _that.sidePull = _that.sldSidePull.value();
        _that.txtSidePull.html(_that.sidePull);
        paramsChanged = true;
        loop();
         backCanvas.loop();
      }
    }
  }

  setParams(params) {
    this.rotation = params.rotation;
    this.mag = params.mag;
    this.pull = params.mag;
    this.sidePull = params.sidePull;
    paramsChanged = true;
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
