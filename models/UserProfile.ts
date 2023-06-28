import { Schema, model, models } from "mongoose";
import { getRandomColor } from "../helpers/global-helpers";

export interface UserProfileProps {
	avatar_url?: string;
	display_name: string;
	account_name: string;
	bio?: string;
	color: string;
	timestamp: Date;
}

const UserProfileSchema = new Schema<UserProfileProps>({
	account_name: { type: String, required: true },
	display_name: { type: String, required: true },
	avatar_url: { type: String, default: "" },
	bio: { type: String, default: "Hello, I just joined ANON" },
	color: { type: String, required: true, default: getRandomColor() },
	timestamp: { type: Date, default: Date.now() },
});

export default models.UserProfile ||
	model<UserProfileProps>("UserProfile", UserProfileSchema);
