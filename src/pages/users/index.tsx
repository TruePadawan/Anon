import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Fragment } from "react";
import { prisma } from "@/lib/prisma-client";

// Empty component to shut nextjs up
export default function Users() {
    return <Fragment></Fragment>;
}

// Redirect to user profile if user is signed in else redirect to sign in page
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions);
    let redirectDestination = "/sign-in";

    if (session) {
        const profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
            select: { accountName: true },
        });
        if (profile) {
            redirectDestination = `/users/${profile.accountName}`;
        }
    }

    return {
        redirect: {
            destination: redirectDestination,
            permanent: false,
        },
    };
};
