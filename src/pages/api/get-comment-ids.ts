import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma-client";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET" || !req.query.groupId || !req.query.limit) {
		res.status(400).json({
			message: "Should receive a GET request with a groupId and limit param",
		});
	} else {
		const groupId = req.query.groupId as string;
		const limit = Number(req.query.limit as string);
		const cursor = req.query.cursor as string | undefined;
		try {
			let comment;
			if (cursor) {
				comment = await prisma.comment.findMany({
					take: limit,
					skip: 1,
					cursor: {
						id: cursor,
					},
					where: {
						commentGroupId: groupId,
					},
					select: {
						id: true,
					},
					orderBy: {
						createdAt: "desc",
					},
				});
			} else {
				comment = await prisma.comment.findMany({
					take: limit,
					where: {
						commentGroupId: groupId,
					},
					select: {
						id: true,
					},
					orderBy: {
						createdAt: "desc",
					},
				});
			}
			res.status(200).json(comment);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				message: error.message,
			});
		}
	}
}
