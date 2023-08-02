import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { prisma } from "../../lib/prisma-client";
import { useMemo, useState } from "react";
import PostItem from "@/components/PostItem/PostItem";
import CreatePost from "@/components/CreatePost/CreatePost";
import { JSONContent } from "@tiptap/react";
import { PublicPostFull } from "@/types/types";
import { notifications } from "@mantine/notifications";
import useUser from "@/hooks/useUser";

interface PageProps {
	publicPosts: PublicPostFull[];
}

const PublicPostsPage = ({ publicPosts }: PageProps) => {
	const { user } = useUser();
	const [postsData, setPostsData] = useState<PublicPostFull[]>(publicPosts);

	const posts = useMemo(() => {
		return postsData.map((post) => {
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
	}, [postsData]);

	async function handlePostSubmit(
		content: JSONContent,
		onSubmit: () => void,
		onSubmitFailed: () => void
	) {
		const postDocument = {
			content,
			authorId: user?.id,
			createdAt: Date.now(),
		};
		const response = await fetch("/api/create-public-post", {
			method: "POST",
			body: JSON.stringify(postDocument),
		});
		if (response.ok) {
			onSubmit();
			const createdPost = await response.json();
			setPostsData((postsData) => {
				postsData.unshift(createdPost);
				return [...postsData];
			});
		} else {
			notifications.show({
				color: "red",
				message: "Failed to create post",
			});
			onSubmitFailed();
		}
	}

	return (
		<>
			<Navbar />
			<main className="grow flex flex-col gap-3 items-center">
				{user && (
					<CreatePost
						className="max-w-4xl w-full"
						handlePostSubmit={handlePostSubmit}
					/>
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
