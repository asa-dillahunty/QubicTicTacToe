var onlineGameDataStream;
var onlineGameData;
var userData = {playerOne:null,name:null,color:null};

document.getElementById('userName').addEventListener('change', function() {
	userData.name = document.getElementById('userName').value;
});
document.getElementById('userColor').addEventListener('change', function() {
	userData.color = document.getElementById('userColor').value;
	document.getElementById('userName').style.backgroundColor = userData.color;

	var colorRGB = hexToRgb(userData.color);
	if (contrast([colorRGB.r,colorRGB.g,colorRGB.b],[0,0,0]) 
		> contrast([colorRGB.r,colorRGB.g,colorRGB.b],[255,255,255])) {
			document.getElementById('userName').style.color = '#000000';
	} else document.getElementById('userName').style.color = '#ffffff';

	// console.log(contrast([colorRGB.r,colorRGB.g,colorRGB.b],[0,0,0]));
	// console.log(contrast([colorRGB.r,colorRGB.g,colorRGB.b],[255,255,255]));

	// if (onlineGameData)
	// 	if (userData.playerOne) onlineGameData.player1.color = userData.color;
	// 	else onlineGameData.player2.color = userData.color;
});
var opponentName = null;


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
			// default should also cancel because something went wrong

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

/* I need to redo message passing 
 *
 * lets try it
 *
 */

// message format:
message = {
	type: "type should be determined by the button pressed", // some types update time of last request
	player: "should be player name maybe an ID", // should spectators get a name?
	data: "if chat message: string, if move: array, if board request return: 2D array, if time request return: string"
}