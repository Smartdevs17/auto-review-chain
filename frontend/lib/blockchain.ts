import { ethers } from 'ethers'
import PeerAICoreABI from './PeerAICore.json'

// Contract addresses from environment variables - NO FALLBACKS FOR SECURITY
const CORE_CONTRACT_ADDRESS = import.meta.env.VITE_PEERAI_CORE_ADDRESS
const TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_PEERAI_TOKEN_ADDRESS

if (!CORE_CONTRACT_ADDRESS || !TOKEN_CONTRACT_ADDRESS) {
	throw new Error('Contract addresses must be provided via environment variables')
}

// Use the full ABI from the deployed contract
const CORE_ABI = PeerAICoreABI.abi

// Helper function to get the contract instance
const getCoreContract = (signer: ethers.Signer) => {
	if (!CORE_CONTRACT_ADDRESS) {
		throw new Error('PEERAI_CORE_ADDRESS is not defined in environment variables')
	}
	return new ethers.Contract(CORE_CONTRACT_ADDRESS, CORE_ABI, signer)
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

		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const network = await provider.getNetwork()
		
		return {
			network: network.name,
			chainId: network.chainId,
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

		const provider = new ethers.providers.Web3Provider(window.ethereum)
		
		// Check network
		const network = await provider.getNetwork()
		console.log('🔍 Registering on network:', network.name, 'Chain ID:', network.chainId)
		
		// Check if user is on Sepolia testnet (chain ID: 11155111)
		if (network.chainId !== 11155111) {
			throw new Error(`Wrong network! Please switch to Sepolia testnet (Chain ID: 11155111). Current network: ${network.name} (${network.chainId})`)
		}
		
		const signer = provider.getSigner(walletAddress)
		const coreContract = getCoreContract(signer)

		try {
			console.log('🔍 Calling registerUser with params:', { name, institution, researchField, expertise })
			const tx = await coreContract.registerUser(name, institution, researchField, expertise)
			console.log('🔍 Transaction submitted:', tx.hash)
			console.log('🔍 Waiting for confirmation...')
			const receipt = await tx.wait()
			console.log('🔍 Transaction confirmed:', receipt.transactionHash)
			return receipt.transactionHash
		} catch (error) {
			console.error('❌ Blockchain registration failed:', error)
			if (error.code === 'NETWORK_ERROR') {
				throw new Error('Network error. Please check your connection and try again.')
			} else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
				throw new Error('Transaction failed. You may already be registered or there was an issue with the transaction.')
			} else if (error.message?.includes('User already registered')) {
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

		const provider = new ethers.providers.Web3Provider(window.ethereum)
		
		// Check network
		const network = await provider.getNetwork()
		console.log('🔍 Current network:', network.name, 'Chain ID:', network.chainId)
		
		// Check if user is on Sepolia testnet (chain ID: 11155111)
		if (network.chainId !== 11155111) {
			throw new Error(`Wrong network! Please switch to Sepolia testnet (Chain ID: 11155111). Current network: ${network.name} (${network.chainId})`)
		}
		
		const coreContract = new ethers.Contract(CORE_CONTRACT_ADDRESS, CORE_ABI, provider)
		console.log('🔍 Contract instance created, calling isUserRegistered...')

		try {
			const result = await coreContract.isUserRegistered(walletAddress)
			console.log('🔍 Blockchain registration result:', result)
			return result
		} catch (error) {
			console.error('❌ Failed to check user registration:', error)
			console.error('❌ Error details:', {
				code: error.code,
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

		const provider = new ethers.providers.Web3Provider(window.ethereum)
		
		// Check network
		const network = await provider.getNetwork()
		console.log('🔍 Removing user on network:', network.name, 'Chain ID:', network.chainId)
		
		// Check if user is on Sepolia testnet (chain ID: 11155111)
		if (network.chainId !== 11155111) {
			throw new Error(`Wrong network! Please switch to Sepolia testnet (Chain ID: 11155111). Current network: ${network.name} (${network.chainId})`)
		}
		
		const signer = provider.getSigner()
		const coreContract = getCoreContract(signer)

		try {
			// Get the current user's address
			const userAddress = await signer.getAddress()
			
			// Check if user is registered first
			const isRegistered = await coreContract.isUserRegistered(userAddress)
			if (!isRegistered) {
				throw new Error('User is not registered on blockchain')
			}

			// Remove the user (user signs the transaction)
			const tx = await coreContract.removeUser(userAddress, reason)
			const receipt = await tx.wait()
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

		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const coreContract = new ethers.Contract(CORE_CONTRACT_ADDRESS, CORE_ABI, provider)

		try {
			const profile = await coreContract.getUserProfile(walletAddress)
			return {
				userAddress: profile.userAddress,
				name: profile.name,
				institution: profile.institution,
				researchField: profile.researchField,
				reputationScore: parseInt(profile.reputationScore.toString()),
				totalReviews: parseInt(profile.totalReviews.toString()),
				tokensEarned: parseInt(profile.tokensEarned.toString()),
				isVerified: profile.isVerified,
				expertise: profile.expertise
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

		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner(walletAddress)
		const coreContract = getCoreContract(signer)

		try {
			const tx = await coreContract.submitManuscript(
				title,
				abstractText,
				authors,
				researchField,
				fileHash,
				keywords
			)
			const receipt = await tx.wait()
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

		const provider = new ethers.providers.Web3Provider(window.ethereum)
		
		// Get the token contract (we'll need the token ABI for this)
		// For now, we'll use a simple ERC20 balance check
		try {
			const balance = await provider.getBalance(walletAddress)
			return ethers.utils.formatEther(balance)
		} catch (error) {
			console.error('Failed to get token balance:', error)
			throw new Error(`Failed to get token balance: ${error.message || error}`)
		}
	}
}

// Export contract addresses for use in other parts of the app
export { CORE_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS, CORE_ABI }