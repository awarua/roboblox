/*
function draw2D() {

  background(51);

  clearGrid();

  let allowed = [];
  if (lastClicked) {
    [allowed, ...rest] = getAllowed(lastClicked[0], lastClicked[1]);
  }
  showAllowedInGrid(allowed);

  //front group of tiles
  push();

  // Draw a grid to show where the tiles go.
  drawGrid();

  // Iterate over the tiles and display each one.
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      // Draw the tile if one has been placed.
      if (board[c][r] >= 0) {
        let n = board[c][r];
        tiles[n].display(
          c * tileSize + (tileSize / 2), r * tileSize + (tileSize / 2));
      }
    }
  }
  pop();

  btnClearTile.elt.disabled = false;

  if (lastClicked) {
    push();
    noFill();
    // fill(255, 0, 0);
    stroke(0, 128, 255, 255);
    strokeWeight(2);
    rect(
      lastClicked[0] * tileSize - 2, lastClicked[1] * tileSize - 2, 
      tileSize + 4, tileSize + 4);
    pop();

    //btnClearTile.elt.disabled = false;

    let lastClickedId = board[lastClicked[0]][lastClicked[1]];

    if (lastClickedId >= 0) {
      jQuery('#currentTileSVG-holder').get(0).innerHTML = tiles[lastClickedId].svgString;
    } else {
      jQuery('#currentTileSVG-holder').get(0).innerHTML = '';
    }
  } else if (isTileSelected) {
    jQuery('#currentTileSVG-holder').get(0).innerHTML = tiles[selectedTile].svgString;
  } else {
    jQuery('#currentTileSVG-holder').get(0).innerHTML = '';
  }

  // shows what tiles need to be selected to back a full brick
  showBackSelected();

  noLoop();

  paramsChanged = false;
 
}

function showBackSelected() {

  // Iterate over the BoardBack and display on the fontCanvas the missing tiles to make a brick.
   for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
    let a = (COLS-1) -c
      // Draw the tile if one has been placed.
      if (board[a][r] ==-1 && boardBack[c][r] >= 0 ) {
      
    push();
    noFill();
    stroke('yellow');
    strokeWeight(2);
    rect(a * tileSize, r * tileSize, tileSize, tileSize);
   pop();
        
      }
    }
  }
  //noLoop();

}
*/