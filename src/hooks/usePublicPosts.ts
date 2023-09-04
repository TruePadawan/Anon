import PublicPostAPI, {
	PublicPostAPIGetManyParams,
} from "@/lib/api/PublicPostAPI";
import { JSONContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import useUser from "./useUser";
import { PublicPostWithAuthor } from "@/types/types";
import useSWRInfinite from "swr/infinite";

/**
 * React hook for getting a list of public posts
 * @param params Prisma query objects for controlling the posts returned
 */
export default function usePublicPosts(params?: UsePublicPostsParams) {
	const [posts, setPosts] = useState<PublicPostWithAuthor[]>([]);
	const paramsRef = useRef(params);
	const {
		data: rawPosts,
		isLoading,
		setSize,
	} = useSWRInfinite(
		(index, prevData?: SWRInfiniteData) => {
			const atEnd = prevData?.posts.length === 0;
			if (atEnd) return null;
			if (index === 0) return paramsRef.current;

			return {
				...paramsRef.current,
				skip: 1,
				cursor: prevData?.nextCursor,
			};
		},
		async (key): Promise<SWRInfiniteData> => {
			const posts = await PublicPostAPI.getMany(key);
			return {
				posts,
				nextCursor: {
					id: posts.at(-1)?.id,
				},
			};
		}
	);
	const { user } = useUser();

	// get the actual posts from the data useSWRInfinite returns
	useEffect(() => {
		if (!isLoading && rawPosts) {
			const posts = rawPosts.flatMap((rawPost) => rawPost.posts);
			setPosts(posts);
		}
	}, [isLoading, rawPosts]);

	async function createPublicPost(content: JSONContent) {
		if (!user) {
			throw new Error("Client is unauthenticated");
		}

		const newPost = await PublicPostAPI.create({ content, authorId: user.id });
		setPosts((posts) => [newPost, ...posts]);
		return newPost;
	}

	function loadMorePosts() {
		setSize((size) => size + 1);
	}

	return { posts, isLoading, createPublicPost, loadMorePosts };
}

type UsePublicPostsParams = Omit<PublicPostAPIGetManyParams, "skip" | "cursor">;

interface SWRInfiniteData {
	posts: PublicPostWithAuthor[];
	nextCursor: PublicPostAPIGetManyParams["cursor"];
}
