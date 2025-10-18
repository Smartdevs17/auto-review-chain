import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { ManuscriptsModule } from './manuscripts/manuscripts.module'
import { ReviewsModule } from './reviews/reviews.module'
import { AuthModule } from './auth/auth.module'
import { BlockchainModule } from './blockchain/blockchain.module'
import { AiModule } from './ai/ai.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/peerai'),
		UsersModule,
		ManuscriptsModule,
		ReviewsModule,
		AuthModule,
		BlockchainModule,
		AiModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}