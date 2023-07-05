import { InputValue } from "@/hooks/useInput";

// Account name is valid if it's unique in database
export async function validateAccountName(value: InputValue) {
	if (!value) return false;
	const response = await fetch(
		`/api/validate-account-name?accountName=${value}`
	);
	const data = await response.json();
	return data.valid;
}

export const IMG_WIDTH = 150;
export const IMG_HEIGHT = IMG_WIDTH;
