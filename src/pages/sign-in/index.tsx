import Button from "@/components/Button/Button";
import Navbar from "@/components/Navbar/Navbar";
import Head from "next/head";
import { signIn } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { GitHub, Google } from "@mui/icons-material";
import { Alert } from "@mui/material";

interface SignInPageProps {
	errorMessage: string | null;
}

const SignIn = ({ errorMessage }: SignInPageProps) => {
	function handleGitHubSignIn() {
		signIn("github");
	}

	function handleGoogleSignIn() {
		signIn("google");
	}

	return (
		<>
			<Head>
				<title key="title">ANON | Sign In</title>
			</Head>
			<Navbar toIndex />
			<main className="grow flex justify-center items-center">
				<div className="mb-10 px-4 py-2 max-w-lg w-full flex flex-col gap-1">
					<h2 className="text-4xl text-center">Who are you?...</h2>
					<div className="mt-6 flex flex-col gap-1.5">
						<Alert
							severity="warning"
							variant="filled">{`Can't sign in with both Google and Github if linked to same Email`}</Alert>
						{errorMessage && (
							<Alert
								severity="error"
								variant="filled">{`Error occurred: ${errorMessage}`}</Alert>
						)}
						<Button
							type="button"
							data-cy="google-signin-btn"
							onClick={handleGoogleSignIn}
							icon={<Google />}>
							Continue with Google
						</Button>
						<Button
							type="button"
							data-cy="github-signin-btn"
							onClick={handleGitHubSignIn}
							icon={<GitHub />}>
							Continue with GitHub
						</Button>
					</div>
				</div>
			</main>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	// redirect to complete-auth route if there is a session | else render sign in page
	const session = await getServerSession(context.req, context.res, authOptions);
	if (session) {
		return {
			redirect: {
				destination: "/api/complete-auth",
				permanent: false,
			},
		};
	}
	return {
		props: {
			errorMessage: context.query?.error || null,
		},
	};
};

export default SignIn;
