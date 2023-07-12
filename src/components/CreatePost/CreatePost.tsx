import { useState } from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { JSONContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorExtensions } from "../../../helpers/global-helpers";
import { Button } from "@mantine/core";

interface CreatePostProps {
	anonymous?: boolean;
	className?: string;
	handlePostSubmit: (content: JSONContent, onSubmit: () => void) => void;
}

export default function CreatePost(props: CreatePostProps) {
	const [isSubmittingPost, setIsSubmittingPost] = useState(false);
	const editor = useEditor({
		extensions: [
			...EditorExtensions,
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
		<div className={`max-w-3xl w-full flex flex-col gap-2 ${props.className || ""}`}>
			<RichTextEditor editor={editor}>
				<RichTextEditor.Toolbar sticky stickyOffset={60}>
					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Bold />
						<RichTextEditor.Italic />
						<RichTextEditor.Underline />
						<RichTextEditor.Strikethrough />
						<RichTextEditor.ClearFormatting />
						<RichTextEditor.Code />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.H1 />
						<RichTextEditor.H2 />
						<RichTextEditor.H3 />
						<RichTextEditor.H4 />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Blockquote />
						<RichTextEditor.BulletList />
						<RichTextEditor.OrderedList />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.Link />
						<RichTextEditor.Unlink />
					</RichTextEditor.ControlsGroup>

					<RichTextEditor.ControlsGroup>
						<RichTextEditor.AlignLeft />
						<RichTextEditor.AlignCenter />
						<RichTextEditor.AlignJustify />
						<RichTextEditor.AlignRight />
					</RichTextEditor.ControlsGroup>
				</RichTextEditor.Toolbar>

				<RichTextEditor.Content />
			</RichTextEditor>
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
