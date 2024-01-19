import { authOptions } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error-message";
import { prisma } from "@/lib/prisma-client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { PostHog } from "posthog-node";

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
            const profile = await prisma.userProfile.findUniqueOrThrow({
                where: {
                    userId: session.user.id,
                },
                select: {
                    id: true,
                    accountName: true,
                    displayName: true,
                },
            });
            await prisma.$transaction(async (client) => {
                /**
                 * delete the user's posts from database only if it has no comments,
                 * posts with comments have their publicPostId/groupPostId set to null via Prisma
                 */
                await client.publicPost.deleteMany({
                    where: {
                        authorId: profile.id,
                        comments: {
                            none: {},
                        },
                    },
                });

                await client.groupPost.deleteMany({
                    where: {
                        authorId: profile.id,
                        comments: {
                            none: {},
                        },
                    },
                });

                // delete comments with no replies
                await client.comment.deleteMany({
                    where: {
                        authorId: profile.id,
                        replies: {
                            none: {},
                        },
                    },
                });

                await client.userProfile.delete({
                    where: {
                        id: profile.id,
                    },
                });
                /**
                 * Prisma takes care of deleting groups that the user owns,
                 * and removing the user from groups theyre in (cascading deletes),
                 * For Comments with replies and Posts with comments, the author is set to null which says their account is deleted
                 */
            });
            // delete profile picture
            await cloudinary.uploader.destroy(
                `anon/profile_pictures/${profile.id}`,
            );

            // let posthog know that a profile has been deleted
            if (
                process.env.NEXT_PUBLIC_POSTHOG_KEY &&
                process.env.NEXT_PUBLIC_POSTHOG_HOST
            ) {
                const postHogClient = new PostHog(
                    process.env.NEXT_PUBLIC_POSTHOG_KEY,
                    {
                        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
                    },
                );

                postHogClient.capture({
                    event: "Profile deleted",
                    distinctId: session.user.id,
                    properties: {
                        accountName: profile.accountName,
                        displayName: profile.displayName,
                    },
                });

                await postHogClient.shutdownAsync();
            }

            res.status(200).json({ message: "Profile deleted successfully" });
        } catch (error) {
            res.status(403).json({
                message: getErrorMessage(error),
            });
        }
    }
}

export default handler;
