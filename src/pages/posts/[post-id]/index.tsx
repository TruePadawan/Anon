import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma-client";
import { PublicPostWithAuthor } from "@/types/types";
import { IconError404 } from "@tabler/icons-react";
import PostItem from "@/components/PostItem/PostItem";

interface PageProps {
	post: PublicPostWithAuthor | null;
}
const Post = (props: PageProps) => {
	const { post } = props;
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
						postType="public"
						full={true}
					/>
				</main>
			)}
		</>
	);
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
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

	return {
		props: { post },
	};
};

export default Post;
