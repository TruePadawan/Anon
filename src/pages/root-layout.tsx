import { ReactElement } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar/Navbar";

interface RootLayoutProps {
	children: ReactElement;
}
export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<>
			<Head>
				<title key="title">Anon</title>
			</Head>
			<Navbar />
			{children}
		</>
	);
}
