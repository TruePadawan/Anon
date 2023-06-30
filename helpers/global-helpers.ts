import randomColor from "randomcolor";
import { prisma } from "../lib/prisma-client";

export function getRandomColor() {
	return randomColor({
		luminosity: "random",
		hue: "random",
	});
}

export function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

export async function getNavbarUserProp(userID: string) {
	const profile = await prisma.userProfile.findUnique({
		where: {
			id: userID,
		},
		select: {
			displayName: true,
			accountName: true,
		},
	});
	return profile;
}
