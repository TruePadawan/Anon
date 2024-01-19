import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getErrorMessage } from "@/lib/error-message";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        res.status(400).json({
            message: "Invalid request",
        });
    } else {
        try {
            const posts = await prisma.comment.findMany({
                include: {
                    author: true,
                    parentComment: true,
                },
                ...JSON.parse(req.body),
            });
            res.status(200).json(posts);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: getErrorMessage(error),
            });
        }
    }
}
