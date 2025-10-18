import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, unique: true })
	walletAddress: string

	@Prop()
	name: string

	@Prop()
	email: string

	@Prop()
	institution: string

	@Prop()
	researchField: string

	@Prop({ type: [String], default: [] })
	expertise: string[]

	@Prop({ type: Number, default: 0 })
	reputationScore: number

	@Prop({ type: Number, default: 0 })
	totalReviews: number

	@Prop({ type: Number, default: 0 })
	tokensEarned: number

	@Prop({ type: Boolean, default: false })
	isVerified: boolean

	@Prop({ type: [{ type: Types.ObjectId, ref: 'Manuscript' }] })
	manuscripts: Types.ObjectId[]

	@Prop({ type: [{ type: Types.ObjectId, ref: 'Review' }] })
	reviews: Types.ObjectId[]
}

export const UserSchema = SchemaFactory.createForClass(User)
