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
var userData = {host:null,name:null,color:null};
document.getElementById('userName').addEventListener('change', function() {
	userData.name = document.getElementById('userName').value;
});
document.getElementById('userColor').addEventListener('change', function() {
	userData.color = document.getElementById('userColor').value;
	document.getElementById('userName').style.backgroundColor = userData.color;

	whiteOrBlack('userName',hexToRgb(userData.color));
});
var opponentName = null;

// document.addEventListener('keydown', function(event) {
// 	console.log(onlineGameData);
// });

var button_background = '#DCDCAA';
var slice_colors = ['#FFFFFF','#CCCCFF','#CCFFCC','#FFCCCC'];

function howToPlay() {
	var elem = document.getElementsByClassName('how-to-play')[0];
	if (elem.style.display=='none') {
		elem.style.display = 'inherit';
		// gets the button and lets you know it's been selected
		document.getElementsByClassName('game-menu')[0].children[3].style.backgroundColor = button_background;
	}
	else {
		elem.style.display = 'none';
		document.getElementsByClassName('game-menu')[0].children[3].style.backgroundColor = '';
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
				var cell = slices[i].children[4].children[j].children[k];
				cell.setAttribute("onClick","clickedSquare("+i+','+j+','+k+");")
			}
}

function makeNotClickable() {
	// object.addEventListener("click", myScript);
	var slices = document.getElementsByClassName("slice");
	for (var i=0;i<4;i++)
		for (var j=0;j<4;j++)
			for (var k=0;k<4;k++) {
				var cell = slices[i].children[4].children[j].children[k];
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
	markCell(i,j,k,players[turn]);
	gameBoard[i][j][k] = players[turn];

	if (onlineGameData && !opponentMove) {
		onlineGameData.lastMove = {
			player:userData.name,
			i:i,
			j:j,
			k:k,
		}
		if (getWinner() != 0) {
			if (userData.host) onlineGameData.player1.ready = false;
			else onlineGameData.player2.ready = false;
		}
		makeNotClickable();
		sendDataStream();
	}

	if (getWinner() != 0) {
		// handle winner
		
		if (interval != null) clearInterval(interval);

		markWinner();
		console.log(players[turn] + ' wins!')
		game_status = 'finished';
		
		setTimeout(() => {
			showModal(`${players[turn]} wins!\nPlay again?`);
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
			showModal('It\'s a draw!\nPlay again?');
			// if (confirm('It\'s a draw!\nPlay again?')) {
			// 	// play again
			// 	startGame(game_type);
			// }
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
	game_type = type;
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
		if (onlineGameData) {
			// game is currently live
			document.getElementsByClassName('game-menu')[0].style.display='none';
			document.getElementById('onlineOptions').style.display = 'inherit';
			document.getElementById('GameDetails').style.display = 'inherit';

			// Tell the other user I'm ready to battle to the bitter end.. again
			if (userData.host) {
				onlineGameData.player1.ready = true;
				if (onlineGameData.player2.ready) makeClickable();
			} else onlineGameData.player2.ready = true;

			onlineGameData.lastMove = null;

			sendDataStream();
			return;
		}
		// Firefox remembers game code. Not good for business
		document.getElementById('gameCode').value = '';
		opponentName = null;
		document.getElementById('opponentName').value = '';
		onlineGameData = null;
		onlineGameDataStream = null;
		userData.name = document.getElementById('userName').value;
		userData.color = document.getElementById('userColor').value;
		document.getElementById('userName').style.backgroundColor = userData.color;
		whiteOrBlack('userName',hexToRgb(userData.color));

		document.getElementsByClassName('game-menu')[0].style.display='none';
		document.getElementById('onlineOptions').style.display = 'inherit';
		document.getElementById('GameDetails').style.display = 'inherit';
		// document.getElementById('GameDetails').style.display = 'inherit';
	}
	else if (type == 'watch') {
		document.getElementsByClassName('game-menu')[0].children[4].style.backgroundColor = button_background;
		bot = newBot('point');
		watchGame();
	}
}

function onlineHandler(selection) {
	switch (selection) {
		case 'join':
			// Make sure user details is finished

			// Check if code is entered
			var gameCode = document.getElementById('gameCode').value;
			if (gameCode.length == 3) {
				if (document.getElementById('userName').value.length < 1) {
					alert('You must enter a name');
					break;
				}
				setAbles(true);
				dataStreamInit(gameCode);
			} else {
				alert('You must enter the game code');
			}
			userData.host = false;
			break;
		case 'host':
			if (document.getElementById('userName').value.length < 1) {
				alert('You must enter a name');
				break;
			}
			
			var gameCode = generateGameCode();
			dataStreamInit(gameCode);
			userData.host = true;

			onlineGameData = {
				player1: {
					name:userData.name,
					color:document.getElementById('userColor').value,
					ready:true
				},
				player2: null,
				gameID: gameCode,
				lastMove: null
			};

			document.getElementById('gameCode').value = gameCode
			setAbles(true);
			document.getElementById('GameDetails').style.display = 'inherit';

			sendDataStream();


			break;
		case 'cancel':
			document.getElementById('canteen').style.display='inherit';
			document.getElementsByClassName('game-menu')[0].style.display='none';
			document.getElementsByClassName("board")[0].style.display = "none";
			document.getElementById('GameDetails').style.display = 'none';
			document.getElementById('gameCode').disabled = false;
			document.getElementById('onlineOptions').style.display = 'none';
			killOnline();
			break;
		default:
			// default will also cancel because something went wrong

	}
}

function setAbles(isDisabled) {
	document.getElementById('gameCode').disabled = isDisabled;
	document.getElementById('userName').disabled = isDisabled;
	document.getElementById('userColor').disabled = isDisabled;
}

function whiteOrBlack(elemID,colorRGB) {
	if (contrast([colorRGB.r,colorRGB.g,colorRGB.b],[0,0,0]) 
		< contrast([colorRGB.r,colorRGB.g,colorRGB.b],[255,255,255])) {
			document.getElementById(elemID).style.color = '#ffffff';
	} else document.getElementById(elemID).style.color = '#000000';
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

	gameCode = gameCode.toUpperCase();
	var database=firebase.database();

	onlineGameDataStream = database.ref(`games/${gameCode}`);

	onlineGameDataStream.on('value',(snapshot) => {
		const data = snapshot.val();
		if (data == null) {
			alert('Connection not found');
			setAbles(false);
			// startGame(game_type);
			return;
		}
		onlineGameData = data;
		// console.log("Received Data");
		dataStreamHandler();		
	});
}

function sendDataStream() {
	onlineGameDataStream.set(onlineGameData);
}

function dataStreamHandler() {
	if (onlineGameData.player1 && onlineGameData.player2) {
		var myReady = document.getElementById('opponentReady');
		// set the  readies
		if (userData.host) {
			if (onlineGameData.player2.ready) {
				myReady.classList = 'ready';
				myReady.value = 'Ready';
			} else {
				myReady.classList = '';
				myReady.value = 'Not Ready';
			}
		} else {
			if (onlineGameData.player2.ready) {
				myReady.classList = 'ready';
				myReady.value = 'Ready';
			} else {
				myReady.classList = '';
				myReady.value = 'Not Ready';
			}
		}

		// console.log(onlineGameData);
		// console.log(!onlineGameData.player1.ready || !onlineGameData.player2.ready);
		// console.log(onlineGameData.lastMove && onlineGameData.lastMove.player != userData.name);
		// console.log(onlineGameData.lastMove == null && userData.host);
		
		if (!onlineGameData.player1.ready || !onlineGameData.player2.ready) makeNotClickable();
		else if (onlineGameData.lastMove && onlineGameData.lastMove.player != userData.name) makeClickable();
		else if (onlineGameData.lastMove == null && userData.host) makeClickable();
	}

	if (opponentName == null && onlineGameData.player1 && onlineGameData.player2) {

		if (userData.host) {
			opponentName = onlineGameData.player2.name;
			document.getElementById('opponentName').value = opponentName;
			document.getElementById('opponentName').style.backgroundColor = onlineGameData.player2.color;
			whiteOrBlack('opponentName',hexToRgb(onlineGameData.player2.color));
		} else {
			opponentName = onlineGameData.player1.name;
			document.getElementById('opponentName').value = opponentName;
			document.getElementById('opponentName').style.backgroundColor = onlineGameData.player1.color;
			whiteOrBlack('opponentName',hexToRgb(onlineGameData.player1.color));
		}
	}

	if (onlineGameData && !userData.host && onlineGameData.player2 == null) {
		// If you used the same name, just add a 2
		if (onlineGameData.player1.name == userData.name) {
			userData.name += '2';
			document.getElementById('userName').value = userData.name;
		}
		onlineGameData.player2 = {
			name:userData.name,
			color:document.getElementById('userColor').value,
			ready:true
		}
		sendDataStream();
		// player2 has joined the chat, and player two is you
		// player2 goes first
		makeClickable();
	}

	// if (onlineGameData && onlineGameData.lastMove == null) {
	// 	if (userData.host && 
	// 		onlineGameData.player1 &&
	// 		onlineGameData.player2 &&
	// 		onlineGameData.player1.ready &&
	// 		onlineGameData.player2.ready) {
	// 			makeClickable();
	// 		}
	// }

	if (onlineGameData == null ||
		onlineGameData.lastMove == null ||
		onlineGameData.lastMove.player == userData.name) return;


	// if (userData.host)
	

	if (onlineGameData.lastMove) {
		sendMove(onlineGameData.lastMove.i,onlineGameData.lastMove.j,onlineGameData.lastMove.k,true);
		makeClickable();
	}
}

function killOnline() {
	// let them know we are leaving
	if (onlineGameDataStream && onlineGameData) {
		if (userData && userData.host && onlineGameData.player1) {
			onlineGameData.player1.ready = false;
			sendDataStream();
		} else if (userData && !userData.host && onlineGameData.player2) {
			onlineGameData.player2.ready = false;
			sendDataStream();
		}
	}
	if (onlineGameDataStream) onlineGameDataStream.off();
	onlineGameData = null;
	onlineGameDataStream = null;
}

function generateGameCode() {
	const letterA = 65;
	var gameCode = '';
	var letterShift;

	for (var i=0;i<3;i++) {
		letterShift = Math.floor(Math.random()*26);
		gameCode += String.fromCharCode(letterA + letterShift);
	}

	return gameCode;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * The functions below (luminance and contrast) were posted online at
 * https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function luminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= 0.03928
			? v / 12.92
			: Math.pow( (v + 0.055) / 1.055, 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function contrast(rgb1, rgb2) {
	var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
	var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
	var brightest = Math.max(lum1, lum2);
	var darkest = Math.min(lum1, lum2);
	return (brightest + 0.05) / (darkest + 0.05);
}
// minimal recommended contrast ratio is 4.5, or 3 for larger font-sizes


/* * * * * * * * * * * * * * * * * * * * * * *
 * The functions below (hexToRgb) were posted online at
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * * * * * * * * * * * * * * * * * * * * * * */
function hexToRgb(hex) {
var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
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

function showModal(message) {
	document.getElementById('modalMessage').value = message;
	document.getElementById('confirm-modal').classList = 'active';
}

function hideModal() {
	document.getElementById('confirm-modal').classList='';
}

const confirmModal =
`<div id="confirm-modal">
	<div class="modal-bg"></div>
	<div class="modal-card">
		<textarea name='modalMessage' id='modalMessage' disabled></textarea> <br>
		<button onclick="hideModal();startGame(game_type);">Yes</button>
		<button onclick="hideModal();">No</button>
	</div>
</div>`;
document.body.insertAdjacentHTML('afterend', confirmModal);
