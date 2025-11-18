const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from public directory
app.use(express.static('public'));

// In-memory storage for game sessions
const gameSessions = new Map();

// Generate unique session code
function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Validate 4-digit number (unique digits)
function isValidNumber(number) {
  const str = number.toString();
  if (str.length !== 4) return false;
  const digits = new Set(str);
  return digits.size === 4;
}

// Check guess against secret number
function checkGuess(guess, secret) {
  const guessStr = guess.toString();
  const secretStr = secret.toString();
  
  let correctDigits = 0;
  let correctPositions = 0;
  
  const secretDigits = new Set(secretStr);
  
  for (let i = 0; i < 4; i++) {
    if (guessStr[i] === secretStr[i]) {
      correctPositions++;
    }
    if (secretDigits.has(guessStr[i])) {
      correctDigits++;
    }
  }
  
  return { correctDigits, correctPositions };
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Create new game session
  socket.on('createSession', () => {
    const sessionCode = generateSessionCode();
    
    gameSessions.set(sessionCode, {
      code: sessionCode,
      players: [{
        id: socket.id,
        number: null,
        ready: false
      }],
      currentTurn: 0,
      guesses: [],
      gameStarted: false,
      winner: null
    });
    
    socket.join(sessionCode);
    socket.emit('sessionCreated', { sessionCode, playerId: socket.id });
    console.log(`Session created: ${sessionCode}`);
  });
  
  // Join existing session
  socket.on('joinSession', (sessionCode) => {
    const session = gameSessions.get(sessionCode);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    if (session.players.length >= 2) {
      socket.emit('error', { message: 'Session is full' });
      return;
    }
    
    session.players.push({
      id: socket.id,
      number: null,
      ready: false
    });
    
    socket.join(sessionCode);
    socket.emit('sessionJoined', { sessionCode, playerId: socket.id });
    
    // Notify both players
    io.to(sessionCode).emit('playerJoined', {
      playerCount: session.players.length
    });
    
    console.log(`Player joined session: ${sessionCode}`);
  });
  
  // Set secret number
  socket.on('setNumber', ({ sessionCode, number }) => {
    const session = gameSessions.get(sessionCode);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    if (!isValidNumber(number)) {
      socket.emit('error', { message: 'Invalid number. Must be 4 unique digits.' });
      return;
    }
    
    const player = session.players.find(p => p.id === socket.id);
    if (player) {
      player.number = number;
      player.ready = true;
      
      socket.emit('numberSet', { success: true });
      
      // Check if both players are ready
      if (session.players.length === 2 && session.players.every(p => p.ready)) {
        session.gameStarted = true;
        io.to(sessionCode).emit('gameStart', {
          currentTurn: session.players[session.currentTurn].id
        });
        console.log(`Game started in session: ${sessionCode}`);
      }
    }
  });
  
  // Make a guess
  socket.on('makeGuess', ({ sessionCode, guess }) => {
    const session = gameSessions.get(sessionCode);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    if (!session.gameStarted) {
      socket.emit('error', { message: 'Game has not started yet' });
      return;
    }
    
    if (session.winner) {
      socket.emit('error', { message: 'Game is already over' });
      return;
    }
    
    const currentPlayer = session.players[session.currentTurn];
    if (currentPlayer.id !== socket.id) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    if (!isValidNumber(guess)) {
      socket.emit('error', { message: 'Invalid guess. Must be 4 unique digits.' });
      return;
    }
    
    // Get opponent
    const opponentIndex = session.currentTurn === 0 ? 1 : 0;
    const opponent = session.players[opponentIndex];
    
    // Check guess
    const result = checkGuess(guess, opponent.number);
    
    const guessData = {
      playerId: socket.id,
      guess: guess,
      correctDigits: result.correctDigits,
      correctPositions: result.correctPositions,
      timestamp: Date.now()
    };
    
    session.guesses.push(guessData);
    
    // Check for winner
    if (result.correctPositions === 4) {
      session.winner = socket.id;
      io.to(sessionCode).emit('gameOver', {
        winner: socket.id,
        guesses: session.guesses,
        numbers: {
          [session.players[0].id]: session.players[0].number,
          [session.players[1].id]: session.players[1].number
        }
      });
      console.log(`Game over in session: ${sessionCode}. Winner: ${socket.id}`);
      return;
    }
    
    // Switch turns
    session.currentTurn = opponentIndex;
    
    // Broadcast guess result
    io.to(sessionCode).emit('guessResult', {
      ...guessData,
      nextTurn: session.players[session.currentTurn].id
    });
  });
  
  // Get current game state
  socket.on('getGameState', (sessionCode) => {
    const session = gameSessions.get(sessionCode);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    socket.emit('gameState', {
      playerCount: session.players.length,
      gameStarted: session.gameStarted,
      currentTurn: session.gameStarted ? session.players[session.currentTurn].id : null,
      guesses: session.guesses,
      winner: session.winner,
      playersReady: session.players.map(p => ({ id: p.id, ready: p.ready }))
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Find and clean up sessions
    for (const [sessionCode, session] of gameSessions.entries()) {
      const playerIndex = session.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Notify other players
        io.to(sessionCode).emit('playerLeft', {
          playerId: socket.id
        });
        
        // Remove session if empty or game was in progress
        gameSessions.delete(sessionCode);
        console.log(`Session ${sessionCode} removed due to player disconnect`);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
