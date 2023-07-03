/* eslint-disable @next/next/no-img-element */
import InputField from "../InputField/InputField";
import { UserProfileType } from "../../types/types";
import TextArea from "../TextArea/TextArea";
import { useEffect, useRef, useState } from "react";
import Button from "../Button/Button";
import useInput from "@/hooks/useInput";
import { IMG_HEIGHT, IMG_WIDTH, validateAccountName } from "./utils";

interface EditProfileInfoProps {
	profileData: UserProfileType;
	onCancel?: () => void;
	onUpdate?: () => void;
}

const EditProfileInfo = (props: EditProfileInfoProps) => {
	const [formIsValid, setFormIsValid] = useState(false);
	const [displayName, setDisplayName] = useState(props.profileData.displayName);
	const [isUpdating, setIsUpdating] = useState(false);
	const bioRef = useRef<HTMLTextAreaElement>(null);
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
			accountNameInput.checkingValidity === false &&
				accountNameIsValid &&
				displayName.trim().length > 0
		);
	}, [accountNameInput, displayName, props.profileData.accountName]);

	async function onFormSubmit(event: React.FormEvent) {
		event.preventDefault();
		console.log(event.target);
		// update profile data
		const data = {
			accountName: accountNameInput.inputValue,
			displayName,
			bio: bioRef.current?.value,
		};
		setIsUpdating(true);
		const response = await fetch("/api/update-profile", {
			method: "POST",
			body: JSON.stringify(data),
		});
		if (response.ok) {
			// after update
			if (props.onUpdate) {
				props.onUpdate();
			}
		} else {
			// handle error
		}
		setIsUpdating(false);
	}

	function onDisplayNameChanged(event: React.ChangeEvent<HTMLInputElement>) {
		setDisplayName(event.target.value);
	}

	function onCancelBtnClicked() {
		// delete uploaded image if any
		if (props.onCancel) {
			props.onCancel();
		}
	}

	function fileInputChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
		console.log(event.target.files);
		// validate that file is less than 1mb and is an image
		// valid file - upload to cloudinary and retrieve public url
	}

	const { profileData } = props;
	const updateIsDisabled = !formIsValid || isUpdating;
	return (
		<form
			className="flex flex-col items-center gap-4 max-w-lg w-full"
			onSubmit={onFormSubmit}>
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
				onChange={onDisplayNameChanged}
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
					onClick={onCancelBtnClicked}
					disabled={isUpdating}>
					Cancel
				</Button>
			</div>
		</form>
	);
};

export default EditProfileInfo;
