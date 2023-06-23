import Link from "next/link";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

interface NavbarProps {
	user?: {
		displayName: string;
		accountName: string;
	};
	toIndex?: boolean;
}

export default function Navbar({ user, toIndex }: NavbarProps) {
	const router = useRouter();

	function routeToProfile() {
		router.push(`/users/${user?.accountName}`);
	}

	async function handleSignout() {
		try {
			const { url } = await signOut({ redirect: false, callbackUrl: "/" });
			router.push(url);
		} catch (error) {
			// this should show error message on a snackbar
			alert("Problem Signing out");
			console.error(error);
		}
	}

	return (
		<nav className="flex justify-between items-center">
			<h1 className="font-extrabold text-5xl">
				<Link href="/">ANON</Link>
			</h1>
			{user && (
				<ProfileMenu
					displayName={user.displayName}
					onProfileMenuItemClicked={routeToProfile}
					onSignoutMenuItemClicked={handleSignout}
				/>
			)}
			{!user && (
				<Link
					href={toIndex ? "/" : "/sign_in"}
					className="text-xl font-semibold hover:text-accent-color-1">
					{toIndex ? "HOMEPAGE" : "SIGN IN"}
				</Link>
			)}
		</nav>
	);
}
