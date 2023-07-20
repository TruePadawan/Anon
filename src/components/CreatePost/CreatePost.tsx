import { useState } from "react";
import { JSONContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { PostEditorExtensions } from "../../../helpers/global-helpers";
import { Button } from "@mantine/core";
import PostEditor from "../Editor/PostEditor";

interface CreatePostProps {
	anonymous?: boolean;
	className?: string;
	handlePostSubmit: (content: JSONContent, onSubmit: () => void) => void;
}

export default function CreatePost(props: CreatePostProps) {
	const [isSubmittingPost, setIsSubmittingPost] = useState(false);
	const editor = useEditor({
		extensions: [
			...PostEditorExtensions,
			Placeholder.configure({ placeholder: "Share your thoughts" }),
		],
	});

	// pass editor content to post submit handler and clear the editor after post is submitted
	function btnClickHandler() {
		if (editor === null) return;
		const NoPostContent =
			editor.isEmpty || editor.getText().trim().length === 0;

		if (!NoPostContent) {
			setIsSubmittingPost(true);
			const editorContent = editor.getJSON();
			props.handlePostSubmit(editorContent, () => {
				setIsSubmittingPost(false);
				editor.commands.clearContent();
			});
		}
	}

	return (
		<div
			className={`flex flex-col gap-2 ${
				props.className || ""
			}`}>
			<PostEditor editor={editor} />
			<Button
				type="button"
				color="gray"
				size="md"
				onClick={btnClickHandler}
				disabled={isSubmittingPost}>
				{props.anonymous ? "Create anonymous post" : "Create post"}
			</Button>
		</div>
	);
}
