import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { normalizeWalletAddress } from '../utils/address.util'

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateWallet(walletAddress: string): Promise<any> {
		// Normalize wallet address for consistent lookup
		const normalizedAddress = normalizeWalletAddress(walletAddress)
		
		try {
			const user = await this.usersService.findByWalletAddress(normalizedAddress)
			return user
		} catch (error) {
			// User doesn't exist, create new user
			const createUserDto: CreateUserDto = {
				walletAddress: normalizedAddress,
			}
			return this.usersService.create(createUserDto)
		}
	}

	async login(walletAddress: string) {
		const user = await this.validateWallet(walletAddress)
		
		const payload = { 
			walletAddress: user.walletAddress, 
			sub: user._id,
			userId: user._id 
		}
		
		return {
			access_token: this.jwtService.sign(payload),
			user: {
				id: user._id,
				walletAddress: user.walletAddress,
				name: user.name,
				email: user.email,
				institution: user.institution,
				researchField: user.researchField,
				expertise: user.expertise,
				reputationScore: user.reputationScore,
				totalReviews: user.totalReviews,
				tokensEarned: user.tokensEarned,
				isVerified: user.isVerified,
			},
		}
	}

	async verifyToken(token: string) {
		try {
			return this.jwtService.verify(token)
		} catch (error) {
			throw new UnauthorizedException('Invalid token')
		}
	}
}
