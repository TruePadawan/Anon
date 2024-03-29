import ConfirmGroupDeleteDialog from "@/components/Dialogs/ConfirmGroupDeleteDialog";
import GroupMember from "@/components/GroupMember/GroupMember";
import PendingGroupMember from "@/components/GroupMember/PendingGroupMember";
import useSearchGroupMembers from "@/hooks/useSearchGroupMembers";
import { GroupData } from "@/pages/groups/[groupId]";
import { GroupMemberWithProfile } from "@/types/types";
import { ActionIcon, Loader, Menu, Tabs, TextInput } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconSettings,
    IconLogout,
    IconClipboard,
    IconListDetails,
    IconError404,
    IconTrash,
    IconHourglass,
    IconEdit,
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
    const { members, search, isSearching } = useSearchGroupMembers(
        groupData?.id,
    );
    const clipboard = useClipboard();
    const [isOpen, { open, close }] = useDisclosure(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            search(searchValue);
        }, 600);
        return () => clearTimeout(timeoutId);
    }, [search, searchValue]);

    if (!groupData) {
        return (
            <main className="flex grow flex-col items-center justify-center">
                <IconError404 size={128} />
                <p className="text-xl font-semibold">
                    This group does not exist
                </p>
            </main>
        );
    }

    function handleTabChange(tabValue: string) {
        router.push(`/groups/${groupData.id}/${tabValue}`);
    }

    function routeToEditPage() {
        router.push(`/groups/${groupData.id}/edit`);
    }

    function copyJoinIdToClipboard() {
        clipboard.copy(groupData.groupJoinId);
        notifications.show({
            color: "green",
            message: "JoinId copied to clipboard",
        });
    }

    const { groupMembers, admin } = groupData;
    const { latestMembers, pendingMembers } = parseGroupMembers(groupMembers);
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
        <main className="flex grow flex-col">
            <div className="flex items-center justify-between bg-primary-color-2 px-4 py-2">
                <span
                    className={`text-3xl ${montserrat.className} font-semibold text-white`}
                >
                    {groupData.name}
                </span>
                <Menu>
                    <Menu.Target>
                        <ActionIcon variant="subtle">
                            <IconSettings />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            icon={<IconClipboard />}
                            onClick={copyJoinIdToClipboard}
                        >
                            Copy joinId to clipboard
                        </Menu.Item>
                        {props.currentUserIsAdmin && (
                            <>
                                <Menu.Item
                                    icon={<IconEdit />}
                                    title="Edit group data. Only shows for admins"
                                    onClick={routeToEditPage}
                                >
                                    Edit group
                                </Menu.Item>
                                <Menu.Item
                                    color="red"
                                    title="Delete group. Only shows for admins"
                                    icon={<IconTrash />}
                                    onClick={open}
                                >
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
                onTabChange={handleTabChange}
            >
                <Tabs.List>
                    <Tabs.Tab
                        className="text-lg font-semibold"
                        value="/"
                        icon={<IconListDetails />}
                    >
                        Posts
                    </Tabs.Tab>
                    {showPendingPostsTab && (
                        <Tabs.Tab
                            className="text-lg font-semibold"
                            value="/pending-posts"
                            icon={<IconHourglass />}
                        >
                            Pending posts
                        </Tabs.Tab>
                    )}
                </Tabs.List>
                <Tabs.Panel value={props.tabValue}>
                    <div className="mt-1.5 flex justify-between gap-x-1">
                        <div className="grow">{props.children}</div>
                        <aside className="hidden w-full max-w-md flex-col items-stretch gap-y-1 lg:flex xl:max-w-xl">
                            <ul className="flex flex-col gap-y-1.5 rounded-md bg-secondary-color p-1.5">
                                {showAnonymousSection && (
                                    <li className="flex flex-col">
                                        <span className="text-base font-semibold text-white">
                                            Admin
                                        </span>
                                        <a
                                            href={`/users/${admin.accountName}`}
                                            className="w-max text-sm font-semibold hover:text-white hover:underline"
                                        >
                                            {admin.accountName}
                                        </a>
                                    </li>
                                )}
                                <li className="flex flex-col">
                                    <span className="text-base font-semibold text-white">
                                        Description
                                    </span>
                                    <p className="text-sm">
                                        {groupData.desc || "No description."}
                                    </p>
                                </li>
                                <li className="flex flex-col">
                                    <span className="text-base font-semibold text-white">
                                        Member count
                                    </span>
                                    <span className="text-sm">
                                        {groupData._count.groupMembers}
                                    </span>
                                </li>
                            </ul>
                            {showAnonymousSection && (
                                <div className="flex flex-col gap-y-2 rounded-md bg-secondary-color p-1.5">
                                    <TextInput
                                        variant="filled"
                                        placeholder="Search members"
                                        classNames={{
                                            input: "bg-accent-color-2",
                                        }}
                                        value={searchValue}
                                        onChange={(e) =>
                                            setSearchValue(
                                                e.currentTarget.value,
                                            )
                                        }
                                        styles={{ input: { color: "black" } }}
                                    />
                                    {searchWasSuccessful && (
                                        <>
                                            <p className="text-base font-semibold text-white">
                                                Search results
                                            </p>
                                            <ul className="flex list-none gap-1">
                                                {members.map(
                                                    (member, index) => {
                                                        return (
                                                            <li key={member.id}>
                                                                <GroupMember
                                                                    memberData={
                                                                        member
                                                                    }
                                                                />
                                                                {index + 1 <
                                                                    members.length && (
                                                                    <span>
                                                                        ,
                                                                    </span>
                                                                )}
                                                            </li>
                                                        );
                                                    },
                                                )}
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
                                        <p className="text-center text-sm font-semibold">
                                            No matching member found
                                        </p>
                                    )}
                                    <div>
                                        <p className="text-base font-semibold text-white">
                                            Latest members
                                        </p>
                                        <ul className="flex list-none gap-1">
                                            {latestMembers.map(
                                                (member, index) => {
                                                    return (
                                                        <li key={member.id}>
                                                            <GroupMember
                                                                memberData={
                                                                    member
                                                                }
                                                            />
                                                            {index + 1 <
                                                                latestMembers.length && (
                                                                <span>,</span>
                                                            )}
                                                        </li>
                                                    );
                                                },
                                            )}
                                        </ul>
                                    </div>
                                    {!groupData.autoMemberApproval && (
                                        <>
                                            <hr />
                                            <div>
                                                <p className="text-base font-semibold text-white">
                                                    Pending members
                                                </p>
                                                {pendingMembers.length > 0 && (
                                                    <ul className="flex list-none gap-1">
                                                        {pendingMembers.map(
                                                            (member, index) => {
                                                                return (
                                                                    <li
                                                                        key={
                                                                            member.id
                                                                        }
                                                                    >
                                                                        <PendingGroupMember
                                                                            memberData={
                                                                                member
                                                                            }
                                                                        />
                                                                        {index +
                                                                            1 <
                                                                            latestMembers.length && (
                                                                            <span>
                                                                                ,
                                                                            </span>
                                                                        )}
                                                                    </li>
                                                                );
                                                            },
                                                        )}
                                                    </ul>
                                                )}
                                                {pendingMembers.length ===
                                                    0 && (
                                                    <p className="text-sm">
                                                        No pending member
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </aside>
                    </div>
                </Tabs.Panel>
            </Tabs>
            <ConfirmGroupDeleteDialog
                isOpen={isOpen}
                onClose={close}
                groupId={groupData.id}
            />
        </main>
    );
}

function parseGroupMembers(groupMembers: GroupMemberWithProfile[]) {
    const pendingMembers: GroupMemberWithProfile[] = [];
    const latestMembers: GroupMemberWithProfile[] = [];
    groupMembers.forEach((member) => {
        if (member.membershipStatus === "PENDING") {
            pendingMembers.push(member);
        } else {
            latestMembers.push(member);
        }
    });
    return {
        pendingMembers,
        latestMembers,
    };
}
