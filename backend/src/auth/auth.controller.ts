import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('wallet-connect')
	@ApiOperation({ summary: 'Connect wallet and authenticate user' })
	@ApiResponse({ status: 200, description: 'Authentication successful' })
	@ApiResponse({ status: 401, description: 'Authentication failed' })
	async walletConnect(@Body('walletAddress') walletAddress: string) {
		if (!walletAddress) {
			throw new Error('Wallet address is required')
		}
		return this.authService.login(walletAddress)
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get current user profile' })
	@ApiResponse({ status: 200, description: 'User profile retrieved' })
	async getProfile(@Request() req) {
		return req.user
	}

	@Post('verify-token')
	@ApiOperation({ summary: 'Verify JWT token' })
	@ApiResponse({ status: 200, description: 'Token is valid' })
	@ApiResponse({ status: 401, description: 'Token is invalid' })
	async verifyToken(@Body('token') token: string) {
		return this.authService.verifyToken(token)
	}
}
