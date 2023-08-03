import Navbar from "@/components/Navbar/Navbar";
import useInput from "@/hooks/useInput";
import { Button, Group, Radio, TextInput, Textarea } from "@mantine/core";
import { Group as GroupModel } from "@prisma/client";

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

export default function CreateGroupPage() {
	const groupNameInput = useInput(validateGroupName);

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
							withAsterisk
							required
						/>
						<Textarea
							label="Description"
							placeholder="This group is for humans currently inhabiting EARTH_1"
							size="md"
							minRows={2}
							autosize
						/>
						<Radio.Group
							name="group-type"
							label="Create anonymous group?"
							description="The profiles of all members are hidden from each other except the admin"
							defaultValue="false"
							size="md"
							withAsterisk>
							<Group mt="xs">
								<Radio value="true" label="Yes" />
								<Radio value="false" label="No" />
							</Group>
						</Radio.Group>
						<Radio.Group
							name="auto-member-approval"
							label="Automatically approve join request?"
							description="New members won't need admin approval to join"
							defaultValue="true"
							size="md"
							withAsterisk>
							<Group mt="xs">
								<Radio value="true" label="Yes" />
								<Radio value="false" label="No" />
							</Group>
						</Radio.Group>
						<Radio.Group
							name="auto-post-approval"
							label="Automatically approve posts?"
							description="Posts will be submitted without needing admin approval"
							defaultValue="true"
							size="md"
							withAsterisk>
							<Group mt="xs">
								<Radio value="true" label="Yes" />
								<Radio value="false" label="No" />
							</Group>
						</Radio.Group>
					</div>
					<Button
						type="submit"
						color="gray"
						className="w-full"
						size="md"
						disabled={!formIsValid}>
						Create
					</Button>
				</form>
			</main>
		</>
	);
}
