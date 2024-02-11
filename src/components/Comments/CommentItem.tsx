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
import {
    CommentEditorExtensions,
    DELETED_COMMENT_CONTENT,
} from "@/helpers/global_vars";
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
import { useRouter } from "next/router";

export interface CommentItemProps {
    data: CommentFull;
    postType: "public" | "group";
    showReplyCount?: boolean;
    className?: string;
}

/**
 * React component for rendering a single comment
 */
const CommentItem = forwardRef(function CommentItem(
    props: CommentItemProps,
    ref: Ref<HTMLLIElement>,
) {
    const { user: currentUser } = useUser();
    const [commentIsDeleted, setCommentIsDeleted] = useState(
        props.data.isDeleted,
    );
    const theme = useMantineTheme();
    const editor = useEditor({
        editable: false,
        extensions: CommentEditorExtensions,
        content: props.data.content as Content,
    });
    const [
        confirmDeleteModalOpened,
        { open: openConfirmDeleteModal, close: closeConfirmDeleteModal },
    ] = useDisclosure(false);
    const [inEditMode, toggleEditMode] = useState(false);
    const [inReplyMode, toggleReplyMode] = useState(false);
    const [isUpdatingComment, setIsUpdatingComment] = useState(false);
    const editorContentRef = useRef(editor?.getHTML());
    const router = useRouter();
    const listItemStyles = { backgroundColor: theme.colors.dark[6] };
    const { author } = props.data;

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
        if (!author) return;

        try {
            await CommentsAPI.remove(props.data.id);
            setCommentIsDeleted(true);
        } catch (error) {
            notifications.show({
                color: "red",
                title: "Failed to delete comment",
                message: getErrorMessage(error),
            });
        }
        closeConfirmDeleteModal();
    }

    if (commentIsDeleted) {
        editor?.commands.setContent(DELETED_COMMENT_CONTENT);
    }

    const isAuthor = currentUser && author && currentUser.id === author.id;
    const repliesUrl = `${router.asPath}/${props.data.id}`;
    const allowReplies = currentUser && !commentIsDeleted;
    const commentIsEditable = !commentIsDeleted && isAuthor;
    const showReplyEditor = inReplyMode && allowReplies;
    return (
        <li ref={ref} className="list-none">
            <PostItem className={props.className} style={listItemStyles}>
                <div className="flex gap-1.5 px-1 py-1">
                    <PostItem.Side>
                        <PostItem.Avatar
                            color={author?.color}
                            avatarUrl={author?.avatarUrl}
                        />
                    </PostItem.Side>
                    <PostItem.Main>
                        <PostItem.Header>
                            <CommentItemHeading commentData={props.data} />
                            <Menu>
                                <Menu.Target data-cy="menu-target">
                                    <ActionIcon>
                                        <IconDots />
                                    </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Label>General</Menu.Label>
                                    <Menu.Item
                                        icon={<IconMessage size={16} />}
                                        component={Link}
                                        href={repliesUrl}
                                    >
                                        View replies
                                    </Menu.Item>
                                    {allowReplies && (
                                        <>
                                            <Menu.Item
                                                icon={<IconMessage size={16} />}
                                                onClick={enterReplyMode}
                                                data-cy="reply-menu-item"
                                            >
                                                Reply
                                            </Menu.Item>
                                        </>
                                    )}
                                    {commentIsEditable && (
                                        <>
                                            <Menu.Label>Manage</Menu.Label>
                                            <Menu.Item
                                                icon={<IconEdit size={16} />}
                                                onClick={startEditMode}
                                                disabled={
                                                    inEditMode ||
                                                    isUpdatingComment
                                                }
                                                data-cy="edit-menu-item"
                                            >
                                                Edit
                                            </Menu.Item>
                                            <Menu.Item
                                                color="red"
                                                icon={<IconTrash size={16} />}
                                                onClick={openConfirmDeleteModal}
                                                disabled={
                                                    inEditMode ||
                                                    isUpdatingComment
                                                }
                                                data-cy="delete-menu-item"
                                            >
                                                Delete
                                            </Menu.Item>
                                        </>
                                    )}
                                </Menu.Dropdown>
                            </Menu>
                            {commentIsEditable && (
                                <Modal
                                    opened={confirmDeleteModalOpened}
                                    onClose={closeConfirmDeleteModal}
                                    title="Confirm Action"
                                    centered
                                    data-cy="confirm-delete-dialog"
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <p>
                                            Are you sure you want to delete this
                                            comment?
                                        </p>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                radius="xs"
                                                color="green"
                                                onClick={deleteComment}
                                                data-cy="delete-comment"
                                            >
                                                Yes
                                            </Button>
                                            <Button
                                                radius="xs"
                                                color="red"
                                                onClick={
                                                    closeConfirmDeleteModal
                                                }
                                            >
                                                No
                                            </Button>
                                        </div>
                                    </div>
                                </Modal>
                            )}
                        </PostItem.Header>
                        <PostItem.Content>
                            {commentIsEditable && inEditMode && (
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
                                            backgroundColor:
                                                listItemStyles.backgroundColor,
                                            fontSize: "0.9rem",
                                            "& .ProseMirror": { padding: "0" },
                                        },
                                    }}
                                >
                                    <Spoiler
                                        maxHeight={300}
                                        showLabel="Show more"
                                        hideLabel="Show less"
                                    >
                                        <RichTextEditor.Content />
                                    </Spoiler>
                                </RichTextEditor>
                            )}
                        </PostItem.Content>
                    </PostItem.Main>
                </div>
                {showReplyEditor && (
                    <ReplyToComment
                        commentData={props.data}
                        postType={props.postType}
                        authorId={currentUser.id}
                        onCancel={endReplyMode}
                        onReplyPosted={endReplyMode}
                    />
                )}
                {props.showReplyCount && (
                    <PostItem.Footer>
                        <ReplyCount
                            commentId={props.data.id}
                            repliesUrl={repliesUrl}
                        />
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
    const { author, createdAt, editedAt } = props.commentData;
    const creationDate = moment(createdAt).fromNow(true);
    const editedAtDate = editedAt ? moment(editedAt).fromNow(true) : null;

    return (
        <div className="flex items-center gap-0.5">
            {author && (
                <>
                    <Link href={`/users/${author.accountName}`}>
                        <span className="font-semibold">
                            {author.displayName}
                        </span>
                    </Link>
                    <Link href={`/users/${author.accountName}`}>
                        <span className="text-sm text-gray-500">{`@${author.accountName}`}</span>
                    </Link>
                </>
            )}
            {!author && <span className="font-semibold">{`[deleted]`}</span>}
            <span>·</span>
            <span className="text-sm text-gray-500">{creationDate}</span>
            {editedAt && (
                <>
                    <span>·</span>
                    <span className="text-sm text-gray-500">{`edited ${editedAtDate} ago`}</span>
                </>
            )}
        </div>
    );
}

export default CommentItem;
