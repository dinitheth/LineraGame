# LineraMatch - Memory Game on Microchains

LineraMatch is a memory card matching game built on Linera's microchain architecture. Each player's stats are stored on their own microchain, providing a personalized gaming experience with persistent stats.

## Features

- Classic memory matching gameplay
- Multiple difficulty levels (Easy, Medium, Hard)
- Player stats tracking (high score, games played, wins, losses)
- Integration with Linera blockchain
- Responsive design for all devices

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js server with Express.js
- **Blockchain**: Linera microchains with Rust smart contracts
- **Deployment**: Linera testnet

## Getting Started

### Prerequisites

- **Node.js**: v14+ recommended
- **Rust and Wasm**:
  \`\`\`bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  rustup target add wasm32-unknown-unknown
  \`\`\`

- **Protoc**:
  \`\`\`bash
  curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v21.11/protoc-21.11-linux-x86_64.zip
  unzip protoc-21.11-linux-x86_64.zip -d $HOME/.local
  export PATH="$HOME/.local/bin:$PATH"
  \`\`\`

- **Linera SDK**:
  \`\`\`bash
  # Clone the Linera Protocol repository
  git clone https://github.com/linera-io/linera-protocol.git
  cd linera-protocol
  
  # Build the Linera SDK
  cargo build --release
  
  # Add the Linera binaries to your PATH
  export PATH="$PWD/target/release:$PATH"
  \`\`\`

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/linera-match.git
   cd linera-match
   \`\`\`

2. Build and deploy the smart contract:
   \`\`\`bash
   chmod +x scripts/build.sh scripts/deploy.sh
   ./scripts/build.sh
   ./scripts/deploy.sh
   \`\`\`

3. Install server dependencies:
   \`\`\`bash
   npm install
   \`\`\`

4. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

5. Open the game in your browser at `http://localhost:3000`

## How It Works

### Blockchain Integration

LineraMatch uses Linera's microchain architecture:

1. **Player Identification**:
   - Each player gets a unique ID stored in their browser's local storage
   - This ID is used to associate the player with a specific microchain

2. **Server-Side Chain Management**:
   - The game server manages a Linera node and wallet
   - The server creates and manages chains for players
   - All blockchain interactions happen through the server

3. **Data Storage**:
   - Game stats (scores, wins, losses) are stored on player-specific microchains
   - Updates happen through server-side operations
   - Players see their stats without needing to understand the blockchain aspect

### Game Flow

1. Player opens the game
2. The game generates or retrieves the player's unique ID
3. The server associates this ID with a Linera microchain
4. Player plays the game
5. When a game ends, stats are updated on the player's microchain
6. Player stats are retrieved from the microchain and displayed

## Development

### Smart Contract

The smart contract is written in Rust and uses the Linera SDK. It handles:
- Storing player stats
- Updating high scores
- Tracking games played, won, and lost

### Server

The server is built with Node.js and Express.js. It:
- Provides API endpoints for the frontend
- Manages Linera wallet and chains
- Handles blockchain interactions

### Frontend

The frontend is built with HTML, CSS, and JavaScript. It:
- Provides the game interface
- Communicates with the server API
- Displays player stats

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Linera](https://linera.io) for the microchain architecture
- [Rust](https://www.rust-lang.org) for the smart contract language
