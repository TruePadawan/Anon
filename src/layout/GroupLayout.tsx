import GroupsAPI from "@/lib/api/GroupsAPI";
import { ActionIcon, Loader, Menu, Tabs } from "@mantine/core";
import { Group } from "@prisma/client";
import {
	IconSettings,
	IconLogout,
	IconClipboard,
	IconListDetails,
	IconMessage2,
	IconError404,
} from "@tabler/icons-react";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/router";
import useSWR from "swr";

interface GroupLayoutProps {
	children: React.ReactNode;
	groupData: Pick<Group, "name" | "id"> | null;
	tabValue: string;
}

const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-montserrat",
});

export default function GroupLayout(props: GroupLayoutProps) {
	const router = useRouter();
	const { groupData } = props;
	const {
		data: asideData,
		error,
		isLoading,
	} = useSWR(groupData ? groupData.id : null, async (groupId) => {
		const group = await GroupsAPI.getOne({
			where: {
				id: groupId,
			},
			select: {
				desc: true,
				admin: {
					select: {
						accountName: true,
					},
				},
				_count: { select: { groupMembers: true } },
			},
		});
		return group;
	});

	if (!groupData) {
		return (
			<main className="grow flex flex-col justify-center items-center">
				<IconError404 size={128} />
				<p className="font-semibold text-xl">This group does not exist</p>
			</main>
		);
	}

	function handleTabChange(tabValue: string) {
		const groupId = groupData?.id ?? "no-id";
		router.push(`/groups/${groupId}/${tabValue}`);
	}

	return (
		<main className="grow flex flex-col">
			<div className="flex justify-between items-center px-4 py-2 bg-primary-color-2">
				<span
					className={`text-3xl ${montserrat.className} font-semibold text-white`}>
					{groupData.name}
				</span>
				<Menu>
					<Menu.Target>
						<ActionIcon variant="subtle">
							<IconSettings />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item icon={<IconClipboard />}>
							Copy JoinId to clipboard
						</Menu.Item>
						<Menu.Item color="red" icon={<IconLogout />}>
							Leave group
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</div>
			<Tabs
				color="dark"
				radius="xs"
				value={props.tabValue}
				onTabChange={handleTabChange}>
				<Tabs.List>
					<Tabs.Tab
						className="text-lg font-semibold"
						value="/"
						icon={<IconListDetails />}>
						Posts
					</Tabs.Tab>
					<Tabs.Tab
						className="text-lg font-semibold"
						value="chatroom"
						icon={<IconMessage2 />}>
						Chatroom
					</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value={props.tabValue}>
					<div className="mt-1.5 flex">
						<div className="grow">{props.children}</div>
						<aside className="flex flex-col gap-y-1 items-stretch max-w-xl w-full">
							{asideData && (
								<ul className="bg-secondary-color p-1.5 flex flex-col gap-y-1.5 rounded-md">
									<li className="flex flex-col">
										<span className="font-semibold text-base text-white">
											Admin
										</span>
										<span className="text-sm">
											{asideData.admin.accountName}
										</span>
									</li>
									<li className="flex flex-col">
										<span className="font-semibold text-base text-white">
											Description
										</span>
										<p className="text-sm">
											{asideData.desc || "No description."}
										</p>
									</li>
									<li className="flex flex-col">
										<span className="font-semibold text-base text-white">
											Member count
										</span>
										<span className="text-sm">
											{asideData._count.groupMembers}
										</span>
									</li>
								</ul>
							)}
							{isLoading && (
								<div className="bg-secondary-color h-48 rounded-md flex justify-center items-center">
									<Loader variant="bars" size="md" color="dark" />
								</div>
							)}
							{error && (
								<div className="bg-secondary-color h-40 text-center rounded-md">
									<p className="text-white font-semibold text-lg mt-6">
										Failed to load data
									</p>
									<p className="text-sm">{error.message}</p>
								</div>
							)}
						</aside>
					</div>
				</Tabs.Panel>
			</Tabs>
		</main>
	);
}
