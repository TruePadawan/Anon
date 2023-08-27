import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface DeleteCommentPayload {
	id: string;
	authorId: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST" || !req.body) {
		res.status(400).json({
			message: "Should receive a POST request with a body",
		});
	} else {
		const session = await getServerSession(req, res, authOptions);
		if (!session) {
			res.status(401).json({ message: "Client not authenticated!?" });
		} else {
			const payload: DeleteCommentPayload = JSON.parse(req.body);
			const { id, authorId } = payload;
			const currentUserIsAuthor = session.user.id === authorId;
			if (currentUserIsAuthor) {
				try {
					await prisma.$transaction(async (client) => {
						const childComments = await client.comment.findMany({
							where: {
								parentId: id,
							},
							orderBy: {
								createdAt: "desc",
							},
						});
						// deleteMany doesn't work due to the self relation
						for (let i = 0; i < childComments.length; i++) {
							await client.comment.delete({
								where: {
									id: childComments[i].id,
								},
							});
						}
						await client.comment.delete({
							where: {
								id: id,
							},
						});
					});
					res.status(200).json({ message: "Comment deleted successfully" });
				} catch (error: any) {
					res.status(500).json({
						message: error.message,
					});
				}
			} else {
				res.status(403).json({
					message: "Current user is not the author",
				});
			}
		}
	}
}
