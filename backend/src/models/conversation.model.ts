import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
	participants: mongoose.Types.ObjectId[];
	lastReadAt: mongoose.Types.Map<Date>;
	unreadCount: mongoose.Types.Map<number>;
	lastMessageAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
	{
		participants: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
		],
		lastReadAt: {
			type: Map,
			of: Date,
			default: {},
		},
		unreadCount: {
			type: Map,
			of: Number,
			default: {},
		},
		lastMessageAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

// Index for sorting by last message
conversationSchema.index({ lastMessageAt: -1 });

// Note: To ensure uniqueness of the participants pair,
// we should always sort the IDs before saving/querying.
conversationSchema.index({ participants: 1 }, { unique: true });

export default mongoose.model<IConversation>("Conversation", conversationSchema);
