import { Prisma } from "@prisma/client";

export type Base64 = string | ArrayBuffer;

const publicPostWithAuthor = Prisma.validator<Prisma.PublicPostDefaultArgs>()({
	include: { author: true },
});

export type PublicPostWithAuthor = Prisma.PublicPostGetPayload<
	typeof publicPostWithAuthor
>;

const commentWithAuthor = Prisma.validator<Prisma.CommentDefaultArgs>()({
	include: { author: true },
});

export type CommentWithAuthor = Prisma.CommentGetPayload<
	typeof commentWithAuthor
>;

export type PostType = "public" | "group";
