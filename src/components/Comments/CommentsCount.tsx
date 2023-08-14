import useSWR from "swr";

interface CommentsCountProps {
	commentGroupId: string;
}

export default function CommentsCount({ commentGroupId }: CommentsCountProps) {
	const { data: count, isLoading } = useSWR(
		["/api/get-comments-count", commentGroupId],
		fetcher
	);
	return (
		<p className="w-full text-center font-semibold">
			{isLoading ? "0 comments" : `${count} comment${count === 1 ? "" : "s"}`}
		</p>
	);
}

const fetcher = async ([url, groupId]: [string, string]): Promise<number> => {
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify({
			commentGroupId: groupId,
		}),
	});

	if (res.ok) {
		const { count } = await res.json();
		return count;
	} else {
		const { message } = await res.json();
		throw new Error(message);
	}
};
