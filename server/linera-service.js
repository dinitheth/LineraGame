const fetch = require("node-fetch")

class LineraService {
  constructor(config = {}) {
    this.graphqlEndpoint = config.graphqlEndpoint || "http://localhost:8080/graphql"
    this.defaultChainId = config.defaultChainId
    this.applicationId = config.applicationId
    this.playerChains = new Map() // Map player IDs to chain IDs
  }

  /**
   * Initialize the Linera service
   */
  async initialize() {
    try {
      // Check if Linera service is running
      const response = await fetch(this.graphqlEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "{ chains { id } }" }),
      })

      const data = await response.json()

      if (data.errors) {
        console.error("GraphQL errors:", data.errors)
        return false
      }

      console.log("Successfully connected to Linera GraphQL endpoint")
      return true
    } catch (error) {
      console.error("Failed to connect to Linera GraphQL endpoint:", error)
      return false
    }
  }

  /**
   * Get or create a chain for a player
   * @param {string} playerId - The player's unique identifier
   */
  async getOrCreatePlayerChain(playerId) {
    // Check if we already have a chain for this player
    if (this.playerChains.has(playerId)) {
      return this.playerChains.get(playerId)
    }

    try {
      // In a real implementation, you might create a new chain for each player
      // For simplicity, we'll use the default chain for all players
      const chainId = this.defaultChainId
      this.playerChains.set(playerId, chainId)

      return chainId
    } catch (error) {
      console.error("Error creating player chain:", error)
      throw error
    }
  }

  /**
   * Get player stats from the chain
   * @param {string} playerId - The player's unique identifier
   */
  async getPlayerStats(playerId) {
    try {
      const chainId = await this.getOrCreatePlayerChain(playerId)

      const response = await fetch(this.graphqlEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query GetPlayerStats($chainId: ChainId!, $applicationId: ApplicationId!) {
              applicationQuery(chainId: $chainId, applicationId: $applicationId, query: "{\\"GetPlayerStats\\": {}}") {
                value
              }
            }
          `,
          variables: {
            chainId: chainId,
            applicationId: this.applicationId,
          },
        }),
      })

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      const result = JSON.parse(data.data.applicationQuery.value)

      if (result.PlayerStats) {
        return {
          success: true,
          stats: result.PlayerStats,
        }
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error getting player stats:", error)
      return {
        success: false,
        error: error.message,
        stats: {
          high_score: 0,
          games_played: 0,
          games_won: 0,
          games_lost: 0,
        },
      }
    }
  }

  /**
   * Update player stats on the chain
   * @param {string} playerId - The player's unique identifier
   * @param {number} score - The player's score
   * @param {boolean} won - Whether the player won the game
   */
  async updatePlayerStats(playerId, score, won) {
    try {
      const chainId = await this.getOrCreatePlayerChain(playerId)

      const operation = {
        UpdateStats: {
          score: score,
          won: won,
        },
      }

      const response = await fetch(this.graphqlEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation ExecuteOperation($chainId: ChainId!, $applicationId: ApplicationId!, $operation: String!) {
              executeOperation(chainId: $chainId, applicationId: $applicationId, operation: $operation) {
                status
              }
            }
          `,
          variables: {
            chainId: chainId,
            applicationId: this.applicationId,
            operation: JSON.stringify(operation),
          },
        }),
      })

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      if (data.data.executeOperation.status === "Accepted") {
        console.log("Successfully updated player stats")
        return {
          success: true,
        }
      } else {
        throw new Error(`Operation status: ${data.data.executeOperation.status}`)
      }
    } catch (error) {
      console.error("Error updating player stats:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }
}

module.exports = { LineraService }
