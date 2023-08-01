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
import NavLink from "../NavLink/NavLink";
import useUser from "@/hooks/useUser";

export interface NavbarUserProp {
	displayName: string;
	accountName: string;
}

interface NavbarProps {
	user?: NavbarUserProp | null;
	toIndex?: boolean;
}

export default function Navbar({ toIndex }: NavbarProps) {
	const router = useRouter();
	const { user, isLoading, mutate } = useUser();

	function routeToProfile() {
		router.push(`/users/${user?.accountName}`);
	}

	async function handleSignout() {
		try {
			const { url } = await signOut({ redirect: false, callbackUrl: "/" });
			// revalidate profile data
			mutate();
			router.push(url);
		} catch (error: any) {
			notifications.show({
				color: "red",
				title: "Signout Failed",
				message: error.message,
			});
		}
	}

	function getNavLinkActiveStatus(href: string) {
		return router.pathname === href;
	}

	const hasUser = !isLoading && user;
	return (
		<nav className="flex flex-col items-stretch gap-4">
			<div className="flex justify-between items-center">
				<h1 className="font-extrabold text-5xl">
					<Link href="/">ANON</Link>
				</h1>
				{hasUser && (
					<ProfileMenu
						displayName={user.displayName}
						onProfileMenuItemClicked={routeToProfile}
						onSignoutMenuItemClicked={handleSignout}
					/>
				)}
				{!hasUser && (
					<Link
						href={toIndex ? "/" : "/sign-in"}
						className="text-lg font-semibold hover:text-accent-color-1">
						{toIndex ? "HOMEPAGE" : "SIGN IN"}
					</Link>
				)}
			</div>
			<div className="flex gap-1.5">
				<NavLink
					href="/"
					disabled={false}
					active={getNavLinkActiveStatus}
					data-cy="home-page-link">
					<IconListDetails size={35} />
					<span className="font-semibold text-inherit">Public Posts</span>
				</NavLink>
				<NavLink
					href="/groups"
					disabled={!user}
					active={getNavLinkActiveStatus}
					data-cy="groups-page-link">
					<IconUsersGroup size={35} />
					<span className="font-semibold text-inherit">Groups</span>
				</NavLink>
				<NavLink
					href="/join-group"
					disabled={!user}
					active={getNavLinkActiveStatus}
					data-cy="join-group-page-link">
					<IconUsersPlus size={35} />
					<span className="font-semibold text-inherit">Join Group</span>
				</NavLink>
			</div>
		</nav>
	);
}
