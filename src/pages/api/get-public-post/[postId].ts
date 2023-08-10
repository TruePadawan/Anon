import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const postId = req.query.postId as string | undefined;
	if (req.method !== "GET" || !postId) {
		res.status(400).json({
			message: "Invalid GET request",
		});
	} else {
		try {
			const post = await prisma.publicPost.findFirstOrThrow({
				where: {
					id: postId,
				},
				include: {
					author: true,
				},
			});
			res.status(200).json(post);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				message: error.message,
			});
		}
	}
}
