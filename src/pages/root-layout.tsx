import Link from "next/link";
import { ReactElement } from "react";
import Head from "next/head";

interface RootLayoutProps {
	children: ReactElement;
}
export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<>
			<Head>
				<title key="title">Anon</title>
			</Head>
			<nav className="flex justify-between items-center">
				<h1 className="font-extrabold text-5xl">
					<Link href="/">ANON</Link>
				</h1>
				<Link
					href="/sign_in"
					className="text-xl font-semibold hover:text-accent-color-1">
					SIGN IN
				</Link>
			</nav>
			{children}
		</>
	);
}
