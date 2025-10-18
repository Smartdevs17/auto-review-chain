import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiController } from 'src/ai/ai.controller'
import { AiService } from 'src/ai/ai.service'

@Module({
	imports: [ConfigModule],
	controllers: [AiController],
	providers: [AiService],
	exports: [AiService],
})
export class AiModule {}
