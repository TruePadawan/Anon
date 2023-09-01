import CommentsAPI, { CommentFull } from "@/lib/api/CommentsAPI";
import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import useUser from "./useUser";
import { PostType } from "@/types/types";

/**
 * useComments takes db query params as an argument which controls the comments returned
 */
export default function useComments(params?: UseCommentsParams) {
	const [commentsData, setCommentsData] = useState<CommentFull[]>([]);
	const paramsRef = useRef(params);
	const {
		data: rawCommentsData,
		isLoading,
		setSize,
	} = useSWRInfinite(
		(index, prevData?: SWRInfiniteData) => {
			const atEnd = prevData?.comments.length === 0;
			if (atEnd) return null;
			if (index === 0) return paramsRef.current;
			return {
				...paramsRef.current,
				skip: 1,
				cursor: prevData?.nextCursor,
			};
		},
		async (queryParams): Promise<SWRInfiniteData> => {
			const commentsData = await CommentsAPI.getMany(queryParams);
			return {
				comments: commentsData,
				nextCursor: {
					id: commentsData.at(-1)?.id,
				},
			};
		}
	);
	const { user } = useUser();

	// parse the data that useSWRInfinite returns and get the actual comments data
	useEffect(() => {
		if (!isLoading && rawCommentsData) {
			const actualCommentsData = rawCommentsData.flatMap(
				(rawComment) => rawComment.comments
			);
			setCommentsData(actualCommentsData);
		}
	}, [isLoading, rawCommentsData]);

	async function createComment(
		content: JSONContent,
		postId: string,
		postType: PostType
	) {
		if (!user) {
			throw new Error("Client is unauthenticated");
		}
		const newCommentData = await CommentsAPI.create({
			content,
			postId,
			authorId: user.id,
			postType,
		});
		setCommentsData((commentsData) => [newCommentData, ...commentsData]);
		return newCommentData;
	}

	function loadMoreComments() {
		setSize((size) => size + 1);
	}

	return {
		commentsData,
		isLoading,
		createComment,
		loadMoreComments,
	};
}

interface UseCommentsParams {
	take?: number;
	where?: Prisma.CommentWhereInput;
	orderBy?: Prisma.CommentOrderByWithRelationInput;
}

interface SWRInfiniteData {
	comments: CommentFull[];
	nextCursor: {
		id?: string;
	};
}
