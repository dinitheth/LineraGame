// Game state variables
const gameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 0,
  moves: 0,
  gameStarted: false,
  gameOver: false,
  startTime: null,
  timerInterval: null,
  difficulty: "easy",
  score: 0,
  playerId: null, // Will be set on page load
}

// DOM elements
const gameBoard = document.getElementById("game-board")
const movesElement = document.getElementById("moves")
const timeElement = document.getElementById("time")
const highScoreElement = document.getElementById("high-score")
const gamesPlayedElement = document.getElementById("games-played")
const gamesWonElement = document.getElementById("games-won")
const gamesLostElement = document.getElementById("games-lost")
const startGameButton = document.getElementById("start-game")
const difficultySelect = document.getElementById("difficulty")
const gameOverModal = document.getElementById("game-over")
const resultMessage = document.getElementById("result-message")
const resultMovesElement = document.getElementById("result-moves")
const resultTimeElement = document.getElementById("result-time")
const resultScoreElement = document.getElementById("result-score")
const playAgainButton = document.getElementById("play-again")

// Card symbols (emojis)
const symbols = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🐤",
  "🦆",
  "🦅",
  "🦉",
  "🦇",
  "🐺",
  "🐗",
  "🐴",
  "🦄",
  "🐝",
  "🐛",
  "🦋",
  "🐌",
  "🐞",
]

// Event listeners
document.addEventListener("DOMContentLoaded", initializeGame)
startGameButton.addEventListener("click", startGame)
difficultySelect.addEventListener("change", (e) => {
  gameState.difficulty = e.target.value
})
playAgainButton.addEventListener("click", () => {
  gameOverModal.classList.add("hidden")
  startGame()
})

// Initialize the game
async function initializeGame() {
  // Generate or retrieve player ID
  gameState.playerId = getOrCreatePlayerId()

  // Load player stats
  await loadPlayerStats()

  updateUI()
}

// Get or create player ID
function getOrCreatePlayerId() {
  // Check if player ID exists in local storage
  let playerId = localStorage.getItem("lineraMatchPlayerId")

  // If not, create a new one
  if (!playerId) {
    playerId = "player_" + Math.random().toString(36).substring(2, 15)
    localStorage.setItem("lineraMatchPlayerId", playerId)
  }

  return playerId
}

// Load player stats from server
async function loadPlayerStats() {
  try {
    const response = await fetch(`/api/player-stats/${gameState.playerId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const stats = await response.json()

    // Update UI with stats
    gamesPlayedElement.textContent = stats.games_played
    gamesWonElement.textContent = stats.games_won
    gamesLostElement.textContent = stats.games_lost
    highScoreElement.textContent = stats.high_score
  } catch (error) {
    console.error("Error loading player stats:", error)
    // Use default values if stats can't be loaded
    gamesPlayedElement.textContent = "0"
    gamesWonElement.textContent = "0"
    gamesLostElement.textContent = "0"
    highScoreElement.textContent = "0"
  }
}

// Update player stats on server
async function updatePlayerStats(score, won) {
  try {
    const response = await fetch(`/api/player-stats/${gameState.playerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ score, won }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Reload stats after update
    await loadPlayerStats()

    return { success: true }
  } catch (error) {
    console.error("Error updating player stats:", error)
    return { success: false, error: error.message }
  }
}

// Start a new game
function startGame() {
  // Reset game state
  resetGameState()

  // Create and shuffle cards
  createCards()

  // Start the timer
  startTimer()

  // Update UI
  updateUI()

  // Enable game board
  gameBoard.classList.remove("disabled")
  gameState.gameStarted = true
}

// Reset game state
function resetGameState() {
  gameState.cards = []
  gameState.flippedCards = []
  gameState.matchedPairs = 0
  gameState.moves = 0
  gameState.gameStarted = false
  gameState.gameOver = false
  gameState.score = 0

  // Clear the game board
  gameBoard.innerHTML = ""

  // Clear the timer
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval)
    gameState.timerInterval = null
  }

  // Set grid size based on difficulty
  let gridSize
  switch (gameState.difficulty) {
    case "easy":
      gridSize = 4 // 4x4 grid (8 pairs)
      break
    case "medium":
      gridSize = 6 // 6x6 grid (18 pairs)
      break
    case "hard":
      gridSize = 8 // 8x8 grid (32 pairs)
      break
    default:
      gridSize = 4
  }

  gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`
  gameState.totalPairs = Math.floor((gridSize * gridSize) / 2)
}

// Create and shuffle cards
function createCards() {
  let gridSize
  switch (gameState.difficulty) {
    case "easy":
      gridSize = 4 // 4x4 grid (8 pairs)
      break
    case "medium":
      gridSize = 6 // 6x6 grid (18 pairs)
      break
    case "hard":
      gridSize = 8 // 8x8 grid (32 pairs)
      break
    default:
      gridSize = 4
  }

  const totalCards = gridSize * gridSize
  const totalPairs = totalCards / 2

  // Select symbols for this game
  const gameSymbols = symbols.slice(0, totalPairs)

  // Create pairs of cards
  const cardPairs = [...gameSymbols, ...gameSymbols]

  // Shuffle the cards
  const shuffledCards = shuffleArray(cardPairs)

  // Create card elements
  shuffledCards.forEach((symbol, index) => {
    const card = document.createElement("div")
    card.className = "card"
    card.dataset.index = index
    card.dataset.symbol = symbol

    const cardFront = document.createElement("div")
    cardFront.className = "card-front"

    const cardContent = document.createElement("div")
    cardContent.className = "card-content"
    cardContent.textContent = symbol

    const cardBack = document.createElement("div")
    cardBack.className = "card-back"

    cardFront.appendChild(cardContent)
    card.appendChild(cardFront)
    card.appendChild(cardBack)

    card.addEventListener("click", () => handleCardClick(card))

    gameBoard.appendChild(card)
    gameState.cards.push({
      element: card,
      symbol: symbol,
      isFlipped: false,
      isMatched: false,
    })
  })
}

// Handle card click
function handleCardClick(card) {
  const index = Number.parseInt(card.dataset.index)
  const cardData = gameState.cards[index]

  // Ignore if game is not started, card is already flipped, or already matched
  if (!gameState.gameStarted || cardData.isFlipped || cardData.isMatched || gameState.flippedCards.length >= 2) {
    return
  }

  // Flip the card
  flipCard(card, true)
  cardData.isFlipped = true
  gameState.flippedCards.push(cardData)

  // Check for match if two cards are flipped
  if (gameState.flippedCards.length === 2) {
    gameState.moves++
    updateUI()

    const [card1, card2] = gameState.flippedCards

    if (card1.symbol === card2.symbol) {
      // Match found
      card1.isMatched = true
      card2.isMatched = true
      card1.element.classList.add("matched")
      card2.element.classList.add("matched")
      gameState.matchedPairs++
      gameState.flippedCards = []

      // Check if game is over
      if (gameState.matchedPairs === gameState.totalPairs) {
        endGame(true)
      }
    } else {
      // No match, flip cards back after a delay
      setTimeout(() => {
        flipCard(card1.element, false)
        flipCard(card2.element, false)
        card1.isFlipped = false
        card2.isFlipped = false
        gameState.flippedCards = []
      }, 1000)
    }
  }
}

// Flip a card
function flipCard(card, isFlipped) {
  if (isFlipped) {
    card.classList.add("flipped")
  } else {
    card.classList.remove("flipped")
  }
}

// Start the timer
function startTimer() {
  gameState.startTime = Date.now()
  gameState.timerInterval = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000)
    const minutes = Math.floor(elapsedTime / 60)
    const seconds = elapsedTime % 60
    timeElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }, 1000)
}

// End the game
async function endGame(isWin) {
  // Stop the timer
  clearInterval(gameState.timerInterval)
  gameState.gameOver = true
  gameState.gameStarted = false

  // Calculate final time
  const endTime = Date.now()
  const totalTime = Math.floor((endTime - gameState.startTime) / 1000)

  // Calculate score based on difficulty, moves, and time
  let baseScore
  switch (gameState.difficulty) {
    case "easy":
      baseScore = 1000
      break
    case "medium":
      baseScore = 2000
      break
    case "hard":
      baseScore = 3000
      break
    default:
      baseScore = 1000
  }

  // Score formula: base score - (moves * 10) - (time in seconds * 5)
  gameState.score = Math.max(0, baseScore - gameState.moves * 10 - totalTime * 5)

  // Update player stats
  await updatePlayerStats(gameState.score, isWin)

  // Show game over modal
  resultMessage.textContent = isWin ? "Congratulations! You Won!" : "Game Over!"
  resultMovesElement.textContent = gameState.moves
  resultTimeElement.textContent = timeElement.textContent
  resultScoreElement.textContent = gameState.score
  gameOverModal.classList.remove("hidden")
}

// Update UI elements
function updateUI() {
  movesElement.textContent = gameState.moves
}

// Utility function to shuffle an array
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}
