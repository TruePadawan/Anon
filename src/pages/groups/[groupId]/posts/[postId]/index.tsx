import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma-client";
import { GroupPostWithAuthor } from "@/types/types";
import { IconError404 } from "@tabler/icons-react";
import Comments from "@/components/Comments/Comments";
import { Button, Divider } from "@mantine/core";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserProfile } from "@prisma/client";
import GroupPostItem, {
	GroupPostItemProps,
} from "@/components/PostItem/GroupPostItem";
import Link from "next/link";

interface PageProps {
	post: GroupPostWithAuthor | null;
	currentUser: UserProfile | null;
	groupId: string;
	postItemProps: Pick<
		GroupPostItemProps,
		"currentUserIsAdmin" | "groupIsAnonymous"
	>;
}

const Post = (props: PageProps) => {
	const { post, currentUser, postItemProps, groupId } = props;
	if (!post) {
		return (
			<>
				<Navbar />
				<main className="flex flex-col justify-center items-center grow">
					<IconError404 size="10rem" />
					<p className="text-xl font-semibold">POST NOT FOUND</p>
				</main>
			</>
		);
	}
	const currentUserIsAuthor = currentUser?.id === post?.authorId;
	const isCommentsAllowed =
		!post.isDeleted && (post.commentsAllowed || currentUserIsAuthor);
	const groupUrl = `/groups/${groupId}`;
	return (
		<>
			<Navbar />
			<main className="grow flex justify-center">
				<div className="max-w-4xl w-full flex flex-col gap-1">
					<Button
						className="self-start"
						variant="subtle"
						color="gray"
						component={Link}
						href={groupUrl}
						compact>
						Go back to group
					</Button>
					<div className="flex flex-col gap-4">
						<GroupPostItem postData={post} {...postItemProps} />
						<Divider label="Comments" labelPosition="center" />
						<Comments
							postType="group"
							postId={post.id}
							where={{
								groupPost: { id: post.id },
								isDeleted: false,
								parentComment: {
									is: null,
								},
							}}
							commentsAllowed={isCommentsAllowed}
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
	const postId = context.params?.postId as string;
	const groupId = context.params?.groupId as string;
	// redirect client to the group's page if the url doesn't have a post id
	if (!postId) {
		return {
			redirect: {
				destination: `/groups/${groupId}`,
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

	// query db for post data
	const postData = await prisma.groupPost.findUnique({
		where: {
			id: postId,
		},
		include: {
			author: true,
		},
	});

	const groupData = await prisma.group.findUnique({
		where: { id: groupId },
		select: {
			isAnonymous: true,
			admin: true,
		},
	});

	if (!groupData) {
		return {
			redirect: {
				destination: "/groups/not-found",
				permanent: false,
			},
		};
	}

	return {
		props: {
			key: postId,
			post: postData,
			currentUser: user,
			groupId,
			postItemProps: {
				groupIsAnonymous: groupData.isAnonymous,
				currentUserIsAdmin: groupData.admin.id === user?.id,
			},
		},
	};
};

export default Post;
