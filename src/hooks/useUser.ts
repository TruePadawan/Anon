import { UserProfile } from "@prisma/client";
import useSWR from "swr";

async function fetchProfile(key: string): Promise<UserProfile> {
	const res = await fetch(key);
	if (res.ok) {
		const { user } = await res.json();
		return user;
	} else {
		const { message } = await res.json();
		throw new Error(message);
	}
}
export default function useUser() {
	const { data: user, ...otherData } = useSWR(
		"/api/get-user-profile",
		fetchProfile
	);
	return { user, ...otherData };
}
