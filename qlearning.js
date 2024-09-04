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

    getBoardState() {
        return this.board.join('');
    }

    getAvailableMoves() {
        return this.board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    }

    chooseMove() {
        if (Math.random() < this.explorationRate) {
            return this.getAvailableMoves()[Math.floor(Math.random() * this.getAvailableMoves().length)];
        } else {
            const state = this.getBoardState();
            if (!this.qTable[state]) this.qTable[state] = Array(9).fill(0);
            let maxQ = Math.max(...this.qTable[state]);
            let moves = this.getAvailableMoves().filter(index => this.qTable[state][index] === maxQ);
            return moves[Math.floor(Math.random() * moves.length)];
        }
    }

    updateQTable(reward) {
        const state = this.getBoardState();
        if (!this.qTable[state]) this.qTable[state] = Array(9).fill(0);
        const move = this.lastMove;
        const nextState = this.board.join('');
        let maxNextQ = Math.max(...(this.qTable[nextState] || Array(9).fill(0)));
        this.qTable[state][move] += this.learningRate * (reward + this.discountFactor * maxNextQ - this.qTable[state][move]);
    }

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

    opponentMove() {
        const opponentMove = this.chooseMove();
        this.board[opponentMove] = this.opponent;
        this.renderBoard();
        if (this.checkWin(this.opponent)) {
            this.updateQTable(-1);
            if (!this.isTraining) alert('Oponente ganhou!');
            this.reset();
        }
    }

    checkWin(player) {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winConditions.some(condition => condition.every(index => this.board[index] === player));
    }

    reset() {
        this.board.fill(null);
        this.renderBoard();
    }

    resetLearning() {
        this.qTable = {};
        this.gamesPlayed = 0;
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = '0%';
        progressBar.innerText = `0 (0%)`;
         await new Promise(resolve => setTimeout(resolve, 0)); // Permite que o DOM seja atualizado
    }

    async trainAgent(iterations = 100000) {
        this.isTraining = true;
        this.gamesPlayed = 0;
        alert('Iniciando treinamento...');

        for (let i = 0; i < iterations; i++) {
            this.reset();
            while (this.getAvailableMoves().length > 0 && !this.checkWin(this.player) && !this.checkWin(this.opponent)) {
                this.makeMove(this.chooseMove());
                if (!this.checkWin(this.player) && this.getAvailableMoves().length > 0) {
                    this.opponentMove();
                }
            }

            this.gamesPlayed++;
             await new Promise(resolve => setTimeout(resolve, 0)); // Permite que o DOM seja atualizado

            // Atualiza a barra de progresso após cada partida
            if (i % 100 === 0 || i === iterations - 1) { // Atualiza a barra de progresso a cada 100 jogos
                const progress = (this.gamesPlayed / iterations) * 100;
                const progressBar = document.getElementById('progress-bar');
                progressBar.style.width = `${progress}%`;
                progressBar.innerText = `${this.gamesPlayed} (${progress.toFixed(2)}%)`;
                await new Promise(resolve => setTimeout(resolve, 0)); // Permite que o DOM seja atualizado
            }
        }

        this.isTraining = false;
        alert('Treinamento concluído!');
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.innerText = cell || '';
            if (!this.isTraining && cell === null) {
                cellElement.addEventListener('click', () => this.makeMove(index));
            }
            boardElement.appendChild(cellElement);
        });
    }
}

const game = new QLearningTicTacToe();
game.renderBoard();

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
