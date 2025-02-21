const canvas = document.getElementById('chessBoard');
const ctx = canvas.getContext('2d');
let GRID_SIZE = 20; // 可以动态调整
let margin = 15;
let CELL_SIZE;

// 缓存 DOM 元素
const blackScoreElement = document.getElementById('black-score');
const whiteScoreElement = document.getElementById('white-score');
const currentPlayerElement = document.getElementById('current-player');
const winnerModal = document.getElementById('winnerModal');
const winnerTextElement = document.getElementById('winnerText');
const roundResultElement = document.getElementById('roundResult');
const continueBtn = document.getElementById('continueBtn');

// 常量定义
const PLAYER_BLACK = 1;
const PLAYER_WHITE = 2;

const gameState = {
    board: [],
    currentPlayer: PLAYER_BLACK,
    gameCount: 0,
    scores: [0, 0],
    totalGames: 3,
    aiEnabled: true,
    gameOver: false,
    difficulty: 'medium', // 默认难度为中等
    aiSurrender: false,
    bestBlackMove: null,
    bestWhiteMove: null,
};

// 初始化游戏参数和棋盘
function initializeGame() {
    GRID_SIZE = Math.min(20, Math.max(10, Math.floor(Math.min(canvas.width, canvas.height) / 30))); //  根据屏幕尺寸调整棋盘大小
    CELL_SIZE = (canvas.width - 2 * margin) / GRID_SIZE;
    gameState.board = Array(GRID_SIZE + 1).fill().map(() => Array(GRID_SIZE + 1).fill(0));
}

// 绘图相关函数
function initBoard() {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
        const x = margin + i * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, canvas.height - margin);
        ctx.stroke();
        const y = margin + i * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(canvas.width - margin, y);
        ctx.stroke();
    }
}

// 动画绘制棋子
function drawPieceAnimated(x, y, player, highlight = false) {
    const centerX = margin + x * CELL_SIZE;
    const centerY = margin + y * CELL_SIZE;
    const targetRadius = CELL_SIZE * 0.4;
    let currentRadius = 0;

    ctx.clearRect(centerX - CELL_SIZE / 2, centerY - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);

    function animate() {
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = player === PLAYER_BLACK ? '#000' : '#FFF';
        ctx.fill();
        ctx.strokeStyle = player === PLAYER_BLACK ? '#666' : '#999';
        ctx.stroke();

        currentRadius += targetRadius / 10; // 控制动画速度

        if (currentRadius < targetRadius) {
            requestAnimationFrame(animate);
        } else {
            if (highlight) drawHighlight(x, y);
        }
    }

    requestAnimationFrame(animate);
}


function drawHighlight(x, y) {
    const centerX = margin + x * CELL_SIZE;
    const centerY = margin + y * CELL_SIZE;
    const radius = CELL_SIZE * 0.45;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.stroke();
}


// 重置和更新UI
function resetBoard() {
    gameState.currentPlayer = gameState.gameCount % 2 === 0 ? PLAYER_BLACK : PLAYER_WHITE;
    gameState.board = Array(GRID_SIZE + 1).fill().map(() => Array(GRID_SIZE + 1).fill(0));
    gameState.gameOver = false;
    gameState.aiSurrender = false;
    gameState.bestBlackMove = null;
    gameState.bestWhiteMove = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initBoard();
    updateUI();
    if (gameState.aiEnabled && gameState.currentPlayer === PLAYER_WHITE) aiMove();
}

function clearBoard() {
    resetBoard(); //  重用 resetBoard
    gameState.scores = [0, 0];
    gameState.gameCount = 0;
}

function updateUI() {
    blackScoreElement.textContent = gameState.scores[0];
    whiteScoreElement.textContent = gameState.scores[1];

    let statusText = gameState.gameOver
        ? (gameState.aiSurrender ? '白方认输!' : '游戏结束')
        : (gameState.currentPlayer === PLAYER_BLACK ? '黑方回合' : (gameState.aiEnabled ? 'AI 思考中...' : '白方回合'));

    currentPlayerElement.querySelector('.status-value').innerHTML = statusText;

    document.querySelectorAll('.status-item').forEach(item => item.classList.remove('active'));
    currentPlayerElement.classList.add('active');
}

// 游戏逻辑
function placePiece(x, y) {
    if (gameState.gameOver || gameState.board[x][y] !== 0) return;

    gameState.board[x][y] = gameState.currentPlayer;
    drawPieceAnimated(x, y, gameState.currentPlayer);

    const winningLine = checkWin(x, y, gameState.currentPlayer);
    if (winningLine) {
        winningLine.forEach(([wx, wy]) => drawPieceAnimated(wx, wy, gameState.currentPlayer, true));
        endGame(winningLine);
        return;
    }

    gameState.currentPlayer = (gameState.currentPlayer === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK; // 更简洁的切换玩家
    updateUI();
    if (gameState.aiEnabled && gameState.currentPlayer === PLAYER_WHITE) aiMove();
}

function checkWin(x, y, player) {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (const [dx, dy] of directions) {
        let count = 1;
        const winningLine = [[x, y]];

        // 检查正方向
        for (let i = 1; i <= 4; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx < 0 || nx > GRID_SIZE || ny < 0 || ny > GRID_SIZE || gameState.board[nx][ny] !== player) break;
            winningLine.push([nx, ny]);
            count++;
        }

        // 检查反方向 (无需重新检查起始点)
        for (let i = 1; i <= 4; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (nx < 0 || nx > GRID_SIZE || ny < 0 || ny > GRID_SIZE || gameState.board[nx][ny] !== player) break;
            winningLine.push([nx, ny]);
            count++;
        }

        if (count >= 5) return winningLine;
    }
    return null;
}


function endGame(winningLine) {
    gameState.gameOver = true;
    gameState.gameCount++;
    const requiredWins = Math.ceil(gameState.totalGames / 2);
    winnerModal.classList.add('show');
    let winnerText = '';
    let roundResultText = `当前比分：黑方 ${gameState.scores[0]} - 白方 ${gameState.scores[1]}`;

    if (gameState.aiSurrender) {
        winnerText = '白方认输！黑方获胜！';
        // Highlight BEFORE updating the score.  CRUCIAL FIX!
        if (gameState.bestBlackMove) {
            drawPieceAnimated(gameState.bestBlackMove[0], gameState.bestBlackMove[1], PLAYER_BLACK, true);
        }
        if (gameState.bestWhiteMove) {
            drawPieceAnimated(gameState.bestWhiteMove[0], gameState.bestWhiteMove[1], PLAYER_WHITE, true);
        }
        gameState.scores[0]++; // Increment score AFTER highlighting
    } else {
        const winner = gameState.currentPlayer === PLAYER_BLACK ? '黑方' : '白方';
        winnerText = `${winner} 胜出本局！`;
        gameState.scores[gameState.currentPlayer - 1]++;
    }

    winnerTextElement.textContent = winnerText;
    roundResultElement.textContent = roundResultText;

    if (gameState.scores.some(score => score >= requiredWins)) {
        const finalWinner = gameState.scores[0] >= requiredWins ? '黑方' : '白方';
        winnerTextElement.textContent = `${finalWinner}获得最终胜利！`;
        roundResultElement.textContent = `最终比分：黑方 ${gameState.scores[0]} - 白方 ${gameState.scores[1]}`;
        continueBtn.onclick = () => {
            winnerModal.classList.remove('show');
            newGame();
        };
    } else {
        continueBtn.onclick = () => {
            winnerModal.classList.remove('show');
            resetBoard();
        };
    }
}


// AI 相关
function getPossibleMoves(board) {
    const moves = [];
    const emptyCells = [];
    const neighborOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    for (let i = 0; i <= GRID_SIZE; i++) {
        for (let j = 0; j <= GRID_SIZE; j++) {
            if (board[i][j] === 0) emptyCells.push([i, j]);
        }
    }

    if (emptyCells.length === (GRID_SIZE + 1) ** 2) return [[Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE / 2)]];

    for (const [x, y] of emptyCells) {
        if (neighborOffsets.some(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            return nx >= 0 && nx <= GRID_SIZE && ny >= 0 && ny <= GRID_SIZE && board[nx][ny] !== 0;
        })) {
            moves.push([x, y]);
        }
    }
    return moves.length > 0 ? moves : emptyCells;
}

// 检查是否存在可以立即制胜的棋步
function findImmediateWin(board, player) {
    const moves = getPossibleMoves(board);
    for (const [x, y] of moves) {
        board[x][y] = player;
        if (checkWin(x, y, player)) {
            board[x][y] = 0; // 恢复棋盘
            return [x, y]; // 找到制胜点
        }
        board[x][y] = 0; // 恢复棋盘
    }
    return null;
}


function calculateBestMove(player) {
    // 优先寻找可以立即获胜的步骤
    let winMove = findImmediateWin(gameState.board, player);
    if (winMove) return winMove;

    // 优先阻止对手获胜
    let blockMove = findImmediateWin(gameState.board, (player === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK);
    if (blockMove) return blockMove;


    let bestScore = -Infinity;
    let bestMove = null;
    const moves = getPossibleMoves(gameState.board);
    // 根据难度设置搜索深度
    const depth = { easy: 2, medium: 3, hard: 4 }[gameState.difficulty];

    for (const [x, y] of moves) {
        gameState.board[x][y] = player;
        const score = minimax(gameState.board, depth - 1, -Infinity, Infinity, false, player);
        gameState.board[x][y] = 0;
        if (score > bestScore) {
            bestScore = score;
            bestMove = [x, y];
        }
    }
    return bestMove;
}

function aiMove() {
    const statusElement = document.getElementById('current-player');
    statusElement.querySelector('.status-value').innerHTML = '<span class="loader"></span>AI 思考中...';

    setTimeout(() => {
        let bestMove;
        if (gameState.gameCount === 0 && gameState.currentPlayer === PLAYER_WHITE && getPossibleMoves(gameState.board).length === (GRID_SIZE + 1) ** 2) {
            bestMove = [Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE / 2)];
        } else {
            bestMove = calculateBestMove(PLAYER_WHITE); //  AI 玩家是 2
        }

        // 降低认输条件，让AI更少地认输，提高游戏性
        if (minimax(gameState.board, 3, -Infinity, Infinity, true, PLAYER_WHITE) < -70000 && gameState.difficulty !== 'easy') { // 使用固定深度检查是否认输
            gameState.aiSurrender = true;
            gameState.bestBlackMove = calculateBestMove(PLAYER_BLACK); // 计算黑棋最佳
            gameState.bestWhiteMove = calculateBestMove(PLAYER_WHITE);
            endGame();
            return;
        }
        if (bestMove) placePiece(bestMove[0], bestMove[1]);
    }, 300);
}


function minimax(board, depth, alpha, beta, isMaximizingPlayer, player) {
    if (depth === 0) {
        return evaluateBoard(board, player);
    }

    let bestScore = isMaximizingPlayer ? -Infinity : Infinity;
    const moves = getPossibleMoves(board);

     // 快速检查是否已经可以获胜/失败
    for (const [x, y] of moves) {
      board[x][y] = isMaximizingPlayer ? player : ((player === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK);
      if(checkWin(x,y, isMaximizingPlayer? player : ((player === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK))){
          board[x][y] = 0;
          return isMaximizingPlayer ? 100000 + depth : -100000 - depth;
      }
      board[x][y] = 0;
    }

    for (const [x, y] of moves) {
        board[x][y] = isMaximizingPlayer ? player : ((player === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK);
        const score = minimax(board, depth - 1, alpha, beta, !isMaximizingPlayer, player);
        board[x][y] = 0;
        bestScore = isMaximizingPlayer ? Math.max(bestScore, score) : Math.min(bestScore, score);
        if (isMaximizingPlayer) alpha = Math.max(alpha, bestScore);
        else beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
    }
    return bestScore;
}

function evaluateBoard(board, player) {
    let score = 0;
    const opponent = (player === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK;
    const gamePhase = Math.min(1, (gameState.gameCount * 2) / (GRID_SIZE * GRID_SIZE)); // 动态权重系数

    // 新增棋型检测（文献7）
    const patternScores = {
        FIVE: 1000000,         // 连五
        DOUBLE_FOUR: 50000,    // 双四
        FOUR: 10000,           // 活四
        DOUBLE_THREE: 8000,    // 双活三
        THREE: 2000,           // 活三
        BLOCKED_FOUR: 1000,    // 冲四
        TWO: 500,              // 活二
        BLOCKED_THREE: 200,    // 眠三
        ONE: 50,               // 活一
        CENTER_WEIGHT: 5 * (1 - gamePhase) + 2 * gamePhase // 动态中心权重
    };

    // 增强棋型检测（文献5）
    function detectPatterns(x, y, currentPlayer) {
        let patterns = new Set();
        const directions = [[1,0], [0,1], [1,1], [1,-1]];

        directions.forEach(([dx, dy]) => {
            let line = [];
            for(let i = -4; i <= 4; i++) {
                const nx = x + dx*i;
                const ny = y + dy*i;
                if(nx >=0 && nx <= GRID_SIZE && ny >=0 && ny <= GRID_SIZE) {
                    line.push(board[nx][ny]);
                } else {
                    line.push(-1); // 边界标记
                }
            }

            // 正则表达式检测棋型（文献7）
            const lineStr = line.map(c =>
                c === currentPlayer ? '1' :
                c === 0 ? '0' : 'x'
            ).join('');

            // 检测连五
            if(/1{5}/.test(lineStr)) patterns.add('FIVE');
            // 检测活四
            if(/01{4}0/.test(lineStr)) patterns.add('FOUR');
            // 检测双四
            if((lineStr.match(/01{4}0/g) || []).length >= 2) patterns.add('DOUBLE_FOUR');
            // 检测双活三
            if((lineStr.match(/01{3}0/g) || []).length >= 2) patterns.add('DOUBLE_THREE');
            // 检测冲四
            if(/x1{4}0|01{4}x|01{3}01/.test(lineStr)) patterns.add('BLOCKED_FOUR');
        });

        return Array.from(patterns);
    }

    // 全盘扫描评估
    for(let i = 0; i <= GRID_SIZE; i++) {
        for(let j = 0; j <= GRID_SIZE; j++) {
            if(board[i][j] === player) {
                // 动态中心权重（文献5）
                const distFromCenter = Math.abs(i - GRID_SIZE/2) + Math.abs(j - GRID_SIZE/2);
                score += patternScores.CENTER_WEIGHT * (10 - distFromCenter);

                // 棋型检测
                const patterns = detectPatterns(i, j, player);
                patterns.forEach(p => score += patternScores[p]);

            } else if(board[i][j] === opponent) {
                // 对手威胁评估
                const patterns = detectPatterns(i, j, opponent);
                patterns.forEach(p => score -= patternScores[p] * 1.2); // 增强防守权重
            }
        }
    }

    // 胜利条件优先判断（文献3）
    const winCheck = checkWin(Math.floor(GRID_SIZE/2), Math.floor(GRID_SIZE/2), player);
    if(winCheck) score += patternScores.FIVE * 2;

    return score;
}

// 初始化和事件监听
function newGame() {
    initializeGame(); // 初始化游戏参数
    gameState.currentPlayer = PLAYER_BLACK;
    gameState.gameCount = 0;
    gameState.scores = [0, 0];
    gameState.totalGames = parseInt(document.getElementById('totalGames').value);
    gameState.aiEnabled = document.getElementById('aiMode').checked;
    gameState.gameOver = false;
    gameState.difficulty = document.getElementById('difficulty').value;
    gameState.aiSurrender = false;
    gameState.bestBlackMove = null;
    gameState.bestWhiteMove = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initBoard();
    updateUI();
    if (gameState.aiEnabled && gameState.currentPlayer === PLAYER_WHITE) aiMove();
}

document.getElementById('totalGames').addEventListener('change', newGame);
document.getElementById('difficulty').addEventListener('change', newGame);
document.getElementById('aiMode').addEventListener('change', newGame);
canvas.addEventListener('click', (e) => {
    if (gameState.gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;   // 水平方向的缩放比例
    const scaleY = canvas.height / rect.height;  // 垂直方向的缩放比例

    // 获取鼠标相对于canvas的坐标 (考虑缩放)
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const x = Math.round((canvasX - margin) / CELL_SIZE);
    const y = Math.round((canvasY - margin) / CELL_SIZE);


    if (x >= 0 && x <= GRID_SIZE && y >= 0 && y <= GRID_SIZE) placePiece(x, y);
});

// 初始化游戏
function init() {
    initializeGame();
    initBoard();
    updateUI();
    document.getElementById('current-player').querySelector('.status-value').textContent = '新游戏';
    document.getElementById('aiMode').checked = gameState.aiEnabled; // 初始化AI状态
}


init();
