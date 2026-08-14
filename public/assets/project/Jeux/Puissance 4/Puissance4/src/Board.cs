namespace Puissance4;

public sealed class Board
{
    public const int Rows = 6;
    public const int Cols = 7;
    public const int WinLength = 4;

    private readonly CellState[,] _grid;

    public Board()
    {
        _grid = new CellState[Rows, Cols];
    }

    private Board(CellState[,] grid)
    {
        _grid = (CellState[,])grid.Clone();
    }

    public CellState this[int row, int col] => _grid[row, col];

    public bool IsColumnPlayable(int col) =>
        col >= 0 && col < Cols && _grid[0, col] == CellState.Empty;

    public IEnumerable<int> GetPlayableColumns()
    {
        for (int c = 0; c < Cols; c++)
            if (IsColumnPlayable(c))
                yield return c;
    }

    public bool IsFull() => !GetPlayableColumns().Any();

    public int Drop(int col, CellState player)
    {
        if (!IsColumnPlayable(col))
            throw new InvalidOperationException($"Column {col + 1} is full.");

        for (int row = Rows - 1; row >= 0; row--)
        {
            if (_grid[row, col] == CellState.Empty)
            {
                _grid[row, col] = player;
                return row;
            }
        }

        throw new InvalidOperationException("Unexpected board state.");
    }

    public bool CheckWin(int row, int col, CellState player)
    {
        return GetWinningCells(row, col, player) is not null;
    }

    public List<(int row, int col)>? GetWinningCells(int row, int col, CellState player)
    {
        (int dr, int dc)[] directions = [(0, 1), (1, 0), (1, 1), (1, -1)];

        foreach (var (dr, dc) in directions)
        {
            var cells = CollectLine(row, col, dr, dc, player);
            if (cells.Count >= WinLength)
                return cells;
        }

        return null;
    }

    private List<(int row, int col)> CollectLine(int row, int col, int dr, int dc, CellState player)
    {
        var cells = new List<(int, int)> { (row, col) };

        for (int sign = -1; sign <= 1; sign += 2)
        {
            int r = row + sign * dr;
            int c = col + sign * dc;
            while (r >= 0 && r < Rows && c >= 0 && c < Cols && _grid[r, c] == player)
            {
                cells.Add((r, c));
                r += sign * dr;
                c += sign * dc;
            }
        }

        return cells;
    }

    private int CountDirection(int row, int col, int dr, int dc, CellState player)
    {
        int count = 0;
        int r = row + dr;
        int c = col + dc;

        while (r >= 0 && r < Rows && c >= 0 && c < Cols && _grid[r, c] == player)
        {
            count++;
            r += dr;
            c += dc;
        }

        return count;
    }

    public Board Clone() => new(_grid);

    public int Score(CellState player)
    {
        int score = 0;
        CellState opponent = player == CellState.Player1 ? CellState.Player2 : CellState.Player1;

        // Center column preference
        for (int r = 0; r < Rows; r++)
            if (_grid[r, Cols / 2] == player) score += 3;

        // Evaluate all windows
        score += EvaluateWindows(player, opponent);

        return score;
    }

    private int EvaluateWindows(CellState player, CellState opponent)
    {
        int score = 0;

        // Horizontal
        for (int r = 0; r < Rows; r++)
            for (int c = 0; c <= Cols - WinLength; c++)
                score += ScoreWindow(r, c, 0, 1, player, opponent);

        // Vertical
        for (int r = 0; r <= Rows - WinLength; r++)
            for (int c = 0; c < Cols; c++)
                score += ScoreWindow(r, c, 1, 0, player, opponent);

        // Diagonal /
        for (int r = WinLength - 1; r < Rows; r++)
            for (int c = 0; c <= Cols - WinLength; c++)
                score += ScoreWindow(r, c, -1, 1, player, opponent);

        // Diagonal \
        for (int r = 0; r <= Rows - WinLength; r++)
            for (int c = 0; c <= Cols - WinLength; c++)
                score += ScoreWindow(r, c, 1, 1, player, opponent);

        return score;
    }

    private int ScoreWindow(int startRow, int startCol, int dr, int dc, CellState player, CellState opponent)
    {
        int playerCount = 0;
        int emptyCount = 0;

        for (int i = 0; i < WinLength; i++)
        {
            var cell = _grid[startRow + i * dr, startCol + i * dc];
            if (cell == player) playerCount++;
            else if (cell == CellState.Empty) emptyCount++;
        }

        if (playerCount == 4) return 100;
        if (playerCount == 3 && emptyCount == 1) return 5;
        if (playerCount == 2 && emptyCount == 2) return 2;

        int opponentCount = WinLength - playerCount - emptyCount;
        if (opponentCount == 3 && emptyCount == 1) return -4;

        return 0;
    }
}
