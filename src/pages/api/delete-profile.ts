import { authOptions } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error-message";
import { prisma } from "@/lib/prisma-client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { deleteCommentWithChildren } from "./delete-comment";

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const session = await getServerSession(req, res, authOptions);
	if (!session) {
		res.status(401).json({ message: "Client not authenticated!?" });
	} else {
		/**
		 * find the profile associated with the current session
		 * use a transaction to delete all its comments and profile,
		 * cascading deletes will handle deleting posts, groups e.t.c
		 */
		try {
			const { id: profileId, comments } =
				await prisma.userProfile.findUniqueOrThrow({
					where: {
						id: session.user.id,
					},
					select: {
						id: true,
						comments: {
							select: {
								id: true,
							},
						},
					},
				});

			await prisma.$transaction(async (client) => {
				// delete comments recursively due to self-relation not allowing cascading deletes
				for (const comment of comments) {
					await deleteCommentWithChildren(client, comment.id);
				}

				await prisma.userProfile.delete({
					where: {
						id: profileId,
					},
				});
			});
			res.status(200).json({ message: "Profile deleted successfully" });
		} catch (error) {
			res.status(403).json({
				message: getErrorMessage(error),
			});
		}
	}
}

export default handler;
