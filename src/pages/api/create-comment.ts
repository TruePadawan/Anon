import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateCommentData } from "@/lib/api/CommentsAPI";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST" || !req.body) {
		res.status(400).json({
			message: "Should receive a POST request with comment data",
		});
	} else {
		const session = await getServerSession(req, res, authOptions);
		if (!session) {
			res.status(401).json({ message: "Client not authenticated!" });
		} else {
			const payload: CreateCommentData = JSON.parse(req.body);
			try {
				const comment = await prisma.comment.create({
					data: { ...payload, createdAt: Date.now() },
					include: {
						author: true,
						parentComment: true,
					},
				});
				res.status(200).json(comment);
			} catch (error: any) {
				res.status(500).json({
					message: error.message,
				});
			}
		}
	}
}
