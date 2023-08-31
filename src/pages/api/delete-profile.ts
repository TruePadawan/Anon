import { authOptions } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error-message";
import { prisma } from "@/lib/prisma-client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";

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
			const { id: profileId } = await prisma.userProfile.findUniqueOrThrow({
				where: {
					id: session.user.id,
				},
				select: {
					id: true,
				},
			});
			await prisma.$transaction(async (client) => {
				// delete public posts with no replies
				const publicPosts = await client.publicPost.findMany({
					where: {
						authorId: profileId,
					},
					select: {
						id: true,
					},
				});
				for (const post of publicPosts) {
					const postCommentCount = await client.comment.count({
						where: {
							commentGroupId: post.id,
						},
					});
					if (postCommentCount === 0) {
						await client.publicPost.delete({
							where: {
								id: post.id,
							},
						});
					}
				}

				// delete group posts with no replies
				const groupPosts = await client.groupPost.findMany({
					where: {
						authorId: profileId,
					},
					select: {
						id: true,
					},
				});
				for (const post of groupPosts) {
					const postCommentCount = await client.comment.count({
						where: {
							commentGroupId: post.id,
						},
					});
					if (postCommentCount === 0) {
						await client.groupPost.delete({
							where: {
								id: post.id,
							},
						});
					}
				}

				// delete comments with no replies
				await client.comment.deleteMany({
					where: {
						authorId: profileId,
						replies: {
							none: {},
						},
					},
				});

				await client.userProfile.delete({
					where: {
						id: profileId,
					},
				});
				/**
				 * Prisma takes care of removing users from groups theyre in (cascading deletes),
				 * For Comments with replies and Posts with comments, the author is set to null which says their account is deleted
				 */
			});
			// delete profile picture
			await cloudinary.uploader.destroy(profileId);
			res.status(200).json({ message: "Profile deleted successfully" });
		} catch (error) {
			res.status(403).json({
				message: getErrorMessage(error),
			});
		}
	}
}

export default handler;
