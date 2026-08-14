namespace Puissance4;

public sealed class AiEngine
{
    private readonly int _depth;
    private readonly CellState _aiPlayer;
    private readonly CellState _humanPlayer;

    public AiEngine(int difficulty, CellState aiPlayer)
    {
        _depth = difficulty switch
        {
            1 => 3,
            2 => 5,
            3 => 7,
            _ => 5
        };
        _aiPlayer = aiPlayer;
        _humanPlayer = aiPlayer == CellState.Player1 ? CellState.Player2 : CellState.Player1;
    }

    public int ChooseBestColumn(Board board)
    {
        int bestScore = int.MinValue;
        int bestCol = board.GetPlayableColumns().First();

        foreach (int col in board.GetPlayableColumns())
        {
            var copy = board.Clone();
            int row = copy.Drop(col, _aiPlayer);

            if (copy.CheckWin(row, col, _aiPlayer))
                return col;

            int score = Minimax(copy, _depth - 1, int.MinValue, int.MaxValue, false);
            if (score > bestScore)
            {
                bestScore = score;
                bestCol = col;
            }
        }

        return bestCol;
    }

    private int Minimax(Board board, int depth, int alpha, int beta, bool isMaximizing)
    {
        var playable = board.GetPlayableColumns().ToList();

        if (depth == 0 || !playable.Any() || board.IsFull())
            return board.Score(_aiPlayer);

        if (isMaximizing)
        {
            int maxScore = int.MinValue;

            foreach (int col in playable)
            {
                var copy = board.Clone();
                int row = copy.Drop(col, _aiPlayer);

                if (copy.CheckWin(row, col, _aiPlayer))
                    return 10000 + depth;

                int score = Minimax(copy, depth - 1, alpha, beta, false);
                maxScore = Math.Max(maxScore, score);
                alpha = Math.Max(alpha, score);
                if (beta <= alpha) break;
            }

            return maxScore;
        }
        else
        {
            int minScore = int.MaxValue;

            foreach (int col in playable)
            {
                var copy = board.Clone();
                int row = copy.Drop(col, _humanPlayer);

                if (copy.CheckWin(row, col, _humanPlayer))
                    return -(10000 + depth);

                int score = Minimax(copy, depth - 1, alpha, beta, true);
                minScore = Math.Min(minScore, score);
                beta = Math.Min(beta, score);
                if (beta <= alpha) break;
            }

            return minScore;
        }
    }
}
