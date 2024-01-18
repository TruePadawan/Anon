import { authOptions } from "@/lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma-client";

/*	If there is a session
		if user has no profile, route to page for creating a profile, else go to index page,
	else redirect to profile page
*/
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session = await getServerSession(req, res, authOptions);
    if (session) {
        const profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id },
            select: { accountName: true },
        });
        if (profile) {
            res.redirect("/");
        } else {
            // should redirect to page for creating a profile
            res.redirect("/create-profile");
        }
    } else {
        res.redirect("/sign-in");
    }
}
