import mongodbClientPromise from "@/mongodb-client";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GitHubProvider from "next-auth/providers/github";

const mongodbAdapter = MongoDBAdapter(mongodbClientPromise, {
	databaseName: "anon",
});

export const authOptions: NextAuthOptions = {
	adapter: mongodbAdapter as Adapter,
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_ID || "",
			clientSecret: process.env.GITHUB_SECRET || "",
		}),
	],
	callbacks: {
		session: async ({ session, user }) => {
			if (session.user !== undefined) {
				session.user.id = user.id;
			}
			return session;
		},
	},
	pages: {
		signIn: "/sign_in",
	},
};
