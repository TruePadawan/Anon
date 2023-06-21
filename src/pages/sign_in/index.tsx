import Button from "@/components/Button/Button";
import InputField from "@/components/InputField/InputField";
import { ReactElement } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Head from "next/head";

const SignIn = () => {
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
							icon={<i className="fa-brands fa-google fa-lg text-white"></i>}>
							Continue with Google
						</Button>
						<Button
							type="button"
							data-cy="github-signin-btn"
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
				<title key="title">Anon | Sign In</title>
			</Head>
			<Navbar />
			{page}
		</>
	);
};

export default SignIn;
