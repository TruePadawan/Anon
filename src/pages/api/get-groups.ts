import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { GroupAPIGetManyFilters } from "@/lib/api/GroupsAPI";
import { getErrorMessage } from "@/lib/error-message";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		res.status(400).json({
			message: "This endpoint accepts only POST requests",
		});
	} else {
		try {
			const queryFilters: GroupAPIGetManyFilters = JSON.parse(req.body);
			const groups = await prisma.group.findMany(queryFilters);
			res.status(200).json(groups);
		} catch (error) {
			console.error(error);
			res.status(500).json({
				message: getErrorMessage(error),
			});
		}
	}
}
