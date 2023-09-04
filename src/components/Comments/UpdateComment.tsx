import { Button } from "@mantine/core";
import CommentEditor from "../Editor/CommentEditor";
import { Editor } from "@tiptap/react";
import { notifications } from "@mantine/notifications";
import { Dispatch, SetStateAction } from "react";
import CommentsAPI from "@/lib/api/CommentsAPI";
import { getErrorMessage } from "@/lib/error-message";

interface UpdateCommentProps {
	editor: Editor;
	commentData: {
		id: string;
		authorId: string;
	};
	isUpdating: boolean;
	setIsUpdatingState: Dispatch<SetStateAction<boolean>>;
	onUpdate?: () => void;
	cancelUpdate: () => void;
}

/**
 * React component which renders an interface for updating a comment
 */
export default function UpdateComment(props: UpdateCommentProps) {
	const { editor, commentData } = props;

	async function updateComment() {
		const noContent = editor.isEmpty || editor.getText().trim().length === 0;
		if (noContent) {
			notifications.show({
				color: "red",
				title: "Invalid data",
				message: "Cannot update comment with empty content",
			});
			return;
		}

		// set the editor to read-only while comment is being updated
		props.setIsUpdatingState(true);
		editor.setEditable(false);
		try {
			await CommentsAPI.update(commentData.id, {
				content: editor.getJSON(),
			});
			if (props.onUpdate) {
				props.onUpdate();
			}
		} catch (error) {
			props.cancelUpdate();
			notifications.show({
				color: "red",
				title: "Failed to update comment",
				message: getErrorMessage(error),
			});
		}
		props.setIsUpdatingState(false);
	}
	return (
		<div className="flex flex-col gap-1">
			<CommentEditor editor={props.editor} />
			<div className="flex flex-col gap-0.5">
				<Button
					type="button"
					className="bg-dark-green disabled:hover:bg-dark-green hover:bg-dark-green-l"
					onClick={updateComment}
					disabled={props.isUpdating}>
					Save
				</Button>
				<Button
					type="button"
					className="bg-dark-red disabled:hover:bg-dark-red hover:bg-dark-red-l"
					onClick={props.cancelUpdate}
					disabled={props.isUpdating}>
					Cancel
				</Button>
			</div>
		</div>
	);
}
