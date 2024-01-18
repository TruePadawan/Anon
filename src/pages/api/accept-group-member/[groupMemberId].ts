import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfile } from "../get-user-profile";
import { getErrorMessage } from "@/lib/error-message";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
        return res.status(400).json({
            message: "This endpoint only allows GET requests",
        });
    }
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ message: "Client not authenticated!" });
    }
    const groupMemberId = req.query.groupMemberId as string;
    try {
        const groupMemberData = await prisma.groupMember.findUniqueOrThrow({
            where: { id: groupMemberId },
            include: { group: true, user: true },
        });
        const clientProfile = await getUserProfile(session);
        const groupAdminProfileId = groupMemberData.group.adminId;
        const clientIsAdmin = clientProfile?.id === groupAdminProfileId;

        if (!clientIsAdmin) {
            throw new Error("Only the group admin can perform this action");
        } else {
            // prevent banning the admin
            const memberIsNotAdmin =
                groupMemberData.user.id !== groupAdminProfileId;
            if (memberIsNotAdmin) {
                const updatedDoc = await prisma.groupMember.update({
                    where: {
                        id: groupMemberId,
                    },
                    data: {
                        membershipStatus: "JOINED",
                    },
                });
                res.status(200).json(updatedDoc);
            } else {
                throw new Error(
                    "Cannot perform moderation actions on admin account",
                );
            }
        }
    } catch (error: any) {
        res.status(500).json({
            message: getErrorMessage(error),
        });
    }
}
