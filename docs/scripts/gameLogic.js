var game_status = 'not started';
var game_type;
var gameBoard;
var lastPlayedCell;

var turn;
var turnCount;
var players;
var bot = null;
var interval = null;

var button_background = '#DCDCAA';
var slice_colors = ['#FFFFFF','#CCCCFF','#CCFFCC','#FFCCCC'];

function howToPlay() {
	var elem = document.getElementsByClassName('how-to-play')[0];
	if (elem.style.display=='none') {
		elem.style.display = 'inherit';
		// gets the button and lets you know it's been selected
		document.getElementById("game-menu").children[2].style.backgroundColor = button_background;
	}
	else {
		elem.style.display = 'none';
		document.getElementById("game-menu").children[2].style.backgroundColor = '';
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

	// safely sets up three.js stuff
	try {
		if (scene === null && threejsInit) threejsInit();
		else if (scene != null) clearThreejsBoard();
	} catch (e) {}
	
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
	try { // if online file is not loaded, this will catch
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
	} catch (e) {}

	markCell(i,j,k,players[turn]);
	gameBoard[i][j][k] = players[turn];

	try {
		if (markThreejsBoard) markThreejsBoard(i,j,k);
	} catch (e) {}


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
	if (lastPlayedCell != null) {
		lastPlayedCell.className = lastPlayedCell.className.replace(' lastMove','');
	}
	lastPlayedCell = document.getElementsByClassName("slice")[i].children[4].children[j].children[k];
	lastPlayedCell.className = mark+' lastMove';
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
	document.getElementById("game-menu").style.display='inherit';
	document.getElementsByClassName("board")[0].style.display = "inline-flex";

	game_status = 'in progress';
	game_type = type;
	lastPlayedCell = null;
	gameBoard = boardInit();
	players = ['X','O'];
	turn = 0;
	turnCount = 0;

	var menuButtonList = document.getElementById("game-menu").children;
	for (var btn = 0;btn<menuButtonList.length;btn++) {
		menuButtonList[btn].style.backgroundColor = '';
	}
	
	switch (type) {
		case 'single':
			makeClickable();
			menuButtonList[0].style.backgroundColor = button_background;
			interval = null;
			bot = newBot('point');
			break;
		case 'two':
			makeClickable();
			menuButtonList[1].style.backgroundColor = button_background;
			interval = null;
			bot = null;
			break;
		case 'online':
			// ongoing game
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

			// Join or Host?


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

			document.getElementById("game-menu").style.display='none';
			document.getElementById('onlineOptions').style.display = 'inherit';
			document.getElementById('GameDetails').style.display = 'inherit';
			// document.getElementById('GameDetails').style.display = 'inherit';
			break;
		case 'watch':
			document.getElementById("game-menu").children[4].style.backgroundColor = button_background;
			bot = newBot('point');
			watchGame();
			break;
	}
}

function watchGame() {
	interval = setInterval( () => {
		move = bot.getBotMove();

		if (move != 0 && validMove(move[0],move[1],move[2])) 
			sendMove(move[0],move[1],move[2]);
	}, 1000);
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