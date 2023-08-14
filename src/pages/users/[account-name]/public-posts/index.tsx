import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import Head from "next/head";
import ProfileLayout from "@/layout/ProfileLayout";
import { prisma } from "@/lib/prisma-client";
import PostItem from "@/components/PostItem/PostItem";
import { Loader } from "@mantine/core";
import { UserProfile } from "@prisma/client";
import { useEffect, useRef } from "react";
import usePublicPosts from "@/hooks/usePublicPosts";
import { useIntersection } from "@mantine/hooks";

interface PublicPostsSectionProps {
	profile: UserProfile | null;
}

const PublicPostsSection = (props: PublicPostsSectionProps) => {
	const { profile } = props;
	const { posts, isLoading, loadMorePosts } = usePublicPosts({
		where: {
			authorId: profile?.id,
		},
		take: 10,
	});
	const intersectionRootElRef = useRef(null);
	const { entry, ref: infiniteScrollTriggerElRef } = useIntersection({
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

	if (profile === null) {
		return (
			<>
				<Head>
					<title key="title">ANON | Profile Not Found</title>
				</Head>
				<Navbar />
				<div className="flex justify-center">
					<h2 className="mt-2 text-2xl font-semibold">Profile Not Found</h2>
				</div>
			</>
		);
	}

	return (
		<>
			<Head>
				<title key="title">{`ANON | ${profile.displayName}`}</title>
			</Head>
			<Navbar />
			<ProfileLayout tabValue="/public-posts" accountName={profile.accountName}>
				<main
					className="grow flex flex-col gap-4 items-center pt-8 h-full"
					ref={intersectionRootElRef}>
					{isLoading && (
						<Loader variant="bars" color="gray" className="my-auto" />
					)}
					{!isLoading && (
						<ul className="max-w-4xl list-none flex flex-col gap-2">
							{posts?.map((post, index) => {
								const secondToLast = index == posts.length - 2;
								return (
									<PostItem
										key={post.id}
										ref={secondToLast ? infiniteScrollTriggerElRef : null}
										postData={post}
										postType="public"
										full={false}
									/>
								);
							})}
						</ul>
					)}
				</main>
			</ProfileLayout>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	if (context.params === undefined) throw new Error("No account name in URL");

	// Get profile data that belongs to what [account-name] resolves to.
	const accountName = context.params["account-name"] as string;
	const profile = await prisma.userProfile.findUnique({
		where: {
			accountName,
		},
	});

	return {
		props: {
			profile,
		},
	};
};

export default PublicPostsSection;
