/* eslint-disable @next/next/no-img-element */
import InputField from "../InputField/InputField";
import { UserProfileType } from "../../types/types";
import TextArea from "../TextArea/TextArea";
import { useEffect, useRef, useState } from "react";
import Button from "../Button/Button";
import useInput from "@/hooks/useInput";
import { validateAccountName } from "./utils";
import {
	validateFileAsImage,
	uploadImage,
} from "../../../helpers/global-helpers";
import { Alert, Snackbar } from "@mui/material";
import { UploadApiOptions } from "cloudinary";

interface EditProfileInfoProps {
	profileData: UserProfileType;
	onCancel?: () => void;
	onUpdate?: () => void;
}

const EditProfileInfo = (props: EditProfileInfoProps) => {
	const [formIsValid, setFormIsValid] = useState(false);
	const [displayName, setDisplayName] = useState(props.profileData.displayName);
	const [isUpdating, setIsUpdating] = useState(false);
	const [profilePicIsValid, setProfilePicIsValid] = useState(true);
	const [errorText, setErrorText] = useState("");

	const bioRef = useRef<HTMLTextAreaElement>(null);
	const profilePictureRef = useRef<File | undefined>();

	const accountNameInput = useInput(validateAccountName, {
		defaultValue: props.profileData.accountName,
		transform: (value) => value?.toString().replaceAll(" ", ""),
	});

	// update formIsValid state when input states change
	// account name is valid if its the same as signed in users' or is unique in db
	useEffect(() => {
		const accountNameIsValid =
			accountNameInput.inputValue === props.profileData.accountName ||
			accountNameInput.isInputValid;
		setFormIsValid(
			profilePicIsValid &&
				accountNameInput.checkingValidity === false &&
				accountNameIsValid &&
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
				throw new Error(response.statusText);
			}
		} catch (error) {
			console.error(error);
			setErrorText("Failed to update profile data");
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

	async function fileInputChangeHandler(
		event: React.ChangeEvent<HTMLInputElement>
	) {
		profilePictureRef.current = undefined;
		const files = event.target.files;

		// validate that file is less than 1MB and is an image
		if (files !== null && files.length === 1) {
			const result = validateFileAsImage(files[0]);
			if (result.isValid) {
				// valid file - keep track of selected file
				profilePictureRef.current = files[0];
				setProfilePicIsValid(true);
			} else {
				// notify user to give correct data
				setErrorText(result.messages.join("\n"));
				setProfilePicIsValid(false);
			}
		}
		if (files?.length === 0) {
			// file input for selecting profile pic is valid if no file is selected or if a valid pic is selected
			setProfilePicIsValid(true);
		}
	}

	function closeSnackbar() {
		setErrorText("");
	}

	const errorSnackbarOpen = Boolean(errorText);
	const { profileData } = props;
	const updateIsDisabled = !formIsValid || isUpdating;
	return (
		<>
			<Snackbar open={errorSnackbarOpen} onClose={closeSnackbar}>
				<Alert
					severity="warning"
					sx={{ width: "100%" }}
					onClose={closeSnackbar}>
					{errorText}
				</Alert>
			</Snackbar>
			<form
				className="flex flex-col items-center gap-4 max-w-lg w-full"
				onSubmit={formSubmitHandler}>
				<InputField
					type="file"
					className="w-full"
					inputElementID="profile_pic"
					label="Select profile picture (<= 1MB)"
					accept="image/*"
					onChange={fileInputChangeHandler}
				/>
				<InputField
					className="w-full"
					inputElementID="account_name"
					title="Account name should not have whitespace"
					label="Account name (no whitespace)"
					pattern="^\S*$"
					value={accountNameInput.inputValue}
					onChange={accountNameInput.changeEventHandler}
					required
				/>
				<InputField
					className="w-full"
					inputElementID="display_name"
					label="Display name"
					value={displayName}
					onChange={displayNameChangeHandler}
					required
				/>
				<TextArea
					className="w-full"
					textareaID="bio"
					label="Bio"
					defaultValue={profileData.bio}
					textareaRef={bioRef}
					required
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
