import CommentsAPI from "@/lib/api/CommentsAPI";
import useSWR from "swr";

export default function CommentsCount({ commentGroupId }: CommentsCountProps) {
	const { data: count, isLoading } = useSWR(commentGroupId, fetchCommentCount);
	return (
		<p className="w-full text-center font-semibold">
			{isLoading ? "0 comments" : `${count} comment${count === 1 ? "" : "s"}`}
		</p>
	);
}

export function ReplyCount({ commentId }: ReplyCountProps) {
	const { data: count, isLoading } = useSWR(commentId, fetchReplyCount);
	return (
		<p className="w-full text-center text-sm">
			{isLoading
				? "0 replies"
				: `${count} ${count === 1 ? "reply" : "replies"}`}
		</p>
	);
}

async function fetchCommentCount(groupId: string) {
	const count = await CommentsAPI.count(groupId);
	return count;
}

async function fetchReplyCount(commentId: string) {
	const count = await CommentsAPI.replyCount(commentId);
	return count;
}

interface CommentsCountProps {
	commentGroupId: string;
}

interface ReplyCountProps {
	commentId: string;
}
