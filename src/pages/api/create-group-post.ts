import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateGroupPostData } from "@/lib/api/GroupPostAPI";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        return res.status(400).json({
            message: "Should receive a POST request with post data",
        });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ message: "Client not authenticated!" });
    }

    const { groupId, authorId, content }: CreateGroupPostData = JSON.parse(
        req.body,
    );
    const groupData = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
            admin: true,
            autoPostApproval: true,
        },
    });

    if (!groupData) {
        return res.status(500).json({ message: "Group does not exist" });
    }

    const currentUserIsAdmin = session.user.id === groupData?.admin.userId;
    // post is auto approved if the group allows it or author is the admin
    const postIsApproved =
        groupData?.autoPostApproval === true || currentUserIsAdmin;
    try {
        const createdPost = await prisma.groupPost.create({
            data: {
                author: {
                    connect: {
                        id: authorId,
                    },
                },
                group: {
                    connect: {
                        id: groupId,
                    },
                },
                content: content,
                isApproved: postIsApproved,
                createdAt: Date.now(),
            },
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
