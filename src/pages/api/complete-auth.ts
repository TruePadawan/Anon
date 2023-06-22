import { authOptions } from "../../../lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import dbConnect from "../../../lib/db-connect";
import UserProfile from "../../../models/UserProfile";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);

	if (session) {
		const userID = session.user.id;
		await dbConnect();

		const displayName = session?.user.name;
		const accountName = session?.user.email?.split("@").at(0);
		const defaultProfile = new UserProfile({
			_id: userID,
			account_name: accountName,
			display_name: displayName,
		});
		await defaultProfile.save();
		// should route to user profile page
		res.redirect("/");
	} else {
		res.redirect("/sign_in");
	}
}
