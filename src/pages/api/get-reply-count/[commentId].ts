import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getErrorMessage } from "@/lib/error-message";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const commentId = req.query.commentId as string | undefined;
	if (req.method !== "GET" || !commentId) {
		res.status(400).json({
			message: "Invalid GET request",
		});
	} else {
		try {
			const replyCount = await prisma.comment.count({
				where: {
					parentId: commentId,
				},
			});
			res.status(200).json({ count: replyCount });
		} catch (error) {
			console.error(error);
			res.status(500).json({
				message: getErrorMessage(error),
			});
		}
	}
}
