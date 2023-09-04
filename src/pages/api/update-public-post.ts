import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UpdatePublicPostPayload } from "@/lib/api/PublicPostAPI";
import { getUserProfile } from "./get-user-profile";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
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
			const { id, data }: Payload = JSON.parse(req.body);
			const profileData = await getUserProfile(session);
			const isAuthorized = session.user.id === profileData?.userId;
			if (isAuthorized) {
				try {
					const updatedPost = await prisma.publicPost.update({
						where: {
							id,
							authorId: session.user.id,
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
	}
}

interface Payload {
	id: string;
	data: UpdatePublicPostPayload;
}
