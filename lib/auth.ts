import MongoClientPromise from "./mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const mongodbAdapter = MongoDBAdapter(MongoClientPromise, {
	databaseName: "anon",
});

export const authOptions: NextAuthOptions = {
	adapter: mongodbAdapter as Adapter,
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_ID as string,
			clientSecret: process.env.GITHUB_SECRET as string,
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
		signIn: "/sign-in",
	},
};
