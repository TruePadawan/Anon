import Navbar from "@/components/Navbar/Navbar";
import useInput from "@/hooks/useInput";
import useUser from "@/hooks/useUser";
import { CreateGroupApiReqBody } from "@/pages/api/create-group";
import { Button, Group, Radio, TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Group as GroupModel } from "@prisma/client";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

interface fetchResponse {
	group: GroupModel | null;
}
async function validateGroupName(groupName: string) {
	if (groupName === "") return false;

	const res = await fetch("/api/get-group", {
		method: "POST",
		body: JSON.stringify({
			name: groupName,
		}),
	});
	if (!res.ok) {
		const { message: errorMessage } = await res.json();
		throw new Error(errorMessage);
	}
	const { group }: fetchResponse = await res.json();
	// group name is valid if there is no group with that name, so group will be null
	return group === null;
}

type RadioValue = "true" | "false" | string;
export default function CreateGroupPage() {
	const { user } = useUser();
	const groupNameInput = useInput(validateGroupName);
	const descRef = useRef<HTMLTextAreaElement>(null);
	const [groupIsAnonymous, setGroupIsAnonymous] = useState<RadioValue>("false");
	const [autoApprovePosts, setAutoApprovePosts] = useState<RadioValue>("true");
	const [autoApproveMembers, setAutoApproveMembers] =
		useState<RadioValue>("true");
	const router = useRouter();
	const [creatingGroup, setCreatingGroup] = useState(false);

	async function submitHandler(event: React.FormEvent) {
		event.preventDefault();
		if (!user) return;

		const payload: CreateGroupApiReqBody = {
			groupData: {
				adminId: user.id,
				name: groupNameInput.inputValue,
				desc: descRef.current?.value,
			},
			settingsData: {
				isAnonymous: groupIsAnonymous === "true",
				autoMemberApproval: autoApproveMembers === "true",
				autoPostApproval: autoApprovePosts === "true",
			},
		};
		setCreatingGroup(true);
		const res = await fetch("/api/create-group", {
			method: "POST",
			body: JSON.stringify(payload),
		});
		if (!res.ok) {
			const { message } = await res.json();
			notifications.show({
				color: "red",
				title: "Failed to complete action",
				message,
			});
		} else {
			const { group }: { group: GroupModel } = await res.json();
			notifications.show({
				color: "green",
				message: `Group '${group.name} created successfully`,
			});
			router.push("/groups");
		}
		setCreatingGroup(false);
	}

	const inputIsInvalid =
		groupNameInput.inputWasTouched &&
		!groupNameInput.checkingValidity &&
		!groupNameInput.isInputValid;

	const inputErrorMessage =
		groupNameInput.inputValue.length <= 0
			? "Group name not specified"
			: `${groupNameInput.inputValue} is taken`;
	const formIsValid =
		!groupNameInput.checkingValidity && groupNameInput.isInputValid;
	return (
		<>
			<Navbar />
			<main className="flex justify-center">
				<form
					onSubmit={submitHandler}
					aria-labelledby="form-header"
					className="max-w-lg w-full flex flex-col gap-4">
					<h2 id="form-header" className="text-4xl text-center">
						Create a group
					</h2>
					<div className="flex flex-col gap-4">
						<TextInput
							label="Name"
							placeholder="EARTH_1"
							size="md"
							value={groupNameInput.inputValue}
							onChange={groupNameInput.changeEventHandler}
							onFocus={groupNameInput.focusEventHandler}
							error={inputIsInvalid ? inputErrorMessage : ""}
							disabled={creatingGroup}
							withAsterisk
							required
						/>
						<Textarea
							label="Description"
							placeholder="This group is for humans currently inhabiting EARTH_1"
							size="md"
							minRows={2}
							ref={descRef}
							disabled={creatingGroup}
							autosize
						/>
						<Radio.Group
							name="group-type"
							label="Create anonymous group?"
							description="The profiles of all members are hidden from each other except the admin"
							value={groupIsAnonymous}
							onChange={setGroupIsAnonymous}
							size="md"
							withAsterisk>
							<Group mt="xs">
								<Radio value="true" label="Yes" disabled={creatingGroup} />
								<Radio value="false" label="No" disabled={creatingGroup} />
							</Group>
						</Radio.Group>
						<Radio.Group
							name="auto-member-approval"
							label="Automatically approve join request?"
							description="New members won't need admin approval to join"
							value={autoApproveMembers}
							onChange={setAutoApproveMembers}
							size="md"
							withAsterisk>
							<Group mt="xs">
								<Radio value="true" label="Yes" disabled={creatingGroup} />
								<Radio value="false" label="No" disabled={creatingGroup} />
							</Group>
						</Radio.Group>
						<Radio.Group
							name="auto-post-approval"
							label="Automatically approve posts?"
							description="Posts will be submitted without needing admin approval"
							value={autoApprovePosts}
							onChange={setAutoApprovePosts}
							size="md"
							withAsterisk>
							<Group mt="xs">
								<Radio value="true" label="Yes" disabled={creatingGroup} />
								<Radio value="false" label="No" disabled={creatingGroup} />
							</Group>
						</Radio.Group>
					</div>
					<Button
						type="submit"
						color="gray"
						className="w-full"
						size="md"
						disabled={creatingGroup || !formIsValid}>
						Create
					</Button>
				</form>
			</main>
		</>
	);
}
