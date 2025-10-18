// Connection configuration for wallet integration
// This file helps with React resolution issues similar to FundX project

export const CONFIG = {
  chains: ['sepolia'],
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-walletconnect-project-id',
  rpcUrl: process.env.VITE_ALCHEMY_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY',
  tokenAddress: process.env.VITE_PEERAI_TOKEN_ADDRESS,
  coreAddress: process.env.VITE_PEERAI_CORE_ADDRESS,
  backendUrl: process.env.VITE_BACKEND_URL || 'http://localhost:3001'
}

export default CONFIG
