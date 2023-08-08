import {
	parseAccountName,
	validateAccountName,
} from "@/components/ProfileInfo/utils";
import useInput from "@/hooks/useInput";
import {
	Button,
	Loader,
	Skeleton,
	TextInput,
	Textarea,
	Title,
} from "@mantine/core";
import { useSession } from "next-auth/react";
import { getRandomInt } from "../../../helpers/global-helpers";
import { useRouter } from "next/router";
import { useState } from "react";

export default function CreateProfilePage() {
	const router = useRouter();
	const { data: session, status } = useSession({
		required: true,
		onUnauthenticated() {
			router.replace("/no-access");
		},
	});
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

	const formIsValid = accountNameInput.isValid && displayNameInput.isValid;
	const btnsAreDisabled = !formIsValid || creatingProfile;
	return (
		<main className="grow flex flex-col justify-center items-center gap-5">
			<Title order={1} id="form-header-text" className="font-semibold">
				Create Profile
			</Title>
			<form
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
				<Textarea size="lg" label="Bio" required autosize />
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
