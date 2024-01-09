import { Button } from "@mantine/core";
import GroupPostItem, { GroupPostItemProps } from "./GroupPostItem";
import { Ref, forwardRef, useState } from "react";
import GroupPostAPI from "@/lib/api/GroupPostAPI";
import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "@/lib/error-message";

type PendingGroupPostItemProps = Omit<
	GroupPostItemProps,
	"className" | "showCommentsCount"
>;
const PendingGroupPostItem = forwardRef(function PendingGroupPostItem(
	props: PendingGroupPostItemProps,
	ref: Ref<HTMLDivElement>
) {
	const [buttonsAreDisabled, setBtnsAreDisabled] = useState(false);

	async function approve() {
		setBtnsAreDisabled(true);
		try {
			await GroupPostAPI.update(props.postData.id, { isApproved: true });
			notifications.show({
				color: "green",
				message: "Post approved",
			});
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to approve post",
				message: getErrorMessage(error),
			});
			setBtnsAreDisabled(false);
		}
	}

	async function reject() {
		setBtnsAreDisabled(true);
		try {
			await GroupPostAPI.remove(props.postData.id);
			notifications.show({
				color: "yellow",
				message: "Post rejected",
			});
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to reject post",
				message: getErrorMessage(error),
			});
			setBtnsAreDisabled(false);
		}
	}

	return (
		<div>
			<GroupPostItem {...props} ref={ref} />
			<div className="mt-1 flex flex-col gap-1">
				<Button
					color="gray"
					variant="filled"
					onClick={approve}
					disabled={buttonsAreDisabled}>
					Approve
				</Button>
				<Button
					color="red"
					variant="subtle"
					onClick={reject}
					disabled={buttonsAreDisabled}>
					Reject
				</Button>
			</div>
		</div>
	);
});

export default PendingGroupPostItem;
