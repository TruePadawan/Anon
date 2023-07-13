import Navbar, { NavbarUserProp } from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import Head from "next/head";
import ProfileInfo from "@/components/ProfileInfo/ProfileInfo";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { Button } from "@mantine/core";
import { useState } from "react";
import EditProfileInfo from "@/components/ProfileInfo/EditProfileInfo";
import { useRouter } from "next/router";
import { prisma } from "../../../../lib/prisma-client";
import { UserProfile } from "@prisma/client";

export interface ProfileProps {
	profile: UserProfile | null;
	navbarUserProp: NavbarUserProp | null;
}

const Profile = (props: ProfileProps) => {
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const router = useRouter();
	const { profile, navbarUserProp } = props;

	if (profile === null) {
		return (
			<>
				<Head>
					<title key="title">ANON | Profile Not Found</title>
				</Head>
				<Navbar user={navbarUserProp} />
				<div className="flex items-center justify-center">
					<h2>Profile Not Found</h2>
				</div>
			</>
		);
	}
	const isEditingAllowed =
		profile.accountName === props.navbarUserProp?.accountName;

	return (
		<>
			<Head>
				<title key="title">{`ANON | ${profile.displayName}`}</title>
			</Head>
			<Navbar user={navbarUserProp} />
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
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	// get profile data, allow editing if profile is signed in users own profile
	if (context.params === undefined) throw new Error("No account name in URL");

	// Get signed in user data for navbar
	const session = await getServerSession(context.req, context.res, authOptions);
	let navbarUserProp = null;

	// get navbar user prop
	if (session) {
		navbarUserProp = await prisma.userProfile.findUnique({
			where: {
				id: session.user.id,
			},
			select: {
				displayName: true,
				accountName: true,
			},
		});
	}

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
			navbarUserProp,
		},
	};
};

export default Profile;
