import { handleFailedAPIRequest } from "@/helpers/global_helpers";
import { Group } from "@prisma/client";

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

	static async joinGroup(joinId: string): Promise<JoinRequestResult> {
		return JoinRequestResult.PENDING;
	}
}

export enum JoinRequestResult {
	PENDING = "PENDING",
	ACCEPTED = "ACCEPTED",
}

export type CreateGroupPayload = Omit<
	Group,
	"id" | "banner_url" | "createdAt" | "groupJoinId"
>;

export default GroupsAPI;
