class LabelSlider {
  constructor({domParent, x, y, min, max, val, inc, label, mouseMoved}){
    this.domParent = domParent;
    this.x = x;
    this.y = y;
    this.label = label;

    this.sld = createSlider(min, max, val, (inc || 1));
    this.sld.parent(this.domParent);
    // this.sld.position(this.x + 90, this.y);
    this.sld.mouseMoved(mouseMoved);
    this.sld.mouseClicked(() => false);
  }

  show(){
  }

  value(){
    return this.sld.value();
  }
}