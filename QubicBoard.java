import java.util.Scanner;

public class QubicBoard
{
	int[][][] board;
	
	public QubicBoard()
	{
		board =new int[4][4][4];	
	}
	
	public QubicBoard copy()
	{
		QubicBoard b=new QubicBoard();
		for(int i=0;i<4;i++)
			for(int j=0;j<4;j++)
				for(int k=0;k<4;k++)
					b.board[i][j][k]=board[i][j][k];  //deep copy
		return b;
	}
	
	public int countPlays()
	{
		int count=0;
		for(int i=0;i<4;i++)
			for(int j=0;j<4;j++)
				for(int k=0;k<4;k++)
					if(board[i][j][k]!=0)count++;
		return count;
	}
	
	public int getTurn()
	{
		return countPlays()%2+1;
	}
	
	public boolean canPlay(int[] pos)
	{
		int x=pos[0];
		int y=pos[1];
		int z=pos[2];
		return board[x][y][z]==0;
	}
	
	public QubicBoard play(int[] pos)
	{
		QubicBoard copy=this.copy();
		int x=pos[0];
		int y=pos[1];
		int z=pos[2];
		copy.board[x][y][z]=getTurn();
		return copy;
	}
	
	public String toString()
	{
		char[][] out=new char[7][19];
		for(int i=0;i<19;i++)
			for(int j=0;j<7;j++)
				out[j][i]=' ';

		for(int i=0;i<4;i++)
			for(int j=0;j<4;j++)
				for(int k=0;k<4;k++)
				{
					int col=i*5+j;
					int row=k+j;
					int token=board[i][j][k];
					if(token==0)out[row][col]='.';
					else if(token==1)out[row][col]='1';
					else out[row][col]='2';
				}
				
		String output="";
		for(int j=0;j<7;j++)
		{
			for(int i=0;i<19;i++)
			{
				output+=out[j][i];
			}
			output+="\n";
		}
		return output;
	}
	
	public int getWinner()
	{
		for(int i=0;i<4;i++)
			for(int j=0;j<4;j++)
				for(int k=0;k<4;k++)
					for(int dx=-1;dx<=1;dx++)
						for(int dy=-1;dy<=1;dy++)
							for(int dz=-1;dz<=1;dz++)
							{
								if (dx==0 && dy==0 && dz==0) continue;
								try
								{
									if(board[i][j][k]!=0 && 
										board[i][j][k]==board[i+dx][j+dy][k+dz] && 
										board[i][j][k]==board[i+2*dx][j+2*dy][k+2*dz] && 
										board[i][j][k]==board[i+3*dx][j+3*dy][k+3*dz])
										return board[i][j][k];
								}
								catch(Exception e)
								{
								}
							}
		return 0;
	}

	public static void startGame(QubicBot bot1, QubicBot bot2, int n) 
	{
		QubicBoard board;
		int wins1 = 0;
		int wins2 = 0;
		int turn;

		for (int i=0;i<n;i++)
		{
			board=new QubicBoard();
			turn = 0;

			while(board.getWinner()==0)
			{
				int[] move=new int[3];
				if(turn%2==0) move=bot1.getMove(board);
				else move=bot2.getMove(board);
				if(!board.canPlay(move)) break;
				board=board.play(move);
				turn++;
			}
			if(board.getWinner()==1) wins1++;
			else if(board.getWinner()==2) wins2++;
		}

		System.out.println("Bot 1 won "+wins1+" times, and bot 2 won "+wins2+" times.");
	}

	public static void startGame(QubicBot bot1, QubicBot bot2) 
	{
		boolean watching = false;
		Scanner pause = null;
		if (!(bot1 instanceof HumanQubicBot) && !(bot2 instanceof HumanQubicBot)) 
		{
			watching = true;
			pause = new Scanner(System.in);
		}

		QubicBoard board=new QubicBoard();
		int turn = 0;

		while(board.getWinner()==0)
		{
			int[] move=new int[3];
			if(turn%2==0) move=bot1.getMove(board);
			else move=bot2.getMove(board);
			if(!board.canPlay(move)) break;
			board=board.play(move);
			turn++;
			if (watching)
			{
				System.out.println(board);
				pause.nextLine();
			}
		}
		if(board.getWinner()==1) System.out.println("Player One Wins!!");
		else if(board.getWinner()==2) System.out.println("Player Two Wins!!");
		else if(board.getWinner()==0) System.out.println("It's a Tie.");
	}

	public static int getNumber(Scanner kb, int max)
	{
		String response;
		int respons = 0;
		while(true)
		{
			response = kb.nextLine();
			try 
			{
				respons = Integer.parseInt(response);
			}
			catch(Exception e) 
			{
				System.out.println("Please enter a valid number between 1 and "+max+" inclusive.");
				continue;
			}

			if (respons > 0 && respons <= max) return respons;
			else System.out.println("Please enter a valid number between 1 and "+max+" inclusive.");
		}
	}
	
	public static void main(String[] args)
	{
		int ans = 0;
		Scanner kb = new Scanner(System.in);
		QubicBot b1;
		QubicBot b2;
		boolean leave = false;
		while (!leave)
		{
			System.out.println("\n\nMain Menu");
			System.out.println("[1] Single Player");
			System.out.println("[2] Two Player");
			System.out.println("[3] Watch");
			System.out.println("[4] Quit");
			ans = QubicBoard.getNumber(kb,4);

			switch(ans)
			{
				case 1:
					System.out.println("\nPick your opponent");
					System.out.println("[1] StanBot");
					System.out.println("[2] AceBot");
					System.out.println("[3] PointBot");
					System.out.println("[4] RandomBot");

					ans = QubicBoard.getNumber(kb, 4);
					switch(ans)
					{
						case 1:
							b1 = new HumanQubicBot();
							b2 = new StanQubicBot();
							QubicBoard.startGame(b1, b2);
							break;
						case 2:
							b1 = new HumanQubicBot();
							b2 = new AceQubicBot();
							QubicBoard.startGame(b1, b2);
							break;
						case 3:
							b1 = new HumanQubicBot();
							b2 = new PointBot();
							QubicBoard.startGame(b1, b2);
							break;
						case 4:
							b1 = new HumanQubicBot();
							b2 = new RandomQubicBot();
							QubicBoard.startGame(b1, b2);
							break;
						default:
							System.out.println("Whoops, that's not supposed to happen.");
					}
					break;
				case 2:
					b1 = new HumanQubicBot();
					b2 = new HumanQubicBot();
					QubicBoard.startGame(b1, b2);
					break;
				case 3:
					System.out.println("\nPick bot one");
					System.out.println("[1] StanBot");
					System.out.println("[2] AceBot");
					System.out.println("[3] PointBot");
					System.out.println("[4] RandomBot");
					ans = QubicBoard.getNumber(kb, 4);
					switch(ans)
					{
						case 1:
							b1 = new StanQubicBot();
							break;
						case 2:
							b1 = new AceQubicBot();
							break;
						case 3:
							b1 = new PointBot();
							break;
						case 4:
							b1 = new RandomQubicBot();
							break;
						default:
							b1 = new StanQubicBot();
							break;
					}

					System.out.println("\nPick bot two");
					System.out.println("[1] StanBot");
					System.out.println("[2] AceBot");
					System.out.println("[3] PointBot");
					System.out.println("[4] RandomBot");

					ans = QubicBoard.getNumber(kb, 4);
					switch(ans)
					{
						case 1:
							b2 = new StanQubicBot();
							break;
						case 2:
							b2 = new AceQubicBot();
							break;
						case 3:
							b2 = new PointBot();
							break;
						case 4:
							b2 = new RandomQubicBot();
							break;
						default:
							b2 = new StanQubicBot();
							break;
					}

					System.out.println("\nHow many games?");

					ans = QubicBoard.getNumber(kb, 1000);
					if (ans == 1) QubicBoard.startGame(b1, b2);
					else QubicBoard.startGame(b1, b2, ans);

					break;
				case 4:
					leave = true;
					break;
				default:
					System.out.println("Something went wrong.");
			}
		}
		// long start=System.nanoTime();
		// int wins1=0;
		// int wins2=0;
		// int n=100;
		// for(int i=0;i<n;i++)
		// {
		// 	QubicBoard board=new QubicBoard();
		// 	// QubicBot bot2=new AceQubicBot();
		// 	QubicBot bot2=new StanQubicBot();
		// 	// QubicBot bot2=new HumanQubicBot();
		// 	QubicBot bot1 = new AceQubicBot();
		// 	int turn=0;
		// 	//start=System.nanoTime();
		// 	while(board.getWinner()==0)
		// 	{
		// 		int[] move=new int[3];
		// 		if(turn%2==0) move=bot1.getMove(board);
		// 		else move=bot2.getMove(board);
		// 		if(!board.canPlay(move)) break;
		// 		board=board.play(move);
		// 		turn++;
		// 		//System.out.println(board);
		// 	}
		// 	//System.out.println(i);
		// 	//System.out.println(board);
		// 	//if(board.getWinner()>0) System.out.printf("The winner is #%d!\n",board.getWinner());
		// 	if(board.getWinner()==1)wins1++;
		// 	if(board.getWinner()==2)wins2++;
		// 	//else System.out.printf("The winner is #%d!\n",(turn+1)%2+1);
		// }
		// // long end=System.nanoTime();
		// // long duration=end-start;
		// // System.out.println(duration);
		// System.out.printf("Player1 won %d times and Player2 won %d times out of %d total games.\n",wins1,wins2,n);
	}
}
