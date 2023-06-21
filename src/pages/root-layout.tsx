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
			<nav className="flex justify-between">
				<h1 className="font-extrabold text-5xl">
					<Link href="/">ANON</Link>
				</h1>
			</nav>
			{children}
		</>
	);
}
