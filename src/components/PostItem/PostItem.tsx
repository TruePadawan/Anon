import { RichTextEditor } from "@mantine/tiptap";
import { Content, useEditor } from "@tiptap/react";
import { PostEditorExtensions } from "../../../helpers/global-helpers";
import { ActionIcon, Avatar, Menu, useMantineTheme } from "@mantine/core";
import { PublicPostFull } from "@/types/types";
import moment from "moment";
import Link from "next/link";
import { IconDots } from "@tabler/icons-react";
import { IconEdit } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import { UserProfile } from "@prisma/client";

interface PostItemProps {
	postData: PublicPostFull;
	currentUser: UserProfile | null;
}

export default function PostItem(props: PostItemProps) {
	const { postData, currentUser } = props;
	const theme = useMantineTheme();
	const { author } = postData;
	const editor = useEditor({
		editable: false,
		extensions: PostEditorExtensions,
		content: postData.content as Content,
	});
	const creationDate = moment(postData.createdAt).fromNow(true);
	const currentUserIsAuthor = currentUser?.id === author.id;
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
			<div className="flex grow flex-col gap-0.5">
				<div className="flex justify-between">
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
					{currentUserIsAuthor && (
						<Menu>
							<Menu.Target>
								<ActionIcon>
									<IconDots />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Label>Manage</Menu.Label>
								<Menu.Item icon={<IconEdit size={16} />}>Edit</Menu.Item>
								<Menu.Item color="red" icon={<IconTrash size={16} />}>
									Delete
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					)}
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
