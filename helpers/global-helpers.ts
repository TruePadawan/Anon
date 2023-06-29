import randomColor from "randomcolor";
import UserProfile from "../models/UserProfile";

export function getRandomColor() {
	return randomColor({
		luminosity: "random",
		hue: "random",
	});
}

export function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

export async function getNavbarUserProp(userID: string) {
	const userProfile = await UserProfile.findById(
		userID,
		"display_name account_name"
	).exec();

	if (userProfile === null) {
		return null;
	}
	return {
		accountName: userProfile.account_name,
		displayName: userProfile.display_name,
	};
}
