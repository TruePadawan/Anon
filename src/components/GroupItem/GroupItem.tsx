import { ActionIcon, Badge, Collapse, Text } from "@mantine/core";
import { Group, MembershipStatus } from "@prisma/client";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

export interface GroupItemProps {
    id: string;
    name: string;
    desc: Group["desc"];
    anonymous: boolean;
    status: MembershipStatus;
}

/**
 * React component for rendering a single group item
 */
export default function GroupItem(props: GroupItemProps) {
    const [descIsShowing, setDescIsShowing] = useState(false);

    function toggleDesc() {
        setDescIsShowing((val) => !val);
    }

    const badgeColor = getBadgeColor(props.status);
    const groupType = props.anonymous ? "ANON" : "PUBLIC";
    return (
        <div className="flex min-w-max flex-col rounded bg-secondary-color p-2 hover:bg-secondary-color-l">
            <div className="flex items-center gap-1">
                <Link
                    className="flex grow justify-between text-lg font-bold"
                    href={`/groups/${props.id}`}
                >
                    <p>{props.name}</p>
                    <Badge size="lg" color={badgeColor} variant="dot">
                        {groupType}
                    </Badge>
                </Link>
                {props.desc && (
                    <ActionIcon
                        title="toggle description"
                        size="lg"
                        onClick={toggleDesc}
                        data-cy="toggle-desc"
                    >
                        {descIsShowing ? (
                            <IconChevronUp />
                        ) : (
                            <IconChevronDown />
                        )}
                    </ActionIcon>
                )}
            </div>
            {props.desc && (
                <Collapse in={descIsShowing}>
                    <Text size="sm" lineClamp={4}>
                        {props.desc}
                    </Text>
                </Collapse>
            )}
        </div>
    );
}

function getBadgeColor(status: MembershipStatus) {
    switch (status) {
        case "JOINED":
            return "green";
        case "BANNED":
            return "red";
        case "PENDING":
            return "yellow";
        default:
            throw new Error("Invalid membership status");
    }
}
