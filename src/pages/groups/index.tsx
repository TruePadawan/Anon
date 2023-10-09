import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import {
	Button,
	Grid,
	Loader,
	Radio,
	TextInput,
	useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IconSearchOff } from "@tabler/icons-react";
import { classNames } from "@/helpers/global_helpers";
import GroupItem from "@/components/GroupItem/GroupItem";
import { Group } from "@prisma/client";
import Head from "next/head";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

interface PageProps {
	groups: Group[];
}

type Status = "JOINED" | "PENDING";

const GroupsPage = (props: PageProps) => {
	const [statusRadioValue, setStatusRadioValue] = useState<Status>("JOINED");
	const [isFiltering, setIsFiltering] = useState(false);
	const theme = useMantineTheme();

	// handle changes in the membership status filter
	function handleStatusChange(value: string) {
		if (!(value as Status)) {
			notifications.show({
				color: "orange",
				title: "Invalid filter",
				message: `Invalid status: ${value}`,
			});
		} else {
			setStatusRadioValue(value as Status);
		}
	}
	const groupItems = props.groups.map((group: Group) => {
		return (
			<Grid.Col key={group.id} sm={6} md={4} lg={3}>
				<GroupItem
					id={group.id}
					name={group.name}
					desc={group.desc}
					anonymous={group.isAnonymous}
					status={statusRadioValue}
				/>
			</Grid.Col>
		);
	});
	const noGroup = groupItems.length === 0;
	const inputRightSection = isFiltering ? (
		<Loader size="xs" variant="bars" color="cyan" />
	) : undefined;
	return (
		<>
			<Head>
				<title key="title">ANON | Groups</title>
			</Head>
			<Navbar />
			<main className="grow flex gap-2">
				<aside className="flex flex-col gap-2 h-max bg-primary-color-2 p-2 min-w-[20rem] rounded-md">
					<TextInput
						rightSection={inputRightSection}
						placeholder="Filter groups"
						aria-label="Filter groups"
						required
					/>
					<Radio.Group
						name="membership_status"
						label="Membership status"
						value={statusRadioValue}
						onChange={handleStatusChange}
						size="md">
						<div className="p-1 flex flex-col gap-1.5">
							<Radio value="JOINED" label="Joined" color="green" />
							<Radio value="PENDING" label="Pending" color="yellow" />
						</div>
					</Radio.Group>
				</aside>
				<div
					className={classNames(
						"grow flex",
						!noGroup && "flex-col gap-2",
						noGroup && "justify-center items-center"
					)}>
					{noGroup && (
						<div className="flex flex-col items-center">
							<IconSearchOff size={64} />
							<p className="text-xl">Such empty</p>
						</div>
					)}
					{!noGroup && (
						<>
							<Button
								className="self-end"
								color="gray"
								sx={{ background: theme.colors.gray[8], color: "white" }}
								variant="light"
								component={Link}
								href="/groups/create">
								Create a group
							</Button>
							<Grid gutter={4}>{groupItems}</Grid>
						</>
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
			user: {
				userId: session?.user.id,
			},
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
