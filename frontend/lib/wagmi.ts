import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Contract addresses - NO FALLBACKS FOR SECURITY
const tokenAddress = import.meta.env.VITE_PEERAI_TOKEN_ADDRESS
const coreAddress = import.meta.env.VITE_PEERAI_CORE_ADDRESS

if (!tokenAddress || !coreAddress) {
  throw new Error('Contract addresses must be provided via environment variables')
}

export const CONTRACT_ADDRESSES = {
  token: tokenAddress as `0x${string}`,
  core: coreAddress as `0x${string}`,
} as const

// Wagmi configuration
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-walletconnect-project-id',
    }),
  ],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_ALCHEMY_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY'),
  },
})

// Contract ABIs - minimal for better performance
export const TOKEN_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const CORE_ABI = [
  {
    inputs: [
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_institution', type: 'string' },
      { internalType: 'string', name: '_researchField', type: 'string' },
      { internalType: 'string[]', name: '_expertise', type: 'string[]' },
    ],
    name: 'registerUser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: '_title', type: 'string' },
      { internalType: 'string', name: '_abstractText', type: 'string' },
      { internalType: 'string', name: '_authors', type: 'string' },
      { internalType: 'string', name: '_researchField', type: 'string' },
      { internalType: 'string', name: '_fileHash', type: 'string' },
      { internalType: 'string[]', name: '_keywords', type: 'string[]' },
    ],
    name: 'submitManuscript',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_userAddress', type: 'address' }],
    name: 'getUserProfile',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'userAddress', type: 'address' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'institution', type: 'string' },
          { internalType: 'string', name: 'researchField', type: 'string' },
          { internalType: 'uint256', name: 'reputationScore', type: 'uint256' },
          { internalType: 'uint256', name: 'totalReviews', type: 'uint256' },
          { internalType: 'uint256', name: 'tokensEarned', type: 'uint256' },
          { internalType: 'bool', name: 'isVerified', type: 'bool' },
          { internalType: 'string[]', name: 'expertise', type: 'string[]' },
        ],
        internalType: 'struct PeerAICore.UserProfile',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const