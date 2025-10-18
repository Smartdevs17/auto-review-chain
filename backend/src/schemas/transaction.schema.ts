import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TransactionDocument = Transaction & Document

export enum TransactionType {
	USER_REGISTRATION = 'user_registration',
	USER_REMOVAL = 'user_removal',
	MANUSCRIPT_SUBMISSION = 'manuscript_submission',
	REVIEW_REWARD = 'review_reward',
	REPUTATION_UPDATE = 'reputation_update',
	TOKEN_TRANSFER = 'token_transfer'
}

export enum TransactionStatus {
	PENDING = 'pending',
	CONFIRMED = 'confirmed',
	FAILED = 'failed'
}

@Schema({ timestamps: true })
export class Transaction {
	@Prop({ required: true, unique: true })
	blockchainTxHash: string

	@Prop({ 
		type: String, 
		enum: Object.values(TransactionType), 
		required: true 
	})
	type: TransactionType

	@Prop({ 
		type: String, 
		enum: Object.values(TransactionStatus), 
		default: TransactionStatus.PENDING 
	})
	status: TransactionStatus

	@Prop({ type: Number, default: 0 })
	amount: number

	@Prop()
	description: string

	@Prop({ type: Object })
	metadata: Record<string, any>

	@Prop({ type: Types.ObjectId, ref: 'User' })
	userId: Types.ObjectId
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)
