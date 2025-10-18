import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Review, ReviewDocument } from '../schemas/review.schema'
import { CreateReviewDto } from '../dto/create-review.dto'
import { UsersService } from '../users/users.service'
import { ManuscriptsService } from '../manuscripts/manuscripts.service'
import { BlockchainService } from '../blockchain/blockchain.service'
import { ReviewStatus, ReviewType } from '../schemas/review.schema'

@Injectable()
export class ReviewsService {
	constructor(
		@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
		private usersService: UsersService,
		private manuscriptsService: ManuscriptsService,
		private blockchainService: BlockchainService,
	) {}

	async create(createReviewDto: CreateReviewDto, reviewerId: string): Promise<Review> {
		// Check if manuscript exists
		await this.manuscriptsService.findOne(createReviewDto.manuscriptId)
		
		// Get user to check wallet address
		const user = await this.usersService.findOne(reviewerId)
		if (!user) {
			throw new NotFoundException('User not found')
		}

		// Check if user is registered on blockchain before allowing review submission
		try {
			await this.blockchainService.getUserProfileFromBlockchain(user.walletAddress)
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new BadRequestException('You must be registered on the blockchain before submitting reviews. Please complete your profile registration first.')
			}
			throw error
		}
		
		// Check if user already reviewed this manuscript
		const existingReview = await this.reviewModel.findOne({
			manuscriptId: new Types.ObjectId(createReviewDto.manuscriptId),
			reviewerId: new Types.ObjectId(reviewerId),
		}).exec()

		if (existingReview) {
			throw new BadRequestException('You have already reviewed this manuscript')
		}

		const review = new this.reviewModel({
			...createReviewDto,
			reviewerId: new Types.ObjectId(reviewerId),
			manuscriptId: new Types.ObjectId(createReviewDto.manuscriptId),
			status: ReviewStatus.COMPLETED,
		})

		const savedReview = await review.save()

		// Update manuscript rating
		await this.manuscriptsService.updateRating(createReviewDto.manuscriptId, createReviewDto.rating)

		// Update reviewer reputation
		await this.usersService.updateReputation(reviewerId, createReviewDto.rating)

		// Award tokens
		const tokensAwarded = parseInt(process.env.TOKEN_REWARD_PER_REVIEW || '100')
		await this.usersService.addTokens(reviewerId, tokensAwarded)

		return savedReview
	}

	async findAll(page: number = 1, limit: number = 10, status?: ReviewStatus): Promise<{ reviews: Review[], total: number }> {
		const query: any = {}
		if (status) {
			query.status = status
		}

		const skip = (page - 1) * limit
		const reviews = await this.reviewModel
			.find(query)
			.populate('reviewerId', 'name walletAddress reputationScore')
			.populate('manuscriptId', 'title authors researchField')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec()

		const total = await this.reviewModel.countDocuments(query).exec()

		return { reviews, total }
	}

	async findOne(id: string): Promise<Review> {
		const review = await this.reviewModel
			.findById(id)
			.populate('reviewerId', 'name walletAddress reputationScore')
			.populate('manuscriptId', 'title authors abstract researchField')
			.exec()
		
		if (!review) {
			throw new NotFoundException('Review not found')
		}
		return review
	}

	async findByManuscript(manuscriptId: string): Promise<Review[]> {
		return this.reviewModel
			.find({ manuscriptId: new Types.ObjectId(manuscriptId) })
			.populate('reviewerId', 'name walletAddress reputationScore')
			.sort({ createdAt: -1 })
			.exec()
	}

	async findByReviewer(reviewerId: string): Promise<Review[]> {
		return this.reviewModel
			.find({ reviewerId: new Types.ObjectId(reviewerId) })
			.populate('manuscriptId', 'title authors researchField')
			.sort({ createdAt: -1 })
			.exec()
	}

	async update(id: string, updateData: Partial<Review>): Promise<Review> {
		const review = await this.reviewModel.findByIdAndUpdate(id, updateData, { new: true }).exec()
		if (!review) {
			throw new NotFoundException('Review not found')
		}
		return review
	}

	async updateStatus(id: string, status: ReviewStatus): Promise<Review> {
		return this.update(id, { status })
	}

	async generateAiReview(manuscriptId: string): Promise<Review> {
		// This will be implemented with AI service
		const manuscript = await this.manuscriptsService.findOne(manuscriptId)
		
		// Mock AI review for now
		const aiReview = {
			summary: `AI-generated review for "${manuscript.title}". This research presents interesting findings in the field of ${manuscript.researchField}.`,
			detailedFeedback: 'The methodology appears sound and the results are well-presented. Some areas for improvement include expanding the literature review and providing more detailed statistical analysis.',
			rating: 4.0,
			strengths: ['Clear methodology', 'Well-structured presentation', 'Relevant research question'],
			weaknesses: ['Limited literature review', 'Small sample size', 'Missing statistical tests'],
			recommendations: ['Expand literature review', 'Increase sample size', 'Add statistical analysis'],
			type: ReviewType.AI_GENERATED,
			status: ReviewStatus.COMPLETED,
			manuscriptId: new Types.ObjectId(manuscriptId),
			reviewerId: null, // AI reviewer
		}

		const review = new this.reviewModel(aiReview)
		const savedReview = await review.save()

		// Update manuscript rating
		await this.manuscriptsService.updateRating(manuscriptId, aiReview.rating)

		return savedReview
	}

	async remove(id: string): Promise<void> {
		const result = await this.reviewModel.findByIdAndDelete(id).exec()
		if (!result) {
			throw new NotFoundException('Review not found')
		}
	}
}
