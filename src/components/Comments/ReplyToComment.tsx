import CommentEditor from "@/components/Editor/CommentEditor";
import { CommentEditorExtensions } from "@/helpers/global_vars";
import CommentsAPI, { CommentFull } from "@/lib/api/CommentsAPI";
import { getErrorMessage } from "@/lib/error-message";
import { PostType } from "@/types/types";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEditor } from "@tiptap/react";
import { useState } from "react";

/**
 * React component which renders an interface for replying to a comment
 */
export default function ReplyToComment(props: ReplyToCommentProps) {
	const [isPostingReply, setIsPostingReply] = useState(false);
	const editor = useEditor({ extensions: CommentEditorExtensions });

	async function postReply() {
		try {
			if (!editor) {
				throw new Error("Reply editor not initialized");
			}
			const noContent = editor.isEmpty || editor.getText().trim().length === 0;
			if (noContent) {
				throw new Error("Cannot post reply with empty content");
			}

			setIsPostingReply(true);
			// set the editor to read-only while posting reply
			editor.setEditable(false);
			await CommentsAPI.create({
				content: editor.getJSON(),
				authorId: props.authorId,
				postId: CommentsAPI.getPostId(props.commentData, props.postType),
				postType: props.postType,
				parentId: props.commentData.id,
			});
			setIsPostingReply(false);
			props.onReplyPosted();
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to post reply",
				message: getErrorMessage(error),
			});
			props.onCancel();
		}
	}

	return (
		<div className="my-2 flex flex-col gap-1">
			<CommentEditor editor={editor} />
			<div className="flex flex-col gap-1">
				<Button
					size="xs"
					radius="xs"
					color="green"
					disabled={isPostingReply}
					onClick={postReply}>
					Post reply
				</Button>
				<Button
					size="xs"
					radius="xs"
					color="red"
					variant="light"
					onClick={props.onCancel}
					disabled={isPostingReply}>
					Cancel
				</Button>
			</div>
		</div>
	);
}

interface ReplyToCommentProps {
	commentData: CommentFull;
	postType: PostType;
	authorId: string;
	onCancel: () => void;
	onReplyPosted: () => void;
}
