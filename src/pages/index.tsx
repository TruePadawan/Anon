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

const PublicPostsPage = () => {
	const { user, isValidating: verifyingUser } = useUser();
	const { createPublicPost, posts, isLoading, loadMorePosts } = usePublicPosts({
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

	return (
		<>
			<Navbar />
			<main
				className="grow flex flex-col gap-3 items-center"
				ref={intersectionRootElRef}>
				{user && (
					<div className="flex flex-col gap-2 max-w-4xl w-full">
						<PostEditor editor={editor} />
						<Button
							color="gray"
							size="md"
							onClick={handlePostSubmit}
							disabled={verifyingUser || isSubmittingPost}>
							Create post
						</Button>
					</div>
				)}
				<ul className="max-w-4xl w-full flex flex-col gap-2">
					{isLoading && (
						<Loader className="mt-2 self-center" size="lg" color="gray" />
					)}
					{!isLoading &&
						posts.map((post, index) => {
							const secondToLast = index == posts.length - 2;
							return (
								<PublicPostItem
									ref={secondToLast ? infiniteScrollTriggerElRef : null}
									key={post.id}
									postData={post}
									showCommentsCount
								/>
							);
						})}
				</ul>
			</main>
		</>
	);
};

export default PublicPostsPage;
