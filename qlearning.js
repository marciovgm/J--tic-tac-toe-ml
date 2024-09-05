class QLearningTicTacToe {
    constructor() {
        this.qTable = {}; // Tabela Q para armazenar valores Q
        this.learningRate = 0.1; // Taxa de aprendizado
        this.discountFactor = 0.9; // Fator de desconto
        this.explorationRate = 0.1; // Taxa de exploração inicial
        this.board = Array(9).fill(null); // Estado inicial do tabuleiro
        this.player = 'X'; // Representa o jogador humano
        this.opponent = 'O'; // Representa a IA
        this.isTraining = false;
        this.gamesPlayed = 0; // Contador de jogos jogados durante o treinamento
    }

    // Retorna o estado atual do tabuleiro como uma string
    getBoardState() {
        return this.board.join('');
    }

    // Retorna uma lista de índices de células disponíveis
    getAvailableMoves() {
        return this.board.reduce((acc, cell, index) => {
            if (cell === null) acc.push(index);
            return acc;
        }, []);
    }

    // Escolhe o próximo movimento com base na política de exploração/explicação
    chooseMove() {
        const state = this.getBoardState();
        if (Math.random() < this.explorationRate) {
            const availableMoves = this.getAvailableMoves();
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else {
            if (!this.qTable[state]) this.qTable[state] = Array(9).fill(0);
            let maxQ = Math.max(...this.qTable[state]);
            let moves = this.getAvailableMoves().filter(index => this.qTable[state][index] === maxQ);
            return moves[Math.floor(Math.random() * moves.length)];
        }
    }

    // Atualiza a Tabela Q com a recompensa recebida
    updateQTable(reward) {
        const state = this.getBoardState();
        if (!this.qTable[state]) this.qTable[state] = Array(9).fill(0);
        const move = this.lastMove;
        const nextState = this.board.join('');
        let maxNextQ = Math.max(...(this.qTable[nextState] || Array(9).fill(0)));
        this.qTable[state][move] += this.learningRate * (reward + this.discountFactor * maxNextQ - this.qTable[state][move]);
    }

    // Executa o movimento para o jogador humano ou IA
    makeMove(index, player) {
        if (this.board[index] === null) {
            this.board[index] = player;
            this.lastMove = index;
            this.renderBoard();

            // Verifica se o jogador atual venceu
            if (this.checkWin(player)) {
                if (!this.isTraining) alert(`${player} venceu!`);
                this.updateQTable(player === this.player ? 10 : -10); // Recompensa ou penalidade
                this.reset();
                return true; // Indica que o jogo terminou
            } else if (this.getAvailableMoves().length === 0) {
                // Verifica se deu empate
                if (!this.isTraining) alert('Empate!');
                this.updateQTable(0); // Recompensa neutra para empate
                this.reset();
                return true; // Indica que o jogo terminou
            }
            return false; // O jogo continua
        }
        return false; // Movimentação inválida
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

    // Reinicia o tabuleiro
    reset() {
        this.board.fill(null);
        this.renderBoard();
    }

    // Reinicia o aprendizado, limpando a Tabela Q e o contador de jogos
    resetLearning() {
        this.qTable = {};
        this.gamesPlayed = 0;
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = '0%';
        progressBar.innerText = `0 (0%)`;
    }

    // Treina a IA simulando várias partidas
    async trainAgent(iterations = 10000000) {
        this.isTraining = true;
        this.gamesPlayed = 0;
        this.explorationRate = 0.1; // Alta taxa de exploração durante o treinamento
        alert('Iniciando treinamento IA...');

        for (let i = 0; i < iterations; i++) {
            this.reset(); // Reinicia o tabuleiro a cada nova partida

            while (this.getAvailableMoves().length > 0) {
                const opponentMove = this.chooseMove(); // IA joga primeiro
                if (this.makeMove(opponentMove, this.opponent)) break;

                const playerMove = this.chooseMove(); // Simula a jogada do jogador
                if (this.makeMove(playerMove, this.player)) break;
            }

            this.gamesPlayed++;

            // Atualiza a barra de progresso
            if (i % 100 === 0 || i === iterations - 1) {
                const progress = (this.gamesPlayed / iterations) * 100;
                const progressBar = document.getElementById('progress-bar');
                progressBar.style.width = `${progress}%`;
                progressBar.innerText = `${this.gamesPlayed} (${progress.toFixed(2)}%)`;

                await new Promise(resolve => setTimeout(resolve, 0)); // Dá tempo para a atualização do DOM
            }
        }

        this.explorationRate = 0.01; // Reduz a taxa de exploração após o treinamento
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
                cellElement.addEventListener('click', () => {
                    if (!this.makeMove(index, this.player)) {
                        const opponentMove = this.chooseMove();
                        this.makeMove(opponentMove, this.opponent);
                    }
                });
            }
            boardElement.appendChild(cellElement);
        });
    }
}

// Inicializa o jogo
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
