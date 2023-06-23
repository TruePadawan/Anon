import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import RootLayout from "./root-layout";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, createTheme } from "@mui/material";

// Extra code to make per-page layout work with TypeScript
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
	// override default Roboto Font
	const theme = createTheme({
		typography: {
			allVariants: {
				fontFamily: "inherit",
			},
		},
	});
	// Use the layout defined at the page level, if available
	const getLayout =
		Component.getLayout || ((page) => <RootLayout>{page}</RootLayout>);
	return (
		<>
			<style jsx global>
				{`
					#__next {
						display: flex;
						flex-direction: column;
						row-gap: 1rem;
						padding: 0.5rem 1rem;
						min-height: 100vh;
					}
				`}
			</style>
			<ThemeProvider theme={theme}>
				<SessionProvider session={session}>
					{getLayout(<Component {...pageProps} />)}
				</SessionProvider>
			</ThemeProvider>
			<Script
				src="https://kit.fontawesome.com/9ceb4dfb5e.js"
				crossOrigin="anonymous"></Script>
		</>
	);
}
