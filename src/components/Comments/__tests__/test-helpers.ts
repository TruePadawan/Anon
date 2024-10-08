import { CommentItemProps } from "../CommentItem";
import { CommentsCountProps, ReplyCountProps } from "../CommentsCount";

export function getCommentItemProps(): CommentItemProps {
    return {
        postType: "public",
        data: {
            id: "64f3991b9817afec59137cea",
            publicPostId: "64f391529817afec59137ce9",
            content: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "",
                            },
                        ],
                    },
                ],
            },
            authorId: "64f391529817afec59137ce9",
            author: {
                id: "64f391529817afec59137ce9",
                accountName: "hermeschi",
                displayName: "Hermes",
                createdAt: Date.now(),
                userId: "64f391529817afec59137ce4",
                avatarUrl: null,
                color: "fff",
                bio: "New to ANON",
            },
            createdAt: Date.now(),
            parentComment: null,
            parentId: null,
            groupPostId: null,
            editedAt: null,
            isDeleted: false,
        },
    };
}

export function getCommentsCountProps(): CommentsCountProps {
    return {
        postType: "public",
        postId: "64f3991b9817afec59137cea",
        postUrl: "/",
    };
}

export function getReplyCountProps(): ReplyCountProps {
    return {
        commentId: "64f3991b9817afec59137cea",
        repliesUrl: "/",
    };
}
