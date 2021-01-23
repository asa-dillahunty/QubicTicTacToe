public class PointBot implements QubicBot
{
	public PointBot() {
	}
	
	public int[]  getMove(QubicBoard board) {

		int highScore = -1;
		int[] bestMove = {0,0,0};
		int score = 0;

		for(int i=0;i<4;i++)
			for(int j=0;j<4;j++)
				for(int k=0;k<4;k++) {
					int[] move = {i,j,k};
					if (!board.canPlay(move)) continue;
					
					score = getScore(i,j,k,board);
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

	private int getScore(int x, int y, int z, QubicBoard board) {
		int OTHER_POINTS = 10;
		int THIS_POINTS = 10;

		boolean OTHER;
		boolean THIS;
		int rowLength;

		int rowScore = 1;
		int score = 0;

		for(int dx=-1;dx<=1;dx++)
			for(int dy=-1;dy<=1;dy++)
				for(int dz=-1;dz<=1;dz++) {
					if (dx==0 && dy==0 && dz==0) continue;

					rowScore = 1;
					OTHER = false;
					THIS = false;
					rowLength = 0;

					for (int i=-4;i<4;i++) {
						if (i==0) continue; // We know this space is blank
						
						if (x+dx*i > 3 || x+dx*i < 0) continue;
						if (y+dy*i > 3 || y+dy*i < 0) continue;
						if (z+dz*i > 3 || z+dz*i < 0) continue;
						
						if (board.board[x + i*dx][y + i*dy][z + i*dz] == board.getTurn()) {
							rowScore *= THIS_POINTS;
							// System.out.println("Me: "+(x+i*dx) +","+(y+i*dx) +","+(z+i*dx));
							THIS = true;
						}
						else if (board.board[x + i*dx][y + i*dy][z + i*dz] == ((board.getTurn()%2)+1)) {
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
}
