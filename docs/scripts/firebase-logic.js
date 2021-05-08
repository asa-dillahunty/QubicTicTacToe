function joinGame() {
	var gameCode = document.getElementById("gameCode").value.toUpperCase();
	console.log(gameCode);
	// hide('canteen');
	show('GameDetails');
}

function hide(elemID) {
	document.getElementById(elemID).style.display = 'none';
}

function show(elemID, displayStyle = 'inherit') {
	document.getElementById(elemID).style.display = displayStyle;
}