function Board(row, column, players) {
  this.row = row;
  this.column = column;
  this.players = players;
  this.cells = createArray(row,column);
  this.turn = 0;

  this.findThreshold = function (i,j) {
    let maxRow = this.row - 1; maxColumn = this.column - 1;
    if ( (i == 0 && j == 0) || (i == 0 && j == maxColumn) || (i == maxRow && j == 0) || (i == maxRow && j == maxColumn)) {
        return 1;
    } else if ( i == 0 || j == 0 || i == maxRow || j == maxColumn ) {
        return 2;
    } else {
        return 3;
    }
  }
  
  this.fire = function (i,j,owner,chainFire = false) {
    if ((this.players[this.turn].name == owner && (this.cells[i][j].owner == null || this.cells[i][j].owner == owner)) || chainFire) {
      let threshold = this.findThreshold(i,j);
      if (this.cells[i][j].atom >= threshold) {
          this.cells[i][j].atom = 0;
          this.cells[i][j].owner = null;
          if ((i-1) >= 0) { this.fire(i-1,j,owner,true); }  
          if ((i+1) < this.row) { this.fire(i+1,j,owner,true); }
          if ((j-1) >= 0) { this.fire(i,j-1,owner,true); }
          if ((j+1) < this.column) { this.fire(i,j+1,owner,true); }
      } else {
          this.cells[i][j].atom++;
          this.cells[i][j].owner = owner;
      }
      if (!chainFire) {
          this.turn = (this.turn < (this.players.length - 1)) ? (this.turn + 1) : 0;
      }
    }
  }
}

function createArray(row,column) {
    let cells = [];
    for (let i = 0; i < row; i++) {
        cells[i] = [];
        for (let j = 0; j < column; j++) {
            cells[i][j] = {atom: 0, owner: null};
        }        
    }
    return cells;
}

module.exports = Board;