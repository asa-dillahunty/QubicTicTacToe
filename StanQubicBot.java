public class StanQubicBot implements QubicBot
{
	public StanQubicBot()
	{
		
	}
	
	
	public int[] getMove(QubicBoard board)
	{
		if (board.countPlays()>63)
		{
			int[] weWillGetThemNextTimeBoys = new int[]{0,0,0};
			return weWillGetThemNextTimeBoys;
		}
		int[] win = canWin(board);
		if (win[3]!=0) 
		{
			return win;
		}
		while(true)
		{
			int[] move=new int[]
			{
				(int)(Math.random()*4),
				(int)(Math.random()*4),
				(int)(Math.random()*4)
			};
			
			if(board.canPlay(move))
			{
				int[] pos = canWin(board.play(move));
				if (pos[3]==0) return move;
				return pos;
			}
		}
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

