import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ManuscriptDocument = Manuscript & Document

export enum ManuscriptStatus {
	SUBMITTED = 'submitted',
	UNDER_REVIEW = 'under_review',
	REVIEWED = 'reviewed',
	PUBLISHED = 'published',
	REJECTED = 'rejected'
}

@Schema({ timestamps: true })
export class Manuscript {
	@Prop({ required: true })
	title: string

	@Prop({ required: true })
	abstract: string

	@Prop({ required: true })
	authors: string

	@Prop({ required: true })
	researchField: string

	@Prop({ type: [String], default: [] })
	keywords: string[]

	@Prop()
	fileHash: string

	@Prop()
	fileUrl: string

	@Prop({ 
		type: String, 
		enum: Object.values(ManuscriptStatus), 
		default: ManuscriptStatus.SUBMITTED 
	})
	status: ManuscriptStatus

	@Prop({ type: Number, default: 0 })
	averageRating: number

	@Prop({ type: Number, default: 0 })
	reviewCount: number

	@Prop()
	blockchainTxHash: string

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	authorId: Types.ObjectId

	@Prop({ type: [{ type: Types.ObjectId, ref: 'Review' }] })
	reviews: Types.ObjectId[]
}

export const ManuscriptSchema = SchemaFactory.createForClass(Manuscript)
