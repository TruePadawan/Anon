import Navbar from "@/components/Navbar/Navbar";
import useInput from "@/hooks/useInput";
import { Button, Switch, TextInput, Textarea } from "@mantine/core";
import { useRef, useState } from "react";
import { validateGroupName } from "@/helpers/groups";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { Group as GroupModel } from "@prisma/client";
import GroupsAPI from "@/lib/api/GroupsAPI";
import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "@/lib/error-message";
import { useRouter } from "next/router";

interface PageProps {
    groupData: Pick<
        GroupModel,
        "id" | "desc" | "name" | "autoMemberApproval" | "autoPostApproval"
    >;
}

export default function EditGroupPage({ groupData }: PageProps) {
    const [desc, setDesc] = useState(groupData.desc);
    const [autoApprovePosts, setAutoApprovePosts] = useState(
        groupData.autoPostApproval,
    );
    const [autoApproveMembers, setAutoApproveMembers] = useState(
        groupData.autoMemberApproval,
    );
    const [savingChanges, setSavingChanges] = useState(false);
    const groupNameInput = useInput(
        [
            {
                name: "Validate group name (edit)",
                async validatorFn(groupName: string) {
                    if (groupName.trim() === groupData.name) {
                        return {
                            valid: true,
                            message: `${groupName} is taken`,
                        };
                    } else {
                        const result =
                            await validateGroupName.validatorFn(groupName);
                        return result;
                    }
                },
            },
        ],
        {
            initialValue: groupData.name,
            initialValueIsValid: true,
        },
    );
    const router = useRouter();

    async function submitHandler(event: React.FormEvent) {
        event.preventDefault();

        setSavingChanges(true);
        try {
            await GroupsAPI.update(groupData.id, {
                name: groupNameInput.value.trim(),
                desc: desc?.trim() ?? null,
                autoMemberApproval: autoApproveMembers,
                autoPostApproval: autoApprovePosts,
            });
            notifications.show({
                color: "green",
                message: `The group was updated successfully`,
            });
            router.push(`/groups/${groupData.id}`);
        } catch (error) {
            notifications.show({
                color: "red",
                title: "Failed to complete action",
                message: getErrorMessage(error),
            });
        }
        setSavingChanges(false);
    }

    const noGroupNameChanged = groupNameInput.value === groupData.name;
    const formIsValid =
        noGroupNameChanged ||
        (!groupNameInput.isValidating && groupNameInput.isValid);
    return (
        <>
            <Navbar />
            <main className="flex justify-center">
                <form
                    onSubmit={submitHandler}
                    aria-labelledby="form-header"
                    className="flex w-full max-w-lg flex-col gap-4"
                >
                    <h2 id="form-header" className="text-center text-4xl">
                        Edit group
                    </h2>
                    <div className="flex flex-col gap-4">
                        <TextInput
                            label="Name"
                            placeholder="EARTH_1"
                            size="md"
                            value={groupNameInput.value}
                            onChange={groupNameInput.changeEvHandler}
                            onFocus={groupNameInput.focusEvHandler}
                            error={
                                groupNameInput.hasError
                                    ? groupNameInput.errorMessage
                                    : ""
                            }
                            disabled={savingChanges}
                            withAsterisk
                            required
                        />
                        <Textarea
                            label="Description"
                            placeholder="This group is for humans currently inhabiting EARTH_1"
                            size="md"
                            minRows={2}
                            value={desc ?? ""}
                            onChange={(e) => setDesc(e.currentTarget.value)}
                            disabled={savingChanges}
                            autosize
                        />
                        <Switch
                            onLabel="YES"
                            offLabel="NO"
                            label="Automatically approve join requests?"
                            labelPosition="left"
                            styles={{ label: { "font-weight": "500" } }}
                            description="Users won't need admin approval to join"
                            size="md"
                            checked={autoApproveMembers}
                            onChange={(ev) =>
                                setAutoApproveMembers(ev.currentTarget.checked)
                            }
                            disabled={savingChanges}
                        />
                        <Switch
                            onLabel="YES"
                            offLabel="NO"
                            label="Automatically approve posts?"
                            labelPosition="left"
                            styles={{ label: { "font-weight": "500" } }}
                            description="Posts will be submitted without needing admin approval"
                            size="md"
                            checked={autoApprovePosts}
                            onChange={(ev) =>
                                setAutoApprovePosts(ev.currentTarget.checked)
                            }
                            disabled={savingChanges}
                        />
                    </div>
                    <Button
                        type="submit"
                        color="gray"
                        className="w-full"
                        size="md"
                        loaderPosition="center"
                        loading={groupNameInput.isValidating}
                        disabled={savingChanges || !formIsValid}
                    >
                        Edit
                    </Button>
                </form>
            </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
    context,
) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions,
    );
    // just to shut up intellisense, there is guaranteed to be a session since middleware redirects unsigned client away from /groups/*
    if (!session) {
        return {
            redirect: {
                destination: "/groups",
                permanent: false,
            },
        };
    }

    const groupId = context.params?.groupId as string;
    // confirm that the group exists
    const groupData = await prisma.group.findUnique({
        where: {
            id: groupId,
        },
        select: {
            admin: true,
            id: true,
            autoMemberApproval: true,
            autoPostApproval: true,
            name: true,
            desc: true,
        },
    });

    if (!groupData) {
        return {
            redirect: {
                destination: "/groups/not-found",
                permanent: false,
            },
        };
    }

    // confirm that client is the admin of the group
    const { admin, ...clientSideData } = groupData;
    const clientIsAdmin = session.user.id === groupData.admin.userId;
    if (!clientIsAdmin) {
        return {
            redirect: {
                destination: "/groups",
                permanent: false,
            },
        };
    }

    return {
        props: {
            groupData: clientSideData,
        },
    };
};
