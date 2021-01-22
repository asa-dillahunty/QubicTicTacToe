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

function joinGame() {
	var gameCode = document.getElementById("gameCode").value.toUpperCase();
	console.log(gameCode);
	hide('cantine');
	show('GameDetails');
}

function hide(elemID) {
	document.getElementById(elemID).style.display = 'none';
}

function show(elemID, displayStyle = 'inherit') {
	document.getElementById(elemID).style.display = displayStyle;
}