import { handleFailedAPIRequest } from "@/helpers/global_helpers";
import { PublicPostWithAuthor } from "@/types/types";
import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";

/**
 * Static class which provides an interface for performing CRUD operations on public posts
 */
class PublicPostAPI {
	/**
	 * Creates a single public post in the database,
	 * an error is thrown if the process fails
	 * @param data the post's data
	 * @returns the document of the created post
	 */
	static async create(data: CreatePublicPostData) {
		const response = await fetch("/api/create-public-post", {
			method: "POST",
			body: JSON.stringify(data),
		});
		await handleFailedAPIRequest(response);
		const createdPost: PublicPostWithAuthor = await response.json();
		return createdPost;
	}

	/**
	 * Updates a single public post in the database,
	 * an error is thrown if the process fails
	 * @param postId the ID of the post to be updated
	 * @param newData the new data of the post
	 * @returns the updated document of the post
	 */
	static async update(postId: string, newData: UpdatePublicPostPayload) {
		const response = await fetch("/api/update-public-post", {
			method: "POST",
			body: JSON.stringify({
				id: postId,
				data: newData,
			}),
		});
		await handleFailedAPIRequest(response);
		const updatedPost: PublicPostWithAuthor = await response.json();
		return updatedPost;
	}

	/**
	 * Deletes a single public post from the database,
	 * an error is thrown if the process fails
	 * @param postId the ID of the post
	 */
	static async remove(postId: string) {
		const response = await fetch("/api/delete-public-post", {
			method: "POST",
			body: JSON.stringify({
				id: postId,
			}),
		});
		await handleFailedAPIRequest(response);
	}

	/**
	 * Gets a list of public post documents
	 * @param params Prisma query objects for controlling the returned comments
	 * @returns a list of public post documents
	 */
	static async getMany(
		params?: PublicPostAPIGetManyParams
	): Promise<PublicPostWithAuthor[]> {
		const response = await fetch("/api/get-public-posts", {
			method: "POST",
			body: JSON.stringify(params),
		});
		await handleFailedAPIRequest(response);
		const posts: PublicPostWithAuthor[] = await response.json();
		return posts;
	}

	/**
	 * Gets a single public post
	 * @param postId the ID of the post
	 * @returns the post document
	 */
	static async getById(postId: string) {
		const response = await fetch(`/api/get-public-post/${postId}`);
		await handleFailedAPIRequest(response);
		const post: PublicPostWithAuthor = await response.json();
		return post;
	}
}

export interface CreatePublicPostData {
	authorId: string;
	content: JSONContent;
}

export interface UpdatePublicPostPayload {
	content?: JSONContent;
	commentsAllowed?: boolean;
}

export type PublicPostAPIGetManyParams = Omit<
	Prisma.PublicPostFindManyArgs,
	"distinct" | "select" | "include"
>;

export default PublicPostAPI;
