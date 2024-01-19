import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DELETED_COMMENT_CONTENT } from "@/helpers/global_vars";

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
            const payload: Payload = JSON.parse(req.body);
            const { id } = payload;
            const commentAuthorData = await prisma.comment.findUnique({
                where: {
                    id,
                },
                select: { author: true },
            });
            const isAuthorized =
                commentAuthorData?.author?.userId === session.user.id;
            if (isAuthorized) {
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
                    res.status(200).json({
                        message: "Comment deleted successfully",
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
