import Navbar from "@/components/Navbar/Navbar";
import useInput from "@/hooks/useInput";
import useUser from "@/hooks/useUser";
import { Button, Switch, TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { validateGroupName } from "@/helpers/groups";
import GroupsAPI from "@/lib/api/GroupsAPI";
import { getErrorMessage } from "@/lib/error-message";

export default function CreateGroupPage() {
    const { user } = useUser();
    const descRef = useRef<HTMLTextAreaElement>(null);
    const [groupIsAnonymous, setGroupIsAnonymous] = useState(false);
    const [autoApprovePosts, setAutoApprovePosts] = useState(true);
    const [autoApproveMembers, setAutoApproveMembers] = useState(true);
    const router = useRouter();
    const [creatingGroup, setCreatingGroup] = useState(false);
    const groupNameInput = useInput([validateGroupName]);

    async function submitHandler(event: React.FormEvent) {
        event.preventDefault();

        if (!user) return;
        setCreatingGroup(true);
        try {
            const group = await GroupsAPI.create({
                adminId: user.id,
                name: groupNameInput.value.trim(),
                desc: descRef.current?.value.trim() ?? null,
                isAnonymous: groupIsAnonymous,
                autoMemberApproval: autoApproveMembers,
                autoPostApproval: autoApprovePosts,
            });
            notifications.show({
                color: "green",
                message: `Group '${group.name} created successfully`,
            });
            router.push("/groups");
        } catch (error) {
            notifications.show({
                color: "red",
                title: "Failed to complete action",
                message: getErrorMessage(error),
            });
        }
        setCreatingGroup(false);
    }

    const formIsValid = !groupNameInput.isValidating && groupNameInput.isValid;
    return (
        <>
            <Navbar />
            <main className="flex justify-center">
                <form
                    onSubmit={submitHandler}
                    aria-labelledby="form-header"
                    className="flex w-full max-w-lg flex-col gap-4"
                >
                    <h2
                        id="form-header"
                        className="text-center text-3xl md:text-4xl"
                    >
                        Create a group
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
                            disabled={creatingGroup}
                            withAsterisk
                            required
                        />
                        <Textarea
                            label="Description"
                            placeholder="This group is for humans currently inhabiting EARTH_1"
                            size="md"
                            minRows={2}
                            ref={descRef}
                            disabled={creatingGroup}
                            autosize
                        />
                        <Switch
                            onLabel="YES"
                            offLabel="NO"
                            label="Create anonymous group?"
                            labelPosition="left"
                            styles={{ label: { "font-weight": "500" } }}
                            description="The profiles of all members are hidden from each other except the admin"
                            size="md"
                            checked={groupIsAnonymous}
                            onChange={(ev) =>
                                setGroupIsAnonymous(ev.currentTarget.checked)
                            }
                            disabled={creatingGroup}
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
                            disabled={creatingGroup}
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
                            disabled={creatingGroup}
                        />
                    </div>
                    <Button
                        type="submit"
                        color="gray"
                        className="w-full"
                        size="md"
                        loaderPosition="center"
                        loading={groupNameInput.isValidating}
                        disabled={creatingGroup || !formIsValid}
                    >
                        Create
                    </Button>
                </form>
            </main>
        </>
    );
}
