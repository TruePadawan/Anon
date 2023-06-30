import Image from "next/image";
import InputField from "../InputField/InputField";
import { UserProfileType } from "../../../lib/types";
import TextArea from "../TextArea/TextArea";

const ProfileInfo = (props: UserProfileType) => {
	return (
		<div className="flex flex-col items-center gap-4 max-w-lg w-full">
			{props.avatarUrl ? (
				<Image
					className="rounded-full"
					src={props.avatarUrl}
					alt="avatar"
					width={120}
					height={120}
					quality={100}
				/>
			) : (
				<span
					className="rounded-full"
					style={{
						background: props.color,
						width: "120px",
						height: "120px",
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
