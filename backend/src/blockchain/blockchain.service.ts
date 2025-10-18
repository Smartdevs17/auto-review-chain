import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from '../schemas/transaction.schema'
import * as PeerAITokenABI from '../contracts/PeerAIToken.json'
import * as PeerAICoreABI from '../contracts/PeerAICore.json'
import { normalizeWalletAddress, validateAndChecksumAddress } from '../utils/address.util'

@Injectable()
export class BlockchainService {
	private provider: ethers.providers.JsonRpcProvider
	private wallet: ethers.Wallet
	private tokenContract: ethers.Contract
	private coreContract: ethers.Contract

	constructor(
		@InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
		private configService: ConfigService,
	) {
		// Initialize blockchain connection
		this.initializeBlockchain()
	}

	private initializeBlockchain() {
		const rpcUrl = this.configService.get<string>('ETHEREUM_RPC_URL')
		const tokenAddress = this.configService.get<string>('PEERAI_TOKEN_ADDRESS')
		const coreAddress = this.configService.get<string>('PEERAI_CORE_ADDRESS')
		const privateKey = this.configService.get<string>('PRIVATE_KEY')

		if (!rpcUrl || !tokenAddress || !coreAddress) {
			console.warn('Blockchain configuration incomplete. Using mock mode.')
			return
		}

		try {
			// Provider with optional wallet for signing
			this.provider = new ethers.providers.JsonRpcProvider(rpcUrl)
			
			// Initialize wallet if private key is available
			if (privateKey) {
				this.wallet = new ethers.Wallet(privateKey, this.provider)
				console.log('✅ Blockchain service initialized with wallet for signing')
			} else {
				console.warn('⚠️ No private key provided. Blockchain service will be read-only.')
			}
			
			// Contracts with signing capability if wallet is available
			this.tokenContract = new ethers.Contract(
				tokenAddress,
				PeerAITokenABI.abi,
				this.wallet || this.provider
			)
			
			this.coreContract = new ethers.Contract(
				coreAddress,
				PeerAICoreABI.abi,
				this.wallet || this.provider
			)

			console.log('✅ Read-only blockchain connection initialized')
		} catch (error) {
			console.error('❌ Failed to initialize blockchain:', error)
		}
	}

	async recordTransaction(
		blockchainTxHash: string,
		type: TransactionType,
		userId?: string,
		amount: number = 0,
		description?: string,
		metadata?: Record<string, any>
	): Promise<Transaction> {
		const transaction = new this.transactionModel({
			blockchainTxHash,
			type,
			status: TransactionStatus.PENDING,
			amount,
			description,
			metadata,
			userId: userId ? new Types.ObjectId(userId) : undefined,
		})

		return transaction.save()
	}

	async getTransactions(userId?: string, page: number = 1, limit: number = 10): Promise<{ transactions: Transaction[], total: number }> {
		const query: any = {}
		if (userId) {
			query.userId = new Types.ObjectId(userId)
		}

		const skip = (page - 1) * limit
		const transactions = await this.transactionModel
			.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec()

		const total = await this.transactionModel.countDocuments(query).exec()

		return { transactions, total }
	}

	async updateTransactionStatus(blockchainTxHash: string, status: TransactionStatus): Promise<Transaction> {
		const transaction = await this.transactionModel.findOneAndUpdate(
			{ blockchainTxHash },
			{ status },
			{ new: true }
		).exec()

		if (!transaction) {
			throw new NotFoundException('Transaction not found')
		}

		return transaction
	}

	async getTransactionByHash(blockchainTxHash: string): Promise<Transaction> {
		const transaction = await this.transactionModel.findOne({ blockchainTxHash }).exec()
		if (!transaction) {
			throw new NotFoundException('Transaction not found')
		}
		return transaction
	}


	// Record blockchain transaction (called by frontend after successful transaction)
	async recordBlockchainTransaction(
		txHash: string,
		type: TransactionType,
		userWalletAddress: string,
		manuscriptData?: any,
		reviewData?: any
	): Promise<void> {
		try {
			// Validate blockchain is initialized
			if (!this.provider) {
				throw new InternalServerErrorException('Blockchain not initialized')
			}

			// Validate transaction hash format
			if (!txHash || !txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
				throw new BadRequestException('Invalid transaction hash format')
			}

			// Normalize wallet address for consistent storage
			const normalizedAddress = normalizeWalletAddress(userWalletAddress)

			// Check if user is registered on blockchain (except for USER_REGISTRATION type)
			if (type !== TransactionType.USER_REGISTRATION) {
				try {
					await this.getUserProfileFromBlockchain(userWalletAddress)
				} catch (error) {
					if (error instanceof NotFoundException) {
						throw new BadRequestException('User must be registered on blockchain before performing this action')
					}
					throw error
				}
			}

			// For USER_REGISTRATION, verify the transaction was actually executed on blockchain
			if (type === TransactionType.USER_REGISTRATION) {
				// Verify the transaction exists and was successful
				const tx = await this.provider.getTransaction(txHash)
				if (!tx) {
					throw new BadRequestException('User registration transaction not found on blockchain')
				}

				// Wait for transaction to be mined and get receipt
				let receipt = await this.provider.getTransactionReceipt(txHash)
				let attempts = 0
				const maxAttempts = 10
				
				// If receipt is null, transaction might not be mined yet
				while (!receipt && attempts < maxAttempts) {
					await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
					receipt = await this.provider.getTransactionReceipt(txHash)
					attempts++
				}

				if (!receipt) {
					throw new BadRequestException('User registration transaction not confirmed on blockchain')
				}

				if (receipt.status !== 1) {
					throw new BadRequestException('User registration transaction failed on blockchain')
				}

				// Record the successful transaction
				await this.recordTransaction(
					txHash,
					type,
					undefined, // userId will be set by caller
					0, // amount
					'User registration transaction confirmed on blockchain',
					{ userWalletAddress: normalizedAddress, manuscriptData, reviewData }
				)
				return
			}

			// Get transaction details from blockchain for other transaction types
			const tx = await this.provider.getTransaction(txHash)
			if (!tx) {
				throw new BadRequestException('Transaction not found on blockchain')
			}

			// Wait for transaction to be mined and get receipt
			let receipt = await this.provider.getTransactionReceipt(txHash)
			let attempts = 0
			const maxAttempts = 10
			
			// If receipt is null, transaction might not be mined yet
			while (!receipt && attempts < maxAttempts) {
				await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
				receipt = await this.provider.getTransactionReceipt(txHash)
				attempts++
			}

			if (!receipt) {
				// Transaction exists but not mined yet - record as pending
				await this.recordTransaction(
					txHash,
					type,
					undefined, // userId will be set by caller
					0,
					`Blockchain transaction: ${type} (pending)`,
					{ 
						userWalletAddress: normalizedAddress, 
						manuscriptData, 
						reviewData,
						status: 'pending',
						note: 'Transaction not yet mined'
					}
				)
				return
			}
			
			// Record the transaction in database with receipt data
			await this.recordTransaction(
				txHash,
				type,
				undefined, // userId will be set by caller
				0,
				`Blockchain transaction: ${type}`,
				{ 
					userWalletAddress: normalizedAddress, 
					manuscriptData, 
					reviewData,
					blockNumber: receipt.blockNumber,
					gasUsed: receipt.gasUsed.toString(),
					status: receipt.status === 1 ? 'success' : 'failed',
					transactionHash: tx.hash,
					from: tx.from,
					to: tx.to,
					value: tx.value.toString()
				}
			)
		} catch (error) {
			console.error('❌ Failed to record blockchain transaction:', error)
			
			// Re-throw known exceptions
			if (error instanceof BadRequestException || error instanceof NotFoundException) {
				throw error
			}
			
			// Handle specific blockchain errors
			if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
				throw new InternalServerErrorException('Blockchain network error. Please try again later.')
			}
			
			if (error.message?.includes('invalid transaction hash')) {
				throw new BadRequestException('Invalid transaction hash')
			}
			
			throw new InternalServerErrorException('Failed to record blockchain transaction')
		}
	}

	// Get token balance (read-only)
	async getTokenBalance(userWalletAddress: string): Promise<string> {
		if (!this.tokenContract) {
			throw new InternalServerErrorException('Blockchain not initialized')
		}

		try {
			// Validate and checksum the address for blockchain operations
			const checksummedAddress = validateAndChecksumAddress(userWalletAddress)
			const balance = await this.tokenContract.balanceOf(checksummedAddress)
			return ethers.utils.formatEther(balance)
		} catch (error) {
			console.error('❌ Failed to get token balance:', error)
			
			// Re-throw known exceptions
			if (error instanceof BadRequestException) {
				throw error
			}
			
			// Handle specific ethers errors
			if (error.code === 'INVALID_ARGUMENT' && error.argument === 'address') {
				throw new BadRequestException('Invalid wallet address format')
			}
			
			if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
				throw new InternalServerErrorException('Blockchain network error. Please try again later.')
			}
			
			throw new InternalServerErrorException('Failed to get token balance')
		}
	}

	// Get user reputation from blockchain (read-only)
	async getUserReputationFromBlockchain(userWalletAddress: string): Promise<number> {
		if (!this.coreContract) {
			throw new InternalServerErrorException('Blockchain not initialized')
		}

		try {
			// Validate and checksum the address for blockchain operations
			const checksummedAddress = validateAndChecksumAddress(userWalletAddress)
			const profile = await this.coreContract.getUserProfile(checksummedAddress)
			return parseInt(profile.reputationScore.toString())
		} catch (error) {
			console.error('❌ Failed to get user reputation from blockchain:', error)
			
			// Re-throw known exceptions
			if (error instanceof BadRequestException) {
				throw error
			}
			
			// Check if it's a "User not registered" error from the smart contract
			if (error.reason === 'User not registered' || error.message?.includes('User not registered')) {
				throw new NotFoundException('User not registered on blockchain')
			}
			
			// Handle specific blockchain errors
			if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
				throw new InternalServerErrorException('Blockchain network error. Please try again later.')
			}
			
			throw new InternalServerErrorException('Failed to get user reputation from blockchain')
		}
	}

	// Check if user is registered on blockchain (read-only)
	async isUserRegisteredOnBlockchain(userWalletAddress: string): Promise<boolean> {
		if (!this.coreContract) {
			throw new InternalServerErrorException('Blockchain not initialized')
		}

		try {
			// Validate and checksum the address for blockchain operations
			const checksummedAddress = validateAndChecksumAddress(userWalletAddress)
			return await this.coreContract.isUserRegistered(checksummedAddress)
		} catch (error) {
			console.error('❌ Failed to check user registration on blockchain:', error)
			throw new InternalServerErrorException('Failed to check user registration on blockchain')
		}
	}

	// Remove user from blockchain (requires wallet with private key)
	async removeUserFromBlockchain(userWalletAddress: string, reason: string = 'Testing cleanup'): Promise<string> {
		if (!this.coreContract) {
			throw new InternalServerErrorException('Blockchain not initialized')
		}

		if (!this.wallet) {
			throw new InternalServerErrorException('No private key configured. Cannot sign transactions.')
		}

		try {
			// Validate and checksum the address for blockchain operations
			const checksummedAddress = validateAndChecksumAddress(userWalletAddress)
			
			// Check if user is registered first
			const isRegistered = await this.coreContract.isUserRegistered(checksummedAddress)
			if (!isRegistered) {
				throw new NotFoundException('User not registered on blockchain')
			}

			// Call removeUser function on smart contract (backend wallet signs)
			const tx = await this.coreContract.removeUser(checksummedAddress, reason)
			const receipt = await tx.wait()
			
			if (receipt.status !== 1) {
				throw new BadRequestException('User removal transaction failed on blockchain')
			}

			console.log(`✅ User removed from blockchain successfully`)
			return receipt.transactionHash
		} catch (error) {
			console.error('❌ Failed to remove user from blockchain:', error)
			
			// Re-throw known exceptions
			if (error instanceof BadRequestException || error instanceof NotFoundException) {
				throw error
			}
			
			// Handle specific blockchain errors
			if (error.message?.includes('User not registered')) {
				throw new NotFoundException('User not found on blockchain')
			}
			if (error.message?.includes('Only user themselves or owner can remove user')) {
				throw new BadRequestException('Only the user themselves or contract owner can remove the user')
			}
			
			throw new InternalServerErrorException('Failed to remove user from blockchain')
		}
	}

	// Read blockchain data methods
	async getUserProfileFromBlockchain(userAddress: string): Promise<any> {
		if (!this.coreContract) {
			throw new InternalServerErrorException('Blockchain not initialized')
		}

		try {
			// Validate and checksum the address for blockchain operations
			const checksummedAddress = validateAndChecksumAddress(userAddress)
			const profile = await this.coreContract.getUserProfile(checksummedAddress)
			return {
				userAddress: profile.userAddress,
				name: profile.name,
				institution: profile.institution,
				researchField: profile.researchField,
				reputationScore: profile.reputationScore.toString(),
				totalReviews: profile.totalReviews.toString(),
				tokensEarned: profile.tokensEarned.toString(),
				isVerified: profile.isVerified,
				expertise: profile.expertise
			}
		} catch (error) {
			console.error('❌ Failed to get user profile from blockchain:', error)
			
			// Re-throw known exceptions
			if (error instanceof BadRequestException) {
				throw error
			}
			
			// Check if it's a "User not registered" error from the smart contract
			if (error.reason === 'User not registered' || error.message?.includes('User not registered')) {
				throw new NotFoundException('User not registered on blockchain')
			}
			
			// Handle specific blockchain errors
			if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
				throw new InternalServerErrorException('Blockchain network error. Please try again later.')
			}
			
			throw new InternalServerErrorException('Failed to get user profile from blockchain')
		}
	}

	async getManuscriptFromBlockchain(manuscriptId: number): Promise<any> {
		if (!this.coreContract) {
			throw new InternalServerErrorException('Blockchain not initialized')
		}

		try {
			// Validate manuscript ID
			if (!manuscriptId || manuscriptId < 0 || !Number.isInteger(manuscriptId)) {
				throw new BadRequestException('Invalid manuscript ID')
			}

			const manuscript = await this.coreContract.getManuscript(manuscriptId)
			return {
				id: manuscript.id.toString(),
				title: manuscript.title,
				abstractText: manuscript.abstractText,
				authors: manuscript.authors,
				researchField: manuscript.researchField,
				fileHash: manuscript.fileHash,
				author: manuscript.author,
				submissionTime: manuscript.submissionTime.toString(),
				averageRating: manuscript.averageRating.toString(),
				reviewCount: manuscript.reviewCount.toString(),
				isActive: manuscript.isActive,
				keywords: manuscript.keywords
			}
		} catch (error) {
			console.error('❌ Failed to get manuscript from blockchain:', error)
			
			// Re-throw known exceptions
			if (error instanceof BadRequestException) {
				throw error
			}
			
			// Check if it's a "Manuscript not found" error from the smart contract
			if (error.reason?.includes('not found') || error.message?.includes('not found')) {
				throw new NotFoundException('Manuscript not found on blockchain')
			}
			
			// Handle specific blockchain errors
			if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
				throw new InternalServerErrorException('Blockchain network error. Please try again later.')
			}
			
			throw new InternalServerErrorException('Failed to get manuscript from blockchain')
		}
	}

	// Utility methods for blockchain integration
	getEthereumRpcUrl(): string {
		const url = this.configService.get<string>('ETHEREUM_RPC_URL')
		if (!url) {
			throw new Error('ETHEREUM_RPC_URL environment variable is required')
		}
		return url
	}

	getTokenContractAddress(): string {
		const address = this.configService.get<string>('PEERAI_TOKEN_ADDRESS')
		if (!address) {
			throw new Error('PEERAI_TOKEN_ADDRESS environment variable is required')
		}
		return address
	}

	getCoreContractAddress(): string {
		const address = this.configService.get<string>('PEERAI_CORE_ADDRESS')
		if (!address) {
			throw new Error('PEERAI_CORE_ADDRESS environment variable is required')
		}
		return address
	}
}
