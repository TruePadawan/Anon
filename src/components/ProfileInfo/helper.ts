import { Base64 } from "@/types/types";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";

/**
 * Converts a file into binary data
 * @param file the file to be converted
 * @returns a `string` or an `ArrayBuffer` if successful, else `null`
 */
export function getBase64(file: File): Promise<Base64 | null> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
}

export function validateFileAsImage(file: File) {
	const errorMessages = [];
	if (file.size / 1024 >= 1024) {
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

export async function uploadImage(
	file: Base64,
	uploadParams: UploadApiOptions
) {
	const response = await fetch("/api/upload-image", {
		method: "POST",
		body: JSON.stringify({
			file,
			options: uploadParams,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}

	const data: UploadApiResponse = await response.json();
	return data;
}
