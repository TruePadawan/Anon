import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST" || !req.body) {
		res.status(400).json({
			message: "Should receive a POST request with post data",
		});
	} else {
		const session = await getServerSession(req, res, authOptions);
		if (!session) {
			res.status(401).json({ message: "Client not authenticated!" });
		} else {
			const newData = JSON.parse(req.body);
			try {
				const updatedPost = await prisma.publicPost.update({
					where: {
						id: newData.id,
						authorId: newData.userID,
					},
					data: {
						content: newData.content,
					},
				});
				res.status(200).json(updatedPost);
			} catch (error: any) {
				res.status(500).json({
					message: error.message,
				});
			}
		}
	}
}