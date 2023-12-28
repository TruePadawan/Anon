import { IconError404 } from "@tabler/icons-react";
import Link from "next/link";

export default function GroupNotFound() {
	return (
		<main className="grow flex flex-col justify-center items-center gap-1">
			<IconError404 size={100} />
			<h1 className="mt-2 text-xl font-semibold">Failed to find group</h1>
			<Link href="/groups" className="underline">
				Go to groups
			</Link>
		</main>
	);
}
