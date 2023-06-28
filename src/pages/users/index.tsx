import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/db-connect";
import UserProfile from "../../../models/UserProfile";
import { Fragment } from "react";

// Empty component to shut nextjs up
export default function Users() {
	return <Fragment></Fragment>;
}

// Redirect to user profile if user is signed in else redirect to sign in page
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	const session = await getServerSession(req, res, authOptions);
	let redirectDestination = "/sign-in";

	if (session) {
		await dbConnect();
		const userID = session.user.id;
		const userProfile = await UserProfile.findById(
			userID,
			"account_name"
		).exec();
		if (userProfile) {
			redirectDestination = `/users/${userProfile.account_name}`;
		}
	}

	return {
		redirect: {
			destination: redirectDestination,
			permanent: false,
		},
	};
};
