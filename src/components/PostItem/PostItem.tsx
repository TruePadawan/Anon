import { RichTextEditor } from "@mantine/tiptap";
import { Content, Editor, useEditor } from "@tiptap/react";
import { PostEditorExtensions } from "../../../helpers/global-helpers";
import {
	ActionIcon,
	Alert,
	Avatar,
	Button,
	Divider,
	Menu,
	Modal,
	useMantineTheme,
} from "@mantine/core";
import { PublicPostFull } from "@/types/types";
import moment from "moment";
import Link from "next/link";
import {
	IconDots,
	IconCheck,
	IconEdit,
	IconTrash,
	IconArrowsMaximize,
	IconMessageCircle,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import UpdatePost from "./UpdatePost";
import Comments from "../Comments/Comments";
import useUser from "@/hooks/useUser";

interface PostItemProps {
	className?: string;
	postData: PublicPostFull;
	postType: "public" | "group";
	full: boolean;
}

export default function PostItem(props: PostItemProps) {
	const { user: currentUser } = useUser();
	const [
		confirmDeleteModalOpened,
		{ open: openConfirmDeleteModal, close: closeConfirmDeleteModal },
	] = useDisclosure(false);
	const theme = useMantineTheme();
	const { postData, postType } = props;
	const { author } = postData;
	const editor = useEditor({
		editable: false,
		extensions: PostEditorExtensions,
		content: postData.content as Content,
	});
	const [inEditMode, setInEditMode] = useState(false);
	const [isUpdatingPost, setIsUpdatingPost] = useState(false);
	const [postDeleted, setPostDeleted] = useState(false);
	const [commentsAllowed, setCommentsAllowed] = useState(
		postData.commentsAllowed
	);
	const editorContentRef = useRef(editor?.getHTML());

	function startEditMode() {
		editorContentRef.current = editor?.getHTML();
		editor?.setEditable(true);
		setInEditMode(true);
	}

	function stopEditMode() {
		editor?.setEditable(false);
		setInEditMode(false);
	}

	// restore editor content to what it was pre-edit before stopping edit mode
	function cancelEditMode() {
		if (editorContentRef.current) {
			editor?.commands.setContent(editorContentRef.current);
		}
		stopEditMode();
	}

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

	async function toggleComments() {
		setIsUpdatingPost(true);
		const response = await fetch(`/api/get-public-post/${postData.id}`);
		if (response.ok) {
			const post: PublicPostFull = await response.json();
			const postResponse = await fetch("/api/update-public-post", {
				method: "POST",
				body: JSON.stringify({
					id: postData.id,
					authorId: postData.authorId,
					data: {
						commentsAllowed: !post.commentsAllowed,
					},
				}),
			});
			const { commentsAllowed }: PublicPostFull = await postResponse.json();
			setCommentsAllowed(commentsAllowed);
		} else {
			notifications.show({
				color: "red",
				title: "Failed to complete action",
				message: "Could not retrieve post data",
			});
		}
		setIsUpdatingPost(false);
	}
	const creationDate = moment(postData.createdAt).fromNow(true);
	const currentUserIsAuthor = currentUser?.id === author.id;
	return (
		<li className={`flex flex-col gap-4 ${props.className || ""}`}>
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
					<div
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
											<span className="font-semibold">
												{author.displayName}
											</span>
										</Link>
										<Link href={`/users/${author.accountName}`}>
											<span className="text-gray-500 text-sm">{`@${author.accountName}`}</span>
										</Link>
										<span>·</span>
										<span className="text-gray-500 text-sm">
											{creationDate}
										</span>
									</div>
									<Menu>
										<Menu.Target>
											<ActionIcon>
												<IconDots />
											</ActionIcon>
										</Menu.Target>
										<Menu.Dropdown>
											{!props.full && (
												<>
													<Menu.Label>General</Menu.Label>
													<Menu.Item
														component={Link}
														icon={<IconArrowsMaximize size={16} />}
														href={`/posts/${postData.id}`}>
														View full post
													</Menu.Item>
												</>
											)}
											{currentUserIsAuthor && (
												<>
													<Menu.Label>Manage</Menu.Label>
													<Menu.Item
														icon={<IconMessageCircle size={16} />}
														onClick={toggleComments}
														disabled={inEditMode || isUpdatingPost}>
														{commentsAllowed
															? "Disable comments"
															: "Enable comments"}
													</Menu.Item>
													<Menu.Item
														icon={<IconEdit size={16} />}
														onClick={startEditMode}
														disabled={inEditMode || isUpdatingPost}>
														Edit
													</Menu.Item>
													<Menu.Item
														color="red"
														icon={<IconTrash size={16} />}
														onClick={openConfirmDeleteModal}
														disabled={inEditMode || isUpdatingPost}>
														Delete
													</Menu.Item>
												</>
											)}
										</Menu.Dropdown>
									</Menu>
									{currentUserIsAuthor && (
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
									)}
								</div>
								{inEditMode && (
									<UpdatePost
										editor={editor as Editor}
										postID={postData.id}
										authorId={postData.authorId}
										isUpdating={isUpdatingPost}
										setIsUpdatingState={setIsUpdatingPost}
										onUpdate={stopEditMode}
										cancelUpdate={cancelEditMode}
									/>
								)}
								{!inEditMode && (
									<RichTextEditor
										editor={editor}
										styles={{
											root: { border: "none" },
											content: { "& .ProseMirror": { padding: "0" } },
										}}>
										<RichTextEditor.Content />
									</RichTextEditor>
								)}
							</div>
						</div>
						{!props.full && (
							<Comments
								commentGroupID={postData.id}
								commentsAllowed={commentsAllowed || currentUserIsAuthor}
								showOnlyCommentsCount={!props.full}
							/>
						)}
					</div>
					{props.full && (
						<>
							<Divider label="Comments" labelPosition="center" />
							<Comments
								commentGroupID={postData.id}
								commentsAllowed={commentsAllowed || currentUserIsAuthor}
								showOnlyCommentsCount={!props.full}
							/>
						</>
					)}
				</>
			)}
		</li>
	);
}
