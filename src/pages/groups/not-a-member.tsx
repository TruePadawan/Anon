import { IconUserOff } from "@tabler/icons-react";
import Link from "next/link";

export default function NotAMember() {
    return (
        <main className="flex grow flex-col items-center justify-center gap-1">
            <IconUserOff size={100} />
            <h1 className="mt-2 text-xl font-semibold">
                You&apos;re not a member of this group
            </h1>
            <Link href="/groups" className="underline">
                Go to groups
            </Link>
        </main>
    );
}
