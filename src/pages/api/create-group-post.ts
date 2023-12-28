import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateGroupPostData } from "@/lib/api/GroupPostAPI";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST" || !req.body) {
		return res.status(400).json({
			message: "Should receive a POST request with post data",
		});
	}
	const session = await getServerSession(req, res, authOptions);
	if (!session) {
		return res.status(401).json({ message: "Client not authenticated!" });
	}
	const payload: CreateGroupPostData = JSON.parse(req.body);
	const count = await prisma.group.count({
		where: { id: payload.groupId, autoPostApproval: true },
	});

	try {
		const createdPost = await prisma.groupPost.create({
			data: {
				author: {
					connect: {
						id: payload.authorId,
					},
				},
				group: {
					connect: {
						id: payload.groupId,
					},
				},
				content: payload.content,
				/// post is auto approved if the group allows it
				isApproved: count === 1,
				createdAt: Date.now(),
			},
			include: {
				author: true,
			},
		});

		res.status(200).json(createdPost);
	} catch (error: any) {
		res.status(500).json({
			message: error.message,
		});
	}
}
