import { handleFailedAPIRequest } from "@/helpers/global_helpers";
import { GroupPostWithAuthor } from "@/types/types";
import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";

/**
 * Static class which provides an interface for performing CRUD operations on group posts
 */
class GroupPostAPI {
	/**
	 * Creates a single group post in the database,
	 * an error is thrown if the process fails
	 * @param data the post's data
	 * @returns the document of the created post
	 */
	static async create(data: CreateGroupPostData) {
		const response = await fetch("/api/create-group-post", {
			method: "POST",
			body: JSON.stringify(data),
		});
		await handleFailedAPIRequest(response);
		const createdPost: GroupPostWithAuthor = await response.json();
		return createdPost;
	}

	/**
	 * Updates a single group post in the database,
	 * an error is thrown if the process fails
	 * @param postId the ID of the post to be updated
	 * @param newData the new data of the post
	 * @returns the updated document of the post
	 */
	static async update(postId: string, newData: UpdateGroupPostPayload) {
		const response = await fetch("/api/update-group-post", {
			method: "POST",
			body: JSON.stringify({
				id: postId,
				data: newData,
			}),
		});
		await handleFailedAPIRequest(response);
		const updatedPost: GroupPostWithAuthor = await response.json();
		return updatedPost;
	}

	/**
	 * Deletes a single group post from the database,
	 * an error is thrown if the process fails
	 * @param postId the ID of the post
	 */
	static async remove(postId: string) {
		const response = await fetch("/api/delete-group-post", {
			method: "POST",
			body: JSON.stringify({
				id: postId,
			}),
		});
		await handleFailedAPIRequest(response);
	}

	/**
	 * Gets a list of group post documents
	 * @param params Prisma query objects for controlling the returned comments
	 * @returns a list of group post documents
	 */
	static async getMany(
		params?: GroupPostAPIGetManyParams
	): Promise<GroupPostWithAuthor[]> {
		const response = await fetch("/api/get-group-posts", {
			method: "POST",
			body: JSON.stringify(params),
		});
		await handleFailedAPIRequest(response);
		const posts: GroupPostWithAuthor[] = await response.json();
		return posts;
	}

	/**
	 * Gets a single group post
	 * @param postId the ID of the post
	 * @returns the post document
	 */
	static async getById(postId: string) {
		const response = await fetch(`/api/get-group-post/${postId}`);
		await handleFailedAPIRequest(response);
		const post: GroupPostWithAuthor = await response.json();
		return post;
	}
}

export interface CreateGroupPostData {
	authorId: string;
	groupId: string;
	content: JSONContent;
}

export interface UpdateGroupPostPayload {
	content?: JSONContent;
	commentsAllowed?: boolean;
}

export type GroupPostAPIGetManyParams = Omit<
	Prisma.GroupPostFindManyArgs,
	"distinct" | "select" | "include"
>;

export default GroupPostAPI;
