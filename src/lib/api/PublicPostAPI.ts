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

		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const createdPost: PublicPostWithAuthor = await response.json();
		return createdPost;
	}

	static async update(
		postId: string,
		authorId: string,
		newData: UpdatePublicPostPayload
	) {}

	static async remove(postId: string) {}

	static async getById(postId: string) {}

	static async getMany(
		params?: GetManyParams
	): Promise<PublicPostWithAuthor[]> {
		const response = await fetch("/api/get-public-posts", {
			method: "POST",
			body: JSON.stringify(params),
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const posts: PublicPostWithAuthor[] = await response.json();
		return posts;
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
