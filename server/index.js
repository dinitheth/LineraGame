const express = require("express")
const { LineraService } = require("./linera-service")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Parse JSON request bodies
app.use(express.json())

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")))

// Initialize Linera service
const lineraService = new LineraService({
  graphqlEndpoint: process.env.LINERA_GRAPHQL_ENDPOINT || "http://localhost:8080/graphql",
  defaultChainId: process.env.LINERA_DEFAULT_CHAIN_ID,
  applicationId: process.env.LINERA_APPLICATION_ID,
})

// Initialize the service when the server starts
;(async () => {
  const initialized = await lineraService.initialize()
  if (!initialized) {
    console.error("Failed to initialize Linera service. Make sure the GraphQL endpoint is running.")
  } else {
    console.log("Linera service initialized successfully.")
  }
})()

// API endpoint to get player stats
app.get("/api/player-stats/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params
    const result = await lineraService.getPlayerStats(playerId)

    if (result.success) {
      res.json(result.stats)
    } else {
      res.status(500).json({ error: result.error })
    }
  } catch (error) {
    console.error("Error getting player stats:", error)
    res.status(500).json({ error: "Failed to get player stats" })
  }
})

// API endpoint to update player stats
app.post("/api/player-stats/:playerId", async (req, res) => {
  try {
    const { playerId } = req.params
    const { score, won } = req.body

    if (typeof score !== "number" || typeof won !== "boolean") {
      return res.status(400).json({ error: "Invalid request body" })
    }

    const result = await lineraService.updatePlayerStats(playerId, score, won)

    if (result.success) {
      res.json({ success: true })
    } else {
      res.status(500).json({ error: result.error })
    }
  } catch (error) {
    console.error("Error updating player stats:", error)
    res.status(500).json({ error: "Failed to update player stats" })
  }
})

// Linera GraphQL proxy endpoint
app.post("/api/linera-proxy", async (req, res) => {
  try {
    const response = await fetch(process.env.LINERA_GRAPHQL_ENDPOINT || "http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error("Error proxying to Linera GraphQL:", error)
    res.status(500).json({ error: "Failed to connect to Linera service" })
  }
})

// Serve the frontend for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Open http://localhost:${PORT} in your browser to play LineraMatch`)
})
