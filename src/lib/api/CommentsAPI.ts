import { handleFailedAPIRequest } from "@/helpers/global_helpers";
import { PostType } from "@/types/types";
import { Comment, Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";

class CommentsAPI {
	static async create(data: CreateCommentData) {
		const response = await fetch("/api/create-comment", {
			method: "POST",
			body: JSON.stringify(data),
		});
		await handleFailedAPIRequest(response);
		const comment: CommentFull = await response.json();
		return comment;
	}

	static async update(
		id: string,
		authorId: string,
		newData: UpdateCommentPayload
	) {
		const response = await fetch("/api/update-comment", {
			method: "POST",
			body: JSON.stringify({
				id,
				authorId,
				data: newData,
			}),
		});
		await handleFailedAPIRequest(response);
		const updatedComment: Comment = await response.json();
		return updatedComment;
	}

	static async remove(id: string, authorId: string) {
		const response = await fetch("/api/delete-comment", {
			method: "POST",
			body: JSON.stringify({
				id,
				authorId,
			}),
		});
		await handleFailedAPIRequest(response);
	}

	static async count(commentGroupId: string, postType: PostType) {
		const response = await fetch("/api/get-comments-count", {
			method: "POST",
			body: JSON.stringify({
				commentGroupId,
				postType,
			}),
		});
		await handleFailedAPIRequest(response);
		const { count } = await response.json();
		return Number(count);
	}

	static async replyCount(commentId: string) {
		const response = await fetch(`/api/get-reply-count/${commentId}`);
		await handleFailedAPIRequest(response);
		const { count } = await response.json();
		return Number(count);
	}

	static async getMany(params?: CommentAPIGetManyParams) {
		const response = await fetch("/api/get-comments", {
			method: "POST",
			body: JSON.stringify(params),
		});
		await handleFailedAPIRequest(response);
		const comments: CommentFull[] = await response.json();
		return comments;
	}

	static getRepliesUrl(comment: CommentFull) {
		const { publicPostId, groupPostId, id } = comment;
		if (!publicPostId && !groupPostId)
			throw new Error("Comment is not linked to a post");
		const commentGroupId = publicPostId ?? groupPostId;
		return `/posts/${commentGroupId}/${id}`;
	}

	static getPostUrl(comment: CommentFull, postType: PostType) {
		const { publicPostId, groupPostId } = comment;
		if (!publicPostId && !groupPostId)
			throw new Error("Comment is not linked to a post");
		const postId = postType === "public" ? publicPostId : groupPostId;
		return `/posts/${postId}`;
	}
}

export interface CommentAPIGetManyParams {
	take?: number;
	where?: Prisma.CommentWhereInput;
	orderBy?: Prisma.CommentOrderByWithRelationInput;
	cursor?: Prisma.CommentWhereInput;
	skip?: number;
}

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

const commentFull = Prisma.validator<Prisma.CommentArgs>()({
	include: { author: true, parentComment: true },
});

export type CommentFull = Prisma.CommentGetPayload<typeof commentFull>;

export default CommentsAPI;
