using Puissance4;

Console.OutputEncoding = System.Text.Encoding.UTF8;
Console.Title = "Puissance 4";

try
{
    Console.WindowWidth = Math.Max(Console.WindowWidth, 90);
}
catch { /* Terminal may not support resizing */ }

while (true)
{
    var (mode, p1, p2, difficulty) = Menu.ShowMainMenu();
    GameLoop.Run(mode, p1, p2, difficulty);

    bool playAgain = Menu.AskPlayAgain();
    if (!playAgain)
        continue;
}
