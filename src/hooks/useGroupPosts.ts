import GroupPostAPI, {
    GroupPostAPIGetManyParams,
} from "@/lib/api/GroupPostAPI";
import { GroupPostWithAuthor } from "@/types/types";
import { useEffect, useState } from "react";
import useSWRInfinite from "swr/infinite";
import useUser from "./useUser";
import { JSONContent } from "@tiptap/react";
import { GetManyQueryModifiers } from "@/types/hook-types";

/**
 * React custom hook for getting an infinite list of group posts
 * @param params Prisma query objects for controlling the group posts returned
 */
export default function useGroupPosts(
    groupId: string,
    queryModifiers: GetManyQueryModifiers<GroupPostAPIGetManyParams>,
) {
    const [posts, setPosts] = useState<GroupPostWithAuthor[]>([]);
    const {
        data: rawPosts,
        isLoading,
        setSize,
    } = useSWRInfinite(
        (index, prevData?: SWRInfiniteData) => {
            const atEnd = prevData?.posts.length === 0;
            if (atEnd) return null;
            if (index === 0) return parseQueryModifier(groupId, queryModifiers);

            return {
                ...parseQueryModifier(groupId, queryModifiers),
                skip: 1,
                cursor: prevData?.nextCursor,
            };
        },
        async (key): Promise<SWRInfiniteData> => {
            const posts = await GroupPostAPI.getMany(key);
            return {
                posts,
                nextCursor: {
                    id: posts.at(-1)?.id,
                },
            };
        },
    );
    const { user } = useUser();

    // get the actual posts from the data useSWRInfinite returns
    useEffect(() => {
        if (!isLoading && rawPosts) {
            const posts = rawPosts.flatMap((rawPost) => rawPost.posts);
            setPosts(posts);
        }
    }, [isLoading, rawPosts]);

    function loadMorePosts() {
        setSize((size) => size + 1);
    }

    async function createGroupPosts(content: JSONContent) {
        if (!user) {
            throw new Error("Client is unauthenticated");
        }

        const newPost = await GroupPostAPI.create({
            content,
            authorId: user.id,
            groupId,
        });
        setPosts((posts) => [newPost, ...posts]);
    }

    return {
        posts,
        isLoading,
        loadMorePosts,
        createGroupPosts,
    };
}

function parseQueryModifier(
    groupId: string,
    queryModifiers: GetManyQueryModifiers<GroupPostAPIGetManyParams>,
) {
    const parsedObject = { ...queryModifiers };
    if (parsedObject.where) {
        parsedObject.where.group = { id: groupId };
    } else {
        parsedObject.where = { group: { id: groupId } };
    }
    return parsedObject;
}

interface SWRInfiniteData {
    posts: GroupPostWithAuthor[];
    nextCursor: GroupPostAPIGetManyParams["cursor"];
}
