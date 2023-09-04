import { UserProfile } from "@prisma/client";
import useSWR from "swr";

type AuthStatus = "GETTING_USER" | "HAS_USER" | "NO_USER";

/**
 * React hook for getting the profile data of the currently signed in user
 */
export default function useUser() {
	const {
		data: user,
		isLoading,
		...otherData
	} = useSWR("/api/get-user-profile", fetchProfile);
	const status: AuthStatus = getAuthStatus(isLoading, user);
	return { user, isLoading, status, ...otherData };
}

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

function getAuthStatus(loading: boolean, user?: UserProfile) {
	if (loading && !user) {
		return "GETTING_USER";
	} else if (!loading && user) {
		return "HAS_USER";
	} else {
		return "NO_USER";
	}
}
