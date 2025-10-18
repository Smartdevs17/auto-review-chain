import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ManuscriptStatus } from '../schemas/manuscript.schema'

export class CreateManuscriptDto {
	@ApiProperty({ description: 'Title of the research paper' })
	@IsString()
	title: string

	@ApiProperty({ description: 'Abstract of the paper' })
	@IsString()
	abstract: string

	@ApiProperty({ description: 'Authors of the paper' })
	@IsString()
	authors: string

	@ApiProperty({ description: 'Research field or discipline' })
	@IsString()
	researchField: string

	@ApiPropertyOptional({ description: 'Keywords related to the research', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	keywords?: string[]

	@ApiPropertyOptional({ description: 'File hash for the uploaded manuscript' })
	@IsOptional()
	@IsString()
	fileHash?: string

	@ApiPropertyOptional({ description: 'URL to the manuscript file' })
	@IsOptional()
	@IsString()
	fileUrl?: string

	@ApiPropertyOptional({ 
		description: 'Status of the manuscript',
		enum: ManuscriptStatus,
		default: ManuscriptStatus.SUBMITTED
	})
	@IsOptional()
	@IsEnum(ManuscriptStatus)
	status?: ManuscriptStatus
}
