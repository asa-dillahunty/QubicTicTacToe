var game_status = 'not started';
var game_type;
var gameBoard;
var turn;
var turnCount;
var players;
var bot = null;
var interval = null;
var onlineGameDataStream;
var onlineGameData;
var userName;
document.getElementById('userName').addEventListener('change', function() {
	userName = document.getElementById('userName').value;
});
var opponentName = null;

var button_background = '#DCDCAA';
var slice_colors = ['#FFFFFF','#CCCCFF','#CCFFCC','#FFCCCC'];

function howToPlay() {
	var elem = document.getElementsByClassName('how-to-play')[0];
	if (elem.style.display=='none') {
		elem.style.display = 'inherit';
		// gets the button and lets you know it's been selected
		document.getElementsByClassName('game-menu')[0].children[2].style.backgroundColor = button_background;
	}
	else {
		elem.style.display = 'none';
		document.getElementsByClassName('game-menu')[0].children[2].style.backgroundColor = '';
	}
	
}

function boardInit() {
	// Clears the html board
	for (var i=0;i<4;i++)
		for (var j=0;j<4;j++) {
			for (var k=0;k<4;k++) {
				var cell = document.getElementsByClassName("slice")[i].children[4].children[j].children[k];
				cell.classList='emptyCell';
				cell.style.backgroundColor = slice_colors[i];
			}
		}

	
	//creates an empty board array
	var board = [];
	for (var i=0;i<4;i++) {
		var slice = [];
		for (var j=0;j<4;j++) {
			var row = [' ',' ',' ',' '];
			slice.push(row);
		}
		board.push(slice);
	}
	return board;
}

// This does so much work for me, thank the lord :)
function makeClickable() {
	// object.addEventListener("click", myScript);
	var slices = document.getElementsByClassName("slice");
	for (var i=0;i<4;i++)
		for (var j=0;j<4;j++)
			for (var k=0;k<4;k++) {
				var cell = document.getElementsByClassName("slice")[i].children[4].children[j].children[k];
				cell.setAttribute("onClick","clickedSquare("+i+','+j+','+k+");")
			}
}

function makeNotClickable() {
	// object.addEventListener("click", myScript);
	var slices = document.getElementsByClassName("slice");
	for (var i=0;i<4;i++)
		for (var j=0;j<4;j++)
			for (var k=0;k<4;k++) {
				var cell = document.getElementsByClassName("slice")[i].children[4].children[j].children[k];
				cell.setAttribute("onClick","")
			}
}

function clickedSquare(i,j,k) {
	if (validMove(i,j,k)) sendMove(i,j,k);
	else return;


	if (bot != null) {
		var move = bot.getBotMove();

		if (move != 0 && validMove(move[0],move[1],move[2])) 
			sendMove(move[0],move[1],move[2]);
	}
}

function validMove(i,j,k) {
	if (game_status != 'in progress') return false;

	if (i>3 || j>3 || k>3) return false;
	if (i<0 || j<0 || k<0) return false;

	if (gameBoard[i][j][k] == ' ') return true;
	else return false;
}

function sendMove(i,j,k, opponentMove=false) {
	if (onlineGameData && !opponentMove) {
		onlineGameData.lastMove = {
			player:userName,
			i:i,
			j:j,
			k:k,
		}
		sendDataStream();
		makeNotClickable();
	}

	markCell(i,j,k,players[turn]);
	gameBoard[i][j][k] = players[turn];


	if (getWinner() != 0) {
		// handle winner
		
		if (interval != null) clearInterval(interval);

		markWinner();
		console.log(players[turn] + ' wins!')
		game_status = 'finished';
		
		setTimeout(() => {
			if (confirm(players[turn] + ' wins!\nPlay again?')) {
				// play again
				if (interval != null) startGame('watch');
				else if (bot != null) startGame('single');
				else startGame('two');
			}
		}, 1000);
		return;
	}
	turn = (turn+1)%2;
	turnCount++;

	if (turnCount > 63) {
		if (interval != null) clearInterval(interval);

		console.log('draw')
		game_status = 'finished';
		
		setTimeout(() => { 
			if (confirm('It\'s a draw!\nPlay again?')) {
				// play again
				if (interval !=null) startGame('watch');
				else if (bot != null) startGame('single');
				else startGame('two');
			}
		}, 1000);
	}
}

function markCell(i,j,k,mark) {
	var cell = document.getElementsByClassName("slice")[i].children[4].children[j].children[k];
	cell.classList = mark;
}

function markWinner() {
	for (var i=0;i<4;i++)
		for (var j=0;j<4;j++)
			for (var k=0;k<4;k++)
				for(var dx=-1;dx<=1;dx++)
					for(var dy=-1;dy<=1;dy++)
						for(var dz=-1;dz<=1;dz++) {
							if (dx==0 && dy==0 && dz==0) continue;
							if (i+dx*3 > 3 || i+dx*3 < 0) continue;
							if (j+dy*3 > 3 || j+dy*3 < 0) continue;
							if (k+dz*3 > 3 || k+dz*3 < 0) continue;

							if(gameBoard[i][j][k]!=' ' && 
								gameBoard[i][j][k]==gameBoard[i+dx][j+dy][k+dz] && 
								gameBoard[i][j][k]==gameBoard[i+2*dx][j+2*dy][k+2*dz] && 
								gameBoard[i][j][k]==gameBoard[i+3*dx][j+3*dy][k+3*dz]) {

									document.getElementsByClassName("slice")[i].children[4].children[j].children[k].classList+=' winning-move';
									document.getElementsByClassName("slice")[i+dx].children[4].children[j+dy].children[k+dz].classList+=' winning-move';
									document.getElementsByClassName("slice")[i+dx*2].children[4].children[j+dy*2].children[k+dz*2].classList+=' winning-move';
									document.getElementsByClassName("slice")[i+dx*3].children[4].children[j+dy*3].children[k+dz*3].classList+=' winning-move';

									return gameBoard[i][j][k];
								}

						}
	return 0;
}

function getWinner() {
	for (var i=0;i<4;i++)
		for (var j=0;j<4;j++)
			for (var k=0;k<4;k++)
				for(var dx=-1;dx<=1;dx++)
					for(var dy=-1;dy<=1;dy++)
						for(var dz=-1;dz<=1;dz++)
						{
							if (dx==0 && dy==0 && dz==0) continue;
							if (i+dx*3 > 3 || i+dx*3 < 0) continue;
							if (j+dy*3 > 3 || j+dy*3 < 0) continue;
							if (k+dz*3 > 3 || k+dz*3 < 0) continue;
								if(gameBoard[i][j][k]!=' ' && 
									gameBoard[i][j][k]==gameBoard[i+dx][j+dy][k+dz] && 
									gameBoard[i][j][k]==gameBoard[i+2*dx][j+2*dy][k+2*dz] && 
									gameBoard[i][j][k]==gameBoard[i+3*dx][j+3*dy][k+3*dz]) {

										return gameBoard[i][j][k];
									}

						}
	return 0;
}

function startGame(type) {
	// if bot alive, kill it >:)
	if (interval != null) clearInterval(interval);

	makeNotClickable();

	// hide buttons
	document.getElementById('canteen').style.display='none';
	// document.getElementsByClassName('how-to-play')[0].style.display='none';
	document.getElementsByClassName('game-menu')[0].style.display='inherit';
	document.getElementsByClassName("board")[0].style.display = "inline-flex";

	game_status = 'in progress';
	gameBoard = boardInit();
	players = ['X','O'];
	turn = 0;
	turnCount = 0;

	var menuButtonList = document.getElementsByClassName('game-menu')[0].children;
	for (var btn = 0;btn<menuButtonList.length;btn++) {
		document.getElementsByClassName('game-menu')[0].children[btn].style.backgroundColor = '';
	}
	
	if (type == 'single') {
		makeClickable();
		document.getElementsByClassName('game-menu')[0].children[0].style.backgroundColor = button_background;
		interval = null;
		bot = newBot('point');
	}
	else if (type == 'two') {
		makeClickable();
		document.getElementsByClassName('game-menu')[0].children[1].style.backgroundColor = button_background;
		interval = null;
		bot = null;
	}
	else if (type == 'online') {
		// Join or Host?
		document.getElementsByClassName('game-menu')[0].style.display='none';
		document.getElementById('onlineOptions').style.display = 'inherit';userDetails
		document.getElementById('userDetails').style.display = 'inherit';
		// document.getElementById('GameDetails').style.display = 'inherit';
	}
	else if (type == 'watch') {
		document.getElementsByClassName('game-menu')[0].children[4].style.backgroundColor = button_background;
		bot = newBot('point');
		watchGame();
	}
}

function onlineHandler(selection) {
	document.getElementById('userDetails').style.display = 'none';
	switch (selection) {
		case 'join':
			// Make sure user details is finished

			// Check if code is entered
			var gameCode = document.getElementById('gameCode').value;
			if (gameCode.length == 3) {
				dataStreamInit(gameCode);
			} else {
				document.getElementById('GameDetails').style.display = 'inherit';
			}
			break;
		case 'host':
			
			var gameCode = generateGameCode();
			dataStreamInit(gameCode);

			onlineGameData = {
				player1: {
					name:userName,
					color:document.getElementById('userColor').value
				},
				player2: null,
				gameID: gameCode,
				lastMove: null
			};

			document.getElementById('gameCode').disabled = 'true';
			document.getElementById('gameCode').value = gameCode
			document.getElementById('GameDetails').style.display = 'inherit';

			sendDataStream();


			break;
		case 'cancel':
			document.getElementById('canteen').style.display='inherit';
			document.getElementsByClassName('game-menu')[0].style.display='none';
			document.getElementsByClassName("board")[0].style.display = "none";
			document.getElementById('GameDetails').style.display = 'none';
			document.getElementById('onlineOptions').style.display = 'none';
			break;
		default:
			// default will also cancel because something went wrong

	}
}

function watchGame() {
	interval = setInterval( () => {
		move = bot.getBotMove();

		if (move != 0 && validMove(move[0],move[1],move[2])) 
			sendMove(move[0],move[1],move[2]);
	}, 1000);
}

/* FIREBASE Stuff */
function dataStreamInit(gameCode) {

	var database=firebase.database();

	onlineGameDataStream = database.ref(`games/${gameCode}`);
	onlineGameDataStream.on('value',(snapshot) => {
		const data = snapshot.val();
		onlineGameData = data;
		console.log("Received Data");
		dataStreamHandler();		
	});
}

function sendDataStream() {
	onlineGameDataStream.set(onlineGameData);
}

function dataStreamHandler() {
	if (opponentName == null && onlineGameData.player1 && onlineGameData.player2) {
		// var database=firebase.database();
		// onlineGameDataStream = database.ref(`games/${onlineGameData.gameID}/lastMove`);
		// onlineGameDataStream.on('value',(snapshot) => {
		// 	const data = snapshot.val();
		// 	onlineGameData.lastMove = data;
		// 	console.log("Received Data");
		// 	dataStreamHandler();		
		// });

		if (onlineGameData.player1.name == userName) {
			opponentName = onlineGameData.player2.name;
			document.getElementById('opponentName').value = opponentName;
			document.getElementById('opponentName').style.backgroundColor = onlineGameData.player2.color;
		} else {
			opponentName = onlineGameData.player1.name;
			document.getElementById('opponentName').value = opponentName;
			document.getElementById('opponentName').style.backgroundColor = onlineGameData.player1.color;
		}
	}

	if (onlineGameData && onlineGameData.player1.name != userName && onlineGameData.player2 == null) {
		onlineGameData.player2 = {
			name:userName,
			color:document.getElementById('userColor').value
		}
		sendDataStream();
		// player2 has joined the chat, and player two is you
		// player2 goes first
		makeClickable();
	}

	if (onlineGameData == null ||
		onlineGameData.lastMove == null ||
		onlineGameData.lastMove.player == userName) return;

	


	sendMove(onlineGameData.lastMove.i,onlineGameData.lastMove.j,onlineGameData.lastMove.k,true);
	makeClickable();
}

function generateGameCode() {
	const letterA = 65;
	var gameCode = '';
	var letterShift;
	// console.log(String.fromCharCode(letterA + letterShift));

	for (var i=0;i<3;i++) {
		letterShift = Math.floor(Math.random()*26);
		gameCode += String.fromCharCode(letterA + letterShift);
	}

	return gameCode;
}

// Bot Code //

function getMove() {
	var result = canWin();
	if (result != 0) sendMove(result[0],result[1],result[2]);

	var highScore = -1;
	var bestMove = [0,0,0];

	for(var i=0;i<4;i++)
		for(var j=0;j<4;j++)
			for(var k=0;k<4;k++) {
				if (!validMove(i,j,k)) continue;
				
				score = getScore(i,j,k);
				if (score < highScore) continue;
				if (score == highScore) 
					if (Math.random() < .5) continue;

				bestMove[0] = i;
				bestMove[1] = j;
				bestMove[2] = k;
			}

	markCell(bestMove[0],bestMove[1],bestMove[2],players[turn]);
	gameBoard[bestMove[0]][bestMove[1]][bestMove[2]] = players[turn];
}

function canWin() {
	for (var i=0;i<4;i++)
		for (var j=0;j<4;j++)
			for (var k=0;k<4;k++) {
				if (validMove(i,j,k)) gameBoard[i][j][k] = players[turn];
				else continue;
				
				if (getWinner() != 0) {
					gameBoard[i][j][k] = ' ';
					return [i,j,k];
				}
				else gameBoard[i][j][k] = ' ';
			}
	return 0;
}

function getScore(x,y,z) {
	var OTHER_POINTS = 10;
	var THIS_POINTS = 10;

	var OTHER;
	var THIS;
	var rowLength;

	var rowScore = 1;
	var score = 0;

	for(var dx=-1;dx<=1;dx++)
		for(var dy=-1;dy<=1;dy++)
			for(var dz=-1;dz<=1;dz++) {
				if (dx==0 && dy==0 && dz==0) continue;

				rowScore = 1;
				OTHER = false;
				THIS = false;
				rowLength = 0;

				for (var i=-4;i<4;i++) {
					if (i==0) continue; // We know this space is blank
					
					if (x+dx*i > 3 || x+dx*i < 0) continue;
					if (y+dy*i > 3 || y+dy*i < 0) continue;
					if (z+dz*i > 3 || z+dz*i < 0) continue;
					
					if (gameBoard[x + i*dx][y + i*dy][z + i*dz] == players[turn]) {
						rowScore *= THIS_POINTS;
						// System.out.println("Me: "+(x+i*dx) +","+(y+i*dx) +","+(z+i*dx));
						THIS = true;
					}
					else if (gameBoard[x + i*dx][y + i*dy][z + i*dz] == players[(turn+1)%2]) {
						rowScore *= OTHER_POINTS;
						// System.out.println("Them: "+(x+i*dx) +","+(y+i*dx) +","+(z+i*dx));
						OTHER = true;
					}
					rowLength+=1;
				}
				if (THIS && OTHER) continue; // if it has both, neither of us can win that row
				// 3 is used because my space is not counted
				if (rowLength < 3) continue; // a row is also unwinnable if length < 4

				score += rowScore;
			}
			
	if (x==0||y==0||z==0||x==3||y==3||z==3) score++;
	return score;
}

function newBot(type) {
	if (type == 'point') {
		var pointBot = {
			type:'point',
			getBotMove : function() {
				var result = canWin();
				if (result != 0) return result;

				var highScore = -1;
				var bestMove = [0,0,0];

				for(var i=0;i<4;i++)
					for(var j=0;j<4;j++)
						for(var k=0;k<4;k++) {
							if (!validMove(i,j,k)) continue;
							
							score = getScore(i,j,k);
							if (score < highScore) continue;
							if (score == highScore) 
								if (Math.random() < .5) continue;

							bestMove[0] = i;
							bestMove[1] = j;
							bestMove[2] = k;
							highScore = score;
						}
				return bestMove;
			}
		};
		return pointBot;
	}
	else if (type == 'random') {
		// Make new random bot
		var randoBot = {
			type:'rando',
			getBotMove : function() {
				if (game_status != 'in progress') return 0;
				var i = 0;
				var j = 0;
				var k = 0;

				while(!validMove(i,j,k)) {
					i = Math.floor(Math.random()*4);
					j = Math.floor(Math.random()*4);
					k = Math.floor(Math.random()*4);
				}
				var move = [i,j,k];
				return move;
			}
		};
		return randoBot;
	}
}