import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UpdateGroupPostPayload } from "@/lib/api/GroupPostAPI";
import { getUserProfile } from "./get-user-profile";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
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

	const { id, data }: Payload = JSON.parse(req.body);
	const postData = await prisma.groupPost.findUnique({
		where: {
			id,
		},
		select: {
			author: true,
			group: true,
		},
	});

	const currentUserProfile = await getUserProfile(session);
	// the action is authorized if the user is the author of the post or admin of the group
	const isAuthor = postData?.author?.userId === session.user.id;
	const isGroupAdmin = postData?.group.adminId === currentUserProfile?.id;
	const isAuthorized = isAuthor || isGroupAdmin;
	if (isAuthorized) {
		try {
			const updatedPost = await prisma.groupPost.update({
				where: {
					id,
					author: {
						user: {
							id: session.user.id,
						},
					},
				},
				data: { ...data, editedAt: Date.now() },
				include: {
					author: true,
				},
			});
			res.status(200).json(updatedPost);
		} catch (error: any) {
			res.status(500).json({
				message: error.message,
			});
		}
	} else {
		res.status(403).json({
			message: "Current user is not the author",
		});
	}
}

interface Payload {
	id: string;
	data: UpdateGroupPostPayload;
}
