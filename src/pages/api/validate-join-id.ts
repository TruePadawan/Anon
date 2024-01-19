import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        res.status(401).json({ message: "Client not authenticated!?" });
    } else {
        const id = JSON.parse(req.body).id;
        if (!id) {
            res.status(400).json({ messsage: "Join ID not provided" });
        } else {
            const group = await prisma.group.findUnique({
                where: {
                    groupJoinId: id,
                },
            });
            if (group) {
                res.status(200).json(group);
            } else {
                res.status(404).json({
                    message: `Group with ID ${id} not found`,
                });
            }
        }
    }
}
