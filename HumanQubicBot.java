import java.util.Scanner;

public class HumanQubicBot implements QubicBot
{
	private String name = "Player 1";
	
	public HumanQubicBot(String name)
	{
		this.name = name;
	}
	
	public HumanQubicBot()
	{
		
	}

	public void setName(String name)
	{
		this.name = name;
	}
	
	public String getName()
	{
		return name;
	}
	
	public int[] getMove(QubicBoard board)
	{
		int[] move = new int[3];
		boolean sensible = false;
		Scanner kb = new Scanner(System.in);
		System.out.println();
		System.out.println(board);
		while (!board.canPlay(move) || !sensible)
		{
			System.out.println("Where would you like to move?");
			String answer = kb.nextLine();
			if (answer.equals("help"))
			{
				System.out.println("\nEnter numbers seperated by a single comma.");
				System.out.println("The first number is the slice, the second number is the column, and the third is distance vertically going down. Read the readme.\n");
			}
			else
			{
				String[] choice = answer.split(",");
				try
				{
					move[0] = Integer.parseInt(choice[0])-1;
					move[1] = Integer.parseInt(choice[1])-1;
					move[2] = Integer.parseInt(choice[2])-1;
					sensible = true;
				}
				catch(Exception e)
				{
					System.out.println("invalid entry");
				}
				if (!board.canPlay(move)) System.out.println("invalid move");
			}
		}
		// kb.close(); // this screws things up??
		return move;
	}
}
