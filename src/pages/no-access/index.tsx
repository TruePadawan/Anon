import { IconLock } from "@tabler/icons-react";
import Link from "next/link";

export default function NoAccess() {
	return (
		<main className="grow flex flex-col justify-center items-center gap-1">
			<IconLock size={128} />
			<h1 className="text-xl font-semibold">
				You need to be signed in to access the full site
			</h1>
			<Link href="/" className="mt-2 underline">
				Go Home
			</Link>
		</main>
	);
}
