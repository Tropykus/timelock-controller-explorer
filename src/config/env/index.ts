const urqlEndpoint = {
  sepolia: process.env.NEXT_PUBLIC_URQL_ENDPOINT_SEPOLIA!,
  mainnet: process.env.NEXT_PUBLIC_URQL_ENDPOINT_MAINNET!,
  rootstock: process.env.NEXT_PUBLIC_URQL_ENDPOINT_ROOTSTOCK || "",
};

const walletConnectcId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

const signatureDatabase = process.env.NEXT_PUBLIC_SIGNATURE_DATABASE!;

const gaId = process.env.NEXT_PUBLIC_GA_ID!;

export { urqlEndpoint, walletConnectcId, signatureDatabase, gaId };
