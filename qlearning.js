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
        return this.board.reduce((acc, cell, index) => {
            if (cell === null) acc.push(index);
            return acc;
        }, []);
    }

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

    updateQTable(reward) {
        const state = this.getBoardState();
        if (!this.qTable[state]) this.qTable[state] = Array(9).fill(0);
        const move = this.lastMove;
        const nextState = this.board.join('');
        let maxNextQ = Math.max(...(this.qTable[nextState] || Array(9).fill(0)));
        this.qTable[state][move] += this.learningRate * (reward + this.discountFactor * maxNextQ - this.qTable[state][move]);
    }

    makeMove(index) {
        if (this.board[index] === null) {
            this.board[index] = this.isTraining ? this.opponent : this.player;
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
            } else if (!this.isTraining) {
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
        } else if (this.getAvailableMoves().length === 0) {
            this.updateQTable(0.5);
            if (!this.isTraining) alert('Empate!');
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
    }

    async trainAgent(iterations = 10) {
    this.isTraining = true;
    this.gamesPlayed = 0;
    alert('Iniciando treinamento IA 2...');

    const trainIteration = async (i) => {
        if (i >= iterations) {
            this.isTraining = false;
            alert('Treinamento concluído!');
            return;
        }

        this.reset();  // Reinicia o tabuleiro a cada nova partida

        while (this.getAvailableMoves().length > 0 && !this.checkWin(this.player) && !this.checkWin(this.opponent)) {
            const move = this.chooseMove();
            this.makeMove(move);
            this.renderBoard();
             alert('b ' + i.toString() + ' ' + this.getAvailableMoves().length.toString());

            if (!this.checkWin(this.player) && this.getAvailableMoves().length > 0) {
                this.opponentMove();
                this.renderBoard();  // Certifica-se de que o tabuleiro seja atualizado após cada jogada
            }
        }

        this.gamesPlayed++;

        // Atualiza a barra de progresso
        if (i % 100 === 0 || i === iterations - 1) {
            const progress = (this.gamesPlayed / iterations) * 100;
            const progressBar = document.getElementById('progress-bar');
            progressBar.style.width = `${progress}%`;
            progressBar.innerText = `${this.gamesPlayed} (${progress.toFixed(2)}%)`;
        }

        await new Promise(resolve => setTimeout(resolve, 0));  // Permite que o DOM seja atualizado

        trainIteration(i + 1);  // Chama a próxima iteração
    };

    trainIteration(0);  // Inicia o processo de treinamento
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
