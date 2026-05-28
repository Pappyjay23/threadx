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

// Ensure participants are always sorted before saving
conversationSchema.pre("save", function () {
	this.participants.sort((a, b) => a.toString().localeCompare(b.toString()));
});

// Compound unique index on both participant slots
// This ensures the pair is unique, not individual IDs
conversationSchema.index(
	{ "participants.0": 1, "participants.1": 1 },
	{ unique: true },
);

export default mongoose.model<IConversation>(
	"Conversation",
	conversationSchema,
);
