// Example Express.js API endpoint
const express = require("express")
const router = express.Router()
const LineraService = require("../linera-service")

// Initialize Linera service
const lineraService = new LineraService({
  graphqlEndpoint: process.env.LINERA_GRAPHQL_ENDPOINT || "http://localhost:8080/graphql",
  defaultChainId: process.env.LINERA_DEFAULT_CHAIN_ID,
  applicationId: process.env.LINERA_APPLICATION_ID,
})

// Initialize the service when the server starts
;(async () => {
  await lineraService.initialize()
})()

// Get player stats
router.get("/:playerId", async (req, res) => {
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

// Update player stats
router.post("/:playerId", async (req, res) => {
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

module.exports = router
