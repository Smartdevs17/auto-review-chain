import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto } from '../dto/create-review.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ReviewStatus } from '../schemas/review.schema'

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Submit a new review' })
	@ApiResponse({ status: 201, description: 'Review submitted successfully' })
	async create(@Body() createReviewDto: CreateReviewDto, @Request() req: any) {
		// Extract the authenticated user's ID from the JWT token
		const reviewerId = req.user.userId
		return this.reviewsService.create(createReviewDto, reviewerId)
	}

	@Get()
	@ApiOperation({ summary: 'Get all reviews with pagination' })
	@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
	@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
	@ApiQuery({ name: 'status', required: false, enum: ReviewStatus, description: 'Review status filter' })
	@ApiResponse({ status: 200, description: 'List of reviews' })
	async findAll(
		@Query('page') page?: number,
		@Query('limit') limit?: number,
		@Query('status') status?: ReviewStatus,
	) {
		return this.reviewsService.findAll(page, limit, status)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get review by ID' })
	@ApiResponse({ status: 200, description: 'Review found' })
	@ApiResponse({ status: 404, description: 'Review not found' })
	async findOne(@Param('id') id: string) {
		return this.reviewsService.findOne(id)
	}

	@Get('manuscript/:manuscriptId')
	@ApiOperation({ summary: 'Get reviews for a specific manuscript' })
	@ApiResponse({ status: 200, description: 'Reviews found' })
	async findByManuscript(@Param('manuscriptId') manuscriptId: string) {
		return this.reviewsService.findByManuscript(manuscriptId)
	}

	@Get('reviewer/:reviewerId')
	@ApiOperation({ summary: 'Get reviews by a specific reviewer' })
	@ApiResponse({ status: 200, description: 'Reviews found' })
	async findByReviewer(@Param('reviewerId') reviewerId: string) {
		return this.reviewsService.findByReviewer(reviewerId)
	}

	@Post('ai/:manuscriptId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Generate AI review for a manuscript' })
	@ApiResponse({ status: 201, description: 'AI review generated successfully' })
	async generateAiReview(@Param('manuscriptId') manuscriptId: string) {
		return this.reviewsService.generateAiReview(manuscriptId)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update review' })
	@ApiResponse({ status: 200, description: 'Review updated successfully' })
	async update(@Param('id') id: string, @Body() updateData: any) {
		return this.reviewsService.update(id, updateData)
	}

	@Patch(':id/status')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update review status' })
	@ApiResponse({ status: 200, description: 'Status updated successfully' })
	async updateStatus(@Param('id') id: string, @Body('status') status: ReviewStatus) {
		return this.reviewsService.updateStatus(id, status)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete review' })
	@ApiResponse({ status: 200, description: 'Review deleted successfully' })
	async remove(@Param('id') id: string) {
		await this.reviewsService.remove(id)
		return { message: 'Review deleted successfully' }
	}
}
