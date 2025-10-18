import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ManuscriptsController } from 'src/manuscripts/manuscripts.controller'
import { ManuscriptsService } from 'src/manuscripts/manuscripts.service'
import { Manuscript, ManuscriptSchema } from '../schemas/manuscript.schema'
import { UsersModule } from '../users/users.module'
import { BlockchainModule } from '../blockchain/blockchain.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Manuscript.name, schema: ManuscriptSchema }]),
		UsersModule,
		BlockchainModule,
	],
	controllers: [ManuscriptsController],
	providers: [ManuscriptsService],
	exports: [ManuscriptsService],
})
export class ManuscriptsModule {}
