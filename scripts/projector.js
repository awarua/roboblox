

// let board3D = new p5(make3DBoard('#canvas-holder-3d', ROWS, COLS))

let board3D;
let parent;

let p1 = new p5((s) => {
  let parent;

  s.setup = () => {
    s.noCanvas();
  }

  s.hideFullscreenBtn = () => {
    s.select('#btn-fullscreen').hide();
  }

})

setParent = (_parent) => {
  parent = _parent;
  document.querySelector('#btn-fullscreen').addEventListener(
    'click', () => {
      toggleFullscreen();
      p1.hideFullscreenBtn();
    }
  )  
}

document.addEventListener(
  'fullscreenchange', (event) => {
     console.log('fullscreen');
    //  setTimeout(() => {
      let appFn = () => parent.app;
      board3D = new p5(make3DBoard('#canvas-holder-3d', appFn, true, 0.8))   
    //  }, 1000);
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
