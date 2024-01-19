import { IconHourglass } from "@tabler/icons-react";
import Link from "next/link";

export default function UserPending() {
    return (
        <main className="flex grow flex-col items-center justify-center gap-1">
            <IconHourglass size={100} />
            <h1 className="mt-2 text-xl font-semibold text-yellow-600">
                Your membership is pending
            </h1>
            <Link href="/groups" className="underline">
                Go to groups
            </Link>
        </main>
    );
}
