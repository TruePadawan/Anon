import CommentsAPI from "@/lib/api/CommentsAPI";
import { PostType } from "@/types/types";
import useSWR from "swr";

/**
 * React component for rendering the number of comments under a post
 */
export default function CommentsCount(props: CommentsCountProps) {
	const { data: count, isLoading } = useSWR(
		[props.postId, props.postType],
		fetchCommentCount
	);
	return (
		<p className="w-full text-center font-semibold">
			{isLoading ? "Getting number of comments" : `Comments (${count})`}
		</p>
	);
}

/**
 * React component for rendering the number of replies under a comment
 */
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

export interface CommentsCountProps {
	postId: string;
	postType: PostType;
}

export interface ReplyCountProps {
	commentId: string;
}
