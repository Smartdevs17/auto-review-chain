import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { BlockchainService } from './blockchain.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { TransactionType, TransactionStatus } from '../schemas/transaction.schema'

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
	constructor(private readonly blockchainService: BlockchainService) {}

	@Get('transactions')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get blockchain transactions' })
	@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
	@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
	@ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
	async getTransactions(
		@Query('page') page?: number,
		@Query('limit') limit?: number,
		@Body('userId') userId?: string,
	) {
		return this.blockchainService.getTransactions(userId, page, limit)
	}

	@Get('transactions/:txHash')
	@ApiOperation({ summary: 'Get transaction by hash' })
	@ApiResponse({ status: 200, description: 'Transaction found' })
	@ApiResponse({ status: 404, description: 'Transaction not found' })
	async getTransactionByHash(@Param('txHash') txHash: string) {
		return this.blockchainService.getTransactionByHash(txHash)
	}

	@Post('record-transaction')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Record a blockchain transaction' })
	@ApiResponse({ status: 201, description: 'Transaction recorded successfully' })
	async recordTransaction(
		@Body('blockchainTxHash') blockchainTxHash: string,
		@Body('type') type: TransactionType,
		@Body('userId') userId?: string,
		@Body('amount') amount?: number,
		@Body('description') description?: string,
		@Body('metadata') metadata?: Record<string, any>,
	) {
		return this.blockchainService.recordTransaction(
			blockchainTxHash,
			type,
			userId,
			amount,
			description,
			metadata
		)
	}


	@Post('record-blockchain-transaction')
	@ApiOperation({ summary: 'Record a blockchain transaction (called by frontend after successful transaction)' })
	@ApiResponse({ status: 201, description: 'Transaction recorded successfully' })
	async recordBlockchainTransaction(
		@Body('txHash') txHash: string,
		@Body('type') type: TransactionType,
		@Body('userWalletAddress') userWalletAddress: string,
		@Body('manuscriptData') manuscriptData?: any,
		@Body('reviewData') reviewData?: any,
	) {
		await this.blockchainService.recordBlockchainTransaction(txHash, type, userWalletAddress, manuscriptData, reviewData)
		return { message: 'Transaction recorded successfully' }
	}

	@Get('user/:address/reputation')
	@ApiOperation({ summary: 'Get user reputation from blockchain' })
	@ApiResponse({ status: 200, description: 'User reputation retrieved from blockchain' })
	async getUserReputationFromBlockchain(@Param('address') address: string) {
		const reputation = await this.blockchainService.getUserReputationFromBlockchain(address)
		return { address, reputation }
	}

	@Patch('transactions/:txHash/status')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update transaction status' })
	@ApiResponse({ status: 200, description: 'Transaction status updated' })
	async updateTransactionStatus(
		@Param('txHash') txHash: string,
		@Body('status') status: TransactionStatus,
	) {
		return this.blockchainService.updateTransactionStatus(txHash, status)
	}

	@Get('user/:address/profile')
	@ApiOperation({ summary: 'Get user profile from blockchain' })
	@ApiResponse({ status: 200, description: 'User profile retrieved from blockchain' })
	async getUserProfileFromBlockchain(@Param('address') address: string) {
		return this.blockchainService.getUserProfileFromBlockchain(address)
	}

	@Get('manuscript/:id')
	@ApiOperation({ summary: 'Get manuscript from blockchain' })
	@ApiResponse({ status: 200, description: 'Manuscript retrieved from blockchain' })
	async getManuscriptFromBlockchain(@Param('id') id: string) {
		return this.blockchainService.getManuscriptFromBlockchain(parseInt(id))
	}

	@Get('token-balance/:address')
	@ApiOperation({ summary: 'Get token balance from blockchain' })
	@ApiResponse({ status: 200, description: 'Token balance retrieved from blockchain' })
	async getTokenBalance(@Param('address') address: string) {
		const balance = await this.blockchainService.getTokenBalance(address)
		return { address, balance }
	}

	@Get('contract-info')
	@ApiOperation({ summary: 'Get smart contract addresses and network info' })
	@ApiResponse({ status: 200, description: 'Contract information retrieved' })
	async getContractInfo() {
		return {
			tokenAddress: this.blockchainService.getTokenContractAddress(),
			coreAddress: this.blockchainService.getCoreContractAddress(),
			rpcUrl: this.blockchainService.getEthereumRpcUrl(),
			network: 'Sepolia Testnet',
			chainId: 11155111
		}
	}


	@Get('user/:address/is-registered')
	@ApiOperation({ summary: 'Check if user is registered on blockchain' })
	@ApiResponse({ status: 200, description: 'User registration status' })
	@ApiResponse({ status: 400, description: 'Invalid address format' })
	@ApiResponse({ status: 500, description: 'Blockchain error' })
	async isUserRegistered(@Param('address') address: string) {
		return this.blockchainService.isUserRegisteredOnBlockchain(address);
	}

	@Post('user/:address/remove')
	@ApiOperation({ summary: 'Remove user from blockchain (requires private key)' })
	@ApiResponse({ status: 200, description: 'User removed successfully' })
	@ApiResponse({ status: 400, description: 'Invalid request or user not found' })
	@ApiResponse({ status: 500, description: 'Blockchain error or no private key configured' })
	async removeUser(
		@Param('address') address: string,
		@Body('reason') reason: string = 'Testing cleanup'
	) {
		const txHash = await this.blockchainService.removeUserFromBlockchain(address, reason);
		return { 
			success: true, 
			message: 'User removed from blockchain successfully',
			transactionHash: txHash
		};
	}
}
