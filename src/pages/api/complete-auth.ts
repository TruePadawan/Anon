import { authOptions } from "../../../lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getRandomColor, getRandomInt } from "../../../helpers/global-helpers";
import { prisma } from "../../../lib/prisma-client";

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
		const profile = await prisma.userProfile.findUnique({
			where: { id: userID },
			select: { accountName: true },
		});
		if (profile) {
			res.redirect("/");
		} else {
			const displayName = session.user.name || "New User";
			const accountName = `${session.user.email
				?.split("@")
				.at(0)}${getRandomInt(100000000)}`;
			await prisma.userProfile.create({
				data: {
					id: userID,
					accountName,
					displayName,
					color: getRandomColor(),
					createdAt: Date.now(),
				},
			});

			// should redirect to user profile
			res.redirect(`/users/${accountName}`);
		}
	} else {
		res.redirect("/sign-in");
	}
}
