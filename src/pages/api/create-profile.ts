import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PostHog } from "posthog-node";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST" || !req.body) {
        res.status(400).json({
            message: "Should receive a POST request with profile data",
        });
    } else {
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            res.status(401).json({ message: "Client not authenticated!?" });
        } else {
            try {
                const profile = await prisma.userProfile.create({
                    data: { ...JSON.parse(req.body), userId: session.user.id },
                });

                // let posthog know that a profile has been created
                if (
                    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
                    process.env.NEXT_PUBLIC_POSTHOG_HOST
                ) {
                    const postHogClient = new PostHog(
                        process.env.NEXT_PUBLIC_POSTHOG_KEY,
                        {
                            host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
                        },
                    );

                    postHogClient.capture({
                        event: "New profile created",
                        distinctId: session.user.id,
                        properties: {
                            accountName: profile.accountName,
                            displayName: profile.displayName,
                        },
                    });

                    await postHogClient.shutdownAsync();
                }

                res.status(200).json({
                    profile,
                    message: "Profile created successfully",
                });
            } catch (error: any) {
                res.status(500).json({
                    message: error.message,
                });
            }
        }
    }
}
