import { Prisma } from "@prisma/client";
import { useState } from "react";

/**
 * React hook for searching for group members
 */
export default function useSearchGroupMembers(
	groupId: string,
	accountNameOrDisplayName?: string
) {
	const [members, setMembers] = useState<Member[]>([]);
	return members;
}

const groupMemberWithProfile =
	Prisma.validator<Prisma.GroupMemberDefaultArgs>()({
		include: { user: true },
	});
type Member = Prisma.GroupMemberGetPayload<typeof groupMemberWithProfile>;
