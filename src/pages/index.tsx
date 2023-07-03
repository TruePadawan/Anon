import Navbar, { NavbarUserProp } from "@/components/Navbar/Navbar";
import { authOptions } from "../../lib/auth";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../lib/prisma-client";

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
	if (session) {
		// get navbar user prop
		const navbarUserProp = await prisma.userProfile.findUnique({
			where: {
				id: session.user.id,
			},
			select: {
				displayName: true,
				accountName: true,
			},
		});
		return {
			props: { navbarUserProp },
		};
	}
	return {
		props: {},
	};
};

export default Home;
