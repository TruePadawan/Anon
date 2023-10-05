import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { PostHog } from "posthog-node";
import { CreateGroupPayload } from "@/lib/api/GroupsAPI";

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
		const { adminId, ...data }: CreateGroupPayload = JSON.parse(req.body);
		try {
			// run a transaction that creates a group and also creates a single GroupMember document for the admin
			const group = await prisma.group.create({
				data: {
					...data,
					admin: {
						connect: {
							id: adminId,
						},
					},
					groupMembers: {
						create: [
							{
								userProfileId: adminId,
								membershipStatus: "JOINED",
							},
						],
					},
					createdAt: Date.now(),
				},
				include: {
					admin: true,
				},
			});

			// Monitor creation of groups
			if (
				process.env.NEXT_PUBLIC_POSTHOG_KEY &&
				process.env.NEXT_PUBLIC_POSTHOG_HOST
			) {
				const postHogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
					host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
				});

				postHogClient.capture({
					event: "Group created",
					distinctId: group.admin.userId,
					properties: {
						adminId: group.adminId,
						adminUserId: group.admin.userId,
						isAnonymous: group.isAnonymous,
					},
				});

				await postHogClient.shutdownAsync();
			}

			res.status(200).json(group);
		} catch (error: any) {
			console.error(error);
			res
				.status(500)
				.json({ message: `Failed to create group: ${error.message}` });
		}
	}
}
