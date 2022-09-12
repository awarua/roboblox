

// let board3D = new p5(make3DBoard('#canvas-holder-3d', ROWS, COLS))

window.board3D = null;
let parent;

let p1 = new p5((s) => {
  let parent;

  s.setup = () => {
    s.noCanvas();
  }

  s.hideFullscreenBtn = () => {
    s.select('#btn-fullscreen').hide();
  }

  s.hideWindowedBtn = () => {
    s.select('#btn-windowed').hide();
  }

})

setParent = (_parent) => {
  parent = _parent;
  document.querySelector('#btn-fullscreen').addEventListener(
    'click', () => {
      p1.hideFullscreenBtn();
      p1.hideWindowedBtn();
      toggleFullscreen();
    }
  )  

  document.querySelector('#btn-windowed').addEventListener(
    'click', () => {
      p1.hideFullscreenBtn();
      p1.hideWindowedBtn();

      let appFn = () => parent.app;

      window.board3D = new p5(make3DBoard('#canvas-holder-3d-projector',
      appFn, false, 1))
    }
  )  

}

document.addEventListener(
  'fullscreenchange', (event) => {
    console.log('fullscreen');
    let appFn = () => parent.app;
    window.board3D = new p5(make3DBoard('#canvas-holder-3d-projector',
      appFn, true, 0.8))   
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
