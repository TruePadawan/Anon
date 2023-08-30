import {
	Menu,
	ActionIcon,
	useMantineTheme,
	Modal,
	Button,
	Spoiler,
} from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import {
	IconDots,
	IconEdit,
	IconTrash,
	IconMessage,
} from "@tabler/icons-react";
import { Content, Editor, useEditor } from "@tiptap/react";
import moment from "moment";
import Link from "next/link";
import { CommentEditorExtensions } from "@/helpers/global_vars";
import { useDisclosure } from "@mantine/hooks";
import { forwardRef, useRef, useState, Ref } from "react";
import { notifications } from "@mantine/notifications";
import UpdateComment from "./UpdateComment";
import useUser from "@/hooks/useUser";
import CommentsAPI, { CommentFull } from "@/lib/api/CommentsAPI";
import { getErrorMessage } from "@/lib/error-message";
import PostItem from "../PostItem/PostItem";
import { ReplyCount } from "./CommentsCount";
import ReplyToComment from "./ReplyToComment";

interface CommentItemProps {
	data: CommentFull;
	postType: "public" | "group";
	showReplyCount?: boolean;
	className?: string;
}

const CommentItem = forwardRef(function CommentItem(
	props: CommentItemProps,
	ref: Ref<HTMLLIElement>
) {
	const { user: currentUser } = useUser();
	const [commentDeleted, setCommentDeleted] = useState(false);
	const theme = useMantineTheme();
	const editor = useEditor({
		editable: false,
		extensions: CommentEditorExtensions,
	});
	const [
		confirmDeleteModalOpened,
		{ open: openConfirmDeleteModal, close: closeConfirmDeleteModal },
	] = useDisclosure(false);
	const [inEditMode, toggleEditMode] = useState(false);
	const [inReplyMode, toggleReplyMode] = useState(false);
	const [isUpdatingComment, setIsUpdatingComment] = useState(false);
	const editorContentRef = useRef(editor?.getHTML());
	const listItemStyles = { backgroundColor: theme.colors.dark[6] };

	if (commentDeleted) {
		return (
			<li className="text-center text-sm list-none p-3" style={listItemStyles}>
				Comment deleted successfully
			</li>
		);
	}

	function enterReplyMode() {
		toggleReplyMode(true);
	}

	function endReplyMode() {
		toggleReplyMode(false);
	}

	function startEditMode() {
		editorContentRef.current = editor?.getHTML();
		toggleEditMode(true);
		editor?.setEditable(true);
	}

	function stopEditMode() {
		toggleEditMode(false);
		editor?.setEditable(false);
	}

	// restore editor content to what it was pre-edit before stopping edit mode
	function cancelEditMode() {
		if (editorContentRef.current) {
			editor?.commands.setContent(editorContentRef.current);
		}
		stopEditMode();
	}

	async function deleteComment() {
		try {
			await CommentsAPI.remove(props.data.id, props.data.author.id);
			setCommentDeleted(true);
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to delete comment",
				message: getErrorMessage(error),
			});
		}
		closeConfirmDeleteModal();
	}

	// set editor content after comment data is fetched
	if (editor?.isEmpty) {
		editor.commands.setContent(props.data.content as Content);
	}

	const { author } = props.data;
	const currentUserIsAuthor = currentUser?.id === author.id;
	const repliesUrl = `/posts/${props.data.commentGroupId}/${props.data.id}`;
	return (
		<li ref={ref} className="list-none">
			<PostItem className={props.className} style={listItemStyles}>
				<div className="flex gap-1.5 py-1 px-1">
					<PostItem.Side>
						<PostItem.Avatar
							variant="filled"
							radius="xl"
							color={author.color}
							src={author.avatarUrl}
						/>
					</PostItem.Side>
					<PostItem.Main>
						<PostItem.Header>
							<CommentItemHeading commentData={props.data} />
							<Menu>
								<Menu.Target>
									<ActionIcon>
										<IconDots />
									</ActionIcon>
								</Menu.Target>
								<Menu.Dropdown>
									<Menu.Label>General</Menu.Label>
									<Menu.Item
										icon={<IconMessage size={16} />}
										component={Link}
										href={repliesUrl}>
										View replies
									</Menu.Item>
									{currentUser && (
										<>
											<Menu.Item
												icon={<IconMessage size={16} />}
												onClick={enterReplyMode}>
												Reply
											</Menu.Item>
										</>
									)}
									{currentUserIsAuthor && (
										<>
											<Menu.Label>Manage</Menu.Label>
											<Menu.Item
												icon={<IconEdit size={16} />}
												onClick={startEditMode}
												disabled={inEditMode || isUpdatingComment}>
												Edit
											</Menu.Item>
											<Menu.Item
												color="red"
												icon={<IconTrash size={16} />}
												onClick={openConfirmDeleteModal}
												disabled={inEditMode || isUpdatingComment}>
												Delete
											</Menu.Item>
										</>
									)}
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
										<Button radius="xs" color="green" onClick={deleteComment}>
											Yes
										</Button>
										<Button
											radius="xs"
											color="red"
											onClick={closeConfirmDeleteModal}>
											No
										</Button>
									</div>
								</div>
							</Modal>
						</PostItem.Header>
						<PostItem.Content>
							{inEditMode && (
								<UpdateComment
									editor={editor as Editor}
									commentData={{
										id: props.data.id,
										authorId: author.id,
									}}
									isUpdating={isUpdatingComment}
									setIsUpdatingState={setIsUpdatingComment}
									onUpdate={stopEditMode}
									cancelUpdate={cancelEditMode}
								/>
							)}
							{!inEditMode && (
								<RichTextEditor
									editor={editor}
									styles={{
										root: { border: "none" },
										content: {
											backgroundColor: listItemStyles.backgroundColor,
											fontSize: "0.9rem",
											"& .ProseMirror": { padding: "0" },
										},
									}}>
									<Spoiler
										maxHeight={300}
										showLabel="Show more"
										hideLabel="Show less">
										<RichTextEditor.Content />
									</Spoiler>
								</RichTextEditor>
							)}
						</PostItem.Content>
					</PostItem.Main>
				</div>
				{inReplyMode && (
					<ReplyToComment
						commentData={props.data}
						onCancel={endReplyMode}
						onReplyPosted={endReplyMode}
					/>
				)}
				{props.showReplyCount && (
					<PostItem.Footer>
						<ReplyCount commentId={props.data.id} />
					</PostItem.Footer>
				)}
			</PostItem>
		</li>
	);
});

interface CommentItemHeadingProps {
	commentData: CommentFull;
}

function CommentItemHeading(props: CommentItemHeadingProps) {
	const { author } = props.commentData;
	const creationDate = moment(props.commentData.createdAt).fromNow(true);

	return (
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
	);
}

export default CommentItem;
