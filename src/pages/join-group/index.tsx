import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { UserProfile } from "@prisma/client";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma-client";

interface PageProps {
	user: UserProfile | null;
}

const JoinGroupPage = ({ user }: PageProps) => {
	return (
		<>
			<Navbar user={user} />
			<main className="grow flex flex-col gap-3 items-center">
				<h2>JOIN GROUP PAGE</h2>
			</main>
		</>
	);
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
	context
) => {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (session) {
		// get current signed in user
		const user = await prisma.userProfile.findUnique({
			where: {
				id: session.user.id,
			},
		});
		return {
			props: { user },
		};
	}
	return {
		props: { user: null },
	};
};

export default JoinGroupPage;
