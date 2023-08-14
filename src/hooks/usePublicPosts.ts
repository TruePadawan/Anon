import PublicPostAPI from "@/lib/api/PublicPostAPI";
import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import useUser from "./useUser";
import { PublicPostWithAuthor } from "@/types/types";
import useSWRInfinite from "swr/infinite";

interface UsePublicPostsParams {
	take?: number;
	where?: Prisma.PublicPostWhereInput;
	orderBy?: Prisma.PublicPostOrderByWithRelationInput;
}

interface SWRInfiniteData {
	posts: PublicPostWithAuthor[];
	nextCursor: {
		id?: string;
	};
}

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
			throw new Error("Unauthenticated user can't create a post");
		}

		const newPost = await PublicPostAPI.create(content, user.id);
		setPosts((posts) => {
			return [newPost, ...posts];
		});
		return newPost;
	}

	async function loadMorePosts() {
		setSize((_size) => _size + 1);
	}

	return { posts, isLoading, createPublicPost, loadMorePosts };
}
