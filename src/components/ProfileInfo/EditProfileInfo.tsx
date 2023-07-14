/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { Button, FileInput, Loader, TextInput, Textarea } from "@mantine/core";
import useInput from "@/hooks/useInput";
import { validateAccountName } from "./utils";
import {
	validateFileAsImage,
	uploadImage,
} from "../../../helpers/global-helpers";
import { UploadApiOptions } from "cloudinary";
import { IconUpload } from "@tabler/icons-react";
import { UserProfile } from "@prisma/client";
import { notifications } from "@mantine/notifications";

interface EditProfileInfoProps {
	profileData: UserProfile;
	onCancel?: () => void;
	onUpdate?: () => void;
}

const EditProfileInfo = (props: EditProfileInfoProps) => {
	const [formIsValid, setFormIsValid] = useState(false);
	const [displayName, setDisplayName] = useState(props.profileData.displayName);
	const [isUpdating, setIsUpdating] = useState(false);
	const [profilePicIsValid, setProfilePicIsValid] = useState(true);
	const [imageValidationErrorText, setImageValidationErrorText] = useState("");

	const bioRef = useRef<HTMLTextAreaElement>(null);
	const profilePictureRef = useRef<File | undefined>();

	// account name is valid if its the same as signed in users' or is unique in db
	const accountNameInput = useInput(validateAccountName, {
		defaultValue: props.profileData.accountName,
		transform: (value) => value?.toString().replaceAll(" ", ""),
	});

	// update formIsValid state when input states change
	useEffect(() => {
		setFormIsValid(
			profilePicIsValid &&
				accountNameInput.checkingValidity === false &&
				accountNameInput.isInputValid &&
				displayName.trim().length > 0
		);
	}, [
		profilePicIsValid,
		accountNameInput,
		displayName,
		props.profileData.accountName,
	]);

	async function uploadProfilePicture(): Promise<string> {
		if (profilePictureRef.current === undefined) {
			throw new Error("No file selected!");
		}
		const uploadOptions: UploadApiOptions = {
			upload_preset: "profile_pic_preset",
			public_id: `${props.profileData.id}`,
			folder: "anon/profile_pictures",
			overwrite: true,
		};

		const uploadResult = await uploadImage(
			profilePictureRef.current,
			uploadOptions
		);
		return uploadResult.secure_url;
	}

	async function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		try {
			setIsUpdating(true);
			const profilePicUrl = profilePictureRef.current
				? await uploadProfilePicture()
				: undefined;

			// update profile data
			const data = {
				avatarUrl: profilePicUrl,
				accountName: accountNameInput.inputValue,
				displayName,
				bio: bioRef.current?.value,
			};

			const response = await fetch("/api/update-profile", {
				method: "POST",
				body: JSON.stringify(data),
			});

			if (response.ok && props.onUpdate) {
				// after update
				props.onUpdate();
			} else if (!response.ok) {
				// handle failed update
				const error = await response.json();
				throw new Error(error.message);
			}
		} catch (error: any) {
			notifications.show({
				color: "red",
				title: "Failed to update profile",
				message: error.message,
			});
			console.error(error);
		}
		setIsUpdating(false);
	}

	function displayNameChangeHandler(
		event: React.ChangeEvent<HTMLInputElement>
	) {
		setDisplayName(event.target.value);
	}

	function cancelBtnClickHandler() {
		if (props.onCancel) {
			props.onCancel();
		}
	}

	async function fileInputChangeHandler(file: File | null) {
		profilePictureRef.current = undefined;
		// validate that file is less than 1MB and is an image
		if (file !== null) {
			const result = validateFileAsImage(file);
			if (result.isValid) {
				// valid file - keep track of selected file
				profilePictureRef.current = file;
				setProfilePicIsValid(true);
			} else {
				// notify user to give correct data
				setImageValidationErrorText(result.messages.join("\n"));
				setProfilePicIsValid(false);
			}
		}
		if (file === null) {
			// file input for selecting profile pic is valid if no file is selected or if a valid pic is selected
			setProfilePicIsValid(true);
		}
	}

	const { profileData } = props;
	const updateIsDisabled = !formIsValid || isUpdating;
	return (
		<>
			<form
				className="flex flex-col items-center gap-4 max-w-lg w-full"
				onSubmit={formSubmitHandler}>
				<FileInput
					accept="image/*"
					size="md"
					className="w-full"
					icon={<IconUpload />}
					label="Profile picture (<= 1MB)"
					placeholder="Select image"
					error={imageValidationErrorText}
					onChange={fileInputChangeHandler}
				/>
				<TextInput
					className="w-full"
					rightSection={
						accountNameInput.checkingValidity ? <Loader size="sm" /> : undefined
					}
					size="md"
					label="Account name (no whitespace)"
					pattern="^\S*$"
					value={accountNameInput.inputValue}
					onChange={accountNameInput.changeEventHandler}
					error={
						!accountNameInput.isInputValid
							? `${accountNameInput.inputValue} is taken`
							: ""
					}
					spellCheck={false}
					required
				/>
				<TextInput
					className="w-full"
					size="md"
					label="Display name"
					value={displayName}
					onChange={displayNameChangeHandler}
					spellCheck={false}
					required
				/>
				<Textarea
					className="w-full"
					size="md"
					label="Bio"
					defaultValue={profileData.bio}
					ref={bioRef}
					required
					autosize
				/>
				{accountNameInput.checkingValidity && (
					<p className="text-dark-green-l text-sm">Validating values</p>
				)}
				{isUpdating && (
					<p className="text-dark-green-l text-sm">Updating profile</p>
				)}
				<div className="flex flex-col gap-2 self-stretch">
					<Button
						type="submit"
						className="bg-dark-green disabled:hover:bg-dark-green hover:bg-dark-green-l"
						disabled={updateIsDisabled}>
						Update
					</Button>
					<Button
						type="button"
						className="bg-dark-red disabled:hover:bg-dark-red hover:bg-dark-red-l"
						onClick={cancelBtnClickHandler}
						disabled={isUpdating}>
						Cancel
					</Button>
				</div>
			</form>
		</>
	);
};

export default EditProfileInfo;
