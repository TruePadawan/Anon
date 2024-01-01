import Navbar from "@/components/Navbar/Navbar";
import useInput from "@/hooks/useInput";
import useUser from "@/hooks/useUser";
import { Button, Group, Radio, TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { validateGroupName } from "@/helpers/groups";
import GroupsAPI from "@/lib/api/GroupsAPI";
import { getErrorMessage } from "@/lib/error-message";

type RadioValue = "true" | "false" | string;
export default function CreateGroupPage() {
	const { user } = useUser();
	const descRef = useRef<HTMLTextAreaElement>(null);
	const [groupIsAnonymous, setGroupIsAnonymous] = useState<RadioValue>("false");
	const [autoApprovePosts, setAutoApprovePosts] = useState<RadioValue>("true");
	const [autoApproveMembers, setAutoApproveMembers] =
		useState<RadioValue>("true");
	const router = useRouter();
	const [creatingGroup, setCreatingGroup] = useState(false);
	const groupNameInput = useInput([validateGroupName]);

	async function submitHandler(event: React.FormEvent) {
		event.preventDefault();

		if (!user) return;
		setCreatingGroup(true);
		try {
			const group = await GroupsAPI.create({
				adminId: user.id,
				name: groupNameInput.value.trim(),
				desc: descRef.current?.value.trim() ?? null,
				isAnonymous: groupIsAnonymous === "true",
				autoMemberApproval: autoApproveMembers === "true",
				autoPostApproval: autoApprovePosts === "true",
			});
			notifications.show({
				color: "green",
				message: `Group '${group.name} created successfully`,
			});
			// should route to group main page
			router.push("/groups");
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to complete action",
				message: getErrorMessage(error),
			});
		}
		setCreatingGroup(false);
	}

	const formIsValid = !groupNameInput.isValidating && groupNameInput.isValid;
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
							value={groupNameInput.value}
							onChange={groupNameInput.changeEvHandler}
							onFocus={groupNameInput.focusEvHandler}
							error={groupNameInput.hasError ? groupNameInput.errorMessage : ""}
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
						loaderPosition="center"
						loading={groupNameInput.isValidating}
						disabled={creatingGroup || !formIsValid}>
						Create
					</Button>
				</form>
			</main>
		</>
	);
}
