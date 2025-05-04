// Linera Client for interacting with the Linera blockchain via GraphQL
class LineraClient {
  constructor() {
    this.graphqlEndpoint = null
    this.applicationId = null
    this.chainId = null
    this.initialized = false
  }

  // Initialize the client with the GraphQL endpoint and application details
  async initialize(config) {
    this.graphqlEndpoint = config.graphqlEndpoint || "/api/linera-proxy"
    this.applicationId = config.applicationId
    this.chainId = config.chainId

    try {
      // Test connection to GraphQL endpoint
      const response = await fetch(this.graphqlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `{ chains { id } }`,
        }),
      })

      const data = await response.json()

      if (data.errors) {
        console.error("GraphQL errors:", data.errors)
        return false
      }

      console.log("Successfully connected to Linera GraphQL endpoint")
      this.initialized = true
      return true
    } catch (error) {
      console.error("Failed to connect to Linera GraphQL endpoint:", error)
      return false
    }
  }

  // Get player stats from the contract
  async getPlayerStats() {
    try {
      if (!this.initialized) {
        throw new Error("Client not initialized")
      }

      const response = await fetch(this.graphqlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query GetPlayerStats($chainId: ChainId!, $applicationId: ApplicationId!) {
              applicationQuery(chainId: $chainId, applicationId: $applicationId, query: "{\\"GetPlayerStats\\": {}}") {
                value
              }
            }
          `,
          variables: {
            chainId: this.chainId,
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

  // Update player stats after a game
  async updatePlayerStats(score, won) {
    try {
      if (!this.initialized) {
        throw new Error("Client not initialized")
      }

      const operation = {
        UpdateStats: {
          score: score,
          won: won,
        },
      }

      const response = await fetch(this.graphqlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation ExecuteOperation($chainId: ChainId!, $applicationId: ApplicationId!, $operation: String!) {
              executeOperation(chainId: $chainId, applicationId: $applicationId, operation: $operation) {
                status
              }
            }
          `,
          variables: {
            chainId: this.chainId,
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

// Create a global instance of the Linera client
const lineraClient = new LineraClient()

// Initialize the client when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  // These values would be set during deployment
  const config = {
    graphqlEndpoint: "/api/linera-proxy", // This would be a proxy endpoint on your server
    applicationId: "your_application_id_here",
    chainId: "your_chain_id_here",
  }

  await lineraClient.initialize(config)

  // Load player stats immediately
  if (lineraClient.initialized) {
    const statsResult = await lineraClient.getPlayerStats()
    if (statsResult.success) {
      updatePlayerStatsDisplay(statsResult.stats)
    }
  }
})

// Helper function to update the player stats display
function updatePlayerStatsDisplay(stats) {
  document.getElementById("games-played").textContent = stats.games_played
  document.getElementById("games-won").textContent = stats.games_won
  document.getElementById("games-lost").textContent = stats.games_lost
  document.getElementById("high-score").textContent = stats.high_score
}
