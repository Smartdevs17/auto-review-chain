import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ReviewsController } from 'src/reviews/reviews.controller'
import { ReviewsService } from 'src/reviews/reviews.service'
import { Review, ReviewSchema } from '../schemas/review.schema'
import { UsersModule } from '../users/users.module'
import { ManuscriptsModule } from '../manuscripts/manuscripts.module'
import { BlockchainModule } from '../blockchain/blockchain.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
		UsersModule,
		ManuscriptsModule,
		BlockchainModule,
	],
	controllers: [ReviewsController],
	providers: [ReviewsService],
	exports: [ReviewsService],
})
export class ReviewsModule {}
