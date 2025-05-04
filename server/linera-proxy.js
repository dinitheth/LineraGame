// This file would be used in a server-side setup (e.g., Next.js API route)
// to proxy requests to the Linera GraphQL service

const https = require("https")
const http = require("http")

/**
 * Proxy requests to the Linera GraphQL service
 * @param {Object} req - The incoming request
 * @param {Object} res - The outgoing response
 */
module.exports = async function lineraProxy(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get the Linera GraphQL endpoint from environment variables
    const lineraEndpoint = process.env.LINERA_GRAPHQL_ENDPOINT || "http://localhost:8080/graphql"

    // Parse the URL to determine if it's HTTP or HTTPS
    const url = new URL(lineraEndpoint)
    const httpModule = url.protocol === "https:" ? https : http

    // Forward the request to the Linera GraphQL service
    const proxyReq = httpModule.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (proxyRes) => {
        // Set the status code and headers from the proxied response
        res.status(proxyRes.statusCode)

        // Forward the response data
        let responseData = ""
        proxyRes.on("data", (chunk) => {
          responseData += chunk
        })

        proxyRes.on("end", () => {
          res.send(responseData)
        })
      },
    )

    // Handle errors
    proxyReq.on("error", (error) => {
      console.error("Error proxying request to Linera GraphQL service:", error)
      res.status(500).json({ error: "Failed to connect to Linera service" })
    })

    // Send the request body
    proxyReq.write(JSON.stringify(req.body))
    proxyReq.end()
  } catch (error) {
    console.error("Error in Linera proxy:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
