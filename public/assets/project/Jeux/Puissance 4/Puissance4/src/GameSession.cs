namespace Puissance4;

public enum GameMode { TwoPlayers, VsAi }

public sealed class PlayerInfo
{
    public string Name { get; init; } = string.Empty;
    public CellState Token { get; init; }
    public bool IsAi { get; init; }
}

public sealed class GameSession
{
    public Board Board { get; } = new Board();
    public PlayerInfo Player1 { get; }
    public PlayerInfo Player2 { get; }
    public PlayerInfo CurrentPlayer { get; private set; }
    public GameResult Result { get; private set; } = GameResult.None;
    public bool IsOver => Result != GameResult.None;
    public int MoveCount { get; private set; }
    public IReadOnlyList<(int row, int col)>? WinningCells { get; private set; }

    private readonly AiEngine? _ai;

    public GameSession(GameMode mode, string player1Name, string player2Name, int aiDifficulty = 2)
    {
        Player1 = new PlayerInfo { Name = player1Name, Token = CellState.Player1, IsAi = false };
        Player2 = new PlayerInfo
        {
            Name = player2Name,
            Token = CellState.Player2,
            IsAi = mode == GameMode.VsAi
        };

        CurrentPlayer = Player1;

        if (mode == GameMode.VsAi)
            _ai = new AiEngine(aiDifficulty, CellState.Player2);
    }

    public int GetAiMove() => _ai!.ChooseBestColumn(Board);

    public void Play(int col)
    {
        if (IsOver)
            throw new InvalidOperationException("La partie est terminée.");

        int row = Board.Drop(col, CurrentPlayer.Token);
        MoveCount++;

        var winning = Board.GetWinningCells(row, col, CurrentPlayer.Token);
        if (winning is not null)
        {
            WinningCells = winning;
            Result = CurrentPlayer.Token == CellState.Player1
                ? GameResult.Player1Wins
                : GameResult.Player2Wins;
            return;
        }

        if (Board.IsFull())
        {
            Result = GameResult.Draw;
            return;
        }

        CurrentPlayer = CurrentPlayer == Player1 ? Player2 : Player1;
    }
}
