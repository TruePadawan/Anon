import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma-client";
import { IconError404 } from "@tabler/icons-react";
import Comments from "@/components/Comments/Comments";
import { Button, Divider } from "@mantine/core";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserProfile } from "@prisma/client";
import CommentItem from "@/components/Comments/CommentItem";
import { CommentFull } from "@/lib/api/CommentsAPI";
import Link from "next/link";

interface PageProps {
	commentData: CommentFull | null;
	currentUser: UserProfile | null;
}

const Post = (props: PageProps) => {
	const { commentData } = props;
	if (!commentData) {
		return (
			<>
				<Navbar />
				<main className="flex flex-col justify-center items-center grow">
					<IconError404 size="10rem" />
					<p className="text-xl font-semibold">COMMENT NOT FOUND</p>
				</main>
			</>
		);
	}
	const postUrl = `/posts/${commentData.commentGroupId}`;
	return (
		<>
			<Navbar />
			<main className="grow flex flex-col items-center">
				<div className="max-w-4xl w-full flex flex-col gap-1">
					<Button
						className="self-start"
						variant="subtle"
						color="gray"
						component={Link}
						href={postUrl}
						compact>
						Go to post
					</Button>
					<div className="flex flex-col gap-3">
						<CommentItem data={commentData} postType="public" />
						<Divider label="Replies" labelPosition="center" />
						<Comments
							postType="public"
							commentGroupId={commentData.commentGroupId}
							where={{
								parentId: commentData.id,
							}}
							commentsAllowed={false}
						/>
					</div>
				</div>
			</main>
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

	// get profile of signed in user
	const session = await getServerSession(context.req, context.res, authOptions);
	const user = !session
		? null
		: await prisma.userProfile.findUnique({
				where: {
					userId: session.user.id,
				},
		  });

	// query db for comment data
	const commentId = context.params["comment-id"] as string;
	const commentData = await prisma.comment.findUnique({
		where: {
			id: commentId,
		},
		include: {
			author: true,
			parentComment: true,
		},
	});

	return {
		props: { key: commentId, commentData, currentUser: user },
	};
};

export default Post;
