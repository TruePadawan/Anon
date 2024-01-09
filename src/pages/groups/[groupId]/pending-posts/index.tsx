import Navbar from "@/components/Navbar/Navbar";
import GroupPostItem from "@/components/PostItem/GroupPostItem";
import useGroupPosts from "@/hooks/useGroupPosts";
import GroupLayout from "@/layout/GroupLayout";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { Loader } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useEffect, useRef } from "react";
import { GroupData } from "..";
import PendingGroupPostItem from "@/components/PostItem/PendingGroupPostItem";

interface GroupPageProps {
	data: GroupData;
	currentUserIsAdmin: boolean;
}

export default function GroupPage(props: GroupPageProps) {
	const { posts, isLoading, loadMorePosts } = useGroupPosts(props.data.id, {
		where: {
			isApproved: false,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 10,
	});
	const intersectionRootElRef = useRef<HTMLDivElement>(null);
	const { entry, ref: infiniteScrollTriggerElRef } = useIntersection({
		root: intersectionRootElRef.current,
		threshold: 0.25,
	});
	const loadMorePostsRef = useRef(loadMorePosts);

	// load more posts when the second to last post is in view
	useEffect(() => {
		const timeoutID = setTimeout(() => {
			if (entry?.isIntersecting) {
				loadMorePostsRef.current();
			}
		}, 800);
		return () => clearTimeout(timeoutID);
	}, [entry?.isIntersecting]);

	const hasPosts = !isLoading && posts.length > 0;
	const noPosts = !isLoading && posts.length === 0;
	return (
		<>
			<Navbar />
			<GroupLayout
				tabValue="/pending-posts"
				groupData={props.data}
				currentUserIsAdmin={props.currentUserIsAdmin}>
				<div className="flex h-full" ref={intersectionRootElRef}>
					{isLoading && (
						<Loader className="mx-auto self-center" size="lg" color="gray" />
					)}
					{hasPosts && (
						<ul className="grow flex flex-col gap-2 list-none">
							{posts.map((post, index) => {
								const secondToLast = index == posts.length - 2;
								return (
									<li key={post.id}>
										<PendingGroupPostItem
											ref={secondToLast ? infiniteScrollTriggerElRef : null}
											postData={post}
											groupIsAnonymous={props.data.isAnonymous}
											currentUserIsAdmin={props.currentUserIsAdmin}
										/>
									</li>
								);
							})}
						</ul>
					)}
					{noPosts && (
						<p className="self-center mx-auto font-semibold text-xl">
							No pending posts
						</p>
					)}
				</div>
			</GroupLayout>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	if (!context.params) {
		return {
			redirect: {
				destination: "/groups",
				permanent: false,
			},
		};
	}

	const groupId = context.params["groupId"] as string;
	const groupData = await prisma.group.findUnique({
		where: {
			id: groupId,
		},
		include: {
			admin: true,
			groupMembers: {
				where: { membershipStatus: "JOINED" },
				include: {
					user: true,
				},
				take: 20,
				orderBy: {
					joinedAt: "desc",
				},
			},
			_count: {
				select: {
					groupMembers: { where: { membershipStatus: "JOINED" } },
				},
			},
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

	// confirm that user is authorized to visit the group
	const session = await getServerSession(context.req, context.res, authOptions);
	// there is guaranteed to be a signedin user since middleware redirects all unsigned users
	if (session) {
	}

	return {
		props: {
			data: groupData,
			currentUserIsAdmin: groupData.admin.userId === session?.user.id,
		},
	};
};
