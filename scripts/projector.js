

// let board3D = new p5(make3DBoard('#canvas-holder-3d', ROWS, COLS))

window.board3D = null;
let parent;

let projectorSketch = new p5((sketchProjector) => {
  let parent;

  sketchProjector.setup = () => {
    sketchProjector.noCanvas();
  }

  sketchProjector.hideFullscreenBtn = () => {
    sketchProjector.select('#btn-fullscreen').hide();
  }

  sketchProjector.hideWindowedBtn = () => {
    sketchProjector.select('#btn-windowed').hide();
  }

})

setParent = (_parent) => {
  parent = _parent;
  document.querySelector('#btn-fullscreen').addEventListener(
    'click', () => {
      projectorSketch.hideFullscreenBtn();
      projectorSketch.hideWindowedBtn();
      toggleFullscreen();
    }
  )  

  document.querySelector('#btn-windowed').addEventListener(
    'click', () => {
      projectorSketch.hideFullscreenBtn();
      projectorSketch.hideWindowedBtn();

      let appFn = () => parent.app;

      window.board3D = new p5(make3DBoard('#canvas-holder-3d-projector',
      appFn, false, 1, appFn().brickSteps))
    }
  )  

}

document.addEventListener(
  'fullscreenchange', (event) => {
    console.log('fullscreen');
    let appFn = () => parent.app;
    window.board3D = new p5(make3DBoard('#canvas-holder-3d-projector',
      appFn, true, 0.8, appFn().brickSteps))   
});

function toggleFullscreen() {
  let elem = document.querySelector("#main-elt");

  console.log('elem', elem);

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch((err) => {
      alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
    });
  } else {
    document.exitFullscreen();
  }
}
