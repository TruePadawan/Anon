import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        return res.status(400).json({
            message: "Should receive a POST request with a body",
        });
    }
    try {
        const posts = await prisma.groupPost.findMany({
            include: {
                author: true,
            },
            ...JSON.parse(req.body),
        });
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(500).json({
            message: error.message,
        });
    }
}
