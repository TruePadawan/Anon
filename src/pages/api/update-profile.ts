import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        res.status(400).json({
            message: "Should receive a POST request with profile data",
        });
    } else {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            res.status(401).json({ message: "Client not authenticated!?" });
        } else {
            try {
                await prisma.userProfile.update({
                    where: {
                        userId: session.user.id,
                    },
                    data: JSON.parse(req.body),
                });
                res.status(200).json({ message: "Update successful" });
            } catch (error: any) {
                res.status(500).json({
                    message: error.message,
                });
            }
        }
    }
}
