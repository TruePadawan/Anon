import Navbar from "@/components/Navbar/Navbar";
import { authOptions } from "../../lib/auth";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../lib/prisma-client";
import { useMemo, useState } from "react";
import { UserProfileType } from "@/types/types";
import { PublicPost } from "@prisma/client";
import PostItem from "@/components/PostItem/PostItem";
import CreatePost from "@/components/CreatePost/CreatePost";
import { JSONContent } from "@tiptap/react";

interface HomeProps {
	user: UserProfileType | null;
	publicPosts: PublicPost[];
}

const Home = ({ user, publicPosts }: HomeProps) => {
	const [postsData, setPostsData] = useState<PublicPost[]>(publicPosts);

	const posts = useMemo(() => {
		return postsData.map((post) => {
			return <PostItem key={post.id} postData={post} />;
		});
	}, [postsData]);

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
			// error submitting post
		}
	}

	return (
		<>
			<Navbar user={user} />
			<main className="flex flex-col gap-2 items-center">
				{user && <CreatePost handlePostSubmit={handlePostSubmit} />}
				{postsData && (
					<ul className="max-w-3xl w-full flex flex-col list-none">{posts}</ul>
				)}
			</main>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getServerSession(context.req, context.res, authOptions);
	if (session) {
		// get navbar user prop
		const user = await prisma.userProfile.findUnique({
			where: {
				id: session.user.id,
			},
			select: {
				id: true,
				displayName: true,
				accountName: true,
			},
		});
		const publicPosts = await prisma.publicPost.findMany();
		return {
			props: { user, publicPosts },
		};
	}
	return {
		props: {},
	};
};

export default Home;
