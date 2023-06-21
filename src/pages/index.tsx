import Navbar from "@/components/Navbar/Navbar";
import { authOptions } from "@/utilities/globals";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { ReactElement } from "react";

interface HomeProps {
	displayName?: string;
}

const Home = (props: HomeProps) => {
	const { displayName } = props;
	return (
		<>
			<Navbar displayName={displayName} />
			<main></main>
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
	return {
		props: {
			displayName: session?.user?.name || "",
		},
	};
};

export default Home;
