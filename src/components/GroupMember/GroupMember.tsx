import GroupsAPI from "@/lib/api/GroupsAPI";
import { getErrorMessage } from "@/lib/error-message";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Prisma } from "@prisma/client";
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

const groupMemberWithProfile =
	Prisma.validator<Prisma.GroupMemberDefaultArgs>()({
		include: { user: true },
	});

export type GroupMemberWithProfile = Prisma.GroupMemberGetPayload<
	typeof groupMemberWithProfile
>;
