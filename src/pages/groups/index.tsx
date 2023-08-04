import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { Button, TextInput, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { prisma } from "../../../lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { Group } from "@prisma/client";

interface PageProps {
	groups: Group[];
}

const GroupsPage = (props: PageProps) => {
	const theme = useMantineTheme();
	function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
	}

	return (
		<>
			<Navbar />
			<main className="grow flex flex-col gap-2 items-stretch">
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
						href="/groups/create">
						Create a group
					</Button>
				</div>
				<div>
					{props.groups.map((group) => (
						<li key={group.id}>{group.name}</li>
					))}
				</div>
			</main>
		</>
	);
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
	req,
	res,
}) => {
	const session = await getServerSession(req, res, authOptions);
	const groups = await prisma.groupMember.findMany({
		where: {
			userProfileId: session?.user.id,
		},
		select: {
			group: true,
		},
	});

	return {
		props: {
			groups: groups.map((obj: { group: Group }) => obj.group),
		},
	};
};

export default GroupsPage;
