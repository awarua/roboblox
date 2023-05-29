class LabelSlider {
  constructor({x, y, min, max, val, inc, label, mouseMoved}){
    this.x = x;
    this.y = y;
    this.label = label;

    this.sld = createSlider(min, max, val, inc);
    this.sld.position(this.x + 90, this.y);
    this.sld.mouseMoved(mouseMoved);
    this.sld.mouseClicked(() => false);
  }

  show(){
    push();
    translate(this.x, this.y + 2);
    noStroke();
    // fill(255);
    // rect(0, 0, this.sld.x + this.sld.width, this.sld.height);

    textAlign(LEFT, TOP);
    fill(255);
    text(this.label, 0, 2);
    textAlign(RIGHT, TOP);
    text(this.sld.value(), 80, 2);
    // text(this.sld.value(), this.sld.x + this.sld.width, 0);
    pop();
  }

  value(){
    return this.sld.value();
  }
}