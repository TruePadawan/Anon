import { RichTextEditor } from "@mantine/tiptap";
import { Content, Editor, useEditor } from "@tiptap/react";
import {
    DELETED_POST_CONTENT,
    PostEditorExtensions,
} from "@/helpers/global_vars";
import { ActionIcon, Button, Menu, Modal, Spoiler } from "@mantine/core";
import { PublicPostWithAuthor } from "@/types/types";
import moment from "moment";
import Link from "next/link";
import {
    IconDots,
    IconEdit,
    IconTrash,
    IconArrowsMaximize,
    IconMessageCircle,
} from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Ref, forwardRef, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import UpdatePost from "./UpdatePost";
import CommentsCount from "@/components/Comments/CommentsCount";
import PublicPostAPI from "@/lib/api/PublicPostAPI";
import { getErrorMessage } from "@/lib/error-message";
import PostItem from "./PostItem";
import useUser from "@/hooks/useUser";

export interface PublicPostItemProps {
    className?: string;
    postData: PublicPostWithAuthor;
    showCommentsCount?: boolean;
}

/**
 * React component which renders a single public post
 */
const PublicPostItem = forwardRef(function PublicPostItem(
    props: PublicPostItemProps,
    ref: Ref<HTMLLIElement>,
) {
    const { user: currentUser } = useUser();
    const { postData, className, showCommentsCount } = props;
    const { author } = postData;
    const [
        confirmDeleteModalOpened,
        { open: openConfirmDeleteModal, close: closeConfirmDeleteModal },
    ] = useDisclosure(false);
    const editor = useEditor({
        editable: false,
        extensions: PostEditorExtensions,
        content: postData.content as Content,
    });
    const [inEditMode, setInEditMode] = useState(false);
    const [isUpdatingPost, setIsUpdatingPost] = useState(false);
    const [postIsDeleted, setPostIsDeleted] = useState(postData.isDeleted);
    const [commentsAllowed, setCommentsAllowed] = useState(
        postData.commentsAllowed,
    );
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const editorContentRef = useRef(editor?.getHTML());

    function startEditMode() {
        editorContentRef.current = editor?.getHTML();
        setInEditMode(true);
        editor?.setEditable(true);
    }

    function stopEditMode() {
        setInEditMode(false);
        editor?.setEditable(true);
    }

    // restore editor content to what it was pre-edit before stopping edit mode
    function cancelEditMode() {
        if (editorContentRef.current) {
            editor?.commands.setContent(editorContentRef.current);
        }
        stopEditMode();
    }

    async function deletePost() {
        if (!author) return;

        try {
            setIsDeletingPost(true);
            await PublicPostAPI.remove(postData.id);
            setPostIsDeleted(true);
            editor?.commands.setContent(DELETED_POST_CONTENT);
        } catch (error) {
            notifications.show({
                color: "red",
                title: "Failed to delete post",
                message: getErrorMessage(error),
            });
        }
        setIsDeletingPost(false);
        closeConfirmDeleteModal();
    }

    async function toggleComments() {
        if (!author) return;

        setIsUpdatingPost(true);
        const { id } = postData;
        try {
            const { commentsAllowed } = await PublicPostAPI.getById(id);
            const updatedPost = await PublicPostAPI.update(id, {
                commentsAllowed: !commentsAllowed,
            });
            setCommentsAllowed(updatedPost.commentsAllowed);
        } catch (error) {
            notifications.show({
                color: "red",
                title: "Failed to complete action",
                message: getErrorMessage(error),
            });
        }
        setIsUpdatingPost(false);
    }

    const isAuthor = currentUser && author && currentUser.id === author.id;
    const postIsEditable = !postIsDeleted && isAuthor;
    const postUrl = `/posts/${postData.id}`;
    return (
        <li ref={ref} className="list-none">
            <PostItem className={className}>
                <div className="flex gap-1.5 px-1 py-1">
                    <PostItem.Side>
                        <PostItem.Avatar
                            color={author?.color}
                            avatarUrl={author?.avatarUrl}
                        />
                    </PostItem.Side>
                    <PostItem.Main>
                        <PostItem.Header>
                            <PublicPostHeading postData={postData} />
                            <Menu>
                                <Menu.Target data-cy="menu-target">
                                    <ActionIcon title="menu">
                                        <IconDots />
                                    </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Label>General</Menu.Label>
                                    <Menu.Item
                                        component={Link}
                                        icon={<IconArrowsMaximize size={16} />}
                                        href={postUrl}
                                    >
                                        View full post
                                    </Menu.Item>
                                    {postIsEditable && (
                                        <>
                                            <Menu.Label>Manage</Menu.Label>
                                            <Menu.Item
                                                icon={
                                                    <IconMessageCircle
                                                        size={16}
                                                    />
                                                }
                                                onClick={toggleComments}
                                                disabled={
                                                    inEditMode || isUpdatingPost
                                                }
                                            >
                                                {commentsAllowed
                                                    ? "Disable comments"
                                                    : "Enable comments"}
                                            </Menu.Item>
                                            <Menu.Item
                                                icon={<IconEdit size={16} />}
                                                onClick={startEditMode}
                                                disabled={
                                                    inEditMode || isUpdatingPost
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
                                                    inEditMode || isUpdatingPost
                                                }
                                                data-cy="delete-menu-item"
                                            >
                                                Delete
                                            </Menu.Item>
                                        </>
                                    )}
                                </Menu.Dropdown>
                            </Menu>
                            {postIsEditable && (
                                <Modal
                                    opened={confirmDeleteModalOpened}
                                    onClose={closeConfirmDeleteModal}
                                    title="Confirm Action"
                                    data-cy="confirm-delete-dialog"
                                    centered
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <p>
                                            Are you sure you want to delete this
                                            post?
                                        </p>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                color="green"
                                                onClick={deletePost}
                                                data-cy="delete-post"
                                                disabled={isDeletingPost}
                                            >
                                                Yes
                                            </Button>
                                            <Button
                                                color="red"
                                                onClick={
                                                    closeConfirmDeleteModal
                                                }
                                                disabled={isDeletingPost}
                                            >
                                                No
                                            </Button>
                                        </div>
                                    </div>
                                </Modal>
                            )}
                        </PostItem.Header>
                        <PostItem.Content>
                            {postIsEditable && inEditMode && (
                                <UpdatePost
                                    editor={editor as Editor}
                                    postData={{
                                        Id: postData.id,
                                        authorId: author.id,
                                        type: "public",
                                    }}
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
                                        content: {
                                            "& .ProseMirror": { padding: "0" },
                                        },
                                    }}
                                >
                                    <Spoiler
                                        maxHeight={400}
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
                <PostItem.Footer>
                    {showCommentsCount && (
                        <CommentsCount
                            postId={postData.id}
                            postType="public"
                            postUrl={postUrl}
                        />
                    )}
                </PostItem.Footer>
            </PostItem>
        </li>
    );
});

interface PublicPostHeadingProps {
    postData: PublicPostWithAuthor;
}

function PublicPostHeading(props: PublicPostHeadingProps) {
    const matchesWidescreen = useMediaQuery("(min-width: 768px)");
    const { author, createdAt, editedAt } = props.postData;
    const datePosted = moment(createdAt).fromNow(true);
    const compactDatePosted = moment(createdAt).format("l");
    const editedAtDate = editedAt ? moment(editedAt).fromNow(true) : null;

    return (
        <div className="flex flex-wrap items-center gap-0.5">
            {author && (
                <>
                    <Link href={`/users/${author.accountName}`}>
                        <span className="font-semibold">
                            {author.displayName}
                        </span>
                    </Link>
                    {matchesWidescreen && (
                        <Link href={`/users/${author.accountName}`}>
                            <span className="text-sm text-gray-500">{`@${author.accountName}`}</span>
                        </Link>
                    )}
                </>
            )}
            {!author && <span className="font-semibold">{`[deleted]`}</span>}
            <span>·</span>
            <span className="text-sm text-gray-500">
                {matchesWidescreen ? datePosted : compactDatePosted}
            </span>
            {matchesWidescreen && editedAt && (
                <>
                    <span>·</span>
                    <span className="text-sm text-gray-500">{`edited ${editedAtDate} ago`}</span>
                </>
            )}
        </div>
    );
}

export default PublicPostItem;
