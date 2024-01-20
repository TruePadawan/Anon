import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreatePublicPostData } from "@/lib/api/PublicPostAPI";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        res.status(400).json({
            message: "Should receive a POST request with post data",
        });
    } else {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            res.status(401).json({ message: "Client not authenticated!" });
        } else {
            const payload: CreatePublicPostData = JSON.parse(req.body);
            try {
                const createdPost = await prisma.publicPost.create({
                    data: { ...payload, createdAt: Date.now() },
                    include: {
                        author: true,
                    },
                });

                res.status(200).json(createdPost);
            } catch (error: any) {
                res.status(500).json({
                    message: error.message,
                });
            }
        }
    }
}
