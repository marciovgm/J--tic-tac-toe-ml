class QLearningTicTacToe {
    constructor() {
        this.qTable = {};
        this.learningRate = 0.1;
        this.discountFactor = 0.9;
        this.explorationRate = 0.1;
        this.board = Array(9).fill(null);
        this.player = 'X';
        this.opponent = 'O';
        this.isTraining = false;
        this.gamesPlayed = 0;
    }

    // Retorna uma string representando o estado atual do tabuleiro
    getBoardState() {
        return this.board.join('');
    }

    // Retorna um array com os índices dos movimentos disponíveis no tabuleiro
    getAvailableMoves() {
        return this.board.reduce((acc, cell, index) => {
            if (cell === null) acc.push(index);
            return acc;
        }, []);
    }

    // Escolhe um movimento baseado na exploração/explicação
    chooseMove() {
        if (Math.random() < this.explorationRate) {
            const availableMoves = this.getAvailableMoves();
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else {
            const state = this.getBoardState();
            if (!this.qTable[state]) this.qTable[state] = Array(9).fill(0);
            let maxQ = Math.max(...this.qTable[state]);
            let moves = this.getAvailableMoves().filter(index => this.qTable[state][index] === maxQ);
            return moves[Math.floor(Math.random() * moves.length)];
        }
    }

    // Atualiza a Q-Table com o valor de recompensa
    updateQTable(reward) {
        const state = this.getBoardState();
        if (!this.qTable[state]) this.qTable[state] = Array(9).fill(0);
        const move = this.lastMove;
        const nextState = this.board.join('');
        let maxNextQ = Math.max(...(this.qTable[nextState] || Array(9).fill(0)));
        this.qTable[state][move] += this.learningRate * (reward + this.discountFactor * maxNextQ - this.qTable[state][move]);
    }

    // Executa um movimento no tabuleiro e verifica se o jogo terminou
    makeMove(index) {
        if (this.board[index] === null && !this.isTraining) {
            this.board[index] = this.player;
            this.lastMove = index;
            this.renderBoard();
            if (this.checkWin(this.player)) {
                this.updateQTable(1);
                if (!this.isTraining) alert('Você ganhou!');
                this.reset();
            } else if (this.getAvailableMoves().length === 0) {
                this.updateQTable(0.5);
                if (!this.isTraining) alert('Empate!');
                this.reset();
            } else {
                this.opponentMove();
            }
        }
    }

    // Movimento do oponente IA
    opponentMove() {
        const opponentMove = this.chooseMove();
        this.board[opponentMove] = this.opponent;
        this.renderBoard();
        if (this.checkWin(this.opponent)) {
            this.updateQTable(-1);
            if (!this.isTraining) alert('Oponente ganhou!');
            this.reset();
        } else if (this.getAvailableMoves().length === 0) {
            // Verifica se não há mais movimentos disponíveis (empate)
            this.updateQTable(0.5);
            if (!this.isTraining) alert('Empate!');
            this.reset();
        }
    }

    // Verifica se há um vencedor
    checkWin(player) {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winConditions.some(condition => condition.every(index => this.board[index] === player));
    }

    // Reseta o tabuleiro
    reset() {
        this.board.fill(null);
        this.renderBoard();
    }

    // Reseta o aprendizado (Q-Table e contador de partidas)
    resetLearning() {
        this.qTable = {};
        this.gamesPlayed = 0;
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = '0%';
        progressBar.innerText = `0 (0%)`;
    }

    // Treina o agente simulando partidas
    async trainAgent(iterations = 10) {
        this.isTraining = true;
        this.gamesPlayed = 0;
        alert('Iniciando treinamento...');
        alert('z ' + this.getAvailableMoves().length.toString());
        for (let i = 0; i < iterations; i++) {
            this.reset();
            alert('a ' + this.getAvailableMoves().length.toString());
            while (this.getAvailableMoves().length > 0 && !this.checkWin(this.player) && !this.checkWin(this.opponent)) {
                alert('b ' + this.getAvailableMoves().length.toString());
                this.makeMove(this.chooseMove());
                if (!this.checkWin(this.player) && this.getAvailableMoves().length > 0) {
                    this.opponentMove();
                }
            }

            this.gamesPlayed++;

            if (i % 100 === 0 || i === iterations - 1) {
                const progress = (this.gamesPlayed / iterations) * 100;
                const progressBar = document.getElementById('progress-bar');
                progressBar.style.width = `${progress}%`;
                progressBar.innerText = `${this.gamesPlayed} (${progress.toFixed(2)}%)`;
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        this.isTraining = false;
        alert('Treinamento concluído!');
    }

    // Renderiza o tabuleiro no DOM
    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.setAttribute('data-content', cell || '');
            if (!this.isTraining && cell === null) {
                cellElement.addEventListener('click', () => this.makeMove(index));
            }
            boardElement.appendChild(cellElement);
        });
    }
}

const game = new QLearningTicTacToe();
game.renderBoard();

// Funções para controle dos botões
function resetGame() {
    if (!game.isTraining) {
        game.reset();
    }
}

function resetLearning() {
    if (!game.isTraining) {
        game.resetLearning();
        alert('Aprendizado zerado!');
    }
}

function trainAgent() {
    game.trainAgent();
}
