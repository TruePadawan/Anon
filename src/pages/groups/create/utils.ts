import { Validator } from "@/hooks/useInput";
import { Group } from "@prisma/client";

export const validateGroupName: Validator = {
	name: "Validate group name",
	async validatorFn(groupName: string) {
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
		const { group }: { group: Group | null } = await res.json();
		// group name is valid if there is no group with that name, so group will be null
		return {
			valid: group === null,
			message: `${groupName} is taken`,
		};
	},
};
