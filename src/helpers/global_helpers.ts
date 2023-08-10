import { Validator } from "@/hooks/useInput";

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

export function classNames(...classNames: Array<boolean | string>) {
	return classNames.filter(Boolean).join(" ");
}
