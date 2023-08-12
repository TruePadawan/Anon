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
	const [isLoading, setIsLoading] = useState(false);
	const paramsRef = useRef(params);
	const cursorRef = useRef<string>();
	const { user } = useUser();

	// update the cursor to the last post whenever posts state changes
	useEffect(() => {
		cursorRef.current = posts.at(-1)?.id;
	}, [posts]);

	// load posts when page mounts
	useEffect(() => {
		setIsLoading(true);
		PublicPostAPI.getMany(paramsRef.current).then((posts) => {
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

	return { posts, isLoading, createPublicPost };
}
