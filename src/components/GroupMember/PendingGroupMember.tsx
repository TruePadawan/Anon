import GroupsAPI from "@/lib/api/GroupsAPI";
import { getErrorMessage } from "@/lib/error-message";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { GroupMemberWithProfile } from "@/types/types";

interface PendingGroupMember {
	memberData: Pick<GroupMemberWithProfile, "id" | "joinedAt" | "user">;
}

export default function PendingGroupMember({ memberData }: PendingGroupMember) {
	const [opened, { open, close }] = useDisclosure(false);
	const [buttonsAreDisabled, setButtonsAreDisabled] = useState(false);

	async function rejectMember() {
		setButtonsAreDisabled(true);
		try {
			await GroupsAPI.removeMember(memberData.id);
			notifications.show({
				color: "green",
				message: `${memberData.user.accountName} was rejected successfully`,
			});
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to reject user",
				message: getErrorMessage(error),
			});
		}
		setButtonsAreDisabled(false);
		close();
	}

	async function acceptMember() {
		setButtonsAreDisabled(true);
		try {
			await GroupsAPI.acceptMember(memberData.id);
			notifications.show({
				color: "green",
				message: `${memberData.user.accountName} was accepted successfully`,
			});
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to accept user",
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
						variant="subtle"
						color="red"
						onClick={acceptMember}
						disabled={buttonsAreDisabled}>
						Accept member
					</Button>
					<Button
						variant="filled"
						color="gray"
						onClick={rejectMember}
						disabled={buttonsAreDisabled}>
						Reject member
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
