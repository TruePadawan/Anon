import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error-message";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res
			.status(400)
			.json({ message: "Endpoint only accepts POST requests" });
	} else if (!req.body) {
		return res
			.status(400)
			.json({ message: "Prisma query params not provided" });
	} else {
		const session = await getServerSession(req, res, authOptions);
		if (!session) {
			res.status(401).json({ message: "Client not authenticated!?" });
		} else {
			try {
				const queryParams = JSON.parse(req.body);
				const count = await prisma.group.count(queryParams);
				res.status(200).json({ count });
			} catch (error: any) {
				console.error(error);
				res.status(500).json({
					message: getErrorMessage(error),
				});
			}
		}
	}
}
