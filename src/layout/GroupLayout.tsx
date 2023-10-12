import { ActionIcon, Menu, Tabs } from "@mantine/core";
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
				<Tabs.Panel value={props.tabValue}>{props.children}</Tabs.Panel>
			</Tabs>
		</main>
	);
}
