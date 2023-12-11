import { Prisma } from "@prisma/client";
import { useState } from "react";

/**
 * React hook for searching for group members
 */
export default function useSearchGroupMembers(
	groupId?: string
): useSearchGroupMembersReturnType {
	const [members, setMembers] = useState<Member[]>([]);

	async function search(accountNameOrDisplayName: string) {
		if (!groupId) {
			setMembers([]);
		} else {
			// main logic
		}
	}

	// return an empty array as members if groupId is not defined
	return {
		members,
		search,
	};
}

// custom types
const groupMemberWithProfile =
	Prisma.validator<Prisma.GroupMemberDefaultArgs>()({
		include: { user: true },
	});
type Member = Prisma.GroupMemberGetPayload<typeof groupMemberWithProfile>;

interface useSearchGroupMembersReturnType {
	members: Member[];
	search: (accountNameOrDisplayName: string) => void;
}
