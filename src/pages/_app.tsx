import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import { Session } from "next-auth";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== "undefined") {
	if (process.env.NEXT_PUBLIC_POSTHOG_KEY === undefined) {
		throw new Error(
			"PostHog failed to initialize, API KEY NOT FOUND IN ENV VARIABLES"
		);
	}
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
		// Enable debug mode in development
		loaded: (posthog) => {
			if (process.env.NODE_ENV === "development") posthog.debug();
		},
		capture_pageview: false, // Disable automatic pageview capture
	});
}

type AppPropsWithSession = AppProps<{ session: Session }>;
export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppPropsWithSession) {
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
			<MantineProvider theme={{ colorScheme: "dark" }}>
				<SessionProvider session={session}>
					<PostHogProvider client={posthog}>
						<Head>
							<title key="title">ANON</title>
						</Head>
						<Component {...pageProps} />
						<Notifications />
					</PostHogProvider>
				</SessionProvider>
			</MantineProvider>
			<Script
				src="https://kit.fontawesome.com/9ceb4dfb5e.js"
				crossOrigin="anonymous"></Script>
		</>
	);
}
