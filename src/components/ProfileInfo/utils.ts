import { Validator } from "@/hooks/useInput";

// Account name is valid if it's unique in database
export const validateAccountName: Validator = {
	name: "validate account name",
	async validatorFn(value: string) {
		const response = await fetch(
			`/api/validate-account-name?accountName=${value}`
		);
		const data = await response.json();
		return {
			valid: data.valid,
			message: `${value} is taken`,
		};
	},
};

export const IMG_WIDTH = 150;
export const IMG_HEIGHT = IMG_WIDTH;
