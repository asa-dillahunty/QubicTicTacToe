public class PointBot implements QubicBot
{
	public PointBot()
	{
		
	}
	
	
	public int[] getMove(QubicBoard board)
	{
		//board is filled
		if (board.countPlays()>63)
		{
			int[] weWillGetThemNextTimeBoys = new int[]{0,0,0};
			return weWillGetThemNextTimeBoys;
		}

		//{ x, y, z, which player's turn}
		int[] win = canWin(board);
		if (win[3]!=0) 
		{
			// If can win, do it
			return win;
		}

		int highScore = Integer.MIN_VALUE;
		int[] bestMove = {0,0,0,board.getTurn()};

		int score=0;
		int[] curr = {0,0,0,board.getTurn()};

		for(int i=0;i<4;i++)
			for(int j=0;j<4;j++)
				for(int k=0;k<4;k++) 
				{
					curr[0]=i;
					curr[1]=j;
					curr[2]=k;
					// System.out.println(board);
					if (board.canPlay(curr))
					// if (board.board[curr[0]][curr[1]][curr[2]] == 0)
					{
						score = getScore(board, curr);
						// System.out.println(score+": "+curr[0]+","+curr[1]+","+curr[2]);

						if (score > highScore) 
						{
							// System.out.println(highScore+" : "+score);
							highScore = score;
							bestMove[0] = curr[0];
							bestMove[1] = curr[1];
							bestMove[2] = curr[2];
							// System.out.println(highScore+": "+bestMove[0]+","+bestMove[1]+","+bestMove[2]);
						}
						else if (score == highScore) {
							if (Math.random() > .5) {
								highScore = score;
								bestMove[0] = curr[0];
								bestMove[1] = curr[1];
								bestMove[2] = curr[2];
							}
						}
					}
				}

		// System.out.println(highScore+": please :"+bestMove[0]+","+bestMove[1]+","+bestMove[2]);
		return bestMove;
	}

	public int getScore(QubicBoard board, int[] move)
	{
		if (move.length!=4) return 0; // Invalid move
		// System.out.println(board);

		/*
		if they can win off move score = min_int + 1
		*/

		int OTHER_POINTS = 10;
		int THIS_POINTS = 10;
		int THIS_PLAYER = board.getTurn();
		int OTHER_PLAYER = (THIS_PLAYER)%2 + 1;

		boolean OTHER;
		boolean THIS;

		int rowScore = 1;
		int score = 0;
		
		/**
		 * Need to make sure only check "row" once
		 */
		for(int dx=-1;dx<=1;dx++)
			for(int dy=-1;dy<=1;dy++)
				for(int dz=-1;dz<=1;dz++)
				{
					if (dx==0 && dy==0 && dz==0) continue;
					// if (dx == 0 && dy == 0 && dz < 0) continue;
					// if (dx == 0 && dz == 0 && dy < 0) continue;
					// if (dy == 0 && dz == 0 && dx < 0) continue;

					rowScore = 1;
					// score = 0;
					OTHER = false;
					THIS = false;

					for (int i=-4;i<4;i++)
					{
						if (i==0) continue; // We know this space is blank
						try
						{
							if (board.board[move[0] + i*dx][move[1] + i*dy][move[2] + i*dz] == THIS_PLAYER)
							{
								rowScore *= THIS_POINTS;
								// System.out.println("Me: "+(move[0]+i*dx) +","+(move[1]+i*dx) +","+(move[2]+i*dx));
								THIS = true;
							}
							else if (board.board[move[0] + i*dx][move[1] + i*dy][move[2] + i*dz] == OTHER_PLAYER)
							{
								rowScore *= OTHER_POINTS;
								// System.out.println("Them: "+(move[0]+i*dx) +","+(move[1]+i*dx) +","+(move[2]+i*dx));
								OTHER = true;
							}
						}
						catch(Exception e)
						{
						}
					}
					if (THIS && OTHER) continue; // if it has both, neither of us can win that row
					score += rowScore;
					// System.out.print("Valid: "+score+"\n");
				}

		// if(board.play(move).getWinner()!=0) {
		// 	return 0;
		// }

		for (int i=0;i<3;i++) 
			if (move[i] == 0 || move[i] == 3) score++; // adds value to edge pieces?? Good or bad strat

		return score;
	}
	
	public int[] canWin(QubicBoard board)
	{
		int l = board.getTurn()%2+1;
		for(int i=0;i<4;i++)
			for(int j=0;j<4;j++)
				for(int k=0;k<4;k++)
				{
					int[] move = new int[] {i,j,k,l};
					if (board.canPlay(move))
					{
						if(board.play(move).getWinner()!=0) 
						{
							return move;
						}
					}
				}
		int[] play = new int[]{0,0,0,0};
		
		return play;		
	}
	
	public int getWinner(QubicBoard b)
	{
		int i = 0;
		int j = 0;
		int k = 0;
			while (j<4)
			{
				while (k<4)
				{
					for(int dx=-1;dx<=1;dx++)
						for(int dy=-1;dy<=1;dy++)
							for(int dz=-1;dz<=1;dz++)
							{
								if (dx==0 && dy==0 && dz==0) continue;
								try
								{
									if(b.board[i][j][k]!=0 && 
										b.board[i][j][k]==b.board[i+dx][j+dy][k+dz] && 
										b.board[i][j][k]==b.board[i+2*dx][j+2*dy][k+2*dz] && 
										b.board[i][j][k]==b.board[i+3*dx][j+3*dy][k+3*dz])
										
										return b.board[i][j][k];
									else 
										continue;
								}
								catch(Exception e)
								{
								}
							}
					k++;
				}
				j++;
			}
			i=0;
			j=0;
			k=0;
			
			while (j<4)
			{
				while (i<4)
				{
					for(int dx=-1;dx<=1;dx++)
						for(int dy=-1;dy<=1;dy++)
							for(int dz=-1;dz<=1;dz++)
							{
								if (dx==0 && dy==0 && dz==0) continue;
								try
								{
									if(b.board[i][j][k]!=0 && 
										b.board[i][j][k]==b.board[i+dx][j+dy][k+dz] && 
										b.board[i][j][k]==b.board[i+2*dx][j+2*dy][k+2*dz] && 
										b.board[i][j][k]==b.board[i+3*dx][j+3*dy][k+3*dz])
										return b.board[i][j][k];
								}
								catch(Exception e)
								{
								}
							}
					i++;
				}
				j++;
			}
			i=0;
			j=0;
			k=0;

			while (i<4)
			{
				while (k<4)
				{
					for(int dx=-1;dx<=1;dx++)
						for(int dy=-1;dy<=1;dy++)
							for(int dz=-1;dz<=1;dz++)
							{
								if (dx==0 && dy==0 && dz==0) continue;
								try
								{
									if(b.board[i][j][k]!=0 && 
										b.board[i][j][k]==b.board[i+dx][j+dy][k+dz] && 
										b.board[i][j][k]==b.board[i+2*dx][j+2*dy][k+2*dz] && 
										b.board[i][j][k]==b.board[i+3*dx][j+3*dy][k+3*dz])
										return b.board[i][j][k];
								}
								catch(Exception e)
								{
								}
							}
					k++;
				}
				i++;
			}
			
		return 0;
	}
}

