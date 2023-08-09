import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma-client";

export interface CreateGroupApiReqBody {
	groupData: {
		adminId: string;
		name: string;
		desc?: string;
	};
	settingsData: {
		isAnonymous: boolean;
		autoMemberApproval: boolean;
		autoPostApproval: boolean;
	};
}
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// use a transaction to create a group and it's settings in the db
	if (req.method !== "POST" || !req.body) {
		res.status(400).json({
			message:
				"Invalid request, should be a POST request with group+group settings data in the request body",
		});
	} else {
		const { groupData, settingsData }: CreateGroupApiReqBody = JSON.parse(
			req.body
		);
		try {
			// run a transaction that creates a group and its settings document, and also creates a single GroupMember document for the admin
			const settings = await prisma.groupSettings.create({
				data: {
					isAnonymous: settingsData.isAnonymous,
					autoMemberApproval: settingsData.autoMemberApproval,
					autoPostApproval: settingsData.autoPostApproval,
					group: {
						create: {
							adminId: groupData.adminId,
							name: groupData.name,
							desc: groupData.desc,
							createdAt: Date.now(),
							groupMembers: {
								create: [
									{
										userProfileId: groupData.adminId,
										membershipStatus: "JOINED",
									},
								],
							},
						},
					},
				},
				include: {
					group: true,
				},
			});
			res
				.status(200)
				.json({ message: "Group created successfully", group: settings.group });
		} catch (error: any) {
			console.error(error);
			res
				.status(500)
				.json({ message: `Failed to create group: ${error.message}` });
		}
	}
}
