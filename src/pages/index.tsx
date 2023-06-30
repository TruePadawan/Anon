import Navbar, { NavbarUserProp } from "@/components/Navbar/Navbar";
import { authOptions } from "../../lib/auth";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { getNavbarUserProp } from "../../helpers/global-helpers";

interface HomeProps {
	navbarUserProp: NavbarUserProp | null;
}

const Home = (props: HomeProps) => {
	const { navbarUserProp } = props;
	return (
		<>
			<Navbar user={navbarUserProp} />
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getServerSession(context.req, context.res, authOptions);
	const navbarUserProp = session
		? await getNavbarUserProp(session.user.id)
		: null;

	return {
		props: { navbarUserProp },
	};
};

export default Home;
