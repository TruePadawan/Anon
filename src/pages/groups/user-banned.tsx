import { IconBan } from "@tabler/icons-react";
import Link from "next/link";

export default function UserBanned() {
    return (
        <main className="flex grow flex-col items-center justify-center gap-1">
            <IconBan size={100} />
            <h1 className="mt-2 text-xl font-semibold text-red-600">
                You&apos;re banned from the group😠
            </h1>
            <Link href="/groups" className="underline">
                Go to groups
            </Link>
        </main>
    );
}
