namespace Puissance4;

public static class GameLoop
{
    public static void Run(GameMode mode, string player1Name, string player2Name, int difficulty)
    {
        var session = new GameSession(mode, player1Name, player2Name, difficulty);

        while (!session.IsOver)
        {
            Redraw(session);

            if (session.CurrentPlayer.IsAi)
                PlayAiTurn(session);
            else
                PlayHumanTurn(session);
        }

        Redraw(session);
    }

    private static void Redraw(GameSession session, int? highlightCol = null)
    {
        Console.Clear();
        ConsoleRenderer.DrawLegend(session.Player1, session.Player2);
        ConsoleRenderer.DrawBoard(session.Board, highlightCol, session.WinningCells);
        ConsoleRenderer.DrawStatus(session);
    }

    private static void PlayHumanTurn(GameSession session)
    {
        int? col = null;

        while (col is null)
        {
            ConsoleRenderer.WriteColor(ConsoleColor.White, "  Colonne (1-7) ou 'q' pour quitter : ");

            var input = Console.ReadLine()?.Trim().ToLower();

            if (input == "q" || input == "quit")
            {
                ConfirmQuit();
                return;
            }

            if (int.TryParse(input, out int choice) && choice >= 1 && choice <= Board.Cols)
            {
                int idx = choice - 1;
                if (session.Board.IsColumnPlayable(idx))
                {
                    col = idx;
                    Redraw(session, col);
                    session.Play(idx);
                }
                else
                {
                    Redraw(session);
                    ConsoleRenderer.ShowError("Cette colonne est pleine. Choisissez une autre.");
                }
            }
            else
            {
                Redraw(session);
                ConsoleRenderer.ShowError("Entrée invalide. Tapez un chiffre entre 1 et 7.");
            }
        }
    }

    private static void PlayAiTurn(GameSession session)
    {
        ConsoleRenderer.ShowInfo("L'IA réfléchit...");
        Thread.Sleep(500);

        int col = session.GetAiMove();
        Redraw(session, col);
        Thread.Sleep(400);
        session.Play(col);
    }

    private static void ConfirmQuit()
    {
        Console.Clear();
        ConsoleRenderer.WriteLineColor(ConsoleColor.DarkYellow, "\n  Retour au menu principal...");
        Thread.Sleep(600);
    }
}
