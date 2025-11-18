# CodeBreaker Duel

A real-time, two-player number guessing game built with Node.js, Express, and Socket.IO.

## Game Rules

1. Each player secretly chooses a 4-digit number with unique digits (e.g., 1234)
2. Players take turns guessing each other's numbers
3. After each guess, you'll see:
   - Correct Digits: How many digits exist in the secret number
   - Correct Positions: How many digits are in the correct position
4. First player to guess correctly wins

## Quick Start

### Installation

```bash
npm install
```

### Run the Application

```bash
npm start
```

The game will be available at `http://localhost:3000`

## How to Play

1. Create a Session: Click "Create New Session" to start a game
2. Share Code: Share the 6-character session code with your friend
3. Join Session: Your friend enters the code to join
4. Choose Numbers: Both players select their secret 4-digit numbers
5. Play: Take turns guessing until someone wins

## Project Structure

```
ai-coding-challenge/
├── server.js           # Express + Socket.IO server
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Game UI
│   ├── styles.css     # Styling
│   └── game.js        # Client-side game logic
└── README.md
```

## Architecture

### Backend (Node.js + Express + Socket.IO)
- Multi-session support: Handles multiple concurrent games
- Real-time communication: WebSocket-based instant updates
- Game logic: Validates numbers, checks guesses, manages turns
- In-memory storage: Fast session management

### Frontend (Vanilla JavaScript)
- Single-page application: Smooth screen transitions
- Real-time updates: Instant feedback on all actions
- Responsive design: Works on desktop and mobile
- User-friendly: Clear visual feedback and intuitive flow

## Features

- Session Management: Create and join games with unique codes
- Real-time Sync: WebSocket-based instant updates
- Multiple Sessions: Support for unlimited concurrent games
- Turn Management: Automatic turn alternation
- Input Validation: Ensures valid 4-digit unique numbers
- Game History: View all guesses and results
- Responsive UI: Works on all devices
- Error Handling: Graceful disconnection handling
- Scalable Architecture: Ready for production deployment

## Technology Stack

- Backend: Node.js, Express.js
- Real-time: Socket.IO
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Deployment: Render, Railway, or Heroku

## Development

### Local Development

```bash
npm install
npm run dev
```

### Testing Multiplayer Locally

1. Open `http://localhost:3000` in one browser window
2. Create a session and copy the code
3. Open `http://localhost:3000` in another browser window (or incognito)
4. Join with the code and play

## Game Logic Details

### Number Validation
- Must be exactly 4 digits
- All digits must be unique
- Only numeric characters allowed

### Guess Checking
- Correct Digits: Counts how many digits from the guess exist anywhere in the secret number
- Correct Positions: Counts how many digits are in the exact right position
- Example: Secret = 1234, Guess = 1543
  - Correct Digits: 4 (all digits exist)
  - Correct Positions: 2 (1 and 4 are in correct positions)

## Scalability

The current architecture supports:
- Multiple concurrent game sessions
- Real-time WebSocket connections
- In-memory session storage

For production scale:
- Database: Add Redis for session persistence
- Load Balancing: Use Socket.IO Redis adapter for multiple instances
- CDN: Serve static assets via CDN
- Monitoring: Add logging and analytics

## License

MIT License - Feel free to use for your projects.

## Contributing

Contributions welcome! Feel free to open issues or submit pull requests.
