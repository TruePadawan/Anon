import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import Head from "next/head";
import ProfileInfo from "@/components/ProfileInfo/ProfileInfo";
import { Button } from "@mantine/core";
import { useState } from "react";
import EditProfileInfo from "@/components/ProfileInfo/EditProfileInfo";
import { useRouter } from "next/router";
import { prisma } from "../../../../lib/prisma-client";
import { UserProfile } from "@prisma/client";
import ProfileLayout from "@/layout/ProfileLayout";
import useUser from "@/hooks/useUser";

export interface ProfileProps {
	profile: UserProfile | null;
}

const Profile = (props: ProfileProps) => {
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const router = useRouter();
	const { user } = useUser();
	const { profile } = props;

	if (profile === null) {
		return (
			<>
				<Head>
					<title key="title">ANON | Profile Not Found</title>
				</Head>
				<Navbar />
				<div className="flex items-center justify-center">
					<h2>Profile Not Found</h2>
				</div>
			</>
		);
	}
	const isEditingAllowed = profile.accountName === user?.accountName;

	return (
		<>
			<Head>
				<title key="title">{`ANON | ${profile.displayName}`}</title>
			</Head>
			<Navbar />
			<ProfileLayout tabValue="/" accountName={profile.accountName}>
				<main className="grow flex flex-col gap-4 items-center pt-8">
					{isEditingProfile && (
						<EditProfileInfo
							profileData={profile}
							onCancel={() => setIsEditingProfile(false)}
							onUpdate={() =>
								router.replace("/users").then(() => setIsEditingProfile(false))
							}
						/>
					)}
					{!isEditingProfile && (
						<>
							<ProfileInfo {...profile} />
							{isEditingAllowed && (
								<Button
									type="button"
									color="gray"
									onClick={() => setIsEditingProfile(true)}
									className="max-w-lg w-full">
									Edit
								</Button>
							)}
						</>
					)}
				</main>
			</ProfileLayout>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	// get profile data, allow editing if profile is signed in users own profile
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

export default Profile;
