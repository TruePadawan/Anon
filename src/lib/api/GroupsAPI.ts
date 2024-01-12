import { handleFailedAPIRequest } from "@/helpers/global_helpers";
import { Member } from "@/hooks/useSearchGroupMembers";
import { Group, MembershipStatus, Prisma } from "@prisma/client";

/**
 * Static class which provides an interface for performing CRUD operations on groups
 */
class GroupsAPI {
	/**
	 * Creates a single group in the database,
	 * an error is thrown if the process fails
	 * @param data the group's data
	 */
	static async create(data: CreateGroupPayload) {
		const response = await fetch("/api/create-group", {
			method: "POST",
			body: JSON.stringify(data),
		});
		await handleFailedAPIRequest(response);
		const group: Group = await response.json();
		return group;
	}

	/**
	 * Updates a group
	 * @param groupId the id of the group
	 * @param data the new data
	 * @returns the updated group data
	 */
	static async update(groupId: string, data: UpdateGroupPayload) {
		const response = await fetch("/api/update-group", {
			method: "POST",
			body: JSON.stringify({
				id: groupId,
				data,
			}),
		});
		await handleFailedAPIRequest(response);
		const updatedGroupData: Group = await response.json();
		return updatedGroupData;
	}

	/**
	 * Delete a group
	 * @param groupId
	 */
	static async delete(groupId: string) {
		const response = await fetch(`/api/delete-group/${groupId}`);
		await handleFailedAPIRequest(response);
	}

	/**
	 * Requests access to a group, it returns a status - PENDING or ACCEPTED
	 * @param joinId the group's join id
	 */
	static async joinGroup(joinId: string): Promise<JoinGroupResult> {
		const response = await fetch(`/api/join-group/${joinId}`);
		await handleFailedAPIRequest(response);
		const parsedResponse: JoinGroupResult = await response.json();
		return parsedResponse;
	}

	/**
	 * Get a group document by its Id
	 * @param transform Prisma query params for transforming the returned document
	 */
	static async getOne(transform: Prisma.GroupFindUniqueArgs) {
		const response = await fetch("/api/get-group", {
			method: "POST",
			body: JSON.stringify(transform),
		});
		await handleFailedAPIRequest(response);
		const group = await response.json();
		return group;
	}

	/**
	 * Get the number of groups that conform to a filter
	 * @param filters Prisma query params for filtering the groups
	 * @returns the number of groups that conform to the filter
	 */
	static async count(filters: Prisma.GroupCountArgs): Promise<number> {
		const response = await fetch("/api/count-groups", {
			method: "POST",
			body: JSON.stringify(filters),
		});
		await handleFailedAPIRequest(response);
		const { count } = await response.json();
		return count;
	}

	/**
	 * Get a list of group documents
	 * An error is thrown if the request fails
	 * @param filters Prisma query filters for controlling the returned documents
	 * @returns list of group documents
	 */
	static async getMany(filters?: GroupAPIGetManyFilters) {
		const response = await fetch("/api/get-groups", {
			method: "POST",
			body: JSON.stringify(filters),
		});
		await handleFailedAPIRequest(response);
		const groups: Group[] = await response.json();
		return groups;
	}

	/**
	 * Get a list of group member documents
	 * @param filters Prisma query filters
	 * @returns list of group members
	 */
	static async getMembers(filters?: GroupAPIGetMembersFilters) {
		const response = await fetch("/api/get-group-members", {
			method: "POST",
			body: JSON.stringify(filters),
		});
		await handleFailedAPIRequest(response);
		const members: Member[] = await response.json();
		return members;
	}

	/**
	 * accept a group member
	 * @param groupMemberId
	 */
	static async acceptMember(groupMemberId: string) {
		const response = await fetch(`/api/accept-group-member/${groupMemberId}`);
		await handleFailedAPIRequest(response);
	}

	/**
	 * remove a user from a group
	 * @param groupMemberId
	 */
	static async removeMember(groupMemberId: string) {
		const response = await fetch(`/api/remove-group-member/${groupMemberId}`);
		await handleFailedAPIRequest(response);
	}

	/**
	 * ban a user from a group
	 * @param groupMemberId
	 */
	static async banMember(groupMemberId: string) {
		const response = await fetch(`/api/ban-group-member/${groupMemberId}`);
		await handleFailedAPIRequest(response);
	}
}

export type CreateGroupPayload = Omit<
	Group,
	"id" | "banner_url" | "createdAt" | "groupJoinId"
>;

export type UpdateGroupPayload = Pick<
	Group,
	"desc" | "name" | "autoMemberApproval" | "autoPostApproval"
>;

export interface JoinGroupResult {
	name: string;
	status: MembershipStatus;
}

export type GroupAPIGetManyFilters = Omit<
	Prisma.GroupFindManyArgs,
	"distinct" | "include"
>;

export type GroupAPIGetMembersFilters = Omit<
	Prisma.GroupMemberFindManyArgs,
	"distinct"
>;

export default GroupsAPI;
