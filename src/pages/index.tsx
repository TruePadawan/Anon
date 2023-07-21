import Navbar from "@/components/Navbar/Navbar";
import { authOptions } from "../../lib/auth";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../lib/prisma-client";
import { useMemo, useState } from "react";
import { UserProfile } from "@prisma/client";
import PostItem from "@/components/PostItem/PostItem";
import CreatePost from "@/components/CreatePost/CreatePost";
import { JSONContent } from "@tiptap/react";
import { PublicPostFull } from "@/types/types";
import { notifications } from "@mantine/notifications";

interface HomeProps {
	user: UserProfile | null;
	publicPosts: PublicPostFull[];
}

const Home = ({ user, publicPosts }: HomeProps) => {
	const [postsData, setPostsData] = useState<PublicPostFull[]>(publicPosts);

	const posts = useMemo(() => {
		return postsData.map((post) => {
			return (
				<li key={post.id}>
					<PostItem
						postData={post}
						currentUser={user}
						postType="public"
						full={false}
					/>
				</li>
			);
		});
	}, [postsData, user]);

	async function handlePostSubmit(content: JSONContent, onSubmit: () => void) {
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
		}
	}

	return (
		<>
			<Navbar user={user} />
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

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
	context
) => {
	const session = await getServerSession(context.req, context.res, authOptions);
	const publicPosts = await prisma.publicPost.findMany({
		include: { author: true },
		orderBy: {
			createdAt: "desc",
		},
	});
	if (session) {
		// get current signed in user
		const user = await prisma.userProfile.findUnique({
			where: {
				id: session.user.id,
			},
		});
		return {
			props: { user, publicPosts },
		};
	}
	return {
		props: { user: null, publicPosts },
	};
};

export default Home;
