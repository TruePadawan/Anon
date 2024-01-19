import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { PostType } from "@/types/types";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { postId, postType }: RequestBody = JSON.parse(req.body);
    if (req.method !== "POST" && !postId) {
        res.status(400).json({
            message:
                "Invalid request, This endpoint takes a POST request with the postId in the body",
        });
    } else {
        try {
            const count =
                postType === "public"
                    ? await prisma.comment.count({
                          where: {
                              publicPostId: postId,
                              isDeleted: false,
                          },
                      })
                    : await prisma.comment.count({
                          where: {
                              groupPostId: postId,
                              isDeleted: false,
                          },
                      });
            res.status(200).json({ count });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({
                message: error.message,
            });
        }
    }
}

interface RequestBody {
    postId: string;
    postType: PostType;
}
