import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UnauthorizedException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { ManuscriptsService } from './manuscripts.service'
import { CreateManuscriptDto } from '../dto/create-manuscript.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ManuscriptStatus } from '../schemas/manuscript.schema'

@ApiTags('manuscripts')
@Controller('manuscripts')
export class ManuscriptsController {
	constructor(private readonly manuscriptsService: ManuscriptsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Submit a new manuscript' })
	@ApiResponse({ status: 201, description: 'Manuscript submitted successfully' })
	async create(@Body() createManuscriptDto: CreateManuscriptDto, @Request() req: any) {
		// Extract the authenticated user's ID from the JWT token
		const authorId = req.user.userId
		return this.manuscriptsService.create(createManuscriptDto, authorId)
	}

	@Get()
	@ApiOperation({ summary: 'Get all manuscripts with pagination and search' })
	@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
	@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
	@ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
	@ApiQuery({ name: 'field', required: false, type: String, description: 'Research field filter' })
	@ApiResponse({ status: 200, description: 'List of manuscripts' })
	async findAll(
		@Query('page') page?: number,
		@Query('limit') limit?: number,
		@Query('search') search?: string,
		@Query('field') field?: string,
	) {
		return this.manuscriptsService.findAll(page, limit, search, field)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get manuscript by ID' })
	@ApiResponse({ status: 200, description: 'Manuscript found' })
	@ApiResponse({ status: 404, description: 'Manuscript not found' })
	async findOne(@Param('id') id: string) {
		return this.manuscriptsService.findOne(id)
	}

	@Get('author/:authorId')
	@ApiOperation({ summary: 'Get manuscripts by author ID' })
	@ApiResponse({ status: 200, description: 'Author manuscripts found' })
	async findByAuthor(@Param('authorId') authorId: string) {
		return this.manuscriptsService.findByAuthor(authorId)
	}

	@Get('my-manuscripts')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get current user manuscripts' })
	@ApiResponse({ status: 200, description: 'User manuscripts found' })
	async findMyManuscripts(@Request() req: any) {
		const authorId = req.user.userId
		return this.manuscriptsService.findByAuthor(authorId)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update manuscript' })
	@ApiResponse({ status: 200, description: 'Manuscript updated successfully' })
	async update(@Param('id') id: string, @Body() updateData: any, @Request() req: any) {
		// First get the manuscript to check ownership
		const manuscript = await this.manuscriptsService.findOne(id)
		const userId = req.user.userId
		
		// Check if the user is the author
		// Handle both populated and non-populated authorId
		const authorId = typeof manuscript.authorId === 'object' && manuscript.authorId._id 
			? manuscript.authorId._id.toString() 
			: manuscript.authorId.toString()
		
		// Ensure both IDs are strings for comparison
		const userIdString = userId.toString()
		const authorIdString = authorId.toString()
		
		if (authorIdString !== userIdString) {
			throw new UnauthorizedException('You can only update your own manuscripts')
		}
		
		return this.manuscriptsService.update(id, updateData)
	}

	@Patch(':id/status')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update manuscript status' })
	@ApiResponse({ status: 200, description: 'Status updated successfully' })
	async updateStatus(@Param('id') id: string, @Body('status') status: ManuscriptStatus) {
		return this.manuscriptsService.updateStatus(id, status)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete manuscript' })
	@ApiResponse({ status: 200, description: 'Manuscript deleted successfully' })
	async remove(@Param('id') id: string, @Request() req: any) {
		// First get the manuscript to check ownership
		const manuscript = await this.manuscriptsService.findOne(id)
		const userId = req.user.userId
		
		// Check if the user is the author
		// Handle both populated and non-populated authorId
		const authorId = typeof manuscript.authorId === 'object' && manuscript.authorId._id 
			? manuscript.authorId._id.toString() 
			: manuscript.authorId.toString()
		
		// Ensure both IDs are strings for comparison
		const userIdString = userId.toString()
		const authorIdString = authorId.toString()
		
		if (authorIdString !== userIdString) {
			throw new UnauthorizedException('You can only delete your own manuscripts')
		}
		
		await this.manuscriptsService.remove(id)
		return { message: 'Manuscript deleted successfully' }
	}
}
