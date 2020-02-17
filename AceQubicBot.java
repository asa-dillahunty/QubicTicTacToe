public class AceQubicBot implements QubicBot
{
	public AceQubicBot()
	{
		
	}
	
	
	public int[] getMove(QubicBoard board)
	{
		for(int i=0;i<4;i++)
			for(int j=0;j<4;j++)
				for(int k=0;k<4;k++)
				{
					int[] move = new int[] {i,j,k};
					if (board.canPlay(move))
						if (board.play(move).getWinner()>0) return move;
				}
		
		for (int i=3;i>=0;i--)
			for (int j=3;j>=0;j--)
				for (int k=3;k>=0;k--)
				{
					int[] move = new int[] {i,j,k};
					if (board.canPlay(move))
						if (canWin(board.play(move))) 
							continue;
						else return move;
						
				}
				
		for (int i=3;i>=0;i--)
			for (int j=3;j>=0;j--)
				for (int k=3;k>=0;k--)
				{
					int[] move = new int[] {i,j,k};
					if (board.canPlay(move))
						return findWin(board.play(move));
				}

		return new int[] {0,0,0};
	}

	public int[] findWin(QubicBoard board)
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
	
	public boolean canWin(QubicBoard board)
	{
		for(int i=0;i<4;i++)
			for(int j=0;j<4;j++)
				for(int k=0;k<4;k++)
				{
					int[] move = new int[] {i,j,k};
					if (board.canPlay(move))
					{
						QubicBoard b = board.play(move);
						if(b.getWinner()!=0) return true;
					}
				}
		return false;
	}
}
