import { RichTextEditor } from "@mantine/tiptap";
import { Editor } from "@tiptap/react";

interface PostEditorProps {
	editor: Editor | null;
}

/**
 * Rich Text Editor component for posts
 */
export default function PostEditor(props: PostEditorProps) {
	const { editor, ...otherProps } = props;
	return (
		<RichTextEditor editor={editor} {...otherProps}>
			<RichTextEditor.Toolbar>
				<RichTextEditor.ControlsGroup>
					<RichTextEditor.Bold />
					<RichTextEditor.Italic />
					<RichTextEditor.Underline />
					<RichTextEditor.Strikethrough />
					<RichTextEditor.ClearFormatting />
				</RichTextEditor.ControlsGroup>

				<RichTextEditor.ControlsGroup>
					<RichTextEditor.Code />
					<RichTextEditor.CodeBlock />
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
	);
}
