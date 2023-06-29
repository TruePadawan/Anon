import Navbar, { NavbarUserProp } from "@/components/Navbar/Navbar";
import UserProfile from "../../../../models/UserProfile";
import { GetServerSideProps } from "next";
import dbConnect from "../../../../lib/db-connect";
import Head from "next/head";
import ProfileInfo from "@/components/ProfileInfo/ProfileInfo";
import { UserProfileData } from "../../../../lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { getNavbarUserProp } from "../../../../helpers/global-helpers";
import Button from "@/components/Button/Button";

export interface ProfileProps {
	profileData: UserProfileData | null;
	navbarUserProp: NavbarUserProp | null;
}

const Profile = (props: ProfileProps) => {
	const { profileData, navbarUserProp } = props;

	if (profileData === null) {
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

	function onEditButtonClicked() {
		// handle start of editing profile process
	}

	const isEditingAllowed =
		profileData.accountName === props.navbarUserProp?.accountName;
	return (
		<>
			<Head>
				<title key="title">{`ANON | ${profileData.displayName}`}</title>
			</Head>
			<Navbar user={navbarUserProp} />
			<main className="grow flex flex-col gap-4 items-center pt-8">
				<ProfileInfo {...profileData} />
				{isEditingAllowed && (
					<Button
						onClick={onEditButtonClicked}
						className="max-w-lg w-full"
						type="button">
						Edit
					</Button>
				)}
			</main>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	// get profile data, allow editing if profile is signed in users own profile
	if (context.params === undefined) throw new Error("No account name in URL");
	await dbConnect();

	// Get signed in user data for navbar
	const session = await getServerSession(context.req, context.res, authOptions);
	let navbarUserProp = null;
	if (session) {
		navbarUserProp = await getNavbarUserProp(session.user.id);
	}

	// Get profile data that belongs to what [account-name] resolves to.
	const accountName = context.params["account-name"];
	const profile = await UserProfile.findOne({
		account_name: accountName,
	}).exec();

	if (profile === null) {
		return {
			props: {
				profileData: null,
			},
		};
	}
	return {
		props: {
			profileData: {
				accountName: profile.account_name,
				displayName: profile.display_name,
				bio: profile.bio,
				color: profile.color,
				avatarUrl: profile.avatar_url,
			},
			navbarUserProp,
		},
	};
};

export default Profile;
