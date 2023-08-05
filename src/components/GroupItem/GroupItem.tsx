import { ActionIcon, Badge, Collapse, Text, useMantineTheme } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

interface GroupItemProps {
	id: string;
	name: string;
	desc: string | null;
	anonymous: boolean;
}

export default function GroupItem(props: GroupItemProps) {
	const [showDesc, setShowDesc] = useState(false);
    const theme = useMantineTheme();

	function toggleDesc() {
		setShowDesc((val: boolean) => !val);
	}

	const groupType = props.anonymous ? "ANON" : "PUBLIC";
	return (
		<li className="flex flex-col items-stretch">
			<div className="flex gap-1">
				<Link className="flex justify-between" href={`/groups/${props.id}`}>
					<p>{props.name}</p>
					<Badge size="lg" color="gray">
						{groupType}
					</Badge>
				</Link>
				{props.desc && (
					<ActionIcon size="lg" onClick={toggleDesc} data-cy="toggle-desc">
						<IconChevronDown />
					</ActionIcon>
				)}
			</div>
			{props.desc && (
				<Collapse in={showDesc}>
					<Text size="sm" lineClamp={4}>
						{props.desc}
					</Text>
				</Collapse>
			)}
		</li>
	);
}
