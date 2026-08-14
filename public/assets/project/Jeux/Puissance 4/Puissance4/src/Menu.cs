namespace Puissance4;

public static class Menu
{
    public static (GameMode mode, string p1, string p2, int difficulty) ShowMainMenu()
    {
        ConsoleRenderer.DrawTitle();

        ConsoleRenderer.WriteLineColor(ConsoleColor.White, "  Bienvenue dans Puissance 4 !");
        Console.WriteLine();

        int modeChoice = SelectOption("Mode de jeu :", new[]
        {
            "Joueur vs Joueur",
            "Joueur vs IA",
            "Quitter"
        });

        if (modeChoice == 2)
            Environment.Exit(0);

        var mode = modeChoice == 0 ? GameMode.TwoPlayers : GameMode.VsAi;

        Console.WriteLine();
        ConsoleRenderer.WriteColor(ConsoleColor.White, "  Nom du Joueur 1 (Rouge) : ");
        string p1 = ReadNonEmpty("Joueur 1");

        string p2;
        int difficulty = 2;

        if (mode == GameMode.TwoPlayers)
        {
            ConsoleRenderer.WriteColor(ConsoleColor.White, "  Nom du Joueur 2 (Jaune) : ");
            p2 = ReadNonEmpty("Joueur 2");
        }
        else
        {
            p2 = "Ordinateur";
            Console.WriteLine();
            difficulty = SelectOption("Difficulté de l'IA :", new[]
            {
                "Facile",
                "Normale",
                "Difficile"
            }) + 1;
        }

        return (mode, p1, p2, difficulty);
    }

    public static bool AskPlayAgain()
    {
        Console.WriteLine();
        int choice = SelectOption("Que souhaitez-vous faire ?", new[]
        {
            "Rejouer",
            "Menu principal",
            "Quitter"
        });

        return choice switch
        {
            0 => true,
            2 => Exit(),
            _ => false
        };
    }

    private static bool Exit()
    {
        Environment.Exit(0);
        return false;
    }

    private static int SelectOption(string prompt, string[] options)
    {
        int selected = 0;
        ConsoleKey key;

        Console.CursorVisible = false;

        // Reserve space by printing empty lines, then save start position
        int lineCount = options.Length + 3; // blank + prompt + blank + options
        for (int i = 0; i < lineCount; i++)
            Console.WriteLine();

        int startTop = Math.Max(0, Console.CursorTop - lineCount);

        do
        {
            Console.SetCursorPosition(0, startTop);

            Console.WriteLine();
            ConsoleRenderer.WriteLineColor(ConsoleColor.White, $"  {prompt}");
            Console.WriteLine();

            for (int i = 0; i < options.Length; i++)
            {
                // Clear the line first
                Console.Write(new string(' ', Console.WindowWidth - 1));
                Console.SetCursorPosition(0, startTop + 3 + i);

                if (i == selected)
                {
                    ConsoleRenderer.WriteColor(ConsoleColor.Cyan, "  ▶ ");
                    ConsoleRenderer.WriteLineColor(ConsoleColor.White, options[i]);
                }
                else
                {
                    ConsoleRenderer.WriteLineColor(ConsoleColor.DarkGray, $"    {options[i]}");
                }
            }

            key = Console.ReadKey(true).Key;

            if (key == ConsoleKey.UpArrow)
                selected = (selected - 1 + options.Length) % options.Length;
            else if (key == ConsoleKey.DownArrow)
                selected = (selected + 1) % options.Length;

        } while (key != ConsoleKey.Enter);

        Console.CursorVisible = true;
        Console.SetCursorPosition(0, startTop + lineCount);

        // Print final selection
        Console.WriteLine();
        ConsoleRenderer.WriteColor(ConsoleColor.White, $"  {prompt} ");
        ConsoleRenderer.WriteLineColor(ConsoleColor.Cyan, options[selected]);
        Console.WriteLine();

        return selected;
    }

    private static string ReadNonEmpty(string fallback)
    {
        var input = Console.ReadLine()?.Trim();
        return string.IsNullOrEmpty(input) ? fallback : input;
    }
}
