import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ReviewDocument = Review & Document

export enum ReviewType {
	AI_GENERATED = 'ai_generated',
	HUMAN = 'human',
	HYBRID = 'hybrid'
}

export enum ReviewStatus {
	PENDING = 'pending',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed'
}

@Schema({ timestamps: true })
export class Review {
	@Prop({ required: true })
	summary: string

	@Prop()
	detailedFeedback: string

	@Prop({ required: true, type: Number })
	rating: number

	@Prop({ type: [String], default: [] })
	strengths: string[]

	@Prop({ type: [String], default: [] })
	weaknesses: string[]

	@Prop({ type: [String], default: [] })
	recommendations: string[]

	@Prop({ 
		type: String, 
		enum: Object.values(ReviewType), 
		default: ReviewType.HUMAN 
	})
	type: ReviewType

	@Prop({ 
		type: String, 
		enum: Object.values(ReviewStatus), 
		default: ReviewStatus.PENDING 
	})
	status: ReviewStatus

	@Prop({ type: Number, default: 0 })
	tokensAwarded: number

	@Prop()
	blockchainTxHash: string

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	reviewerId: Types.ObjectId

	@Prop({ type: Types.ObjectId, ref: 'Manuscript', required: true })
	manuscriptId: Types.ObjectId
}

export const ReviewSchema = SchemaFactory.createForClass(Review)
