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
import { filterGroups } from "@/helpers/groups";

interface PageProps {
	groups: Group[];
	userId: string;
}

export type StatusRadioValue = "JOINED" | "PENDING";

const GroupsPage = (props: PageProps) => {
	const [groups, setGroups] = useState<Group[]>(props.groups);
	const [statusRadioValue, setStatusRadioValue] =
		useState<StatusRadioValue>("JOINED");
	const [isFiltering, setIsFiltering] = useState(false);
	const [groupNameFilter, setGroupNameFilter] = useState("");
	const theme = useMantineTheme();

	/**
	 * Returns group items that conform with currently applied filters
	 * If a group name is provided, filter against the name and the selected membership status,
	 * else filter against the selected membership status
	 */

	// handle changes in the membership status filter
	async function handleStatusChange(value: string) {
		if (!(value as StatusRadioValue)) {
			notifications.show({
				color: "orange",
				title: "Invalid filter",
				message: `Invalid status: ${value}`,
			});
		} else {
			const castedValue = value as StatusRadioValue;
			setStatusRadioValue(castedValue);

			setIsFiltering(true);
			const filteredGroups = await filterGroups(
				props.userId,
				castedValue,
				groupNameFilter
			);
			setGroups(filteredGroups);
			setIsFiltering(false);
		}
	}

	const groupItems = groups.map((group: Group) => {
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

	const noGroupItems = !isFiltering && groupItems.length === 0;
	const hasGroupItems = !isFiltering && groupItems.length !== 0;
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
				{/* SIDEBAR */}
				<aside className="flex flex-col gap-2 h-max bg-primary-color-2 p-2 min-w-[20rem] rounded-md">
					<TextInput
						rightSection={inputRightSection}
						placeholder="Filter groups"
						aria-label="Filter groups"
						value={groupNameFilter}
						onChange={(event) => setGroupNameFilter(event.currentTarget.value)}
						required
					/>
					<Radio.Group
						name="membership_status"
						label="Membership status"
						value={statusRadioValue}
						onChange={handleStatusChange}
						size="md">
						<div className="p-1 flex flex-col gap-1.5">
							<Radio
								value="JOINED"
								label="Joined"
								color="green"
								disabled={isFiltering}
							/>
							<Radio
								value="PENDING"
								label="Pending"
								color="yellow"
								disabled={isFiltering}
							/>
						</div>
					</Radio.Group>
				</aside>
				<div
					className={classNames(
						"grow flex",
						hasGroupItems && "flex-col gap-2",
						isFiltering && "justify-center items-center",
						noGroupItems && "flex-col gap-2"
					)}>
					{isFiltering && <Loader size="md" variant="bars" color="cyan" />}
					{!isFiltering && (
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
							{noGroupItems && (
								<div className="grow flex flex-col justify-center items-center">
									<IconSearchOff size={64} />
									<p className="text-xl">Such empty</p>
								</div>
							)}
							{hasGroupItems && (
								<>
									<Grid gutter={4}>{groupItems}</Grid>
								</>
							)}
						</>
					)}
				</div>
			</main>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	const session = await getServerSession(req, res, authOptions);
	if (!session) {
		return {
			redirect: {
				destination: "/sign-in",
				permanent: false,
			},
		};
	}

	const memberships = await prisma.groupMember.findMany({
		where: {
			user: {
				userId: session.user.id,
			},
		},
		select: {
			group: true,
		},
	});
	return {
		props: {
			groups: memberships.map(({ group }) => group),
			userId: session.user.id,
		},
	};
};

export default GroupsPage;
