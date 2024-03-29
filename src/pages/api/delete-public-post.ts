import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DELETED_POST_CONTENT } from "@/helpers/global_vars";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
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
            const postData: Payload = JSON.parse(req.body);
            const postAuthorData = await prisma.publicPost.findUnique({
                where: {
                    id: postData.id,
                },
                select: {
                    author: true,
                },
            });
            const isAuthorized =
                session.user.id === postAuthorData?.author?.userId;
            if (isAuthorized) {
                const commentCount = await prisma.comment.count({
                    where: {
                        publicPost: { id: postData.id },
                    },
                });
                try {
                    // delete the post from database only if it has no comments, else use reddit's style of handling 'deleted' posts
                    if (commentCount === 0) {
                        await prisma.publicPost.delete({
                            where: {
                                id: postData.id,
                            },
                        });
                    } else {
                        await prisma.publicPost.update({
                            where: {
                                id: postData.id,
                            },
                            data: {
                                content: DELETED_POST_CONTENT,
                                isDeleted: true,
                            },
                        });
                    }
                    res.status(200).json({
                        message: "Post deleted successfully",
                    });
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

interface Payload {
    id: string;
}
