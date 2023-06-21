import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Open_Sans } from "next/font/google";
import Script from "next/script";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import RootLayout from "./root-layout";

// Extra code to make per-page layout work with TypeScript
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

const openSans = Open_Sans({
	variable: "--font-open-sans",
	subsets: ["latin"],
	weight: ["300", "400", "600", "800"],
});

export default function App({ Component, pageProps }: AppPropsWithLayout) {
	// Use the layout defined at the page level, if available
	const getLayout =
		Component.getLayout || ((page) => <RootLayout>{page}</RootLayout>);
	return (
		<>
			<style jsx global>
				{`
					html {
						font-family: ${openSans.style.fontFamily};
					}
					#__next {
						display: flex;
						flex-direction: column;
						row-gap: 1rem;
						padding: 0.5rem 1rem;
						min-height: 100vh;
					}
				`}
			</style>
			{getLayout(<Component {...pageProps} />)}
			<Script
				src="https://kit.fontawesome.com/9ceb4dfb5e.js"
				crossOrigin="anonymous"></Script>
		</>
	);
}
