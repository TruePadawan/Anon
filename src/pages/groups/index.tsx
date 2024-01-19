import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import {
    Button,
    Drawer,
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
import { useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { filterGroups } from "@/helpers/groups";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

interface PageProps {
    groups: Group[];
    userId: string;
}

export type StatusRadioValue = "JOINED" | "PENDING";

const GroupsPage = (props: PageProps) => {
    const [groups, setGroups] = useState<Group[]>(props.groups);
    const membershipStatusRef = useRef<StatusRadioValue>("JOINED");
    const [isFiltering, setIsFiltering] = useState(false);
    const [groupNameFilter, setGroupNameFilter] = useState("");
    const theme = useMantineTheme();
    const matchesViewport = useMediaQuery("(min-width: 1280px)");
    const [dialogIsOpen, { open: openDialog, close: closeDialog }] =
        useDisclosure(false);
    /**
     * Apply debouncing to filter groups my name and the currently selected status
     */
    useEffect(() => {
        const timeoutID = setTimeout(async () => {
            setIsFiltering(true);
            const filteredGroups = await filterGroups(
                props.userId,
                membershipStatusRef.current,
                groupNameFilter.trim(),
            );
            setGroups(filteredGroups);
            setIsFiltering(false);
        }, 600);

        return () => clearTimeout(timeoutID);
    }, [groupNameFilter, props.userId]);

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
            membershipStatusRef.current = castedValue;

            setIsFiltering(true);
            const filteredGroups = await filterGroups(
                props.userId,
                castedValue,
                groupNameFilter,
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
                    status={membershipStatusRef.current}
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
            <main className="flex grow gap-2">
                {/* SIDEBAR */}
                {matchesViewport && (
                    <aside className="flex h-max min-w-[20rem] flex-col gap-2 rounded-md bg-primary-color-2 p-2">
                        <TextInput
                            rightSection={inputRightSection}
                            placeholder="Filter groups"
                            aria-label="Filter groups"
                            value={groupNameFilter}
                            onChange={(event) =>
                                setGroupNameFilter(event.currentTarget.value)
                            }
                            required
                        />
                        <Radio.Group
                            name="membership_status"
                            label="Membership status"
                            value={membershipStatusRef.current}
                            onChange={handleStatusChange}
                            size="md"
                        >
                            <div className="flex flex-col gap-1.5 p-1">
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
                )}
                {!matchesViewport && (
                    <Drawer
                        size="max-content"
                        opened={dialogIsOpen}
                        onClose={closeDialog}
                    >
                        <aside className="flex h-max min-w-[20rem] flex-col gap-2 rounded-md bg-primary-color-2 p-2">
                            <TextInput
                                rightSection={inputRightSection}
                                placeholder="Filter groups"
                                aria-label="Filter groups"
                                value={groupNameFilter}
                                onChange={(event) =>
                                    setGroupNameFilter(
                                        event.currentTarget.value,
                                    )
                                }
                                required
                            />
                            <Radio.Group
                                name="membership_status"
                                label="Membership status"
                                value={membershipStatusRef.current}
                                onChange={handleStatusChange}
                                size="md"
                            >
                                <div className="flex flex-col gap-1.5 p-1">
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
                    </Drawer>
                )}
                <div
                    className={classNames(
                        "flex grow",
                        hasGroupItems && "flex-col gap-2",
                        isFiltering && "items-center justify-center",
                        noGroupItems && "flex-col gap-2",
                    )}
                >
                    {isFiltering && (
                        <Loader size="md" variant="bars" color="cyan" />
                    )}
                    {!isFiltering && (
                        <>
                            <div className="flex justify-between">
                                {!matchesViewport && (
                                    <Button
                                        color="gray"
                                        variant="light"
                                        className="font-bold"
                                        onClick={openDialog}
                                    >
                                        Search/Filter
                                    </Button>
                                )}
                                <Button
                                    color="gray"
                                    sx={{
                                        background: theme.colors.gray[8],
                                        color: "white",
                                    }}
                                    component={Link}
                                    href="/groups/create"
                                >
                                    Create a group
                                </Button>
                            </div>
                            {noGroupItems && (
                                <div className="flex grow flex-col items-center justify-center">
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
