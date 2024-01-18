import { Button } from "@mantine/core";
import Navbar from "@/components/Navbar/Navbar";
import Head from "next/head";
import { signIn } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";
import { usePostHog } from "posthog-js/react";

interface SignInPageProps {
    errorMessage: string | null;
}

const SignIn = ({ errorMessage }: SignInPageProps) => {
    const posthog = usePostHog();

    function handleGitHubSignIn() {
        signIn("github").then(() =>
            posthog.capture("GitHub authentication flow trigged"),
        );
    }

    function handleGoogleSignIn() {
        signIn("google").then(() =>
            posthog.capture("Google authentication flow trigged"),
        );
    }

    return (
        <>
            <Head>
                <title key="title">ANON | Sign In</title>
            </Head>
            <Navbar toIndex />
            <main className="flex grow items-center justify-center">
                <div className="mb-10 flex w-max flex-col gap-1 px-4 py-2">
                    <h2 className="text-center text-4xl">Who are you?...</h2>
                    <div className="mt-6 flex flex-col gap-1.5">
                        <Alert
                            icon={<IconAlertCircle />}
                            color="orange"
                            title="Note"
                            variant="filled"
                        >
                            {`Can't sign in with both Google and Github if they're linked to the same Email`}
                        </Alert>
                        {errorMessage && (
                            <Alert
                                icon={<IconAlertCircle />}
                                color="red"
                                title="Error"
                                variant="filled"
                            >{`Error occurred: ${errorMessage}`}</Alert>
                        )}
                        <Button
                            type="button"
                            color="gray"
                            data-cy="google-signin-btn"
                            onClick={handleGoogleSignIn}
                            leftIcon={<IconBrandGoogle />}
                        >
                            Continue with Google
                        </Button>
                        <Button
                            type="button"
                            color="gray"
                            data-cy="github-signin-btn"
                            onClick={handleGitHubSignIn}
                            leftIcon={<IconBrandGithub />}
                        >
                            Continue with GitHub
                        </Button>
                    </div>
                </div>
            </main>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    // redirect to complete-auth route if there is a session | else render sign in page
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions,
    );
    if (session) {
        return {
            redirect: {
                destination: "/api/complete-auth",
                permanent: false,
            },
        };
    }
    return {
        props: {
            errorMessage: context.query?.error || null,
        },
    };
};

export default SignIn;
