import { IsString, IsNumber, IsArray, IsOptional, IsEnum, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ReviewType, ReviewStatus } from '../schemas/review.schema'

export class CreateReviewDto {
	@ApiProperty({ description: 'Summary of the review' })
	@IsString()
	summary: string

	@ApiPropertyOptional({ description: 'Detailed feedback' })
	@IsOptional()
	@IsString()
	detailedFeedback?: string

	@ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
	@IsNumber()
	@Min(1)
	@Max(5)
	rating: number

	@ApiPropertyOptional({ description: 'Strengths of the manuscript', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	strengths?: string[]

	@ApiPropertyOptional({ description: 'Weaknesses of the manuscript', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	weaknesses?: string[]

	@ApiPropertyOptional({ description: 'Recommendations for improvement', type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	recommendations?: string[]

	@ApiPropertyOptional({ 
		description: 'Type of review',
		enum: ReviewType,
		default: ReviewType.HUMAN
	})
	@IsOptional()
	@IsEnum(ReviewType)
	type?: ReviewType

	@ApiProperty({ description: 'ID of the manuscript being reviewed' })
	@IsString()
	manuscriptId: string
}
