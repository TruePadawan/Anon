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
			res.status(400).json({ message: "WHO ARE YOU?" });
		} else {
			try {
				const createdPost = await prisma.publicPost.create({
					data: JSON.parse(req.body),
				});
				res.status(200).json(createdPost);
			} catch (error) {
				res.status(500).json({
					message: "Failed to create post",
				});
			}
		}
	}
}