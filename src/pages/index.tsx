import Navbar from "@/components/Navbar/Navbar";
import { useState } from "react";
import PostItem from "@/components/PostItem/PostItem";
import { useEditor } from "@tiptap/react";
import { notifications } from "@mantine/notifications";
import useUser from "@/hooks/useUser";
import { Button, Loader } from "@mantine/core";
import PostEditor from "@/components/Editor/PostEditor";
import { PostEditorExtensions } from "@/helpers/global_vars";
import Placeholder from "@tiptap/extension-placeholder";
import { getErrorMessage } from "@/lib/error-message";
import usePublicPosts from "@/hooks/usePublicPosts";

const PublicPostsPage = () => {
	const { user, isValidating: verifyingUser } = useUser();
	const { createPublicPost, posts, isLoading } = usePublicPosts({
		orderBy: {
			createdAt: "desc",
		},
	});
	const editor = useEditor({
		extensions: [
			...PostEditorExtensions,
			Placeholder.configure({ placeholder: "Share your thoughts" }),
		],
	});
	const [isSubmittingPost, setIsSubmittingPost] = useState(false);

	async function handlePostSubmit() {
		if (editor === null) {
			notifications.show({
				color: "red",
				title: "Cannot get post content",
				message: "Editor not initialized",
			});
			return;
		}

		const validPost = !editor.isEmpty || editor.getText().trim().length !== 0;
		if (validPost) {
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
		}
	}

	return (
		<>
			<Navbar />
			<main className="grow flex flex-col gap-3 items-center">
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
				<ul className="max-w-4xl w-full flex flex-col gap-2 list-none">
					{isLoading && (
						<Loader className="mt-2 self-center" size="lg" color="gray" />
					)}
					{!isLoading &&
						posts.map((post) => {
							return (
								<PostItem
									key={post.id}
									postData={post}
									postType="public"
									full={false}
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
