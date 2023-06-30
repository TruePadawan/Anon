// import dbConnect from "../../../lib/db-connect";
import UserProfile from "../../../models/UserProfile";

// Account name is valid if it's unique in database
export async function validateAccountName(value: string) {
	if (!value) return false;

	const count = await UserProfile.countDocuments({
		account_name: value,
	}).exec();

	return count === 0;
}
