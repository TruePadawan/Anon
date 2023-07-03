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
