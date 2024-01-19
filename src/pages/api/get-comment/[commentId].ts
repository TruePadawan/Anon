import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const commentId = req.query.commentId as string | undefined;
    if (req.method !== "GET" || !commentId) {
        res.status(400).json({
            message: "Invalid GET request",
        });
    } else {
        try {
            const comment = await prisma.comment.findFirstOrThrow({
                where: {
                    id: commentId,
                },
                include: {
                    author: true,
                    parentComment: true,
                },
            });
            res.status(200).json(comment);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({
                message: error.message,
            });
        }
    }
}
