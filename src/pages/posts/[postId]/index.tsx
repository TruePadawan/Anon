import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma-client";
import { PublicPostWithAuthor } from "@/types/types";
import { IconError404 } from "@tabler/icons-react";
import PublicPostItem from "@/components/PostItem/PublicPostItem";
import Comments from "@/components/Comments/Comments";
import { Divider } from "@mantine/core";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserProfile } from "@prisma/client";

interface PageProps {
    post: PublicPostWithAuthor | null;
    currentUser: UserProfile | null;
}

const Post = (props: PageProps) => {
    const { post, currentUser } = props;
    if (!post) {
        return (
            <>
                <Navbar />
                <main className="flex grow flex-col items-center justify-center">
                    <IconError404 size="10rem" />
                    <p className="text-xl font-semibold">POST NOT FOUND</p>
                </main>
            </>
        );
    }
    const currentUserIsAuthor = currentUser?.id === post?.authorId;
    const allowComments =
        !post.isDeleted && (post.commentsAllowed || currentUserIsAuthor);
    return (
        <>
            <Navbar />
            <main className="flex grow justify-center">
                <div className="flex w-full max-w-4xl flex-col gap-4">
                    <PublicPostItem postData={post} />
                    <Divider label="Comments" labelPosition="center" />
                    <Comments
                        postType="public"
                        postId={post.id}
                        where={{
                            publicPostId: post.id,
                            isDeleted: false,
                            parentComment: {
                                is: null,
                            },
                        }}
                        commentsAllowed={allowComments}
                    />
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

    // query db for post data
    const postId = context.params.postId as string;
    const post = await prisma.publicPost.findUnique({
        where: {
            id: postId,
        },
        include: {
            author: true,
        },
    });

    return {
        props: { key: postId, post, currentUser: user },
    };
};

export default Post;
