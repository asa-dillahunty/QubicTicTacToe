public class RandomQubicBot implements QubicBot
{
	public RandomQubicBot()
	{
		
	}
	
	
	public int[] getMove(QubicBoard board)
	{
		while(true)
		{
			int[] move=new int[]{(int)(Math.random()*4),(int)(Math.random()*4),(int)(Math.random()*4)};
			if(board.canPlay(move))return move;
		}
		
	}
}
