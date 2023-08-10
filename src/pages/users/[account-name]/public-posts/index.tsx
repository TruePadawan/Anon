import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import Head from "next/head";
import ProfileLayout from "@/layout/ProfileLayout";
import { prisma } from "@/lib/prisma-client";
import useSWR from "swr";
import { PublicPostFull } from "@/types/types";
import PostItem from "@/components/PostItem/PostItem";
import { Loader } from "@mantine/core";
import { UserProfile } from "@prisma/client";

interface PublicPostsSectionProps {
	profile: UserProfile | null;
}

const PublicPostsSection = (props: PublicPostsSectionProps) => {
	const { profile } = props;
	const { data: postsData, isLoading } = useSWR(
		profile ? "/api/get-public-posts" : null,
		async (key: string): Promise<PublicPostFull[]> => {
			const response = await fetch(key, {
				method: "POST",
				body: JSON.stringify({
					authorId: profile?.id,
				}),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message);
			}
			const posts = await response.json();
			return posts;
		}
	);

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

	const posts = postsData?.map((post) => {
		return (
			<PostItem key={post.id} postData={post} postType="public" full={false} />
		);
	});
	return (
		<>
			<Head>
				<title key="title">{`ANON | ${profile.displayName}`}</title>
			</Head>
			<Navbar />
			<ProfileLayout tabValue="/public-posts" accountName={profile.accountName}>
				<main className="grow flex flex-col gap-4 items-center pt-8 h-full">
					{isLoading && (
						<Loader variant="bars" color="gray" className="my-auto" />
					)}
					{!isLoading && <ul className="max-w-4xl">{posts}</ul>}
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
