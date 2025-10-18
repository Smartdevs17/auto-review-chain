import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { BlockchainController } from 'src/blockchain/blockchain.controller'
import { BlockchainService } from 'src/blockchain/blockchain.service'
import { Transaction, TransactionSchema } from '../schemas/transaction.schema'

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }])
	],
	controllers: [BlockchainController],
	providers: [BlockchainService],
	exports: [BlockchainService],
})
export class BlockchainModule {}
