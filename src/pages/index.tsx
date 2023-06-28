import Navbar from "@/components/Navbar/Navbar";
import { authOptions } from "../../lib/auth";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
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

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (session) {
		await dbConnect();
		
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
