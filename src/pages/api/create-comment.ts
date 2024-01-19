import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateCommentPayload } from "@/lib/api/CommentsAPI";
import { Prisma } from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        res.status(400).json({
            message: "Should receive a POST request with comment data",
        });
    } else {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            res.status(401).json({ message: "Client not authenticated!" });
        } else {
            const payload: CreateCommentPayload = JSON.parse(req.body);
            try {
                const comment = await prisma.comment.create({
                    data: generateQueryData(payload),
                    include: {
                        author: true,
                        parentComment: true,
                    },
                });
                res.status(200).json(comment);
            } catch (error: any) {
                res.status(500).json({
                    message: error.message,
                });
            }
        }
    }
}

function generateQueryData(payload: CreateCommentPayload) {
    const data: Prisma.CommentCreateInput = {
        content: payload.content,
        author: {
            connect: {
                id: payload.authorId,
            },
        },
        createdAt: Date.now(),
    };

    if (payload.postType === "public") {
        data.publicPost = {
            connect: {
                id: payload.postId,
            },
        };
    } else {
        data.groupPost = {
            connect: {
                id: payload.postId,
            },
        };
    }

    if (payload.parentId !== undefined) {
        data.parentComment = {
            connect: {
                id: payload.parentId,
            },
        };
    }

    return data;
}
