#!/bin/bash

# Exit on error
set -e

echo "Building LineraMatch game..."

# Build the contract
cargo build --release --target wasm32-unknown-unknown -p match-contract

# Create the bytecode directory if it doesn't exist
mkdir -p bytecode

# Copy the compiled WebAssembly to the bytecode directory
cp target/wasm32-unknown-unknown/release/match_contract.wasm bytecode/

echo "Build complete! WebAssembly bytecode is in the bytecode directory."
