import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { PostType } from "@/types/types";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { commentGroupId, postType }: RequestBody = JSON.parse(req.body);
	if (req.method !== "POST" && !commentGroupId) {
		res.status(400).json({
			message:
				"Invalid request, This endpoint takes a POST request with the commentGroupId in the body",
		});
	} else {
		try {
			const count =
				postType === "public"
					? await prisma.comment.count({
							where: {
								publicPostId: commentGroupId,
								isDeleted: false,
							},
					  })
					: await prisma.comment.count({
							where: {
								groupPostId: commentGroupId,
								isDeleted: false,
							},
					  });
			res.status(200).json({ count });
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				message: error.message,
			});
		}
	}
}

interface RequestBody {
	commentGroupId: string;
	postType: PostType;
}
