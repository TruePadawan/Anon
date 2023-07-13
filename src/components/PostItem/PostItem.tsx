import { RichTextEditor } from "@mantine/tiptap";
import { Content, useEditor } from "@tiptap/react";
import { PostEditorExtensions } from "../../../helpers/global-helpers";
import { Avatar, useMantineTheme } from "@mantine/core";
import { PublicPostFull } from "@/types/types";
import moment from "moment";
import Link from "next/link";

interface PostItemProps {
	postData: PublicPostFull;
}

export default function PostItem({ postData }: PostItemProps) {
	const theme = useMantineTheme();
	const { author } = postData;
	const editor = useEditor({
		editable: false,
		extensions: PostEditorExtensions,
		content: postData.content as Content,
	});
	const creationDate = moment(postData.createdAt).fromNow(true);
	return (
		<li
			className="flex gap-1.5 py-1.5 px-2 rounded-md"
			style={{ backgroundColor: theme.colors.dark[7] }}>
			<Avatar
				variant="filled"
				radius="xl"
				color={author.color}
				src={author.avatarUrl}
			/>
			<div className="flex flex-col gap-0.5">
				<div className="flex items-center gap-0.5">
					<Link href={`/users/${author.accountName}`}>
						<span className="font-semibold">{author.displayName}</span>
					</Link>
					<Link href={`/users/${author.accountName}`}>
						<span className="text-gray-500 text-sm">{`@${author.accountName}`}</span>
					</Link>
					<span>·</span>
					<span className="text-gray-500 text-sm">{creationDate}</span>
				</div>
				<RichTextEditor
					editor={editor}
					sx={{ border: "none", ".ProseMirror": { padding: "0" } }}>
					<RichTextEditor.Content />
				</RichTextEditor>
			</div>
		</li>
	);
}
