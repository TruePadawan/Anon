import { RichTextEditor } from "@mantine/tiptap";
import { Content, useEditor } from "@tiptap/react";
import { PostEditorExtensions } from "../../../helpers/global-helpers";
import {
	ActionIcon,
	Alert,
	Avatar,
	Button,
	Menu,
	Modal,
	useMantineTheme,
} from "@mantine/core";
import { PublicPostFull } from "@/types/types";
import moment from "moment";
import Link from "next/link";
import { IconDots, IconCheck, IconEdit, IconTrash } from "@tabler/icons-react";
import { UserProfile } from "@prisma/client";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

interface PostItemProps {
	postData: PublicPostFull;
	currentUser: UserProfile | null;
	postType: "public" | "group";
}

export default function PostItem(props: PostItemProps) {
	const [
		confirmDeleteModalOpened,
		{ open: openConfirmDeleteModal, close: closeConfirmDeleteModal },
	] = useDisclosure(false);
	const theme = useMantineTheme();
	const { postData, currentUser, postType } = props;
	const { author } = postData;
	const editor = useEditor({
		editable: false,
		extensions: PostEditorExtensions,
		content: postData.content as Content,
	});
	const [postDeleted, setPostDeleted] = useState(false);

	async function deletePost() {
		const response = await fetch("/api/delete-post", {
			method: "POST",
			body: JSON.stringify({ postData, postType }),
		});
		if (response.ok) {
			setPostDeleted(true);
		} else {
			const error = await response.json();
			notifications.show({
				color: "red",
				title: "Failed to delete post",
				message: error.message,
			});
		}
		closeConfirmDeleteModal();
	}

	const creationDate = moment(postData.createdAt).fromNow(true);
	const currentUserIsAuthor = currentUser?.id === author.id;
	return (
		<li
			className="flex gap-1.5 py-1.5 px-2 rounded-md"
			style={{ backgroundColor: theme.colors.dark[7] }}>
			{postDeleted && (
				<Alert
					className="grow"
					icon={<IconCheck size="1rem" />}
					color="dark"
					variant="filled">
					Post deleted successfully
				</Alert>
			)}
			{!postDeleted && (
				<>
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
								<>
									<Menu>
										<Menu.Target>
											<ActionIcon>
												<IconDots />
											</ActionIcon>
										</Menu.Target>
										<Menu.Dropdown>
											<Menu.Label>Manage</Menu.Label>
											<Menu.Item icon={<IconEdit size={16} />}>Edit</Menu.Item>
											<Menu.Item
												color="red"
												icon={<IconTrash size={16} />}
												onClick={openConfirmDeleteModal}>
												Delete
											</Menu.Item>
										</Menu.Dropdown>
									</Menu>
									<Modal
										opened={confirmDeleteModalOpened}
										onClose={closeConfirmDeleteModal}
										title="Confirm Action"
										centered>
										<div className="flex flex-col gap-1.5">
											<p>Are you sure you want to delete this post?</p>
											<div className="flex flex-col gap-1">
												<Button color="green" onClick={deletePost}>
													Yes
												</Button>
												<Button color="red" onClick={closeConfirmDeleteModal}>
													No
												</Button>
											</div>
										</div>
									</Modal>
								</>
							)}
						</div>
						<RichTextEditor
							editor={editor}
							styles={{
								root: { border: "none" },
								content: { "& .ProseMirror": { padding: "0" } },
							}}>
							<RichTextEditor.Content />
						</RichTextEditor>
					</div>
				</>
			)}
		</li>
	);
}
