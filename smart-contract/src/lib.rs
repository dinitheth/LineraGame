#![cfg_attr(target_arch = "wasm32", no_std)]

use linera_sdk::{
    base::{Amount, ContractAbi, Owner, WithContractAbi},
    contract::*,
    ApplicationId, ContractRuntime, MessageContext, OperationContext, SessionId, ViewStateStorage,
};
use serde::{Deserialize, Serialize};

// Define the contract ABI
pub struct MatchGameAbi;

impl ContractAbi for MatchGameAbi {
    type Parameters = ();
    type InitializationArgument = ();
    type Operation = Operation;
    type Message = Message;
}

// Define the contract state
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct MatchGameState {
    pub high_score: u32,
    pub games_played: u32,
    pub games_won: u32,
    pub games_lost: u32,
}

// Define operations that can be performed on the contract
#[derive(Debug, Deserialize, Serialize)]
pub enum Operation {
    UpdateStats { score: u32, won: bool },
}

// Define messages that can be sent to the contract
#[derive(Debug, Deserialize, Serialize)]
pub enum Message {
    NotifyGameCompleted { score: u32, won: bool },
}

// Implement the contract
#[contract]
#[with_contract_abi(MatchGameAbi)]
pub struct MatchGame;

// Implement the contract logic
#[contract_impl]
impl MatchGame {
    // Initialize the contract
    pub fn initialize(
        &mut self,
        _context: &OperationContext,
        _argument: (),
    ) -> Result<(), ContractError> {
        // Initialize with default state
        let state = MatchGameState::default();
        self.write_state(state);
        Ok(())
    }

    // Handle operations
    pub fn execute_operation(
        &mut self,
        context: &OperationContext,
        operation: Operation,
    ) -> Result<(), ContractError> {
        match operation {
            Operation::UpdateStats { score, won } => {
                let mut state = self.read_state();
                
                // Update high score if the current score is higher
                if score > state.high_score {
                    state.high_score = score;
                }
                
                // Update game stats
                state.games_played += 1;
                if won {
                    state.games_won += 1;
                } else {
                    state.games_lost += 1;
                }
                
                // Write updated state
                self.write_state(state);
                Ok(())
            }
        }
    }

    // Handle messages
    pub fn execute_message(
        &mut self,
        context: &MessageContext,
        message: Message,
    ) -> Result<(), ContractError> {
        match message {
            Message::NotifyGameCompleted { score, won } => {
                let mut state = self.read_state();
                
                // Update high score if the current score is higher
                if score > state.high_score {
                    state.high_score = score;
                }
                
                // Update game stats
                state.games_played += 1;
                if won {
                    state.games_won += 1;
                } else {
                    state.games_lost += 1;
                }
                
                // Write updated state
                self.write_state(state);
                Ok(())
            }
        }
    }

    // Helper to read the contract state
    fn read_state(&self) -> MatchGameState {
        self.runtime().contract_state().unwrap_or_default()
    }

    // Helper to write the contract state
    fn write_state(&mut self, state: MatchGameState) {
        self.runtime().set_contract_state(state);
    }
}

// Query interface for the contract
#[derive(Clone, Debug, Deserialize, Serialize)]
pub enum Query {
    GetPlayerStats,
}

// Response types for queries
#[derive(Clone, Debug, Deserialize, Serialize)]
pub enum QueryResponse {
    PlayerStats(MatchGameState),
}

// Implement query handling
#[contract_impl]
impl MatchGame {
    pub fn query(&self, query: Query) -> Result<QueryResponse, ContractError> {
        match query {
            Query::GetPlayerStats => {
                let state = self.read_state();
                Ok(QueryResponse::PlayerStats(state))
            }
        }
    }
}
