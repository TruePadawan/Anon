import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma-client";
import { useState } from "react";
import PostItem from "@/components/PostItem/PostItem";
import { useEditor } from "@tiptap/react";
import { PublicPostFull } from "@/types/types";
import { notifications } from "@mantine/notifications";
import useUser from "@/hooks/useUser";
import { Button } from "@mantine/core";
import PostEditor from "@/components/Editor/PostEditor";
import { PostEditorExtensions } from "@/helpers/global_vars";
import Placeholder from "@tiptap/extension-placeholder";
import PublicPostAPI from "@/lib/api/PublicPostAPI";
import { getErrorMessage } from "@/lib/error-message";

interface PageProps {
	publicPosts: PublicPostFull[];
}

const PublicPostsPage = ({ publicPosts }: PageProps) => {
	const { user, isValidating: verifyingUser } = useUser();
	const [postsData, setPostsData] = useState<PublicPostFull[]>(publicPosts);
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

		if (verifyingUser || !user) {
			notifications.show({
				color: "orange",
				title: "Cannot start post submission",
				message: "User is not valid",
			});
			return;
		}

		const validPost = !editor.isEmpty || editor.getText().trim().length !== 0;

		if (validPost) {
			setIsSubmittingPost(true);
			// editor should be read-only while submitting post
			editor.setEditable(false);

			try {
				const post = await PublicPostAPI.create(editor.getJSON(), user.id);
				setPostsData((postsData) => {
					postsData.unshift(post);
					return [...postsData];
				});

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

	const posts = postsData.map((post) => {
		return (
			<PostItem
				key={post.id}
				postData={post}
				postType="public"
				full={false}
				showCommentsCount
			/>
		);
	});

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
				{postsData && (
					<ul className="max-w-4xl w-full flex flex-col gap-2 list-none">
						{posts}
					</ul>
				)}
			</main>
		</>
	);
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
	context
) => {
	const publicPosts = await prisma.publicPost.findMany({
		include: { author: true },
		orderBy: {
			createdAt: "desc",
		},
	});

	return {
		props: { publicPosts },
	};
};

export default PublicPostsPage;
