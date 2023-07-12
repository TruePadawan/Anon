import { RichTextEditor } from "@mantine/tiptap";
import { PublicPost } from "@prisma/client";
import { Content, useEditor } from "@tiptap/react";
import { EditorExtensions } from "../../../helpers/global-helpers";

interface PostItemProps {
	postData: PublicPost;
}

export default function PostItem({ postData }: PostItemProps) {
	const editor = useEditor({
		editable: false,
		extensions: EditorExtensions,
		content: postData.content as Content,
	});
	const creationDate = new Date(postData.createdAt).toLocaleDateString();

	return (
		<li className="d-flex flex-col gap-1">
			<p>{`Post created on ${creationDate}`}</p>
			<RichTextEditor editor={editor}>
				<RichTextEditor.Content />
			</RichTextEditor>
		</li>
	);
}
