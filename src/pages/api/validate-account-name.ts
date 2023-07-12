import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);
	if (!session) {
		throw new Error("USER NOT AUTHENTICATED");
	}
	const currentUser = await prisma.userProfile.findUnique({
		where: {
			id: session.user.id,
		},
		select: {
			accountName: true,
		},
	});
	if (!currentUser) {
		throw new Error("Failed to find profile of current user");
	}

	const accountName = req.query.accountName as string;
	const count = await prisma.userProfile.count({
		where: {
			accountName,
		},
	});
	const accountNameIsValid =
		accountName === currentUser.accountName || count === 0;
	res.status(200).json({ valid: accountNameIsValid });
}
