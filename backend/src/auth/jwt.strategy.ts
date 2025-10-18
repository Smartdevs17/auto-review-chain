import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private usersService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
		})
	}

	async validate(payload: any) {
		const user = await this.usersService.findOne(payload.sub)
		return {
			userId: (user as any)._id,
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
		}
	}
}
