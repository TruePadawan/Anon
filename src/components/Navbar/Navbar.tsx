import Link from "next/link";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import {
	IconUsersGroup,
	IconUsersPlus,
	IconListDetails,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export interface NavbarUserProp {
	displayName: string;
	accountName: string;
}

interface NavbarProps {
	user?: NavbarUserProp | null;
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
		} catch (error: any) {
			notifications.show({
				color: "red",
				title: "Signout Failed",
				message: error.message,
			});
			console.error(error);
		}
	}

	const linkElClasses =
		"flex flex-col flex-1 items-center gap-1 p-3 bg-primary-color-2 text-accent-color-2-l hover:text-white rounded-md";
	return (
		<nav className="flex flex-col items-stretch gap-4">
			<div className="flex justify-between items-center">
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
						href={toIndex ? "/" : "/sign-in"}
						className="text-lg font-semibold hover:text-accent-color-1">
						{toIndex ? "HOMEPAGE" : "SIGN IN"}
					</Link>
				)}
			</div>
			{user && (
				<div className="flex gap-1.5">
					<Link className={linkElClasses} href="/" data-cy="home-page-link">
						<IconListDetails size={35} />
						<span className="font-semibold text-inherit">Public Posts</span>
					</Link>
					<Link
						className={linkElClasses}
						href="/groups"
						data-cy="groups-page-link">
						<IconUsersGroup size={35} />
						<span className="font-semibold text-inherit">Groups</span>
					</Link>
					<Link
						className={linkElClasses}
						href="/join-group"
						data-cy="join-group-page-link">
						<IconUsersPlus size={35} />
						<span className="font-semibold text-inherit">Join Group</span>
					</Link>
				</div>
			)}
		</nav>
	);
}
