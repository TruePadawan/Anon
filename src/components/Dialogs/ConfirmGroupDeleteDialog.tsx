import GroupsAPI from "@/lib/api/GroupsAPI";
import { getErrorMessage } from "@/lib/error-message";
import { Button, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useState } from "react";

interface ConfirmGroupDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
}

export default function ConfirmGroupDeleteDialog(
    props: ConfirmGroupDeleteDialogProps,
) {
    const [buttonsAreDisabled, setBtnsAreDisabled] = useState(false);
    const router = useRouter();

    async function deleteGroup() {
        setBtnsAreDisabled(true);
        try {
            await GroupsAPI.delete(props.groupId);
            notifications.show({
                color: "green",
                message: "Group deleted successfully",
            });
            router.push("/groups");
        } catch (error) {
            notifications.show({
                color: "red",
                title: "Failed to delete group",
                message: getErrorMessage(error),
            });
        }
        setBtnsAreDisabled(false);
    }

    return (
        <Modal
            title="Delete this group?"
            opened={props.isOpen}
            onClose={props.onClose}
            centered
        >
            <p className="text-sm">
                Are you sure you want to delete this group?
            </p>
            <div className="mt-2 flex flex-col gap-1">
                <Button
                    color="green"
                    onClick={deleteGroup}
                    disabled={buttonsAreDisabled}
                >
                    Yes
                </Button>
                <Button
                    color="red"
                    variant="subtle"
                    onClick={props.onClose}
                    disabled={buttonsAreDisabled}
                >
                    No
                </Button>
            </div>
        </Modal>
    );
}
