import { Button } from "@mantine/core";
import PostEditor from "../Editor/PostEditor";
import { Editor } from "@tiptap/react";
import { notifications } from "@mantine/notifications";
import { Dispatch, SetStateAction } from "react";

interface UpdatePostProps {
	editor: Editor;
	postID: string;
	authorId: string;
	isUpdating: boolean;
	setIsUpdatingState: Dispatch<SetStateAction<boolean>>;
	onUpdate?: () => void;
	cancelUpdate: () => void;
}

export default function UpdatePost(props: UpdatePostProps) {
	const { editor, postID, authorId } = props;

	async function updatePost() {
		const NoPostContent =
			editor.isEmpty || editor.getText().trim().length === 0;
		if (NoPostContent) {
			notifications.show({
				color: "red",
				title: "Invalid data",
				message: "Cannot update post with empty content",
			});
			return;
		}

		// set the editor to read-only while post is being updated
		props.setIsUpdatingState(true);
		editor.setEditable(false);

		const response = await fetch("/api/update-public-post", {
			method: "POST",
			body: JSON.stringify({
				id: postID,
				authorId,
				content: editor.getJSON(),
			}),
		});
		if (response.ok && props.onUpdate) {
			props.onUpdate();
		} else if (!response.ok) {
			const error = await response.json();
			notifications.show({
				color: "red",
				title: "Failed to update post",
				message: error.message,
			});

			// run the cancel update callback if the update failed
			props.cancelUpdate();
		}
		props.setIsUpdatingState(false);
	}
	return (
		<div className="flex flex-col gap-1">
			<PostEditor editor={props.editor} />
			<div className="flex flex-col gap-0.5">
				<Button
					type="button"
					className="bg-dark-green disabled:hover:bg-dark-green hover:bg-dark-green-l"
					onClick={updatePost}
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
