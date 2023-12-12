import useSearchGroupMembers from "@/hooks/useSearchGroupMembers";
import { GroupData } from "@/pages/groups/[group-id]";
import { ActionIcon, Menu, Tabs, TextInput } from "@mantine/core";
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
import { useState } from "react";

interface GroupLayoutProps {
	children: React.ReactNode;
	groupData: GroupData | null;
	currentUserIsAdmin: boolean;
	tabValue: string;
}

const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-montserrat",
});

export default function GroupLayout(props: GroupLayoutProps) {
	const { groupData } = props;
	const router = useRouter();
	const [searchValue, setSearchValue] = useState("");
	const { members, search } = useSearchGroupMembers(groupData?.id);

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

	const { groupMembers: latestMembers } = groupData;
	const { isAnonymous: groupIsAnonymous } = groupData;
	const searchInputIsEmpty = searchValue.trim().length === 0;
	// search result is empty if the search text input isn't empty and the search result is empty
	const searchResultIsEmpty = !searchInputIsEmpty && members.length === 0;
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
							<ul className="bg-secondary-color p-1.5 flex flex-col gap-y-1.5 rounded-md">
								{groupIsAnonymous && (
									<li className="flex flex-col">
										<span className="font-semibold text-base text-white">
											Admin
										</span>
										<span className="text-sm">
											{groupData.admin.accountName}
										</span>
									</li>
								)}
								<li className="flex flex-col">
									<span className="font-semibold text-base text-white">
										Description
									</span>
									<p className="text-sm">
										{groupData.desc || "No description."}
									</p>
								</li>
								<li className="flex flex-col">
									<span className="font-semibold text-base text-white">
										Member count
									</span>
									<span className="text-sm">
										{groupData._count.groupMembers}
									</span>
								</li>
							</ul>
							<div className="bg-secondary-color p-1.5 flex flex-col gap-y-2 rounded-md">
								<TextInput
									variant="filled"
									placeholder="Search members"
									classNames={{ input: "bg-accent-color-2" }}
									value={searchValue}
									onChange={(e) => setSearchValue(e.currentTarget.value)}
									styles={{ input: { color: "black" } }}
								/>
								{searchInputIsEmpty && (
									<>
										<p className="font-semibold text-base text-white">
											Latest members
										</p>
										<ul className="flex gap-1 list-none">
											{latestMembers.map((member, index) => {
												return (
													<li
														key={member.id}
														className="font-semibold text-sm hover:underline hover:text-white">
														<a href={`/users/${member.user.accountName}`}>
															{member.user.displayName}
														</a>
														{index < latestMembers.length - 1 && <span>,</span>}
													</li>
												);
											})}
										</ul>
									</>
								)}
							</div>
						</aside>
					</div>
				</Tabs.Panel>
			</Tabs>
		</main>
	);
}
