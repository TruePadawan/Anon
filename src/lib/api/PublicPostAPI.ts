import { handleFailedAPIRequest } from "@/helpers/global_helpers";
import { PublicPostWithAuthor } from "@/types/types";
import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";

/**
 * This class defines an interface for managing public posts
 */
class PublicPostAPI {
	static async create(content: JSONContent, authorId: string) {
		const postData: CreatePublicPostData = {
			content,
			authorId,
			createdAt: Date.now(),
		};
		const response = await fetch("/api/create-public-post", {
			method: "POST",
			body: JSON.stringify(postData),
		});
		await handleFailedAPIRequest(response);
		const createdPost: PublicPostWithAuthor = await response.json();
		return createdPost;
	}

	static async update(
		postId: string,
		authorId: string,
		newData: UpdatePublicPostPayload
	) {
		const response = await fetch("/api/update-public-post", {
			method: "POST",
			body: JSON.stringify({
				id: postId,
				authorId,
				data: newData,
			}),
		});
		await handleFailedAPIRequest(response);
		const updatedPost: PublicPostWithAuthor = await response.json();
		return updatedPost;
	}

	static async remove(postId: string, authorId: string) {
		const response = await fetch("/api/delete-public-post", {
			method: "POST",
			body: JSON.stringify({
				authorId,
				id: postId,
			}),
		});
		await handleFailedAPIRequest(response);
	}

	static async getMany(
		params?: GetManyParams
	): Promise<PublicPostWithAuthor[]> {
		const response = await fetch("/api/get-public-posts", {
			method: "POST",
			body: JSON.stringify(params),
		});
		await handleFailedAPIRequest(response);
		const posts: PublicPostWithAuthor[] = await response.json();
		return posts;
	}

	static async getById(postId: string) {
		const response = await fetch(`/api/get-public-post/${postId}`);
		await handleFailedAPIRequest(response);
		const post: PublicPostWithAuthor = await response.json();
		return post;
	}
}

interface CreatePublicPostData {
	authorId: string;
	content: JSONContent;
	createdAt: number;
}

interface UpdatePublicPostPayload {
	content?: JSONContent;
	commentsAllowed?: boolean;
}

export interface GetManyParams {
	take?: number;
	where?: Prisma.PublicPostWhereInput;
	orderBy?: Prisma.PublicPostOrderByWithRelationInput;
	cursor?: Prisma.PublicPostWhereInput;
	skip?: number;
}

export default PublicPostAPI;
