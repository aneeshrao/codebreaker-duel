// Socket.IO connection
const socket = io();

// Game state
let sessionCode = null;
let playerId = null;
let gameStarted = false;

// DOM Elements
const screens = {
    setup: document.getElementById('setupScreen'),
    waiting: document.getElementById('waitingScreen'),
    numberSelection: document.getElementById('numberSelectionScreen'),
    game: document.getElementById('gameScreen'),
    gameOver: document.getElementById('gameOverScreen')
};

const elements = {
    createSessionBtn: document.getElementById('createSessionBtn'),
    joinSessionBtn: document.getElementById('joinSessionBtn'),
    sessionCodeInput: document.getElementById('sessionCodeInput'),
    displaySessionCode: document.getElementById('displaySessionCode'),
    copyCodeBtn: document.getElementById('copyCodeBtn'),
    playerStatus: document.getElementById('playerStatus'),
    secretNumberInput: document.getElementById('secretNumberInput'),
    lockNumberBtn: document.getElementById('lockNumberBtn'),
    waitingForOpponent: document.getElementById('waitingForOpponent'),
    gameSessionCode: document.getElementById('gameSessionCode'),
    currentTurnDisplay: document.getElementById('currentTurnDisplay'),
    turnIndicator: document.getElementById('turnIndicator'),
    guessInput: document.getElementById('guessInput'),
    submitGuessBtn: document.getElementById('submitGuessBtn'),
    guessHistory: document.getElementById('guessHistory'),
    winnerMessage: document.getElementById('winnerMessage'),
    revealNumbers: document.getElementById('revealNumbers'),
    newGameBtn: document.getElementById('newGameBtn'),
    errorMessage: document.getElementById('errorMessage')
};

// Show screen helper
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Show error message
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.add('show');
    setTimeout(() => {
        elements.errorMessage.classList.remove('show');
    }, 3000);
}

// Validate 4-digit number with unique digits
function isValidNumber(number) {
    const str = number.toString();
    if (str.length !== 4) return false;
    if (!/^\d{4}$/.test(str)) return false;
    const digits = new Set(str);
    return digits.size === 4;
}

// Format number for display
function formatNumber(number) {
    return number.toString().split('').join(' ');
}

// Event Listeners - Setup Screen
elements.createSessionBtn.addEventListener('click', () => {
    socket.emit('createSession');
});

elements.joinSessionBtn.addEventListener('click', () => {
    const code = elements.sessionCodeInput.value.trim().toUpperCase();
    if (!code) {
        showError('Please enter a session code');
        return;
    }
    socket.emit('joinSession', code);
});

elements.sessionCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.joinSessionBtn.click();
    }
});

// Copy session code
elements.copyCodeBtn.addEventListener('click', () => {
    const code = elements.displaySessionCode.textContent;
    navigator.clipboard.writeText(code).then(() => {
        elements.copyCodeBtn.textContent = '✓';
        setTimeout(() => {
            elements.copyCodeBtn.textContent = '📋';
        }, 2000);
    });
});

// Number selection validation
elements.secretNumberInput.addEventListener('input', (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    e.target.value = value;
    
    elements.lockNumberBtn.disabled = !isValidNumber(value);
});

elements.lockNumberBtn.addEventListener('click', () => {
    const number = parseInt(elements.secretNumberInput.value);
    
    if (!isValidNumber(number)) {
        showError('Invalid number. Must be 4 unique digits.');
        return;
    }
    
    socket.emit('setNumber', { sessionCode, number });
    elements.lockNumberBtn.disabled = true;
    elements.secretNumberInput.disabled = true;
    elements.waitingForOpponent.style.display = 'block';
});

// Guess input validation
elements.guessInput.addEventListener('input', (e) => {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
});

elements.guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && isValidNumber(e.target.value)) {
        elements.submitGuessBtn.click();
    }
});

elements.submitGuessBtn.addEventListener('click', () => {
    const guess = parseInt(elements.guessInput.value);
    
    if (!isValidNumber(guess)) {
        showError('Invalid guess. Must be 4 unique digits.');
        return;
    }
    
    socket.emit('makeGuess', { sessionCode, guess });
    elements.guessInput.value = '';
});

// New game button
elements.newGameBtn.addEventListener('click', () => {
    location.reload();
});

// Socket.IO Event Handlers
socket.on('sessionCreated', (data) => {
    sessionCode = data.sessionCode;
    playerId = data.playerId;
    
    elements.displaySessionCode.textContent = sessionCode;
    showScreen('waiting');
    
    // Request game state
    socket.emit('getGameState', sessionCode);
});

socket.on('sessionJoined', (data) => {
    sessionCode = data.sessionCode;
    playerId = data.playerId;
    
    showScreen('numberSelection');
});

socket.on('playerJoined', (data) => {
    if (data.playerCount === 2) {
        elements.playerStatus.innerHTML = '<p>✓ Both players connected! Choose your secret number.</p>';
        showScreen('numberSelection');
    }
});

socket.on('numberSet', (data) => {
    if (data.success) {
        // Wait for game to start
    }
});

socket.on('gameStart', (data) => {
    gameStarted = true;
    elements.gameSessionCode.textContent = sessionCode;
    elements.guessHistory.innerHTML = '<p class="empty-state">No guesses yet. Make your first guess!</p>';
    showScreen('game');
    updateTurnDisplay(data.currentTurn);
});

socket.on('guessResult', (data) => {
    addGuessToHistory(data);
    updateTurnDisplay(data.nextTurn);
});

socket.on('gameOver', (data) => {
    const isWinner = data.winner === playerId;
    
    elements.winnerMessage.innerHTML = isWinner 
        ? '🎉 You Win! 🎉' 
        : '😔 You Lose';
    elements.winnerMessage.className = isWinner ? 'winner-message win' : 'winner-message lose';
    
    // Show both numbers
    const playerNumber = data.numbers[playerId];
    const opponentNumber = data.numbers[data.winner === playerId ? getOpponentId(data.numbers) : data.winner];
    
    elements.revealNumbers.innerHTML = `
        <p><strong>Your number:</strong> ${formatNumber(playerNumber)}</p>
        <p><strong>Opponent's number:</strong> ${formatNumber(opponentNumber)}</p>
    `;
    
    showScreen('gameOver');
});

socket.on('gameState', (state) => {
    if (state.guesses) {
        state.guesses.forEach(guess => addGuessToHistory(guess));
    }
});

socket.on('playerLeft', (data) => {
    showError('Your opponent has disconnected. The game has ended.');
    setTimeout(() => {
        location.reload();
    }, 3000);
});

socket.on('error', (data) => {
    showError(data.message);
});

// Helper Functions
function updateTurnDisplay(currentTurnId) {
    const isYourTurn = currentTurnId === playerId;
    
    elements.currentTurnDisplay.textContent = isYourTurn ? 'Your Turn' : "Opponent's Turn";
    elements.guessInput.disabled = !isYourTurn;
    elements.submitGuessBtn.disabled = !isYourTurn;
    
    if (isYourTurn) {
        elements.turnIndicator.classList.add('your-turn');
        elements.guessInput.focus();
    } else {
        elements.turnIndicator.classList.remove('your-turn');
    }
}

function addGuessToHistory(guessData) {
    // Remove empty state message
    const emptyState = elements.guessHistory.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const isYourGuess = guessData.playerId === playerId;
    
    const guessItem = document.createElement('div');
    guessItem.className = `guess-item ${isYourGuess ? 'your-guess' : 'opponent-guess'}`;
    
    guessItem.innerHTML = `
        <div class="guess-info">
            <div class="guess-player">${isYourGuess ? 'You' : 'Opponent'}</div>
            <div class="guess-number">${formatNumber(guessData.guess)}</div>
        </div>
        <div class="guess-result">
            <span class="result-badge badge-digits">✓ ${guessData.correctDigits} digits</span>
            <span class="result-badge badge-positions">📍 ${guessData.correctPositions} positions</span>
        </div>
    `;
    
    // Add to top of history
    elements.guessHistory.insertBefore(guessItem, elements.guessHistory.firstChild);
}

function getOpponentId(numbers) {
    return Object.keys(numbers).find(id => id !== playerId);
}

// Initialize
console.log('Game initialized. Ready to play!');
