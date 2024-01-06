import GroupsAPI from "@/lib/api/GroupsAPI";
import { Prisma } from "@prisma/client";
import { useCallback, useState } from "react";

/**
 * React hook for searching for group members
 */
export default function useSearchGroupMembers(
	groupId?: string
): useSearchGroupMembersReturnType {
	const [members, setMembers] = useState<Member[]>([]);
	const [errorText, setErrorText] = useState(() =>
		!groupId ? "GroupId not defined" : ""
	);
	const [isSearching, setIsSearching] = useState(false);

	const search = useCallback(
		async (accountNameOrDisplayName: string) => {
			setErrorText("");

			if (accountNameOrDisplayName.trim().length === 0) {
				setErrorText("search value is not defined");
				setMembers([]);
				return;
			}

			if (!groupId) {
				setErrorText("GroupId is not defined");
				setMembers([]);
				return;
			}

			setIsSearching(true);
			// main logic
			const result = await GroupsAPI.getMembers({
				where: {
					OR: [
						{
							user: {
								accountName: {
									contains: accountNameOrDisplayName,
									mode: "insensitive",
								},
							},
							membershipStatus: "JOINED",
						},
						{
							user: {
								displayName: {
									contains: accountNameOrDisplayName,
									mode: "insensitive",
								},
							},
							membershipStatus: "JOINED",
						},
					],
				},
				include: {
					user: true,
				},
			});
			setMembers(result);
			setIsSearching(false);
		},
		[groupId]
	);

	// return an empty array as members if groupId is not defined
	return {
		members,
		search,
		isSearching,
		errorText,
	};
}

// custom types
const groupMemberWithProfile =
	Prisma.validator<Prisma.GroupMemberDefaultArgs>()({
		include: { user: true },
	});

export type Member = Prisma.GroupMemberGetPayload<
	typeof groupMemberWithProfile
>;

interface useSearchGroupMembersReturnType {
	members: Member[];
	search: (accountNameOrDisplayName: string) => void;
	isSearching: boolean;
	errorText: string;
}
