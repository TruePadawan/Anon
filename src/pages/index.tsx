import Navbar from "@/components/Navbar/Navbar";
import { authOptions } from "../../lib/auth";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { ReactElement } from "react";
import UserProfile from "../../models/UserProfile";
import dbConnect from "../../lib/db-connect";

interface HomeProps {
	user?: {
		displayName: string;
		accountName: string;
	};
}

const Home = (props: HomeProps) => {
	const { user } = props;
	return (
		<>
			<Navbar user={user} />
		</>
	);
};

Home.getLayout = function getLayout(page: ReactElement) {
	return (
		<>
			<Head>
				<title key="title">ANON</title>
			</Head>
			{page}
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getServerSession(context.req, context.res, authOptions);
	await dbConnect();

	if (session) {
		const userID = session.user.id;
		const profile = await UserProfile.findById(
			userID,
			"display_name account_name"
		).exec();

		return {
			props: {
				user: {
					displayName: profile?.display_name,
					accountName: profile?.account_name,
				},
			},
		};
	}
	return {
		props: {},
	};
};

export default Home;
