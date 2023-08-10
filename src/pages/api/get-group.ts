import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);
	if (!session) {
		res.status(401).json({ message: "Client not authenticated!?" });
	} else {
		try {
			const { name } = JSON.parse(req.body);
			const group = await prisma.group.findUnique({
				where: {
					name,
				},
			});
			res.status(200).json({ group });
		} catch (error: any) {
			console.error(error);
			res.status(500).json({
				message: error.message,
			});
		}
	}
}
