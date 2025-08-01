import { mainnet, sepolia } from "viem/chains";
import { urqlEndpoint } from "../env";
import { defineChain } from 'viem'

export const rootstock = defineChain({
  id: 30,
  name: 'Rootstock',
  network: 'rootstock',
  nativeCurrency: {
    decimals: 18,
    name: 'Rootstock Smart Bitcoin',
    symbol: 'RBTC'
  },
  rpcUrls: {
    default: {
      http: ['https://public-node.rsk.co'],
      webSocket: ['wss://public-node.rsk.co'],
    },
    public: {
      http: ['https://public-node.rsk.co'],
      webSocket: ['wss://public-node.rsk.co'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://rootstock.blockscout.com' },
  },
})

const chains = [
  {
    definition: mainnet,
    subgraphUrl: urqlEndpoint.mainnet,
  },
  {
    definition: sepolia,
    subgraphUrl: urqlEndpoint.sepolia,
  },
  {
    definition: rootstock,
    subgraphUrl: urqlEndpoint.rootstock,
  },
] as const;

export { chains };
