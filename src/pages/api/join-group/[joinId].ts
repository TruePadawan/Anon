import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { getUserProfile } from "../get-user-profile";
import { MembershipStatus } from "@prisma/client";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const joinId = req.query.joinId as string | undefined;
	if (req.method !== "GET") {
		return res.status(400).json({
			message: "Endpoint only accepts GET request",
		});
	}

	if (joinId === undefined) {
		return res.status(400).json({
			message: "No group join id specified",
		});
	}
	/**
	 * Verify that user is not banned
	 *
	 * If the group has auto member approval set to true
	 * - Create a GroupMember document with status set to JOINED else PENDING
	 */
	const session = await getServerSession(req, res, authOptions);
	if (session === null) {
		return res.status(401).json({ message: "Client not authenticated" });
	}

	// verify that group with that joinId exists
	const groupData = await prisma.group.findUnique({
		where: {
			groupJoinId: joinId,
		},
		select: {
			id: true,
			name: true,
			autoMemberApproval: true,
		},
	});

	if (groupData === null) {
		return res.status(403).json({ message: "Group does not exist" });
	}

	// verify that user is not banned from the group
	const profile = await getUserProfile(session);

	if (profile === null) {
		return res.status(403).json({ message: "Could not find client's profile" });
	}

	const userIsBanned =
		(await prisma.groupMember.count({
			where: {
				user: {
					id: profile.id,
				},
				group: {
					groupJoinId: joinId,
				},
				membershipStatus: MembershipStatus.BANNED,
			},
		})) === 1;
	if (userIsBanned) {
		return res.status(403).json({ message: "User is banned" });
	}

	const { membershipStatus } = await prisma.groupMember.create({
		data: {
			membershipStatus: groupData.autoMemberApproval
				? MembershipStatus.JOINED
				: MembershipStatus.PENDING,
			userProfileId: profile.id,
			groupId: groupData.id,
		},
		select: {
			membershipStatus: true,
		},
	});

	return res.status(200).json({ membershipStatus });
}
