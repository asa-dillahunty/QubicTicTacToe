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