import mongoose, { Model } from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

export type AuthProvider = "email" | "google";

export interface IUser {
	firstName: string;
	lastName?: string;
	email: string;
	password?: string;
	picture?: string;
	authProvider: AuthProvider;
	createdAt: Date;
	updatedAt: Date;
	pinnedChats: mongoose.Types.ObjectId[];
}

interface IUserModel extends Model<IUser> {
	comparePassword(
		plainPassword: string,
		hashedPassword: string,
	): Promise<boolean>;
}

const userSchema = new Schema<IUser, IUserModel>(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String, trim: true },
		picture: { type: String, default: "" },
		authProvider: {
			type: String,
			enum: ["email", "google"],
			default: "email",
		},
		pinnedChats: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
	},
	{ timestamps: true },
);

userSchema.pre("save", async function () {
	if (!this.isModified("password") || !this.password) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

userSchema.statics.comparePassword = async function (
	plainPassword: string,
	hashedPassword: string,
) {
	if (!hashedPassword) return false;
	return await bcrypt.compare(plainPassword, hashedPassword);
};

userSchema.methods.toJSON = function () {
	const user = this.toObject();
	delete user.password;
	delete user.__v;
	return user;
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
