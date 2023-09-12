import { ActionIcon, Badge, Collapse, Text } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

export interface GroupItemProps {
	id: string;
	name: string;
	desc?: string;
	anonymous: boolean;
}

/**
 * React component for rendering a single group
 */
export default function GroupItem(props: GroupItemProps) {
	const [descIsShowing, setDescIsShowing] = useState(false);

	function toggleDesc() {
		setDescIsShowing((val) => !val);
	}

	const groupType = props.anonymous ? "ANON" : "PUBLIC";
	return (
		<div className="flex flex-col rounded bg-secondary-color hover:bg-secondary-color-l p-2 min-w-max">
			<div className="flex items-center gap-1">
				<Link
					className="text-lg font-bold grow flex justify-between"
					href={`/groups/${props.id}`}>
					<p>{props.name}</p>
					<Badge size="lg" color="dark" className="bg-primary-color-2">
						{groupType}
					</Badge>
				</Link>
				{props.desc && (
					<ActionIcon
						title="toggle description"
						size="lg"
						onClick={toggleDesc}
						data-cy="toggle-desc">
						{descIsShowing ? <IconChevronUp /> : <IconChevronDown />}
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
