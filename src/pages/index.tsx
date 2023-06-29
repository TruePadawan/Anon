import Navbar, { NavbarUserProp } from "@/components/Navbar/Navbar";
import { authOptions } from "../../lib/auth";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import dbConnect from "../../lib/db-connect";
import { getNavbarUserProp } from "../../helpers/global-helpers";

interface HomeProps {
	user: NavbarUserProp | null;
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

		const navbarUserProp = await getNavbarUserProp(session.user.id);
		return {
			props: {
				user: navbarUserProp,
			},
		};
	}
	return {
		props: { user: null },
	};
};

export default Home;
