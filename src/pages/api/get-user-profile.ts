import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		res.status(400).json({
			message: "This endpoint allows only GET requests",
		});
	} else {
		const session = await getServerSession(req, res, authOptions);
		if (!session) {
			res.status(200).json({ user: null });
		} else {
			try {
				const profileData = await getUserProfile(session);
				res.status(200).json({ user: profileData });
			} catch (error: any) {
				console.error(error);
				res.status(500).json({
					message: error.message,
				});
			}
		}
	}
}

export async function getUserProfile(session: Session) {
	const profileData = await prisma.userProfile.findUnique({
		where: {
			userId: session.user.id,
		},
	});
	return profileData;
}
