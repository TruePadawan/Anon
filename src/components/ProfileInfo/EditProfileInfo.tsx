/* eslint-disable @next/next/no-img-element */
import InputField from "../InputField/InputField";
import { UserProfileType } from "../../types/types";
import TextArea from "../TextArea/TextArea";
import { useEffect, useRef, useState } from "react";
import Button from "../Button/Button";
import useInput from "@/hooks/useInput";
import { validateAccountName } from "./utils";

interface EditProfileInfoProps {
	profileData: UserProfileType;
	onCancel?: () => void;
	onUpdate?: () => void;
}

const EditProfileInfo = (props: EditProfileInfoProps) => {
	const [formIsValid, setFormIsValid] = useState(false);
	const [displayName, setDisplayName] = useState(props.profileData.displayName);
	const bioRef = useRef<HTMLTextAreaElement>(null);
	const accountNameInput = useInput(
		validateAccountName,
		props.profileData.accountName
	);

	// update formIsValid state when input states change
	useEffect(() => {
		setFormIsValid(
			accountNameInput.checkingValidity === false &&
				accountNameInput.isInputValid === true &&
				displayName.trim().length > 0
		);
	}, [accountNameInput, displayName]);

	function onFormSubmit(event: React.FormEvent) {
		event.preventDefault();
		// update profile data

		// after update
		if (props.onUpdate) {
			props.onUpdate();
		}
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

	const { profileData } = props;
	return (
		<form
			className="flex flex-col items-center gap-4 max-w-lg w-full"
			onSubmit={onFormSubmit}>
			{profileData.avatarUrl ? (
				<img
					className="rounded-full"
					src={profileData.avatarUrl}
					alt="avatar"
					width={120}
					height={120}
				/>
			) : (
				<span
					className="rounded-full"
					style={{
						background: profileData.color,
						width: "120px",
						height: "120px",
					}}></span>
			)}
			<InputField
				className="w-full"
				inputElementID="account_name"
				label="Account name"
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
			<div className="flex flex-col gap-2 self-stretch">
				<Button
					type="submit"
					className="bg-dark-green disabled:hover:bg-dark-green hover:bg-dark-green-l"
					disabled={!formIsValid}>
					Update
				</Button>
				<Button
					type="button"
					className="bg-dark-red disabled:hover:bg-dark-red hover:bg-dark-red-l"
					onClick={onCancelBtnClicked}>
					Cancel
				</Button>
			</div>
		</form>
	);
};

export default EditProfileInfo;
