# TimelockController Explorer

A comprehensive UI interface for exploring OpenZeppelin TimelockController contracts and governance systems across multiple blockchains.

## Features

- 🔍 **TimelockController Detection**: Automatically detects and explores TimelockController contracts
- 🌐 **Multi-Chain Support**: Works on Ethereum Mainnet, Sepolia, and Rootstock
- ⏰ **Governance Insights**: View minimum delays, roles (PROPOSER, EXECUTOR, CANCELLER), and operations
- 🔗 **AccessManager Support**: Also supports original OpenZeppelin AccessManager contracts
- ⭐ **Favorites System**: Save frequently accessed contracts
- 📱 **Responsive Design**: Mobile-friendly interface
- 🔌 **Wallet Integration**: Connect wallets using RainbowKit

## Supported Contract Types

### TimelockController
- Role management (PROPOSER_ROLE, EXECUTOR_ROLE, CANCELLER_ROLE)
- Minimum delay configuration
- Operation scheduling and execution
- Governance workflow visualization

### AccessManager (Legacy Support)
- Access control management
- Role-based permissions
- Target and function-level access control

## Getting Started

### Prerequisites
- Node.js 18+ 
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/timelock-controller-explorer.git
cd timelock-controller-explorer
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:

```env
# Required: Subgraph endpoints
NEXT_PUBLIC_URQL_ENDPOINT_MAINNET=https://api.studio.thegraph.com/query/your-mainnet-subgraph
NEXT_PUBLIC_URQL_ENDPOINT_SEPOLIA=https://api.studio.thegraph.com/query/your-sepolia-subgraph
NEXT_PUBLIC_URQL_ENDPOINT_ROOTSTOCK=https://api.studio.thegraph.com/query/46125/access-control-rootstock/version/latest

# Required: WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Required: 4byte.directory API for function signatures
NEXT_PUBLIC_SIGNATURE_DATABASE=https://www.4byte.directory/api/v1/signatures/?hex_signature=

# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=your_ga_id
```

4. Start the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Exploring TimelockController Contracts

1. Navigate to the explorer for your desired network:
   - Mainnet: `/explorer/1`
   - Sepolia: `/explorer/11155111` 
   - Rootstock: `/explorer/30`

2. Enter a TimelockController contract address in the search bar

3. The explorer will automatically detect the contract type and display:
   - Minimum delay requirements
   - Role assignments and permissions
   - Pending and executed operations (coming soon)

### Example Contracts

Try these example contracts:
- **Rootstock**: `0x784024a1F91564743Cf7C17f4d5e994A8EE002E7` (Your TimelockController)

## Development

### Architecture

- **Frontend**: Next.js 13 with App Router
- **Styling**: Tailwind CSS + Radix UI
- **Blockchain**: Wagmi + Viem for Ethereum interactions
- **Data**: GraphQL with URQL client for subgraph data + direct contract calls for TimelockController
- **Type Safety**: Full TypeScript with auto-generated GraphQL types

### Key Components

- `src/hooks/use-timelock-controller.ts` - TimelockController detection and data fetching
- `src/components/entities/timelock-controller/` - TimelockController UI components
- `src/components/navbar/search/` - Smart contract detection and search
- `src/config/chains/` - Multi-chain configuration

### GraphQL Code Generation

This project uses [GraphQL Code Generator](https://graphql-code-generator.com/) for type safety:

```bash
yarn codegen
```

### Building for Production

```bash
yarn build
yarn start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on top of [OpenZeppelin Access Manager Explorer](https://github.com/OpenZeppelin/access-manager-explorer)
- Powered by [The Graph](https://thegraph.com/) for blockchain data indexing
- UI components from [Radix UI](https://www.radix-ui.com/)
- Wallet connectivity via [RainbowKit](https://www.rainbowkit.com/)
