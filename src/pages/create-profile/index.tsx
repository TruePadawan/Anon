import {
	parseAccountName,
	validateAccountName,
} from "@/components/ProfileInfo/utils";
import useInput from "@/hooks/useInput";
import { Button, Loader, Skeleton, TextInput, Title } from "@mantine/core";
import { useSession } from "next-auth/react";
import { getRandomColor, getRandomInt } from "../../helpers/global_helpers";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { notifications } from "@mantine/notifications";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export default function CreateProfilePage() {
	const router = useRouter();
	const { mutate } = useSWRConfig();
	const { data: session, status } = useSession();
	const accountNameInput = useInput([validateAccountName], {
		transform: parseAccountName,
	});
	const displayNameInput = useInput([]);
	const [creatingProfile, setCreatingProfile] = useState(false);

	if (status === "loading") {
		return (
			<main className="grow flex justify-center items-center">
				<div className="w-full max-w-2xl flex flex-col gap-5">
					<Skeleton className="self-center" height={25} width="70%" />
					<div className="flex flex-col gap-3">
						<Skeleton height={40} />
						<Skeleton height={40} />
					</div>
					<div className="flex flex-col gap-1">
						<Skeleton height={45} />
						<Skeleton height={45} />
					</div>
				</div>
			</main>
		);
	}

	if (status === "authenticated") {
		if (!accountNameInput.wasTouched) {
			const randomAccountName = `${session.user.email
				?.split("@")
				.at(0)}${getRandomInt(100000000)}`;
			accountNameInput.updateValue(randomAccountName);
		}
		if (!displayNameInput.wasTouched) {
			displayNameInput.updateValue(session.user.name ?? "New User");
		}
	}

	async function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		try {
			setCreatingProfile(true);

			const profileData = {
				accountName: accountNameInput.value,
				displayName: displayNameInput.value,
				color: getRandomColor(),
				createdAt: Date.now(),
			};
			const response = await fetch("/api/create-profile", {
				method: "POST",
				body: JSON.stringify(profileData),
			});

			if (response.ok) {
				mutate("/api/get-user-profile");
				router.replace(`/users/${profileData.accountName}`);
				notifications.show({
					color: "green",
					message: "Profile created successfully",
				});
			} else if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message);
			}
		} catch (error: any) {
			notifications.show({
				color: "red",
				title: "Failed to create profile",
				message: error.message,
			});
			setCreatingProfile(false);
		}
	}

	const formIsValid = accountNameInput.isValid && displayNameInput.isValid;
	const btnsAreDisabled = !formIsValid || creatingProfile;
	return (
		<main className="grow flex flex-col justify-center items-center gap-5">
			<Title order={1} id="form-header-text" className="font-semibold">
				Create Profile
			</Title>
			<form
				onSubmit={formSubmitHandler}
				className="w-full max-w-2xl flex flex-col gap-3"
				aria-labelledby="form-header-text">
				<TextInput
					size="lg"
					label="Account name"
					description="Account names are unique and should have no whitespace"
					rightSection={
						accountNameInput.isValidating ? <Loader size="sm" /> : undefined
					}
					value={accountNameInput.value}
					onChange={accountNameInput.changeEvHandler}
					onFocus={accountNameInput.focusEvHandler}
					error={accountNameInput.hasError ? accountNameInput.errorMessage : ""}
					spellCheck={false}
					required
				/>
				<TextInput
					size="lg"
					label="Display name"
					rightSection={
						displayNameInput.isValidating ? <Loader size="sm" /> : undefined
					}
					value={displayNameInput.value}
					onChange={displayNameInput.changeEvHandler}
					onFocus={displayNameInput.focusEvHandler}
					error={displayNameInput.hasError ? displayNameInput.errorMessage : ""}
					spellCheck={false}
					required
				/>
				<div className="flex flex-col gap-1">
					<Button
						type="submit"
						color="gray"
						size="lg"
						loaderPosition="center"
						loading={creatingProfile}
						disabled={btnsAreDisabled}>
						Create Profile
					</Button>
					<Button
						type="button"
						variant="light"
						color="red"
						size="lg"
						disabled={btnsAreDisabled}>
						Signout
					</Button>
				</div>
			</form>
		</main>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	// Check that signed in user doesn't already have a profile, if they do? redirect to their profile
	const session = await getServerSession(context.req, context.res, authOptions);
	if (!session) {
		return {
			redirect: {
				destination: "/sign-in",
				permanent: false,
			},
		};
	}

	const profile = await prisma.userProfile.findUnique({
		where: { userId: session.user.id },
		select: { accountName: true },
	});

	if (profile !== null) {
		return {
			redirect: {
				destination: `/users/${profile.accountName}`,
				permanent: false,
			},
		};
	}

	return {
		props: {},
	};
};
