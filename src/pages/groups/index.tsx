import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { Button, TextInput, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { prisma } from "../../../lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { IconSearchOff } from "@tabler/icons-react";
import { classNames } from "../../../helpers/global-helpers";
import GroupItem from "@/components/GroupItem/GroupItem";
import { GroupFull } from "@/types/types";

interface PageProps {
	groups: GroupFull[];
}

const GroupsPage = (props: PageProps) => {
	const theme = useMantineTheme();
	function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
	}

	const groupItems = props.groups.map((group: GroupFull) => {
		return (
			<GroupItem
				key={group.id}
				id={group.id}
				name={group.name}
				desc={group.desc}
				anonymous={group.settings.isAnonymous}
			/>
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
						"flex grow",
						noGroup && "justify-center items-center"
					)}>
					{noGroup && (
						<div className="flex flex-col items-center">
							<IconSearchOff size={64} />
							<p className="text-xl">Such empty</p>
						</div>
					)}
					{!noGroup && <ul className="list-none">{groupItems}</ul>}
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
			group: {
				include: {
					settings: true,
				},
			},
		},
	});
	console.log(groups[0].group.settings)
	return {
		props: {
			groups: groups.map((obj: { group: GroupFull }) => obj.group),
		},
	};
};

export default GroupsPage;
