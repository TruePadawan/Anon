import Navbar from "@/components/Navbar/Navbar";
import { Button, Group, Radio, TextInput, Textarea } from "@mantine/core";

export default function CreateGroupPage() {
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
					<Button type="submit" color="gray" className="w-full" size="md">
						Create
					</Button>
				</form>
			</main>
		</>
	);
}
