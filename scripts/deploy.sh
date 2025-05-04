#!/bin/bash

# Exit on error
set -e

echo "Deploying LineraMatch game to Linera..."

# Check for Linera CLI
if ! command -v linera &> /dev/null; then
    echo "Linera CLI not found. Please install it first or add it to your PATH."
    exit 1
fi

# Build the contract if it doesn't exist
if [ ! -f "bytecode/match_contract.wasm" ]; then
    echo "Contract bytecode not found. Building first..."
    ./scripts/build.sh
fi

# Initialize a wallet if needed
if ! linera wallet show &> /dev/null; then
    echo "Initializing a new wallet..."
    linera wallet init --with-new-chain
fi

# Get the chain ID
CHAIN_ID=$(linera wallet show | grep "Chain ID" | awk '{print $3}')
echo "Using chain ID: $CHAIN_ID"

# Publish the application
echo "Publishing the application..."
APPLICATION_ID=$(linera publish-app \
    --path bytecode/match_contract.wasm \
    --json-abi bytecode/match_contract.json)
echo "Application ID: $APPLICATION_ID"

# Create the application on the chain
echo "Creating application on chain $CHAIN_ID..."
linera create-application \
    --application-id $APPLICATION_ID \
    --chain-id $CHAIN_ID \
    --json-argument "{}"

echo "Deployment complete!"
echo "Contract ID: $APPLICATION_ID"
echo "Chain ID: $CHAIN_ID"

# Start the GraphQL service if not already running
if ! nc -z localhost 8080 &>/dev/null; then
    echo "Starting Linera GraphQL service on port 8080..."
    linera service --port 8080 &
    echo "GraphQL service started. Press Ctrl+C to stop."
else
    echo "Linera GraphQL service is already running on port 8080."
fi

# Create environment variables file for the server
cat > .env << EOF
LINERA_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
LINERA_DEFAULT_CHAIN_ID=${CHAIN_ID}
LINERA_APPLICATION_ID=${APPLICATION_ID}
EOF

echo "Environment variables created in .env file."

# Update the frontend configuration
echo "Updating frontend configuration..."
mkdir -p frontend
cat > frontend/config.js << EOF
// LineraMatch Configuration
// This file is auto-generated during deployment

const LINERA_CONFIG = {
  graphqlEndpoint: "/api/linera-proxy",
  applicationId: "${APPLICATION_ID}",
  chainId: "${CHAIN_ID}"
};
EOF

echo "Frontend configuration updated."
echo "Done!"
