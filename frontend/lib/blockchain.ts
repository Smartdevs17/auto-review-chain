import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import PeerAICoreABI from './PeerAICore.json'

// Contract addresses from environment variables - with fallbacks for build time
const CORE_CONTRACT_ADDRESS = import.meta.env.VITE_PEERAI_CORE_ADDRESS || '0x0000000000000000000000000000000000000000'
const TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_PEERAI_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000'

// Only throw error in production if addresses are not properly set
if (import.meta.env.PROD && (!import.meta.env.VITE_PEERAI_CORE_ADDRESS || !import.meta.env.VITE_PEERAI_TOKEN_ADDRESS)) {
	console.warn('Contract addresses not properly configured for production')
}

// Use the full ABI from the deployed contract
const CORE_ABI = PeerAICoreABI.abi

// Helper function to get the public client
const getPublicClient = () => {
	return createPublicClient({
		chain: sepolia,
		transport: http(import.meta.env.VITE_ALCHEMY_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo')
	})
}

// Helper function to get the wallet client
const getWalletClient = () => {
	if (typeof window.ethereum === 'undefined') {
		throw new Error('MetaMask or a compatible wallet is not installed.')
	}
	
	return createWalletClient({
		chain: sepolia,
		transport: http(import.meta.env.VITE_ALCHEMY_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo')
	})
}

// Blockchain service for direct smart contract interactions
export const blockchainService = {
	/**
	 * Test blockchain connection and contract
	 */
	async testConnection(): Promise<{ network: string, chainId: number, contractAddress: string, isConnected: boolean }> {
		if (typeof window.ethereum === 'undefined') {
			throw new Error('MetaMask or a compatible wallet is not installed.')
		}

		const publicClient = getPublicClient()
		const chainId = await publicClient.getChainId()
		
		return {
			network: 'sepolia',
			chainId: chainId,
			contractAddress: CORE_CONTRACT_ADDRESS,
			isConnected: true
		}
	},
	/**
	 * Register a user on the blockchain
	 */
  async registerUser(
		walletAddress: string,
    name: string,
    institution: string,
    researchField: string,
    expertise: string[]
	): Promise<string> {
		if (typeof window.ethereum === 'undefined') {
			throw new Error('MetaMask or a compatible wallet is not installed.')
		}

		const publicClient = getPublicClient()
		const walletClient = getWalletClient()
		
		// Check network
		const chainId = await publicClient.getChainId()
		console.log('🔍 Registering on network: sepolia, Chain ID:', chainId)
		
		// Check if user is on Sepolia testnet (chain ID: 11155111)
		if (chainId !== 11155111) {
			throw new Error(`Wrong network! Please switch to Sepolia testnet (Chain ID: 11155111). Current chain ID: ${chainId}`)
		}

		try {
			console.log('🔍 Calling registerUser with params:', { name, institution, researchField, expertise })
			const hash = await walletClient.writeContract({
				address: CORE_CONTRACT_ADDRESS as `0x${string}`,
				abi: CORE_ABI,
				functionName: 'registerUser',
				args: [name, institution, researchField, expertise],
				account: walletAddress as `0x${string}`
			})
			console.log('🔍 Transaction submitted:', hash)
			console.log('🔍 Waiting for confirmation...')
			const receipt = await publicClient.waitForTransactionReceipt({ hash })
			console.log('🔍 Transaction confirmed:', receipt.transactionHash)
			return receipt.transactionHash
		} catch (error) {
			console.error('❌ Blockchain registration failed:', error)
			if (error.message?.includes('User already registered')) {
				throw new Error('You are already registered on the blockchain.')
			} else if (error.message?.includes('insufficient funds')) {
				throw new Error('Insufficient funds for transaction. Please add some Sepolia ETH to your wallet.')
			} else {
				throw new Error(`Failed to register user on blockchain: ${error.message || error}`)
			}
		}
	},

	/**
	 * Check if a user is registered on the blockchain
	 */
	async isUserRegistered(walletAddress: string): Promise<boolean> {
		if (typeof window.ethereum === 'undefined') {
			throw new Error('MetaMask or a compatible wallet is not installed.')
		}

		console.log('🔍 Checking blockchain registration for address:', walletAddress)
		console.log('🔍 Using contract address:', CORE_CONTRACT_ADDRESS)

		const publicClient = getPublicClient()
		
		// Check network
		const chainId = await publicClient.getChainId()
		console.log('🔍 Current network: sepolia, Chain ID:', chainId)
		
		// Check if user is on Sepolia testnet (chain ID: 11155111)
		if (chainId !== 11155111) {
			throw new Error(`Wrong network! Please switch to Sepolia testnet (Chain ID: 11155111). Current chain ID: ${chainId}`)
		}
		
		console.log('🔍 Contract instance created, calling isUserRegistered...')

		try {
			const result = await publicClient.readContract({
				address: CORE_CONTRACT_ADDRESS as `0x${string}`,
				abi: CORE_ABI,
				functionName: 'isUserRegistered',
				args: [walletAddress as `0x${string}`]
			})
			console.log('🔍 Blockchain registration result:', result)
			return result as boolean
		} catch (error) {
			console.error('❌ Failed to check user registration:', error)
			console.error('❌ Error details:', {
				message: error.message,
				reason: error.reason,
				data: error.data
			})
			throw new Error(`Failed to check user registration: ${error.message || error}`)
		}
	},

	/**
	 * Remove current user from the blockchain (user must sign the transaction)
	 */
	async removeCurrentUser(reason: string = 'User requested removal'): Promise<string> {
		if (typeof window.ethereum === 'undefined') {
			throw new Error('MetaMask or a compatible wallet is not installed.')
		}

		const publicClient = getPublicClient()
		const walletClient = getWalletClient()
		
		// Check network
		const chainId = await publicClient.getChainId()
		console.log('🔍 Removing user on network: sepolia, Chain ID:', chainId)
		
		// Check if user is on Sepolia testnet (chain ID: 11155111)
		if (chainId !== 11155111) {
			throw new Error(`Wrong network! Please switch to Sepolia testnet (Chain ID: 11155111). Current chain ID: ${chainId}`)
		}

		try {
			// Get the current user's address
			const accounts = await walletClient.getAddresses()
			const userAddress = accounts[0]
			
			// Check if user is registered first
			const isRegistered = await publicClient.readContract({
				address: CORE_CONTRACT_ADDRESS as `0x${string}`,
				abi: CORE_ABI,
				functionName: 'isUserRegistered',
				args: [userAddress]
			})
			
			if (!isRegistered) {
				throw new Error('User is not registered on blockchain')
			}

			// Remove the user (user signs the transaction)
			const hash = await walletClient.writeContract({
				address: CORE_CONTRACT_ADDRESS as `0x${string}`,
				abi: CORE_ABI,
				functionName: 'removeUser',
				args: [userAddress, reason],
				account: userAddress
			})
			
			const receipt = await publicClient.waitForTransactionReceipt({ hash })
			return receipt.transactionHash
		} catch (error) {
			console.error('Failed to remove user from blockchain:', error)
			throw new Error(`Failed to remove user from blockchain: ${error.message || error}`)
		}
	},

	/**
	 * Get user profile from blockchain
	 */
	async getUserProfile(walletAddress: string): Promise<any> {
		if (typeof window.ethereum === 'undefined') {
			throw new Error('MetaMask or a compatible wallet is not installed.')
		}

		const publicClient = getPublicClient()

		try {
			const profile = await publicClient.readContract({
				address: CORE_CONTRACT_ADDRESS as `0x${string}`,
				abi: CORE_ABI,
				functionName: 'getUserProfile',
				args: [walletAddress as `0x${string}`]
			})
			
			return {
				userAddress: profile[0],
				name: profile[1],
				institution: profile[2],
				researchField: profile[3],
				reputationScore: parseInt(profile[4].toString()),
				totalReviews: parseInt(profile[5].toString()),
				tokensEarned: parseInt(profile[6].toString()),
				isVerified: profile[7],
				expertise: profile[8]
			}
		} catch (error) {
			console.error('Failed to get user profile from blockchain:', error)
			throw new Error(`Failed to get user profile from blockchain: ${error.message || error}`)
		}
	},

	/**
	 * Submit a manuscript to the blockchain
	 */
  async submitManuscript(
		walletAddress: string,
    title: string,
		abstractText: string,
    authors: string,
    researchField: string,
    fileHash: string,
    keywords: string[]
	): Promise<string> {
		if (typeof window.ethereum === 'undefined') {
			throw new Error('MetaMask or a compatible wallet is not installed.')
		}

		const publicClient = getPublicClient()
		const walletClient = getWalletClient()

		try {
			const hash = await walletClient.writeContract({
				address: CORE_CONTRACT_ADDRESS as `0x${string}`,
				abi: CORE_ABI,
				functionName: 'submitManuscript',
				args: [title, abstractText, authors, researchField, fileHash, keywords],
				account: walletAddress as `0x${string}`
			})
			
			const receipt = await publicClient.waitForTransactionReceipt({ hash })
			return receipt.transactionHash
    } catch (error) {
			console.error('Failed to submit manuscript to blockchain:', error)
			throw new Error(`Failed to submit manuscript to blockchain: ${error.message || error}`)
		}
	},

	/**
	 * Get token balance for a wallet address
	 */
	async getTokenBalance(walletAddress: string): Promise<string> {
		if (typeof window.ethereum === 'undefined') {
			throw new Error('MetaMask or a compatible wallet is not installed.')
		}

		const publicClient = getPublicClient()
		
		// Get the ETH balance for now (can be extended for token balance)
		try {
			const balance = await publicClient.getBalance({
				address: walletAddress as `0x${string}`
			})
			return formatEther(balance)
		} catch (error) {
			console.error('Failed to get token balance:', error)
			throw new Error(`Failed to get token balance: ${error.message || error}`)
		}
	}
}

// Export contract addresses for use in other parts of the app
export { CORE_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS, CORE_ABI }