import PublicPostAPI from "@/lib/api/PublicPostAPI";
import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import useUser from "./useUser";
import { PublicPostWithAuthor } from "@/types/types";

interface UsePublicPostsParams {
	take?: number;
	where?: Prisma.PublicPostWhereInput;
	orderBy?: Prisma.PublicPostOrderByWithRelationInput;
}

export default function usePublicPosts(params?: UsePublicPostsParams) {
	const [posts, setPosts] = useState<PublicPostWithAuthor[]>([]);
	// isLoading is true only when the initial load is happening
	const [isLoading, setIsLoading] = useState(false);
	const paramsRef = useRef(params);
	const cursorRef = useRef<string>();
	const { user } = useUser();

	// load posts when page mounts
	useEffect(() => {
		setIsLoading(true);
		PublicPostAPI.getMany(paramsRef.current).then((posts) => {
			cursorRef.current = posts.at(-1)?.id;
			setPosts(posts);
			setIsLoading(false);
		});
	}, []);

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
		const newPosts = await PublicPostAPI.getMany({
			cursor: {
				id: cursorRef.current,
			},
			skip: 1,
			...paramsRef.current,
		});

		setPosts((currentPosts) => {
			const posts = currentPosts.concat(newPosts);
			// update the cursor after the new posts has been added to current posts
			cursorRef.current = posts.at(-1)?.id;
			return posts;
		});
	}

	return { posts, isLoading, createPublicPost, loadMorePosts };
}
