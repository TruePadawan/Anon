import { useEditor } from "@tiptap/react";
import { CommentEditorExtensions } from "../../../helpers/global-helpers";
import CommentEditor from "../Editor/CommentEditor";
import { useMemo, useState } from "react";
import CommentItem from "./CommentItem";
import { UserProfile } from "@prisma/client";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

interface CommentsProps {
	commentGroupID: string;
	currentUser: UserProfile | null;
	commentsAllowed: boolean;
	initialCommentsCount?: number;
	showOnlyCommentsCount?: boolean;
}

export default function Comments(props: CommentsProps) {
	const editor = useEditor({
		extensions: CommentEditorExtensions,
	});
	const [commentIDs, setCommentIDs] = useState<string[]>([]);
	const [creatingComment, setCreatingComment] = useState(false);
	const { commentGroupID, currentUser, initialCommentsCount = 5 } = props;
	// use swr to fetch for comments

	const comments = useMemo(() => {
		return commentIDs.map((id) => <CommentItem key={id} id={id} />);
	}, [commentIDs]);

	function getCommentObject() {
		if (editor === null) {
			throw new Error("Failed to initialize editor");
		} else if (props.currentUser === null) {
			throw new Error("Unsigned user can't make comments");
		}

		const invalidComment =
			editor.isEmpty || editor.getText().trim().length === 0;

		if (invalidComment) {
			throw new Error("A comment can't be empty or just whitespace");
		}
		return {
			commentGroupId: commentGroupID,
			content: editor.getJSON(),
			authorId: props.currentUser.id,
			createdAt: Date.now(),
		};
	}

	async function createComment() {
		setCreatingComment(true);
		try {
			const comment = getCommentObject();
			const response = await fetch("/api/create-comment", {
				method: "POST",
				body: JSON.stringify(comment),
			});
			const responseBody = await response.json();
			if (!response.ok) {
				throw new Error(responseBody.message);
			}
			const newCommentID = responseBody.commentID;
			setCommentIDs((IDs) => [newCommentID, ...IDs]);

			// clear comment editor after comment is created
			editor?.commands.clearContent();
		} catch (error: any) {
			console.error(error);
			notifications.show({
				color: "red",
				title: "Failed to create comment",
				message: error.message,
			});
		}
		setCreatingComment(false);
	}

	const commentsCount = commentIDs.length;
	if (props.showOnlyCommentsCount) {
		return (
			<p className="w-full text-center font-semibold">{`${commentsCount} comment${
				commentsCount === 1 ? "" : "s"
			}`}</p>
		);
	}
	return (
		<div className="w-full flex flex-col gap-2">
			{props.commentsAllowed && (
				<div>
					<CommentEditor editor={editor} />
					<Button
						type="button"
						className="mt-1 w-full"
						size="md"
						color="gray"
						onClick={createComment}
						disabled={creatingComment}>
						Post comment
					</Button>
				</div>
			)}
			<ul>{comments}</ul>
		</div>
	);
}
