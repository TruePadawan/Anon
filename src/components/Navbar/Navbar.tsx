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
import { Loader } from "@mantine/core";
import styles from "./navbar.module.scss";

interface NavbarProps {
    toIndex?: boolean;
}

/**
 * React component representing the Navigation bar of the site
 */
export default function Navbar({ toIndex }: NavbarProps) {
    const router = useRouter();
    const { user, status, mutate } = useUser();

    function routeToProfile() {
        router.push(`/users/${user?.accountName}`);
    }

    async function handleSignout() {
        try {
            const { url } = await signOut({
                redirect: false,
                callbackUrl: "/",
            });
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

    const gettingUser = status === "GETTING_USER";
    const hasUser = status === "HAS_USER" && user;
    const noUser = status === "NO_USER";
    return (
        <nav className="flex flex-col items-stretch gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-5xl font-extrabold">
                    <Link href="/">ANON</Link>
                </h1>
                {gettingUser && <Loader color="gray" variant="dots" />}
                {hasUser && (
                    <ProfileMenu
                        displayName={user.displayName}
                        onProfileMenuItemClicked={routeToProfile}
                        onSignoutMenuItemClicked={handleSignout}
                    />
                )}
                {noUser && (
                    <Link
                        href={toIndex ? "/" : "/sign-in"}
                        className="text-lg font-semibold hover:text-accent-color-1"
                    >
                        {toIndex ? "HOMEPAGE" : "SIGN IN"}
                    </Link>
                )}
            </div>
            <div
                className={`flex gap-1.5 overflow-x-scroll ${styles.navlinks}`}
            >
                <NavLink
                    href="/"
                    disabled={false}
                    active={
                        router.pathname === "/" ||
                        router.pathname.includes("posts")
                    }
                    data-cy="home-page-link"
                >
                    <IconListDetails className="h-7 w-7 sm:h-9 sm:w-9" />
                    <span className="text-sm font-semibold text-inherit sm:text-base">
                        Public Posts
                    </span>
                </NavLink>
                <NavLink
                    href="/groups"
                    disabled={!user}
                    active={router.pathname.includes("groups")}
                    data-cy="groups-page-link"
                >
                    <IconUsersGroup className="h-7 w-7 sm:h-9 sm:w-9" />
                    <span className="text-sm font-semibold text-inherit sm:text-base">
                        Groups
                    </span>
                </NavLink>
                <NavLink
                    href="/join-group"
                    disabled={!user}
                    active={router.pathname.includes("join-group")}
                    data-cy="join-group-page-link"
                >
                    <IconUsersPlus className="h-7 w-7 sm:h-9 sm:w-9" />
                    <span className="text-sm font-semibold text-inherit sm:text-base">
                        Join Group
                    </span>
                </NavLink>
            </div>
        </nav>
    );
}
