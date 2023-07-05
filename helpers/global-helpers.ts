import { UploadApiResponse } from "cloudinary";
import randomColor from "randomcolor";

export function getRandomColor() {
	return randomColor({
		luminosity: "random",
		hue: "random",
	});
}

export function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

export const CLOUDINARY_UPLOAD_URL =
	"https://api.cloudinary.com/v1_1/cloudinary-freeplan/image/upload";

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

export async function generateUploadSignature(uploadParams: object) {
	const response = await fetch("/api/get-auth-signature", {
		method: "POST",
		body: JSON.stringify({
			params: uploadParams,
		}),
	});
	const data = await response.json();
	return data;
}

export function getBase64(file: File): Promise<string | ArrayBuffer | null> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
}

export async function uploadImage(imageFile: File, uploadParams: FormData) {
	const { isValid } = validateFileAsImage(imageFile);
	if (!isValid) {
		throw new Error("Could not verify that file is an image");
	}
	const fileBase64 = await getBase64(imageFile);
	if (!fileBase64) {
		throw new Error("Failed to convert file to base64");
	}

	uploadParams.append("file", fileBase64.toString());
	const response = await fetch(CLOUDINARY_UPLOAD_URL, {
		method: "POST",
		body: uploadParams,
	});

	if (!response.ok) {
		throw new Error(response.statusText);
	}

	const data: UploadApiResponse = await response.json();
	return data;
}
