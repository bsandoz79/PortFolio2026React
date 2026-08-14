namespace Puissance4;

public static class ConsoleRenderer
{
    private const char TokenP1 = '●';
    private const char TokenP2 = '●';
    private const char Empty = '·';
    private const char Border = '│';

    private static readonly ConsoleColor ColorP1 = ConsoleColor.Red;
    private static readonly ConsoleColor ColorP2 = ConsoleColor.Yellow;
    private static readonly ConsoleColor ColorBorder = ConsoleColor.DarkCyan;
    private static readonly ConsoleColor ColorEmpty = ConsoleColor.DarkGray;
    private static readonly ConsoleColor ColorHeader = ConsoleColor.Cyan;
    private static readonly ConsoleColor ColorHighlight = ConsoleColor.Green;

    public static void DrawTitle()
    {
        Console.Clear();
        WriteColor(ColorHeader, @"
  ██████╗ ██╗   ██╗██╗███████╗███████╗ █████╗ ███╗   ██╗ ██████╗███████╗    ██╗  ██╗
  ██╔══██╗██║   ██║██║██╔════╝██╔════╝██╔══██╗████╗  ██║██╔════╝██╔════╝    ██║  ██║
  ██████╔╝██║   ██║██║███████╗███████╗███████║██╔██╗ ██║██║     █████╗      ███████║
  ██╔═══╝ ██║   ██║██║╚════██║╚════██║██╔══██║██║╚██╗██║██║     ██╔══╝      ╚════██║
  ██║     ╚██████╔╝██║███████║███████║██║  ██║██║ ╚████║╚██████╗███████╗         ██║
  ╚═╝      ╚═════╝ ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝         ╚═╝
");
        Console.WriteLine();
    }

    public static void DrawBoard(Board board, int? highlightCol = null, IReadOnlyList<(int row, int col)>? winningCells = null)
    {
        var winSet = winningCells is not null
            ? new HashSet<(int, int)>(winningCells)
            : null;

        Console.WriteLine();

        // Column numbers — each column is 4 chars wide (" X │"), prefix matches "  ║" (3 chars)
        Console.Write("   ");
        for (int c = 0; c < Board.Cols; c++)
        {
            Console.Write(" ");
            if (c == highlightCol)
                WriteColor(ColorHighlight, $"{c + 1}");
            else
                WriteColor(ColorHeader, $"{c + 1}");
            Console.Write("  ");
        }
        Console.WriteLine();

        // Top border
        WriteColor(ColorBorder, "  ╔");
        for (int c = 0; c < Board.Cols; c++)
        {
            WriteColor(ColorBorder, "═══");
            if (c < Board.Cols - 1) WriteColor(ColorBorder, "╦");
        }
        WriteColor(ColorBorder, "╗\n");

        // Rows
        for (int r = 0; r < Board.Rows; r++)
        {
            WriteColor(ColorBorder, "  ║");
            for (int c = 0; c < Board.Cols; c++)
            {
                Console.Write(" ");
                bool isWinner = winSet?.Contains((r, c)) == true;
                DrawCell(board[r, c], isWinner);
                Console.Write(" ");
                WriteColor(ColorBorder, Border.ToString());
            }
            Console.WriteLine();

            if (r < Board.Rows - 1)
            {
                WriteColor(ColorBorder, "  ╠");
                for (int c = 0; c < Board.Cols; c++)
                {
                    WriteColor(ColorBorder, "═══");
                    if (c < Board.Cols - 1) WriteColor(ColorBorder, "╬");
                }
                WriteColor(ColorBorder, "╣\n");
            }
        }

        // Bottom border
        WriteColor(ColorBorder, "  ╚");
        for (int c = 0; c < Board.Cols; c++)
        {
            WriteColor(ColorBorder, "═══");
            if (c < Board.Cols - 1) WriteColor(ColorBorder, "╩");
        }
        WriteColor(ColorBorder, "╝\n");

        Console.WriteLine();
    }

    private static void DrawCell(CellState cell, bool isWinning = false)
    {
        switch (cell)
        {
            case CellState.Player1:
                WriteColor(isWinning ? ConsoleColor.White : ColorP1, isWinning ? "★" : TokenP1.ToString());
                break;
            case CellState.Player2:
                WriteColor(isWinning ? ConsoleColor.White : ColorP2, isWinning ? "★" : TokenP2.ToString());
                break;
            default:
                WriteColor(ColorEmpty, Empty.ToString());
                break;
        }
    }

    public static void DrawStatus(GameSession session)
    {
        if (session.IsOver)
        {
            DrawResult(session);
            return;
        }

        var player = session.CurrentPlayer;
        Console.Write("  Tour de ");
        WriteColor(player.Token == CellState.Player1 ? ColorP1 : ColorP2, player.Name);

        if (player.IsAi)
            WriteColor(ConsoleColor.DarkGray, " [IA]");

        Console.Write($"  •  Coup #{session.MoveCount + 1}");
        Console.WriteLine();
        Console.WriteLine();
    }

    public static void DrawResult(GameSession session)
    {
        Console.WriteLine();
        switch (session.Result)
        {
            case GameResult.Player1Wins:
                WriteColor(ColorP1, $"  🏆  {session.Player1.Name} remporte la partie !");
                break;
            case GameResult.Player2Wins:
                WriteColor(ColorP2, $"  🏆  {session.Player2.Name} remporte la partie !");
                break;
            case GameResult.Draw:
                WriteColor(ConsoleColor.White, "  🤝  Égalité ! Bien joué les deux !");
                break;
        }
        Console.WriteLine();
        Console.WriteLine();
    }

    public static void DrawLegend(PlayerInfo p1, PlayerInfo p2)
    {
        Console.Write("  ");
        WriteColor(ColorP1, TokenP1.ToString());
        Console.Write($" {p1.Name}   ");
        WriteColor(ColorP2, TokenP2.ToString());
        Console.Write($" {p2.Name}");
        if (p2.IsAi) WriteColor(ConsoleColor.DarkGray, " (IA)");
        Console.WriteLine();
        Console.WriteLine();
    }

    public static void WriteColor(ConsoleColor color, string text)
    {
        var prev = Console.ForegroundColor;
        Console.ForegroundColor = color;
        Console.Write(text);
        Console.ForegroundColor = prev;
    }

    public static void WriteLineColor(ConsoleColor color, string text)
    {
        WriteColor(color, text);
        Console.WriteLine();
    }

    public static void ShowError(string message)
    {
        WriteLineColor(ConsoleColor.DarkRed, $"  ⚠  {message}");
    }

    public static void ShowInfo(string message)
    {
        WriteLineColor(ConsoleColor.DarkGray, $"  {message}");
    }
}
