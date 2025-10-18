import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AiService } from './ai.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@ApiTags('ai')
@Controller('ai')
export class AiController {
	constructor(private readonly aiService: AiService) {}

	@Post('generate-review')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Generate AI review for a manuscript' })
	@ApiResponse({ status: 201, description: 'AI review generated successfully' })
	async generateReview(@Body('manuscript') manuscript: any) {
		return this.aiService.generateReview(manuscript)
	}

	@Post('analyze-manuscript')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Analyze manuscript content and structure' })
	@ApiResponse({ status: 200, description: 'Manuscript analysis completed' })
	async analyzeManuscript(@Body('manuscript') manuscript: any) {
		return this.aiService.analyzeManuscript(manuscript)
	}
}
