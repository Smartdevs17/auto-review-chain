import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../schemas/user.schema'
import { CreateUserDto } from '../dto/create-user.dto'
import { normalizeWalletAddress } from '../utils/address.util'

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		// Normalize wallet address for consistent storage
		const normalizedAddress = normalizeWalletAddress(createUserDto.walletAddress)
		const userData = { ...createUserDto, walletAddress: normalizedAddress }
		
		// Check if user with this wallet address already exists
		const existingUser = await this.userModel.findOne({ 
			walletAddress: normalizedAddress 
		}).exec()
		
		if (existingUser) {
			throw new ConflictException(`User with wallet address ${normalizedAddress} already exists`)
		}
		
		const createdUser = new this.userModel(userData)
		return createdUser.save()
	}

	async createOrUpdate(createUserDto: CreateUserDto): Promise<User> {
		// Normalize wallet address for consistent storage
		const normalizedAddress = normalizeWalletAddress(createUserDto.walletAddress)
		const userData = { ...createUserDto, walletAddress: normalizedAddress }
		
		// Find existing user by wallet address
		const existingUser = await this.userModel.findOne({ 
			walletAddress: normalizedAddress 
		}).exec()
		
		if (existingUser) {
			// Update existing user with new data
			const updatedUser = await this.userModel.findByIdAndUpdate(
				existingUser._id, 
				userData, 
				{ new: true }
			).exec()
			return updatedUser as User;
		} else {
			// Create new user
			const createdUser = new this.userModel(userData)
			return createdUser.save()
		}
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().populate('manuscripts reviews').exec()
	}

	async findOne(id: string): Promise<User> {
		const user = await this.userModel.findById(id).populate('manuscripts reviews').exec()
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return user
	}

	async findByWalletAddress(walletAddress: string): Promise<User> {
		// Normalize wallet address for consistent lookup
		const normalizedAddress = normalizeWalletAddress(walletAddress)
		const user = await this.userModel.findOne({ walletAddress: normalizedAddress }).populate('manuscripts reviews').exec()
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return user
	}

	async update(id: string, updateData: Partial<User>): Promise<User> {
		const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec()
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return user
	}

	async updateReputation(id: string, newRating: number): Promise<User> {
		const user = await this.findOne(id)
		const totalReviews = user.totalReviews + 1
		const newReputationScore = ((user.reputationScore * user.totalReviews) + newRating) / totalReviews
		
		return this.update(id, {
			reputationScore: newReputationScore,
			totalReviews,
		})
	}

	async addTokens(id: string, tokens: number): Promise<User> {
		const user = await this.findOne(id)
		return this.update(id, {
			tokensEarned: user.tokensEarned + tokens,
		})
	}

	async remove(id: string): Promise<void> {
		const result = await this.userModel.findByIdAndDelete(id).exec()
		if (!result) {
			throw new NotFoundException('User not found')
		}
	}
}
