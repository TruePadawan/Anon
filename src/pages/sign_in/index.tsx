import Button from "@/components/Button/Button";
import InputField from "@/components/InputField/InputField";
import { ReactElement } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Head from "next/head";
import { signIn } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import UserProfile from "../../../models/UserProfile";
import dbConnect from "../../../lib/db-connect";

const SignIn = () => {
	function handleGitHubSignIn() {
		signIn("github");
	}

	function handleGoogleSignIn() {
		signIn("google");
	}

	return (
		<main className="grow flex justify-center items-center">
			<form className="mb-10 px-4 py-2 max-w-md w-full" data-cy="signin-form">
				<h2 className="text-4xl text-center">Who are you?...</h2>
				<div className="mt-6 flex flex-col gap-6">
					<InputField
						label="Email"
						type="email"
						componentID="email"
						data-cy="signin-email-input"
						autoFocus={true}
					/>
					<Button type="submit">Sign In</Button>
					<div className="flex flex-col gap-1.5">
						<Button
							type="button"
							data-cy="google-signin-btn"
							onClick={handleGoogleSignIn}
							icon={<i className="fa-brands fa-google fa-lg text-white"></i>}>
							Continue with Google
						</Button>
						<Button
							type="button"
							data-cy="github-signin-btn"
							onClick={handleGitHubSignIn}
							icon={<i className="fa-brands fa-github fa-lg text-white"></i>}>
							Continue with GitHub
						</Button>
					</div>
				</div>
			</form>
		</main>
	);
};

SignIn.getLayout = function getLayout(page: ReactElement) {
	return (
		<>
			<Head>
				<title key="title">ANON | Sign In</title>
			</Head>
			<Navbar toIndex />
			{page}
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	// check if user attached to session has a profile
	// if no, route to complete-auth which creates a default profile | else route to index page
	const session = await getServerSession(context.req, context.res, authOptions);
	if (session) {
		const userID = session.user.id;
		await dbConnect();
		const userHasProfile = (await UserProfile.findById(userID)) !== null;

		if (userHasProfile) {
			return {
				redirect: {
					destination: "/",
					permanent: false,
				},
			};
		} else {
			return {
				redirect: {
					destination: "/api/complete-auth",
					permanent: false,
				},
			};
		}
	}
	// unsigned user - render sign in page
	return {
		props: {},
	};
};

export default SignIn;
