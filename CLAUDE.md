# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server (Next.js 13 with App Router)
- `yarn build` - Build for production 
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn codegen` - Generate GraphQL types from schema (required after GraphQL changes)

## Architecture Overview

This is a TimelockController and AccessManager explorer built on Next.js 13+ with:

- **Frontend Stack**: Next.js 13 App Router, TypeScript, Tailwind CSS, Radix UI
- **Blockchain Integration**: Wagmi + Viem for Ethereum interactions, RainbowKit for wallet connectivity
- **Data Layer**: 
  - GraphQL with URQL client for subgraph data (AccessManager contracts)
  - Direct contract calls via Wagmi for TimelockController detection and data
- **Multi-chain Support**: Ethereum Mainnet, Sepolia testnet, and Rootstock (custom chain definition)

## Key Architecture Components

### TimelockController Detection System
- `src/hooks/use-timelock-controller.ts` - Core hook for detecting and fetching TimelockController contract data
- Uses `useContractReads` to batch multiple contract calls (PROPOSER_ROLE, EXECUTOR_ROLE, CANCELLER_ROLE, getMinDelay)
- Automatically detects if an address is a valid TimelockController by checking method existence

### Smart Contract Detection Flow
- `src/components/navbar/search/` - Handles address input and contract type detection
- Prioritizes TimelockController detection over legacy AccessManager contracts
- `src/components/entities/timelock-controller/` - UI components for TimelockController display

### Multi-Chain Configuration
- `src/config/chains/index.ts` - Chain definitions including custom Rootstock chain
- `src/config/env/index.ts` - Environment variable configuration for subgraph endpoints
- Each chain has its own subgraph URL for AccessManager data

### Entity System
- `src/providers/entities/` - Manages the entity stack for exploring related contracts
- `src/providers/favorites/` - Persistent favorites system for frequently accessed contracts
- `src/types/index.ts` - Core type definitions including AddressEntity enum

### GraphQL Integration
- `codegen.ts` - GraphQL Code Generator configuration pointing to mainnet subgraph
- `src/gql/` - Auto-generated GraphQL types and queries
- Only used for legacy AccessManager contracts; TimelockController uses direct contract calls

## Environment Variables Required

```env
# Subgraph endpoints for AccessManager data
NEXT_PUBLIC_URQL_ENDPOINT_MAINNET=<subgraph_url>
NEXT_PUBLIC_URQL_ENDPOINT_SEPOLIA=<subgraph_url>
NEXT_PUBLIC_URQL_ENDPOINT_ROOTSTOCK=<subgraph_url>

# Wallet connectivity
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<project_id>

# Function signature resolution
NEXT_PUBLIC_SIGNATURE_DATABASE=https://www.4byte.directory/api/v1/signatures/?hex_signature=

# Optional analytics
NEXT_PUBLIC_GA_ID=<google_analytics_id>
```

## Contract Types Supported

### TimelockController (Primary Focus)
- OpenZeppelin governance contract with time-delayed execution
- Key methods: PROPOSER_ROLE, EXECUTOR_ROLE, CANCELLER_ROLE, getMinDelay
- UI shows role permissions, minimum delays, and governance workflow

### AccessManager (Legacy Support)
- Original OpenZeppelin access control system
- Uses GraphQL subgraph for data fetching
- Supports role-based permissions and target/function-level access control

## Development Patterns

- Component structure follows entity-based organization under `src/components/entities/`
- Each entity type has its own folder with index.tsx, requests.ts, and skeleton components
- Hooks are organized by functionality in `src/hooks/`
- Provider pattern used for global state (entities, favorites, route-network)
- Responsive design with mobile-first approach using Tailwind CSS