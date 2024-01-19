import { authOptions } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getUserProfile } from "../get-user-profile";
import { prisma } from "@/lib/prisma-client";
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
        return res.status(401).json({ message: "Client not authenticated!?" });
    }
    const groupId = req.query.groupId as string;
    try {
        const groupData = await prisma.group.findUniqueOrThrow({
            where: {
                id: groupId,
            },
            select: {
                admin: true,
            },
        });
        if (!groupData) {
            throw new Error("Failed to find the group");
        }

        const clientProfile = await getUserProfile(session);
        const groupAdminProfileId = groupData.admin.id;
        const clientIsAdmin = clientProfile?.id === groupAdminProfileId;
        if (!clientIsAdmin) {
            throw new Error("Only the group admin can perform this action");
        }

        /**
         * Use a transaction to delete
         * - group member documents
         * - group posts
         * - group document
         */
        const deleteGroupMembers = prisma.groupMember.deleteMany({
            where: {
                group: {
                    id: groupId,
                },
            },
        });
        const deleteGroupPostComments = prisma.comment.deleteMany({
            where: {
                groupPost: {
                    group: {
                        id: groupId,
                    },
                },
            },
        });
        const deleteGroupPosts = prisma.groupPost.deleteMany({
            where: {
                group: {
                    id: groupId,
                },
            },
        });
        const deleteGroup = prisma.group.delete({
            where: {
                id: groupId,
            },
        });
        await prisma.$transaction([
            deleteGroupMembers,
            deleteGroupPostComments,
            deleteGroupPosts,
            deleteGroup,
        ]);
        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: getErrorMessage(error),
        });
    }
}
