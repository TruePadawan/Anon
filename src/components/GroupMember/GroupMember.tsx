import GroupsAPI from "@/lib/api/GroupsAPI";
import { getErrorMessage } from "@/lib/error-message";
import { GroupMemberWithProfile } from "@/types/types";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

interface GroupMemberProps {
	memberData: Pick<GroupMemberWithProfile, "id" | "joinedAt" | "user">;
}

export default function GroupMember({ memberData }: GroupMemberProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [buttonsAreDisabled, setButtonsAreDisabled] = useState(false);

	async function removeMember() {
		setButtonsAreDisabled(true);
		try {
			await GroupsAPI.removeMember(memberData.id);
			notifications.show({
				color: "green",
				message: `${memberData.user.accountName} was removed successfully`,
			});
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to remove user",
				message: getErrorMessage(error),
			});
		}
		setButtonsAreDisabled(false);
		close();
	}

	async function banMember() {
		setButtonsAreDisabled(true);
		try {
			await GroupsAPI.banMember(memberData.id);
			notifications.show({
				color: "green",
				message: `${memberData.user.accountName} was banned successfully`,
			});
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to ban user",
				message: getErrorMessage(error),
			});
		}
		setButtonsAreDisabled(false);
		close();
	}

	return (
		<>
			<Modal
				opened={opened}
				onClose={close}
				title={`Manage ${memberData.user.accountName}`}
				centered>
				<div className="flex flex-col gap-y-1">
					<Button
						variant="filled"
						component="a"
						target="_blank"
						rel="noopener noreferrer"
						href={`/users/${memberData.user.accountName}`}>
						View profile
					</Button>
					<Button
						variant="filled"
						color="gray"
						onClick={removeMember}
						disabled={buttonsAreDisabled}>
						Remove member
					</Button>
					<Button
						variant="subtle"
						color="red"
						onClick={banMember}
						disabled={buttonsAreDisabled}>
						Ban member
					</Button>
				</div>
			</Modal>
			<p
				className="font-semibold text-sm hover:underline hover:text-white hover:cursor-pointer inline"
				onClick={open}>
				{memberData.user.displayName}
			</p>
		</>
	);
}
