import { Schema, model, models } from "mongoose";
import { getRandomColor } from "../helpers/global-helpers";

export interface UserProfile {
	avatar_url?: string;
	display_name: string;
	account_name: string;
	bio?: string;
	color: string;
	timestamp: Date;
}

const UserProfileSchema = new Schema<UserProfile>({
	account_name: { type: String, required: true },
	display_name: { type: String, required: true },
	avatar_url: { type: String },
	bio: { type: String },
	color: { type: String, required: true, default: getRandomColor() },
	timestamp: { type: Date, default: Date.now() },
});

export default models.UserProfile ||
	model<UserProfile>("UserProfile", UserProfileSchema);
