import { handleFailedAPIRequest } from "@/helpers/global_helpers";
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
}

export type CreateGroupPayload = Omit<
	Group,
	"id" | "banner_url" | "createdAt" | "groupJoinId"
>;

export interface JoinGroupResult {
	name: string;
	status: MembershipStatus;
}

export type GroupAPIGetManyFilters = Omit<
	Prisma.GroupFindManyArgs,
	"distinct" | "include"
>;

export default GroupsAPI;
