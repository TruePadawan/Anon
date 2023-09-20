import { handleFailedAPIRequest } from "@/helpers/global_helpers";
import { Group, MembershipStatus } from "@prisma/client";

/**
 * Statuc class which provides an interface for performing CRUD operations on groups
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
	static async joinGroup(joinId: string): Promise<MembershipStatus> {
		const response = await fetch(`/api/join-group/${joinId}`);
		await handleFailedAPIRequest(response);
		const status: MembershipStatus = await response.json();
		return status;
	}
}

export type CreateGroupPayload = Omit<
	Group,
	"id" | "banner_url" | "createdAt" | "groupJoinId"
>;

export default GroupsAPI;
