import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { DELETED_COMMENT_CONTENT } from "@/helpers/global_vars";

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
				const replyCount = await prisma.comment.count({
					where: {
						parentId: id,
					},
				});
				try {
					// if comment has no replies, delete it from db else update its content to a generic content and set its `isDeleted` to true
					if (replyCount === 0) {
						await prisma.comment.delete({
							where: {
								id,
							},
						});
					} else {
						await prisma.comment.update({
							where: {
								id,
							},
							data: {
								isDeleted: true,
								content: DELETED_COMMENT_CONTENT,
							},
						});
					}
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

// export async function deleteCommentWithChildren(
// 	prismaClient: Client,
// 	commentId: string
// ) {
// 	const children = await prismaClient.comment.findMany({
// 		where: {
// 			parentId: commentId,
// 		},
// 		select: {
// 			id: true,
// 			_count: {
// 				select: { replies: true },
// 			},
// 		},
// 	});

// 	for (const child of children) {
// 		// recursively delete child comments that have replies, instantly delete comments with no replies
// 		if (child._count.replies > 0) {
// 			await deleteCommentWithChildren(prismaClient, child.id);
// 		} else {
// 			await prismaClient.comment.delete({
// 				where: {
// 					id: child.id,
// 				},
// 			});
// 		}
// 	}

// 	await prismaClient.comment.delete({
// 		where: {
// 			id: commentId,
// 		},
// 	});
// }

// type Client = Omit<
// 	PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
// 	"$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
// >;
