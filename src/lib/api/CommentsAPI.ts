import { handleFailedAPIRequest } from "@/helpers/global_helpers";
import { Comment, Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";

class CommentsAPI {
	static async create(data: CreateCommentData) {
		const response = await fetch("/api/create-comment", {
			method: "POST",
			body: JSON.stringify(data),
		});
		await handleFailedAPIRequest(response);
		const comment: CreatedComment = await response.json();
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
}

export interface CreateCommentData {
	content: JSONContent;
	authorId: string;
	commentGroupId: string;
}

export interface UpdateCommentPayload {
	content?: JSONContent;
}

const createdComment = Prisma.validator<Prisma.CommentArgs>()({
	include: { author: true, parentComment: true },
});

export type CreatedComment = Prisma.CommentGetPayload<typeof createdComment>;

export default CommentsAPI;
