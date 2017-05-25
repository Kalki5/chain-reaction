var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
http.listen(80, function () { console.log('listening on *:8000'); });

var Board = require('./board.js');

var boardObject = null;

//=============================================================
// HTTP Methods

app.get('/', function (req, res) {
  if (boardObject == null) {
    return res.redirect('/create');
  }
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/create', function (req, res) {
  res.sendFile(__dirname + '/views/create.html');
});

app.post('/create', function (req, res) {
  let row = req.body.row; column = req.body.column; players = req.body.players;
  players = players.split(",").map(function (name) {
    return { name: name.trim(), status: false};
  });
  boardObject = new Board(row,column,players);
  res.redirect('/');
});
//=============================================================


io.on('connection', function (socket) {
  

  socket.on('validate', function(data){
    let validationResult = validatePlayer(data.name, boardObject.players, false);
    if (validationResult != -1) {
      socket.emit('createBoard', { row: boardObject.row, column: boardObject.column, players: boardObject.players, turn: boardObject.turn });
      socket.emit('message', 'You\'ve Joined Successfully');
      socket.name = data.name;
      boardObject.players[validationResult].status = true;
    } else {
      socket.emit('message', 'You\'re not registered as a player in this game');
    }

    io.emit('status', boardObject.players);
    return validationResult != -1;
  });

  socket.on('play', function(data){
    boardObject.fire(+data.i,+data.j,data.owner);
    let info = {
      cells : boardObject.cells,
      turn : boardObject.turn
    }
    io.emit('play', info);
  });

  socket.on('disconnect', function () {
    if (boardObject != null) {
      let validationResult = validatePlayer(socket.name, boardObject.players, true);
      if (validationResult != -1) {
        boardObject.players[validationResult].status = false;    
        io.emit('status', boardObject.players);    
      }
    }
  });

});

function validatePlayer(name, players, status) {
  for (var i = 0; i < players.length; i++) {
    if(players[i].name == name && players[i].status == status){
      return i;
    }
  }
  return -1;
}


//       io.clients(function(error, clients){
//         if (error) throw error;
//         console.log(clients);
//       });

// // console.log('User connected. Total users ' + users);


//       // console.log('User disconnected. Total users ' + users);