import CommentsAPI from "@/lib/api/CommentsAPI";
import { PostType } from "@/types/types";
import useSWR from "swr";

export default function CommentsCount(props: CommentsCountProps) {
	const { data: count, isLoading } = useSWR(
		[props.commentGroupId, props.postType],
		fetchCommentCount
	);
	return (
		<p className="w-full text-center font-semibold">
			{isLoading ? "Getting number of comments" : `Comments (${count})`}
		</p>
	);
}

export function ReplyCount({ commentId }: ReplyCountProps) {
	const { data: count, isLoading } = useSWR(commentId, fetchReplyCount);
	return (
		<p className="w-full text-center text-sm">
			{isLoading ? "Getting number of replies" : `Replies (${count})`}
		</p>
	);
}

async function fetchCommentCount(data: [string, PostType]) {
	const count = await CommentsAPI.count(...data);
	return count;
}

async function fetchReplyCount(commentId: string) {
	const count = await CommentsAPI.replyCount(commentId);
	return count;
}

interface CommentsCountProps {
	commentGroupId: string;
	postType: PostType;
}

interface ReplyCountProps {
	commentId: string;
}
