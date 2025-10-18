import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { CreateUserDto } from '../dto/create-user.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new user' })
	@ApiResponse({ status: 201, description: 'User created successfully' })
	@ApiResponse({ status: 409, description: 'User with this wallet address already exists' })
	async create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto)
	}

	@Post('create-or-update')
	@ApiOperation({ summary: 'Create a new user or update existing one' })
	@ApiResponse({ status: 201, description: 'User created or updated successfully' })
	async createOrUpdate(@Body() createUserDto: CreateUserDto) {
		return this.usersService.createOrUpdate(createUserDto)
	}

	@Get()
	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({ status: 200, description: 'List of all users' })
	async findAll() {
		return this.usersService.findAll()
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get user by ID' })
	@ApiResponse({ status: 200, description: 'User found' })
	@ApiResponse({ status: 404, description: 'User not found' })
	async findOne(@Param('id') id: string) {
		return this.usersService.findOne(id)
	}

	@Get('wallet/:address')
	@ApiOperation({ summary: 'Get user by wallet address' })
	@ApiResponse({ status: 200, description: 'User found' })
	@ApiResponse({ status: 404, description: 'User not found' })
	async findByWalletAddress(@Param('address') address: string) {
		return this.usersService.findByWalletAddress(address)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update user profile' })
	@ApiResponse({ status: 200, description: 'User updated successfully' })
	async update(@Param('id') id: string, @Body() updateData: any) {
		return this.usersService.update(id, updateData)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete user' })
	@ApiResponse({ status: 200, description: 'User deleted successfully' })
	async remove(@Param('id') id: string) {
		await this.usersService.remove(id)
		return { message: 'User deleted successfully' }
	}
}
