import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { UserProfile } from "@prisma/client";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma-client";
import { Button, TextInput, useMantineTheme } from "@mantine/core";
import Link from "next/link";

interface PageProps {
	user: UserProfile | null;
}

const GroupsPage = ({ user }: PageProps) => {
	const theme = useMantineTheme();
	function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
	}

	return (
		<>
			<Navbar />
			<main className="grow flex flex-col">
				<div className="flex justify-between">
					<form
						onSubmit={formSubmitHandler}
						className="flex gap-1 max-w-xs w-full">
						<TextInput
							className="grow"
							placeholder="Group name"
							aria-label="group name"
						/>
						<Button
							type="submit"
							color="gray"
							sx={{ background: theme.colors.gray[8], color: "white" }}>
							Search
						</Button>
					</form>
					<Button
						color="gray"
						sx={{ background: theme.colors.gray[8], color: "white" }}
						variant="light"
						component={Link}
						href="/groups/new">
						Create a group
					</Button>
				</div>
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

export default GroupsPage;
