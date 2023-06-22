import randomColor from "randomcolor";

export function getRandomColor() {
	return randomColor({
		luminosity: "random",
		hue: "random",
	});
}
