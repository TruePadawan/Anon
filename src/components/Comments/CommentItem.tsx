import { CommentFull } from "@/types/types";
import {
	Avatar,
	Menu,
	ActionIcon,
	useMantineTheme,
	Skeleton,
	Modal,
	Button,
	Alert,
} from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { UserProfile } from "@prisma/client";
import { IconCheck, IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import { Content, useEditor } from "@tiptap/react";
import moment from "moment";
import Link from "next/link";
import useSWR from "swr";
import { CommentEditorExtensions } from "../../../helpers/global-helpers";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

interface CommentItemProps {
	id: string;
	currentUser: UserProfile | null;
	className?: string;
}

const fetcher = async (key: string): Promise<CommentFull> => {
	const response = await fetch(key);
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}
	const comments = await response.json();
	return comments;
};

export default function CommentItem(props: CommentItemProps) {
	const [commentDeleted, setCommentDeleted] = useState(false);
	const theme = useMantineTheme();
	const {
		data: commentData,
		isLoading,
		error,
	} = useSWR(commentDeleted ? null : `/api/get-comment/${props.id}`, fetcher);
	const editor = useEditor({
		editable: false,
		extensions: CommentEditorExtensions,
	});
	const [
		confirmDeleteModalOpened,
		{ open: openConfirmDeleteModal, close: closeConfirmDeleteModal },
	] = useDisclosure(false);

	if (isLoading) {
		return (
			<div
				className="flex flex-col p-1 rounded-md"
				style={{ backgroundColor: theme.colors.dark[7] }}>
				<div className="flex gap-1.5 py-1 px-1">
					<Skeleton circle height={40} />
					<div className="flex grow flex-col gap-1.5">
						<Skeleton height={25} />
						<Skeleton height={80} />
					</div>
				</div>
			</div>
		);
	}

	if (commentDeleted) {
		return (
			<li
				className="flex flex-col p-1 rounded-md"
				style={{ backgroundColor: theme.colors.dark[7] }}>
				<Alert
					className="grow"
					icon={<IconCheck size="1rem" />}
					color="dark"
					variant="filled">
					Comment has been deleted
				</Alert>
			</li>
		);
	}

	if (error || !commentData) {
		return (
			<li
				className="flex flex-col p-1 rounded-md"
				style={{ backgroundColor: theme.colors.dark[7] }}>
				<Alert
					className="grow"
					icon={<IconCheck size="1rem" />}
					color="dark"
					variant="filled">
					Comment not found
				</Alert>
			</li>
		);
	}

	async function deleteComment() {
		const response = await fetch("/api/delete-comment", {
			method: "POST",
			body: JSON.stringify({ comment: commentData }),
		});
		if (response.ok) {
			setCommentDeleted(true);
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
	// set editor content after comment data is fetched
	if (editor?.isEmpty) {
		editor.commands.setContent(commentData.content as Content);
	}

	const { author } = commentData;
	const currentUserIsAuthor = props.currentUser?.id === author.id;
	const creationDate = moment(commentData.createdAt).fromNow(true);
	return (
		<li
			className="flex flex-col p-1 rounded-md"
			style={{ backgroundColor: theme.colors.dark[7] }}>
			<div className="flex gap-1.5 py-1 px-1">
				<Avatar
					variant="filled"
					radius="xl"
					color={author.color}
					src={author.avatarUrl}
				/>
				<div className="flex grow flex-col gap-1.5">
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
										<p>Are you sure you want to delete this comment?</p>
										<div className="flex flex-col gap-1">
											<Button color="green" onClick={deleteComment}>
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
			</div>
		</li>
	);
}
