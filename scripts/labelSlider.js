class LabelSlider {
  constructor({parent, x, y, min, max, val, inc, label, mouseMoved}){
    this.parent = parent;
    this.x = x;
    this.y = y;
    this._labelText = label;

    this.div = createDiv().parent(this.parent).class("row");
    this.label = createElement("label").parent(this.div);
  
    this.sld = createSlider(min, max, val, (inc || 1));
    this.sld.parent(this.div);

    // this.sld.position(this.x + 90, this.y);
    this.sld.mouseMoved(() => {
      this.updateLabel();
      mouseMoved();
    });
    this.sld.mouseClicked(() => false);

    this.updateLabel();
  }

  updateLabel(){
    this.label.html(
      `${this._labelText}:<span class="val">${this.sld.value()}</span>`);
  }

  value(){
    return this.sld.value();
  }
}