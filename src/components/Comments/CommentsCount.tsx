import useSWR from "swr";

interface CommentsCountProps {
	commentGroupId: string;
}
export default function CommentsCount(props: CommentsCountProps) {
	const { data: count, isLoading } = useSWR(
		"/api/get-comments-count",
		async (key: string): Promise<number> => {
			const res = await fetch(key, {
				method: "POST",
				body: JSON.stringify({
					commentGroupId: props.commentGroupId,
				}),
			});

			if (res.ok) {
				const { count } = await res.json();
				return count;
			} else {
				const { message } = await res.json();
				throw new Error(message);
			}
		}
	);
	return (
		<p className="w-full text-center font-semibold">
			{isLoading ? "0 comments" : `${count} comment${count === 1 ? "" : "s"}`}
		</p>
	);
}
