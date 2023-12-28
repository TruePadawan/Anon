import { Button } from "@mantine/core";
import PostEditor from "../Editor/PostEditor";
import { Editor } from "@tiptap/react";
import { notifications } from "@mantine/notifications";
import { Dispatch, SetStateAction } from "react";
import PublicPostAPI from "@/lib/api/PublicPostAPI";
import { getErrorMessage } from "@/lib/error-message";
import GroupPostAPI from "@/lib/api/GroupPostAPI";

interface UpdatePostProps {
	editor: Editor;
	postData: {
		Id: string;
		authorId: string;
		type: "public" | "group";
	};
	isUpdating: boolean;
	setIsUpdatingState: Dispatch<SetStateAction<boolean>>;
	onUpdate?: () => void;
	cancelUpdate: () => void;
}

/**
 * React component which renders an interface for updating a post
 */
export default function UpdatePost(props: UpdatePostProps) {
	const { editor, postData } = props;

	async function updatePost() {
		const emptyPost = editor.isEmpty || editor.getText().trim().length === 0;
		if (emptyPost) {
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
		try {
			if (postData.type === "public") {
				await PublicPostAPI.update(postData.Id, {
					content: editor.getJSON(),
				});
			} else {
				await GroupPostAPI.update(postData.Id, { content: editor.getJSON() });
			}
			if (props.onUpdate) {
				props.onUpdate();
			}
		} catch (error) {
			// run the cancel update callback if the update failed
			props.cancelUpdate();
			notifications.show({
				color: "red",
				title: "Failed to update post",
				message: getErrorMessage(error),
			});
		}
		props.setIsUpdatingState(false);
	}
	return (
		<div className="flex flex-col gap-1">
			<PostEditor editor={props.editor} data-cy="update-post-editor" />
			<div className="flex flex-col gap-0.5">
				<Button
					type="button"
					className="bg-dark-green disabled:hover:bg-dark-green hover:bg-dark-green-l"
					onClick={updatePost}
					disabled={props.isUpdating}
					data-cy="submit-post-update">
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
