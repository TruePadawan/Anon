import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, createTheme } from "@mui/material";
import Head from "next/head";
import { Session } from "next-auth";

type AppPropsWithSession = AppProps<{ session: Session }>;

export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppPropsWithSession) {
	// override default Roboto Font
	const theme = createTheme({
		typography: {
			allVariants: {
				fontFamily: "inherit",
			},
		},
	});

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
					<Head>
						<title key="title">ANON</title>
					</Head>
					<Component {...pageProps} />
				</SessionProvider>
			</ThemeProvider>
			<Script
				src="https://kit.fontawesome.com/9ceb4dfb5e.js"
				crossOrigin="anonymous"></Script>
		</>
	);
}
