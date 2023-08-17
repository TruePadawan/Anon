import CommentsAPI from "@/lib/api/CommentsAPI";
import useSWR from "swr";

interface CommentsCountProps {
	commentGroupId: string;
}

export default function CommentsCount({ commentGroupId }: CommentsCountProps) {
	const { data: count, isLoading } = useSWR(commentGroupId, fetcher);
	return (
		<p className="w-full text-center font-semibold">
			{isLoading ? "0 comments" : `${count} comment${count === 1 ? "" : "s"}`}
		</p>
	);
}

const fetcher = async (groupId: string): Promise<number> => {
	const count = await CommentsAPI.count(groupId);
	return count;
};
