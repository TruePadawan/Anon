import { Prisma } from "@prisma/client";
import { useCallback, useState } from "react";

/**
 * React hook for searching for group members
 */
export default function useSearchGroupMembers(
	groupId?: string
): useSearchGroupMembersReturnType {
	const [members, setMembers] = useState<Member[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const search = useCallback(
		async (accountNameOrDisplayName: string) => {
			if (!groupId) {
				setMembers([]);
			} else {
				setIsSearching(true);
				// main logic
				setIsSearching(false);
			}
		},
		[groupId]
	);

	// return an empty array as members if groupId is not defined
	return {
		members,
		search,
		isSearching,
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
	isSearching: boolean;
}
