import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Manuscript, ManuscriptDocument } from '../schemas/manuscript.schema'
import { CreateManuscriptDto } from '../dto/create-manuscript.dto'
import { ManuscriptStatus } from '../schemas/manuscript.schema'
import { UsersService } from '../users/users.service'
import { BlockchainService } from '../blockchain/blockchain.service'

@Injectable()
export class ManuscriptsService {
	constructor(
		@InjectModel(Manuscript.name) private manuscriptModel: Model<ManuscriptDocument>,
		private usersService: UsersService,
		private blockchainService: BlockchainService,
	) {}

	async create(createManuscriptDto: CreateManuscriptDto, authorId: string): Promise<Manuscript> {
		// Get user to check wallet address
		const user = await this.usersService.findOne(authorId)
		if (!user) {
			throw new NotFoundException('User not found')
		}

		// Check if user is registered on blockchain before allowing manuscript submission
		try {
			await this.blockchainService.getUserProfileFromBlockchain(user.walletAddress)
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new BadRequestException('You must be registered on the blockchain before submitting manuscripts. Please complete your profile registration first.')
			}
			throw error
		}

		const manuscript = new this.manuscriptModel({
			...createManuscriptDto,
			authorId: new Types.ObjectId(authorId),
		})
		return manuscript.save()
	}

	async findAll(page: number = 1, limit: number = 10, search?: string, field?: string): Promise<{ manuscripts: Manuscript[], total: number }> {
		const query: any = {}
		
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ authors: { $regex: search, $options: 'i' } },
				{ abstract: { $regex: search, $options: 'i' } },
			]
		}
		
		if (field) {
			query.researchField = { $regex: field, $options: 'i' }
		}

		const skip = (page - 1) * limit
		const manuscripts = await this.manuscriptModel
			.find(query)
			.populate('authorId', 'name walletAddress institution')
			.populate('reviews')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.exec()

		const total = await this.manuscriptModel.countDocuments(query).exec()

		return { manuscripts, total }
	}

	async findOne(id: string): Promise<Manuscript> {
		const manuscript = await this.manuscriptModel
			.findById(id)
			.populate('authorId', 'name walletAddress institution researchField')
			.populate('reviews')
			.exec()
		
		if (!manuscript) {
			throw new NotFoundException('Manuscript not found')
		}
		return manuscript
	}

	async findByAuthor(authorId: string): Promise<Manuscript[]> {
		return this.manuscriptModel
			.find({ authorId: new Types.ObjectId(authorId) })
			.populate('reviews')
			.sort({ createdAt: -1 })
			.exec()
	}

	async update(id: string, updateData: Partial<Manuscript>): Promise<Manuscript> {
		const manuscript = await this.manuscriptModel.findByIdAndUpdate(id, updateData, { new: true }).exec()
		if (!manuscript) {
			throw new NotFoundException('Manuscript not found')
		}
		return manuscript
	}

	async updateStatus(id: string, status: ManuscriptStatus): Promise<Manuscript> {
		return this.update(id, { status })
	}

	async updateRating(id: string, newRating: number): Promise<Manuscript> {
		const manuscript = await this.findOne(id)
		const reviewCount = manuscript.reviewCount + 1
		const averageRating = ((manuscript.averageRating * manuscript.reviewCount) + newRating) / reviewCount
		
		return this.update(id, {
			averageRating,
			reviewCount,
		})
	}

	async remove(id: string): Promise<void> {
		const result = await this.manuscriptModel.findByIdAndDelete(id).exec()
		if (!result) {
			throw new NotFoundException('Manuscript not found')
		}
	}
}
