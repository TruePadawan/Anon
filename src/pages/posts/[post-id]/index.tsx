import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma-client";
import { PublicPostWithAuthor } from "@/types/types";
import { IconError404 } from "@tabler/icons-react";
import PostItem from "@/components/PostItem/PostItem";
import Comments from "@/components/Comments/Comments";
import { Divider } from "@mantine/core";
import useUser from "@/hooks/useUser";

interface PageProps {
	post: PublicPostWithAuthor | null;
}
const Post = (props: PageProps) => {
	const { user } = useUser();
	const { post } = props;
	const currentUserIsAuthor = user?.id === post?.authorId;
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
				<main className="grow flex justify-center">
					<div className="max-w-4xl w-full flex flex-col gap-4">
						<PostItem postData={post} postType="public" />
						<Divider label="Comments" labelPosition="center" />
						<Comments
							commentGroupID={post.id}
							commentsAllowed={post.commentsAllowed || currentUserIsAuthor}
						/>
					</div>
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
