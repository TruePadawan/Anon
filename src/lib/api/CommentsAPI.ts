import { handleFailedAPIRequest } from "@/helpers/global_helpers";
import { PostType } from "@/types/types";
import { Comment, Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";

/**
 * Static class which provides an interface for performing CRUD operations on comments
 */
class CommentsAPI {
	/**
	 * Creates a single comment in the database,
	 * an error is thrown if the process fails
	 * @param data the comment's data
	 * @returns the document of the created comment
	 */
	static async create(data: CreateCommentData) {
		const response = await fetch("/api/create-comment", {
			method: "POST",
			body: JSON.stringify(data),
		});
		await handleFailedAPIRequest(response);
		const comment: CommentFull = await response.json();
		return comment;
	}

	/**
	 * Updates a single comment in the database,
	 * an error is thrown if the process fails
	 * @param id the ID of the comment to be updated
	 * @param newData the new data of the comment
	 * @returns the document of the updated comment
	 */
	static async update(id: string, newData: UpdateCommentPayload) {
		const response = await fetch("/api/update-comment", {
			method: "POST",
			body: JSON.stringify({
				id,
				data: newData,
			}),
		});
		await handleFailedAPIRequest(response);
		const updatedComment: Comment = await response.json();
		return updatedComment;
	}

	/**
	 * Deletes a single comment from the database,
	 * an error is thrown if the process fails
	 * @param id the ID of the comment to be deleted
	 */
	static async remove(id: string) {
		const response = await fetch("/api/delete-comment", {
			method: "POST",
			body: JSON.stringify({
				id,
			}),
		});
		await handleFailedAPIRequest(response);
	}

	/**
	 * Gets the number of comments under a post,
	 * an error is thrown if the process fails
	 * @param postId the ID of the post
	 * @param postType the type of post (Public or Group)
	 * @returns the number of comments
	 */
	static async count(postId: string, postType: PostType) {
		const response = await fetch("/api/get-comments-count", {
			method: "POST",
			body: JSON.stringify({
				postId,
				postType,
			}),
		});
		await handleFailedAPIRequest(response);
		const { count } = await response.json();
		return Number(count);
	}

	/**
	 * Gets the number of replies under a comment,
	 * an error is thrown if the process fails
	 * @param commentId the ID of the
	 * @returns the number of replies
	 */
	static async replyCount(commentId: string) {
		const response = await fetch(`/api/get-reply-count/${commentId}`);
		await handleFailedAPIRequest(response);
		const { count } = await response.json();
		return Number(count);
	}

	/**
	 * Gets a list of comment documents,
	 * an error is thrown if the process fails
	 * @param params Prisma query objects for controlling the returned comments
	 * @returns a list of comment comments
	 */
	static async getMany(params?: CommentAPIGetManyParams) {
		const response = await fetch("/api/get-comments", {
			method: "POST",
			body: JSON.stringify(params),
		});
		await handleFailedAPIRequest(response);
		const comments: CommentFull[] = await response.json();
		return comments;
	}

	/**
	 * Forms the reply url of a comment,
	 * an error is thrown if the process fails
	 * @param comment the data of the comment
	 * @returns a string which represents a relative url
	 */
	static getRepliesUrl(comment: CommentFull) {
		const { publicPostId, groupPostId, id } = comment;
		if (!publicPostId && !groupPostId)
			throw new Error("Comment is not linked to a post");
		const postId = publicPostId ?? groupPostId;
		return `/posts/${postId}/${id}`;
	}

	/**
	 * Extracts the ID of the post a comment belongs to
	 * @param comment the data of the comment
	 * @param postType the type of the post (Public or Group)
	 * @returns the post ID
	 */
	static getPostId(comment: CommentFull, postType: PostType) {
		const { publicPostId, groupPostId } = comment;
		if (!publicPostId && !groupPostId)
			throw new Error("Comment is not linked to a post");
		const postId = postType === "public" ? publicPostId : groupPostId;
		return postId as string;
	}

	/**
	 * Forms the relative url of the post a comment belongs to,
	 * an error is thrown if the process fails
	 * @param comment the data of the comment
	 * @returns a string which represents a relative url
	 */
	static getPostUrl(comment: CommentFull, postType: PostType) {
		const postId = this.getPostId(comment, postType);
		return `/posts/${postId}`;
	}
}

export type CommentAPIGetManyParams = Omit<
	Prisma.CommentFindManyArgs,
	"distinct" | "select" | "include"
>;

export interface CreateCommentData {
	content: JSONContent;
	postId: string;
	authorId: string;
	postType: PostType;
	parentId?: string;
}

export interface UpdateCommentPayload {
	content?: JSONContent;
}

const commentFull = Prisma.validator<Prisma.CommentDefaultArgs>()({
	include: { author: true, parentComment: true },
});

export type CommentFull = Prisma.CommentGetPayload<typeof commentFull>;

export default CommentsAPI;
