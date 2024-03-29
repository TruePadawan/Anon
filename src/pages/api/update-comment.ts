import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UpdateCommentPayload } from "@/lib/api/CommentsAPI";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        res.status(400).json({
            message: "Should receive a POST request with comment data",
        });
    } else {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            res.status(401).json({ message: "Client not authenticated!" });
        } else {
            const { id, data }: Payload = JSON.parse(req.body);
            const commentAuthorData = await prisma.comment.findUnique({
                where: {
                    id,
                },
                select: {
                    author: true,
                },
            });
            const isAuthorized =
                session.user.id === commentAuthorData?.author?.userId;
            if (isAuthorized) {
                try {
                    const updatedComment = await prisma.comment.update({
                        where: {
                            id,
                            authorId: session.user.id,
                        },
                        data: { ...data, editedAt: Date.now() },
                    });
                    res.status(200).json(updatedComment);
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
    data: UpdateCommentPayload;
}
