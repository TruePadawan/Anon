import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UpdateGroupPayload } from "@/lib/api/GroupsAPI";
import { getErrorMessage } from "@/lib/error-message";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        res.status(400).json({
            message: "Should receive a POST request with payload",
        });
    } else {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            res.status(401).json({ message: "Client not authenticated!" });
        } else {
            const { id, data }: Payload = JSON.parse(req.body);
            const count = await prisma.group.count({
                where: { id, admin: { userId: session.user.id } },
            });
            const currentUserIsAdmin = count === 1;
            if (currentUserIsAdmin) {
                try {
                    const updatedGroupData = await prisma.group.update({
                        where: {
                            id,
                        },
                        data,
                    });
                    res.status(200).json(updatedGroupData);
                } catch (error) {
                    res.status(500).json({
                        message: getErrorMessage(error),
                    });
                }
            } else {
                res.status(403).json({
                    message:
                        "Only the admin is authorized to edit the group's data",
                });
            }
        }
    }
}

interface Payload {
    id: string;
    data: UpdateGroupPayload;
}
