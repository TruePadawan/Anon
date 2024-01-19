import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma-client";
import { IconError404 } from "@tabler/icons-react";
import Comments from "@/components/Comments/Comments";
import { Button, Divider } from "@mantine/core";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CommentItem from "@/components/Comments/CommentItem";
import CommentsAPI, { CommentFull } from "@/lib/api/CommentsAPI";
import Link from "next/link";

interface PageProps {
    commentData: CommentFull | null;
    groupId: string;
}

const Comment = (props: PageProps) => {
    const { commentData, groupId } = props;
    if (!commentData) {
        return (
            <>
                <Navbar />
                <main className="flex grow flex-col items-center justify-center">
                    <IconError404 size="10rem" />
                    <p className="text-xl font-semibold">COMMENT NOT FOUND</p>
                </main>
            </>
        );
    }
    const postId = CommentsAPI.getPostId(commentData, "group");
    const postUrl = `/groups/${groupId}/posts/${postId}`;
    return (
        <>
            <Navbar />
            <main className="flex grow flex-col items-center">
                <div className="flex w-full max-w-4xl flex-col gap-1">
                    <Button
                        className="self-start"
                        variant="subtle"
                        color="gray"
                        component={Link}
                        href={postUrl}
                        compact
                    >
                        Go to post
                    </Button>
                    <div className="flex flex-col gap-3">
                        <CommentItem data={commentData} postType="group" />
                        <Divider label="Replies" labelPosition="center" />
                        <Comments
                            postType="group"
                            postId={postId}
                            where={{
                                parentId: commentData.id,
                                isDeleted: false,
                            }}
                            commentsAllowed={false}
                        />
                    </div>
                </div>
            </main>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
    context,
) => {
    if (!context.params) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    // get profile of signed in user
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions,
    );
    const user = !session
        ? null
        : await prisma.userProfile.findUnique({
              where: {
                  userId: session.user.id,
              },
          });

    // query db for comment data
    const commentId = context.params["commentId"] as string;
    const commentData = await prisma.comment.findUnique({
        where: {
            id: commentId,
        },
        include: {
            author: true,
            parentComment: true,
        },
    });

    const groupId = context.params.groupId as string;
    return {
        props: { key: commentId, commentData, currentUser: user, groupId },
    };
};

export default Comment;
