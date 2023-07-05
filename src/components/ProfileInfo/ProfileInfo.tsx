/* eslint-disable @next/next/no-img-element */
import InputField from "../InputField/InputField";
import { UserProfileType } from "../../types/types";
import TextArea from "../TextArea/TextArea";
import { IMG_HEIGHT, IMG_WIDTH } from "./utils";

const ProfileInfo = (props: UserProfileType) => {
	return (
		<div className="flex flex-col items-center gap-4 max-w-lg w-full">
			{props.avatarUrl ? (
				<img
					className="rounded-full"
					src={props.avatarUrl}
					alt={props.accountName}
				/>
			) : (
				<span
					className="rounded-full"
					style={{
						background: props.color,
						width: `${IMG_WIDTH}px`,
						height: `${IMG_HEIGHT}px`,
					}}></span>
			)}

			<InputField
				className="w-full"
				inputElementID="account_name"
				label="Account name"
				value={props.accountName}
				readOnly
			/>
			<InputField
				className="w-full"
				inputElementID="display_name"
				label="Display name"
				value={props.displayName}
				readOnly
			/>
			<TextArea
				className="w-full"
				textareaID="bio"
				label="Bio"
				value={props.bio}
				readOnly
			/>
		</div>
	);
};

export default ProfileInfo;
