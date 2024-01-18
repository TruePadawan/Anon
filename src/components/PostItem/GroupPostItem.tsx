import { RichTextEditor } from "@mantine/tiptap";
import { Content, Editor, useEditor } from "@tiptap/react";
import {
    DELETED_POST_CONTENT,
    PostEditorExtensions,
} from "@/helpers/global_vars";
import { ActionIcon, Button, Menu, Modal, Spoiler } from "@mantine/core";
import { GroupPostWithAuthor } from "@/types/types";
import moment from "moment";
import Link from "next/link";
import {
    IconDots,
    IconEdit,
    IconTrash,
    IconArrowsMaximize,
    IconMessageCircle,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Ref, forwardRef, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import UpdatePost from "./UpdatePost";
import CommentsCount from "@/components/Comments/CommentsCount";
import GroupPostAPI from "@/lib/api/GroupPostAPI";
import { getErrorMessage } from "@/lib/error-message";
import PostItem from "./PostItem";
import useUser from "@/hooks/useUser";

export interface GroupPostItemProps {
    className?: string;
    postData: GroupPostWithAuthor;
    groupIsAnonymous: boolean;
    currentUserIsAdmin: boolean;
    showCommentsCount?: boolean;
}

/**
 * React component which renders a single group post
 */
const GroupPostItem = forwardRef(function GroupPostItem(
    props: GroupPostItemProps,
    ref: Ref<HTMLDivElement>,
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
            await GroupPostAPI.remove(postData.id);
            setPostIsDeleted(true);
            editor?.commands.setContent(DELETED_POST_CONTENT);
        } catch (error) {
            notifications.show({
                color: "red",
                title: "Failed to delete post",
                message: getErrorMessage(error),
            });
        }
        closeConfirmDeleteModal();
    }

    async function toggleComments() {
        if (!author) return;

        setIsUpdatingPost(true);
        const { id } = postData;
        try {
            const { commentsAllowed } = await GroupPostAPI.getById(id);
            const updatedPost = await GroupPostAPI.update(id, {
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

    const postUrl = `/groups/${postData.groupId}/posts/${postData.id}`;
    const isAuthor = currentUser && author && currentUser.id === author.id;
    const postIsEditable = !postIsDeleted && isAuthor;
    return (
        <div ref={ref}>
            <PostItem className={className}>
                <div className="flex gap-1.5 px-1 py-1">
                    <PostItem.Side>
                        {!props.groupIsAnonymous && (
                            <PostItem.Avatar
                                color={author?.color}
                                avatarUrl={author?.avatarUrl}
                            />
                        )}
                        {props.groupIsAnonymous && (
                            <PostItem.Avatar color={author?.color} />
                        )}
                    </PostItem.Side>
                    <PostItem.Main>
                        <PostItem.Header>
                            <GroupPostHeading
                                postData={postData}
                                groupIsAnonymous={props.groupIsAnonymous}
                                currentUserIsAdmin={props.currentUserIsAdmin}
                            />
                            <Menu>
                                <Menu.Target data-cy="menu-target">
                                    <ActionIcon>
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
                                            >
                                                Yes
                                            </Button>
                                            <Button
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
                            {postIsEditable && inEditMode && (
                                <UpdatePost
                                    editor={editor as Editor}
                                    postData={{
                                        Id: postData.id,
                                        authorId: author.id,
                                        type: "group",
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
                        <CommentsCount postId={postData.id} postType="group" />
                    )}
                </PostItem.Footer>
            </PostItem>
        </div>
    );
});

interface GroupPostHeadingProps {
    postData: GroupPostWithAuthor;
    groupIsAnonymous: boolean;
    currentUserIsAdmin: boolean;
}

function GroupPostHeading(props: GroupPostHeadingProps) {
    const { author, createdAt, editedAt } = props.postData;
    const creationDate = moment(createdAt).fromNow(true);
    const editedAtDate = editedAt ? moment(editedAt).fromNow(true) : null;

    return (
        <div className="flex items-center gap-0.5">
            {author && (
                <>
                    {props.groupIsAnonymous && (
                        <span className="font-semibold">
                            {props.currentUserIsAdmin
                                ? "Anonymous admin"
                                : "Anonymous user"}
                        </span>
                    )}
                    {!props.groupIsAnonymous && (
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

export default GroupPostItem;
