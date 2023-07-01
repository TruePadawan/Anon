import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma-client";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const accountName = req.query.accountName as string;
	const count = await prisma.userProfile.count({
		where: {
			accountName,
		},
	});
	res.status(200).json({ valid: count === 0 });
}
