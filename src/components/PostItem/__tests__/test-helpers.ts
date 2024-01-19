import { PublicPostItemProps } from "../PublicPostItem";

export function getPublicPostItemProps(): PublicPostItemProps {
    return {
        postData: {
            id: "64f3991b9817afec59137cea",
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
            content: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        attrs: {
                            textAlign: "left",
                        },
                        content: [
                            {
                                type: "text",
                                text: "this is a public post",
                            },
                        ],
                    },
                ],
            },
            commentsAllowed: true,
            createdAt: Date.now(),
            editedAt: null,
            isDeleted: false,
        },
    };
}
