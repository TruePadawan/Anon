import { authOptions } from "../../../lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import dbConnect from "../../../lib/db-connect";
import UserProfile from "../../../models/UserProfile";
import { getRandomInt } from "../../../helpers/global-helpers";

/*	If there is a session
		create default profile for user if none,
		else redirect to profile page
*/
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);

	if (session) {
		const userID = session.user.id;
		await dbConnect();

		const profile = await UserProfile.findById(userID, "account_name");
		if (profile !== null) {
			res.redirect("/");
		} else {
			const displayName = session?.user.name;
			const accountName = `${session?.user.email
				?.split("@")
				.at(0)}${getRandomInt(100000000)}`;

			const defaultProfile = new UserProfile({
				_id: userID,
				account_name: accountName,
				display_name: displayName,
			});
			await defaultProfile.save();
			// should redirect to user profile
			// res.redirect(`/users/${profile.account_name}`);
			res.redirect("/");
		}
	} else {
		res.redirect("/sign_in");
	}
}
