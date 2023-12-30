import useSearchGroupMembers from "@/hooks/useSearchGroupMembers";
import { GroupData } from "@/pages/groups/[groupId]";
import { ActionIcon, Loader, Menu, Tabs, TextInput } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
	IconSettings,
	IconLogout,
	IconClipboard,
	IconListDetails,
	IconError404,
	IconTrash,
	IconHourglass,
} from "@tabler/icons-react";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface GroupLayoutProps {
	children: React.ReactNode;
	groupData: GroupData;
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
	const { members, search, isSearching } = useSearchGroupMembers(groupData?.id);
	const clipboard = useClipboard();

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			search(searchValue);
		}, 600);
		return () => clearTimeout(timeoutId);
	}, [search, searchValue]);

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

	function copyJoinIdToClipboard() {
		clipboard.copy(groupData.groupJoinId);
		notifications.show({
			color: "green",
			message: "JoinId copied to clipboard",
		});
	}

	const { groupMembers: latestMembers, admin } = groupData;
	const { isAnonymous: groupIsAnonymous } = groupData;
	const searchInputIsEmpty = searchValue.trim().length === 0;
	const searchResultIsEmpty =
		!searchInputIsEmpty && !isSearching && members.length === 0;
	const searchWasSuccessful =
		!searchInputIsEmpty && !isSearching && members.length > 0;
	const showAnonymousSection = !groupIsAnonymous || props.currentUserIsAdmin;
	const showPendingPostsTab =
		props.currentUserIsAdmin && !groupData.autoPostApproval;
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
						<Menu.Item icon={<IconClipboard />} onClick={copyJoinIdToClipboard}>
							Copy joinId to clipboard
						</Menu.Item>
						{props.currentUserIsAdmin && (
							<>
								{!groupData.autoMemberApproval && (
									<Menu.Item icon={<IconHourglass />}>
										View pending members
									</Menu.Item>
								)}
								<Menu.Item color="red" icon={<IconTrash />}>
									Delete group
								</Menu.Item>
							</>
						)}
						{!props.currentUserIsAdmin && (
							<Menu.Item color="red" icon={<IconLogout />}>
								Leave group
							</Menu.Item>
						)}
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
					{showPendingPostsTab && (
						<Tabs.Tab
							className="text-lg font-semibold"
							value="/pending-posts"
							icon={<IconHourglass />}>
							Pending posts
						</Tabs.Tab>
					)}
				</Tabs.List>
				<Tabs.Panel value={props.tabValue}>
					<div className="mt-1.5 flex justify-between gap-x-1">
						<div className="grow">{props.children}</div>
						<aside className="flex flex-col gap-y-1 items-stretch max-w-xl w-full">
							<ul className="bg-secondary-color p-1.5 flex flex-col gap-y-1.5 rounded-md">
								{showAnonymousSection && (
									<li className="flex flex-col">
										<span className="font-semibold text-base text-white">
											Admin
										</span>
										<a
											href={`/users/${admin.accountName}`}
											className="font-semibold text-sm hover:underline hover:text-white w-max">
											{admin.accountName}
										</a>
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
							{showAnonymousSection && (
								<div className="bg-secondary-color p-1.5 flex flex-col gap-y-2 rounded-md">
									<TextInput
										variant="filled"
										placeholder="Search members"
										classNames={{ input: "bg-accent-color-2" }}
										value={searchValue}
										onChange={(e) => setSearchValue(e.currentTarget.value)}
										styles={{ input: { color: "black" } }}
									/>
									{searchWasSuccessful && (
										<>
											<p className="font-semibold text-base text-white">
												Search results
											</p>
											<ul className="flex gap-1 list-none">
												{members.map((member, index) => {
													return (
														<li
															key={member.id}
															className="font-semibold text-sm hover:underline hover:text-white">
															<a href={`/users/${member.user.accountName}`}>
																{member.user.displayName}
															</a>
															{index + 1 < members.length && <span>,</span>}
														</li>
													);
												})}
											</ul>
										</>
									)}
									{isSearching && (
										<Loader
											className="self-center"
											size="sm"
											color="grey"
											variant="bars"
										/>
									)}
									{searchResultIsEmpty && (
										<p className="text-center font-semibold text-sm">
											No matching member found
										</p>
									)}
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
														{index + 1 < latestMembers.length && <span>,</span>}
													</li>
												);
											})}
										</ul>
									</>
								</div>
							)}
						</aside>
					</div>
				</Tabs.Panel>
			</Tabs>
		</main>
	);
}
