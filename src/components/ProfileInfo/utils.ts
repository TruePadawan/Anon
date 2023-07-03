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

export function validateFileAsImage(file: File) {
	const errorMessages = [];
	if (file.size / 1000 >= 1024) {
		errorMessages.push("Selected file must be less than or equal to 1MB");
	}
	if (file.type.split("/").at(0) !== "image") {
		errorMessages.push("Selected file must be an image");
	}
	return {
		isValid: errorMessages.length === 0,
		messages: errorMessages,
	};
}
