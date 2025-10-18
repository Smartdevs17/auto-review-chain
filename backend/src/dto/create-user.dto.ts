import { IsString, IsEmail, IsOptional, IsArray, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
	@ApiProperty({ description: 'Wallet address of the user' })
	@IsString()
	walletAddress: string

	@ApiPropertyOptional({ description: 'Full name of the user' })
	@IsOptional()
	@IsString()
	name?: string

	@ApiPropertyOptional({ description: 'Email address' })
	@IsOptional()
	@IsEmail()
	email?: string

	@ApiPropertyOptional({ description: 'Institution or organization' })
	@IsOptional()
	@IsString()
	institution?: string

	@ApiPropertyOptional({ description: 'Primary research field' })
	@IsOptional()
	@IsString()
	researchField?: string

	@ApiPropertyOptional({ description: 'Areas of expertise', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	expertise?: string[]
}
