class QLearningTicTacToe {
    constructor() {
        this.qTableA = {}; // Primeira Tabela Q para Double Q-Learning
        this.qTableB = {}; // Segunda Tabela Q para Double Q-Learning
        this.learningRate = 0.1; // Taxa de aprendizado
        this.discountFactor = 0.95; // Fator de desconto aprimorado
        this.explorationRate = 1.0; // Taxa de exploração inicial
        this.explorationDecay = 0.995; // Decaimento da exploração
        this.minExplorationRate = 0.01; // Taxa mínima de exploração
        this.board = Array(9).fill(null); // Estado inicial do tabuleiro
        this.player = 'X'; // Representa o jogador humano
        this.opponent = 'O'; // Representa a IA
        this.isTraining = false;
        this.gamesPlayed = 0; // Contador de jogos jogados durante o treinamento
        this.lastState = null; // Armazena o estado anterior
        this.lastMove = null; // Armazena a última jogada
        this.currentPlayer = this.player; // Define o jogador atual como 'X'
        this.initializeQTables(); // Inicializa as tabelas Q com todas as combinações possíveis
    }

    // Inicializa a Tabela Q com todas as combinações possíveis do tabuleiro
    initializeQTables() {
        const possibleStates = this.generateAllBoardStates();
        possibleStates.forEach(state => {
            this.qTableA[state] = Array(9).fill(0);
            this.qTableB[state] = Array(9).fill(0);
        });
    }

    // Gera todas as combinações possíveis do tabuleiro
    generateAllBoardStates() {
        const states = [];
        const generate = (current, depth) => {
            if (depth === 9) {
                states.push(current.join(''));
                return;
            }
            ['X', 'O', null].forEach(val => {
                current[depth] = val;
                generate(current, depth + 1);
            });
        };
        generate(Array(9).fill(null), 0);
        return states;
    }

    // Retorna o estado atual do tabuleiro como uma string
    getBoardState() {
        return this.board.map(cell => cell || '').join('');
    }

    // Retorna uma lista de índices de células disponíveis
    getAvailableMoves() {
        return this.board.reduce((acc, cell, index) => {
            if (cell === null) acc.push(index);
            return acc;
        }, []);
    }

    // Escolhe o próximo movimento com base em uma política epsilon-greedy
    chooseMove() {
        const state = this.getBoardState();
        if (Math.random() < this.explorationRate) {
            const availableMoves = this.getAvailableMoves();
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else {
            const qValues = this.qTableA[state].map((q, idx) => (q + this.qTableB[state][idx]) / 2);
            let maxQ = Math.max(...qValues);
            let bestMoves = this.getAvailableMoves().filter(index => qValues[index] === maxQ);
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }
    }

    // Atualiza as Tabelas Q usando Double Q-Learning
    updateQTable(reward) {
        if (this.lastState !== null && this.lastMove !== null) {
            const state = this.getBoardState();
            if (Math.random() < 0.5) {
                const maxNextQ = Math.max(...this.qTableA[state]);
                this.qTableA[this.lastState][this.lastMove] += this.learningRate * (reward + this.discountFactor * maxNextQ - this.qTableA[this.lastState][this.lastMove]);
            } else {
                const maxNextQ = Math.max(...this.qTableB[state]);
                this.qTableB[this.lastState][this.lastMove] += this.learningRate * (reward + this.discountFactor * maxNextQ - this.qTableB[this.lastState][this.lastMove]);
            }
        }
    }

    // Executa o movimento para o jogador humano ou IA
    makeMove(index, player) {
        if (this.board[index] === null) {
            this.board[index] = player;
            this.lastState = this.getBoardState();
            this.lastMove = index;
            this.renderBoard();

            if (this.checkWin(player)) {
                const reward = player === this.player ? 1 : -1;
                this.updateQTable(reward);
                this.reset();
                if (!this.isTraining) alert(`${player} venceu!`);
                return true;
            } else if (this.getAvailableMoves().length === 0) {
                this.updateQTable(0.5); // Recompensa neutra para empate
                this.reset();
                if (!this.isTraining) alert('Empate!');
                return true;
            }

            // Alterna o turno para o próximo jogador
            this.currentPlayer = this.currentPlayer === this.player ? this.opponent : this.player;
            return false;
        }
        return true; // Jogada inválida
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
        this.lastState = null;
        this.lastMove = null;
        this.currentPlayer = this.player; // Reseta o turno para começar com o jogador 'X'
        this.renderBoard();
    }

    // Reinicia o aprendizado, limpando a Tabela Q e o contador de jogos
    resetLearning() {
        this.qTableA = {};
        this.qTableB = {};
        this.initializeQTables(); // Reinicializa as tabelas Q
        this.gamesPlayed = 0;
        this.explorationRate = 1.0; // Reseta a exploração
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = '0%';
        progressBar.innerText = `0 (0%)`;
        this.reset(); // Reseta o tabuleiro também ao zerar o aprendizado
    }

    // Treina a IA simulando várias partidas, sempre assumindo que o humano joga primeiro
    async trainAgent(iterations = 1000) {
        this.isTraining = true;
        this.gamesPlayed = 0;
        alert('Iniciando treinamento IA...');

        for (let i = 0; i < iterations; i++) {
            this.reset(); // Reinicia o tabuleiro a cada nova partida

            while (this.getAvailableMoves().length > 0) {
                const playerMove = this.chooseMove(); 
                if (this.makeMove(playerMove, this.player)) break;

                const opponentMove = this.chooseMove();
                if (this.makeMove(opponentMove, this.opponent)) break;
            }

            this.gamesPlayed++;

            // Decaimento da exploração
            this.explorationRate = Math.max(this.minExplorationRate, this.explorationRate * this.explorationDecay);

            // Atualiza a barra de progresso
            if (i % 100 === 0 || i === iterations - 1) {
                const progress = (this.gamesPlayed / iterations) * 100;
                const progressBar = document.getElementById('progress-bar');
                progressBar.style.width = `${progress}%`;
                progressBar.innerText = `${this.gamesPlayed} (${progress.toFixed(2)}%)`;

                await new Promise(resolve => setTimeout(resolve, 0)); // Dá tempo para a atualização do DOM
            }
        }

        this.explorationRate = this.minExplorationRate; // Reduz a taxa de exploração após o treinamento
        this.isTraining = false;
        alert('Treinamento concluído!');
        this.reset(); // Reinicia o tabuleiro para começar o jogo após o treinamento
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
                    if (this.currentPlayer === this.player && !this.makeMove(index, this.player)) {
                        setTimeout(() => {
                            if (this.currentPlayer === this.opponent) {
                                const opponentMove = this.chooseMove();
                                this.makeMove(opponentMove, this.opponent);
                            }
                        }, 100);
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
