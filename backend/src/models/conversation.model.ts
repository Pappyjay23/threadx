import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
	participants: mongoose.Types.ObjectId[];
	type: "direct" | "group";
	name?: string;
	groupAvatar?: string;
	admin?: mongoose.Types.ObjectId;
	hidden: mongoose.Types.Map<boolean>;
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
		type: {
			type: String,
			enum: ["direct", "group"],
			default: "direct",
		},
		name: {
			type: String,
			trim: true,
		},
		groupAvatar: {
			type: String,
		},
		admin: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
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
		hidden: {
			type: Map,
			of: Boolean,
			default: {},
		},
	},
	{ timestamps: true },
);

// Index for sorting chats by last message
conversationSchema.index({ lastMessageAt: -1 });

// Index for finding all conversations a user participates in
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

export default mongoose.model<IConversation>(
	"Conversation",
	conversationSchema,
);
