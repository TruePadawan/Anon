import Link from "next/link";

interface NavbarProps {
	displayName?: string;
	toIndex?: boolean;
}

export default function Navbar({ displayName, toIndex }: NavbarProps) {
	return (
		<nav className="flex justify-between items-center">
			<h1 className="font-extrabold text-5xl">
				<Link href="/">ANON</Link>
			</h1>
			{displayName && <span>{displayName}</span>}
			{!displayName && (
				<Link
					href={toIndex ? "/" : "/sign_in"}
					className="text-xl font-semibold hover:text-accent-color-1">
					{toIndex ? "HOMEPAGE" : "SIGN IN"}
				</Link>
			)}
		</nav>
	);
}
