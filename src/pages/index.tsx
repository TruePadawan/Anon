import Navbar from "@/components/Navbar/Navbar";
import { useEffect, useRef, useState } from "react";
import PublicPostItem from "@/components/PostItem/PublicPostItem";
import { useEditor } from "@tiptap/react";
import { notifications } from "@mantine/notifications";
import useUser from "@/hooks/useUser";
import { Button, Loader } from "@mantine/core";
import PostEditor from "@/components/Editor/PostEditor";
import { PostEditorExtensions } from "@/helpers/global_vars";
import Placeholder from "@tiptap/extension-placeholder";
import { getErrorMessage } from "@/lib/error-message";
import usePublicPosts from "@/hooks/usePublicPosts";
import { useIntersection } from "@mantine/hooks";
import { IconNotesOff } from "@tabler/icons-react";

const PublicPostsPage = () => {
    const { user, isValidating: verifyingUser } = useUser();
    const { createPublicPost, posts, isLoading, loadMorePosts } =
        usePublicPosts({
            where: {
                isDeleted: false,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
        });
    const editor = useEditor({
        extensions: [
            ...PostEditorExtensions,
            Placeholder.configure({ placeholder: "Share your thoughts" }),
        ],
    });
    const [isSubmittingPost, setIsSubmittingPost] = useState(false);
    const intersectionRootElRef = useRef(null);
    const { entry, ref: infiniteScrollTriggerElRef } = useIntersection({
        root: intersectionRootElRef.current,
        threshold: 0.25,
    });
    const loadMorePostsRef = useRef(loadMorePosts);

    // load more posts when the second to last post is in view
    useEffect(() => {
        const timeoutID = setTimeout(() => {
            if (entry?.isIntersecting) {
                loadMorePostsRef.current();
            }
        }, 800);
        return () => clearTimeout(timeoutID);
    }, [entry?.isIntersecting]);

    async function handlePostSubmit() {
        if (editor === null) {
            notifications.show({
                color: "red",
                title: "Cannot get post content",
                message: "Editor not initialized",
            });
            return;
        }

        const editorNotEmpty =
            !editor.isEmpty && editor.getText().trim().length !== 0;
        if (editorNotEmpty) {
            setIsSubmittingPost(true);
            // editor should be read-only while submitting post
            editor.setEditable(false);
            try {
                await createPublicPost(editor.getJSON());
                editor.commands.clearContent();
            } catch (error) {
                notifications.show({
                    color: "red",
                    title: "Post submission failed",
                    message: getErrorMessage(error),
                });
            }
            setIsSubmittingPost(false);
            editor.setEditable(true);
        } else {
            notifications.show({
                color: "orange",
                title: "Post submission failed",
                message: "Post content cannot be empty or just whitespace",
            });
        }
    }

    const hasPosts = !isLoading && posts.length > 0;
    const noPosts = !isLoading && posts.length === 0;
    return (
        <>
            <Navbar />
            <main
                className="flex grow flex-col items-center gap-3"
                ref={intersectionRootElRef}
            >
                {user && (
                    <div className="flex w-full max-w-4xl flex-col gap-2">
                        <PostEditor editor={editor} />
                        <Button
                            color="gray"
                            size="md"
                            onClick={handlePostSubmit}
                            disabled={verifyingUser || isSubmittingPost}
                        >
                            Create post
                        </Button>
                    </div>
                )}
                {isLoading && (
                    <Loader
                        className="mt-2 self-center"
                        size="lg"
                        color="gray"
                    />
                )}
                {hasPosts && (
                    <ul className="flex w-full max-w-4xl flex-col gap-2">
                        {posts.map((post, index) => {
                            const secondToLast = index == posts.length - 2;
                            return (
                                <PublicPostItem
                                    ref={
                                        secondToLast
                                            ? infiniteScrollTriggerElRef
                                            : null
                                    }
                                    key={post.id}
                                    postData={post}
                                    showCommentsCount
                                />
                            );
                        })}
                    </ul>
                )}
                {noPosts && (
                    <div className="flex grow flex-col items-center justify-center gap-4">
                        <IconNotesOff size={64} />
                        <p className="text-lg font-semibold">
                            No public posts
                        </p>
                    </div>
                )}
            </main>
        </>
    );
};

export default PublicPostsPage;
