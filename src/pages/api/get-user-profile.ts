import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		res.status(400).json({
			message: "This endpoint allows only GET requests",
		});
	} else {
		const session = await getServerSession(req, res, authOptions);
		if (!session) {
			res.status(200).json({ user: null });
		} else {
			try {
				const user = await prisma.userProfile.findUnique({
					where: {
						userId: session.user.id,
					},
				});
				res.status(200).json({ user });
			} catch (error: any) {
				console.error(error);
				res.status(500).json({
					message: error.message,
				});
			}
		}
	}
}
