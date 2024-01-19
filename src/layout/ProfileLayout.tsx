import { Tabs } from "@mantine/core";
import { useRouter } from "next/router";
import { IconUser, IconListDetails } from "@tabler/icons-react";

interface ProfileLayout {
    children: React.ReactNode;
    tabValue: string;
    accountName: string;
}

export default function ProfileLayout(props: ProfileLayout) {
    const router = useRouter();

    function tabChangeHandler(value: string) {
        router.push(`/users/${props.accountName}${value}`);
    }

    const tabClasses = "text-lg";
    return (
        <Tabs
            color="gray"
            variant="pills"
            value={props.tabValue}
            onTabChange={tabChangeHandler}
            className="grow"
        >
            <Tabs.List>
                <Tabs.Tab
                    value="/"
                    icon={<IconUser size={24} />}
                    className={tabClasses}
                >
                    Profile Information
                </Tabs.Tab>
                <Tabs.Tab
                    value="/public-posts"
                    icon={<IconListDetails size={24} />}
                    className={tabClasses}
                >
                    Public Posts
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value={props.tabValue}>{props.children}</Tabs.Panel>
        </Tabs>
    );
}
