import { Validator } from "@/hooks/useInput";

export const validateGroupJoinId: Validator = {
	name: "validate group join id",
	validatorFn: async (id: string) => {
		const response = await fetch("/api/validate-join-id", {
			method: "POST",
			body: JSON.stringify({
				id,
			}),
		});
		return {
			valid: response.ok,
			message: `No group with join-id "${id}"`,
		};
	},
};
