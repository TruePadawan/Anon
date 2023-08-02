import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma-client";
import { UserProfile } from "@prisma/client";
import { PublicPostFull } from "@/types/types";
import { IconError404 } from "@tabler/icons-react";
import PostItem from "@/components/PostItem/PostItem";

interface PostProps {
	user: UserProfile | null;
	post: PublicPostFull | null;
}
const Post = (props: PostProps) => {
	const { user, post } = props;
	return (
		<>
			<Navbar />
			{!post && (
				<main className="flex flex-col justify-center items-center grow">
					<IconError404 size="10rem" />
					<p className="text-xl font-semibold">POST NOT FOUND</p>
				</main>
			)}
			{post && (
				<main className="grow flex flex-col items-center">
					<PostItem
						className="max-w-4xl w-full"
						postData={post}
						currentUser={user}
						postType="public"
						full={true}
					/>
				</main>
			)}
		</>
	);
};

export const getServerSideProps: GetServerSideProps<PostProps> = async (
	context
) => {
	if (!context.params) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const session = await getServerSession(context.req, context.res, authOptions);
	// query db for post data
	const postID = context.params["post-id"] as string;
	const post = await prisma.publicPost.findUnique({
		where: {
			id: postID,
		},
		include: {
			author: true,
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
			props: { user, post },
		};
	}
	return {
		props: { user: null, post },
	};
};

export default Post;
