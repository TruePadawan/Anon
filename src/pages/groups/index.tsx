import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { Button, Grid, TextInput, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IconSearchOff } from "@tabler/icons-react";
import { classNames } from "@/helpers/global_helpers";
import GroupItem from "@/components/GroupItem/GroupItem";
import { Group } from "@prisma/client";

interface PageProps {
	groups: Group[];
}

const GroupsPage = (props: PageProps) => {
	const theme = useMantineTheme();
	function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
	}

	const groupItems = props.groups.map((group: Group) => {
		return (
			<Grid.Col key={group.id} sm={6} md={4} lg={3}>
				<GroupItem
					id={group.id}
					name={group.name}
					desc={group.desc}
					anonymous={group.isAnonymous}
				/>
			</Grid.Col>
		);
	});
	const noGroup = groupItems.length === 0;
	return (
		<>
			<Navbar />
			<main className="grow flex flex-col gap-2 items-stretch">
				<div className="flex justify-between">
					<form
						onSubmit={formSubmitHandler}
						className="flex gap-1 max-w-md w-full">
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
				<div
					className={classNames(
						"grow",
						noGroup && "flex justify-center items-center"
					)}>
					{noGroup && (
						<div className="flex flex-col items-center">
							<IconSearchOff size={64} />
							<p className="text-xl">Such empty</p>
						</div>
					)}
					{!noGroup && (
						<Grid gutter={4} sx={{ width: "100%" }}>
							{groupItems}
						</Grid>
					)}
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
	const memberships = await prisma.groupMember.findMany({
		where: {
			userProfileId: session?.user.id,
		},
		select: {
			group: true,
		},
	});
	return {
		props: {
			groups: memberships.map(({ group }) => group),
		},
	};
};

export default GroupsPage;
