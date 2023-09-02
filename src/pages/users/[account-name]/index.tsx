import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import Head from "next/head";
import ProfileInfo from "@/components/ProfileInfo/ProfileInfo";
import { Button, Modal } from "@mantine/core";
import { useState } from "react";
import EditProfileInfo from "@/components/ProfileInfo/EditProfileInfo";
import { useRouter } from "next/router";
import { prisma } from "@/lib/prisma-client";
import { UserProfile } from "@prisma/client";
import ProfileLayout from "@/layout/ProfileLayout";
import useUser from "@/hooks/useUser";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "@/lib/error-message";
import { signOut } from "next-auth/react";

export interface ProfileProps {
	profile: UserProfile | null;
}

const Profile = (props: ProfileProps) => {
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const router = useRouter();
	const { user } = useUser();
	const [dialogIsOpen, { open: openDialog, close: closeDialog }] =
		useDisclosure(false);
	const [deletingProfile, setDeletingProfile] = useState(false);
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
	const sameUser = profile.accountName === user?.accountName;

	async function deleteProfile() {
		setDeletingProfile(true);
		const response = await fetch("/api/delete-profile");
		if (response.ok) {
			await signOut({ callbackUrl: "/" });
		} else {
			const error = await response.json();
			notifications.show({
				color: "red",
				title: "Action failed",
				message: getErrorMessage(error),
			});
			setDeletingProfile(false);
		}
	}
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
							{sameUser && (
								<>
									<Button
										type="button"
										color="gray"
										onClick={() => setIsEditingProfile(true)}
										className="max-w-lg w-full">
										Edit
									</Button>
									<Button
										className="max-w-lg w-full"
										variant="filled"
										color="red"
										onClick={openDialog}>
										DELETE ACCOUNT
									</Button>
									<Modal
										title="Confirm Action"
										opened={dialogIsOpen}
										onClose={closeDialog}
										centered
										withCloseButton={false}
										closeOnClickOutside={false}>
										<div className="flex flex-col gap-1.5">
											<p className="text-sm">
												Are you sure you want to delete your profile? It is
												permanent and all your comments, posts and groups will
												be deleted
											</p>
											<div className="flex flex-col gap-1">
												<Button
													color="red"
													onClick={deleteProfile}
													disabled={deletingProfile}>
													Yes, I want to permanently delete my account
												</Button>
												<Button
													variant="light"
													color="green"
													onClick={closeDialog}
													disabled={deletingProfile}>
													No
												</Button>
											</div>
										</div>
									</Modal>
								</>
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
